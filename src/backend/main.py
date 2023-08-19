import pandas as pd
import numpy as np
import plotly.graph_objects as go
import requests
import json
from collections import defaultdict
import os
from fastapi import FastAPI, File, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from tqdm import tqdm

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# read json files
with open("../name2id.json") as j:
    name2id = json.load(j)

with open("../name2probs.json") as j:
    name2probs = json.load(j)
    
@app.get("/")
async def root():
    return "Do not brick problem B"


@app.get("/get_contest_snapshots")
async def get_contest_snapshots(contestName: str):
    #contestID = (await request.json()).values()[0]
    #return contestID
    if contestName not in name2id:
        return "Invalid contest name"
    contest = name2id[contestName]
    
    page = "https://codeforces.com/api/contest.status?contestId=" + str(contest) + "&from=1"
    cf_submissions_api = requests.get(page)
    submissions = cf_submissions_api.json()
    cf_dataframe = pd.json_normalize(submissions,['result'])
    
    cf_duration_api = requests.get("https://codeforces.com/api/contest.list?gym=false")
    contests = cf_duration_api.json()
    cf_duration_dataframe = pd.json_normalize(contests,['result'])
    
    selected_contest = cf_duration_dataframe.loc[cf_duration_dataframe["id"] == int(contest)]
    start_time = list(selected_contest["startTimeSeconds"])[0]
    duration = list(selected_contest["durationSeconds"])[0]
    
    #minutes_after_start = int(input())
    #seconds_after_start = minutes_after_start * 60
    
    end_time = list(selected_contest["startTimeSeconds"])[0] + duration #seconds_after_start
    byTimeMemory = cf_dataframe[["creationTimeSeconds","contestId","problem.index","problem.name","programmingLanguage","author.members","verdict","timeConsumedMillis", "memoryConsumedBytes"]].loc[(cf_dataframe["creationTimeSeconds"] >= start_time) & (cf_dataframe["creationTimeSeconds"] <= end_time)]
    byTimeMemory = byTimeMemory.rename(columns = {"timeConsumedMillis": "Time","problem.index":"problem_index","problem.name":"problem_name","author.members":"author_members"})

    #retrieve the name and id of the problems
    problem_header = byTimeMemory[["problem_index","problem_name"]]
    problems = sorted(set(list(byTimeMemory["problem_index"])))
    index_to_name = defaultdict()
    for index,name in problem_header.values:
        index_to_name[index] = name
        if len(index_to_name) == len(problems):
            break
        
    dur_contest = []
    for i in tqdm(range(len(problems)), desc = "Calculating AC rates"):
        pindex = problems[i]
        solved_df = byTimeMemory[(byTimeMemory["problem_index"] == pindex) & (byTimeMemory["verdict"] == "OK")]
        attempted_df = byTimeMemory[(byTimeMemory["problem_index"] == pindex)]
        user_solved = len(set([x[0]["handle"] for x in list(solved_df["author_members"])]))
        user_attempted = len(set([x[0]["handle"] for x in list(attempted_df["author_members"])]))
        total_solved = len(solved_df)
        total_attempted = len(attempted_df)
        acceptance_rate = round(((total_solved / total_attempted) * 100),2)
        dur_contest.append({"problem": f'{pindex}. {index_to_name[pindex]}', 
                            "user_ac": f'{user_solved:,}', 
                            "user_tried": f'{user_attempted:,}', 
                            "total_ac": f'{total_solved:,}', 
                            "total_sub": f'{total_attempted:,}', 
                            "ac_percent": f'{acceptance_rate}'})
    
    print(dur_contest)
    return dur_contest