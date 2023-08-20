import React, { useState } from 'react';
import name2id from './name2id.json';
import name2probs from './name2probs.json';
import axios from 'axios'; // Import Axios for making HTTP requests

const App = () => {
  const [contestName, setContestName] = useState('');
  const [contestDF, setContestDF] = useState([]);
  const [verdictDF, setVerdictDF] = useState([]);
  const [contestLoadStatus, setContestLoadStatus] = useState("No contest is chosen");
  const [verdictLoadStatus, setVerdictLoadStatus] = useState("No problem/language is chosen");
  const [problem, setProblem] = useState('Select Problem');
  const [language, setLanguage] = useState('Select Language');
  const [progLangs, setProgLangs] = useState([]);
  //const [contestHeader, setContestHeader] = useState([]);

  const handleContestDropdownChange = (event) => {
    setContestName(event.target.value);
  };

  const handleProblemDropdownChange = (event) => {
    setProblem(event.target.value);
  };

  const handleLanguageDropdownChange = (event) => {
    setLanguage(event.target.value);
  };

  const handleContestSubmit = async (event) => {
    event.preventDefault();
    console.log(contestName);
    //console.log(name2probs[contestName]);
    setContestLoadStatus("Pending")
    if (contestName) {
      try {
        const response = await axios.get('http://localhost:8000/get_contest_snapshots', {
        params: {
          contestName: contestName, // Pass contestName as a query parameter
          },
        });
        console.log(response);
        setContestDF(response.data.dur_contest);
        setProgLangs(response.data.prog_langs);
        setContestLoadStatus("Successful")
      } catch (error) {
        console.error('Error sending request:', error);
        setContestLoadStatus("Failed")
      }
    }
  };

  const handleVerdictSubmit = async (event) => {
    event.preventDefault();
    console.log(contestName);
    setVerdictLoadStatus("Pending")
    if (contestName) {
      try {
        const response = await axios.get('http://localhost:8000/get_verdicts', {
        params: {
          contestName: contestName, // Pass contestName as a query parameter
          selected_problem: problem,
          selected_language: language,
          },
        });
        console.log(response);
        setVerdictDF(response.data);
        setVerdictLoadStatus("Successful")
      } catch (error) {
        console.error('Error sending request:', error);
        setVerdictLoadStatus("Failed")
      }
    }
  };

  return (
    <div>
      <div className="Intro">
          <h1> ACRateChecker </h1>
          <h2> A tool to find the acceptance rate of contest problems, and summarise verdicts from contest submissions </h2>
      </div>
      <form onSubmit={handleContestSubmit}>
        <select onChange={handleContestDropdownChange}>
            <option value=""> Select Contest </option>
            {Object.keys(name2id).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        <button type="submit">Submit</button>
      </form>
      <br></br>

      <p> Retrieving Problem Statistics : {contestLoadStatus} </p>
      <table style={{border: '2px solid forestgreen', width: '800px', height: '400px', textAlign: 'center'}}>
        <thead>
          <tr>
            <th>Problem</th>
            <th>User Accepted</th>
            <th>User Tried</th>
            <th>Total Accepted</th>
            <th>Total Submissions</th>
            <th>Accepted %</th>
          </tr>
        </thead>
        <tbody>
          {contestDF.map(item => {
            return (
              <tr key={item.problem}>
                <td>{ item.problem }</td>
                <td>{ item.user_ac }</td>
                <td>{ item.user_tried }</td>
                <td>{ item.total_ac }</td>
                <td>{ item.total_sub }</td>
                <td>{ item.ac_percent }</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <br></br>

      <form onSubmit={handleVerdictSubmit}>
        <select onChange={handleProblemDropdownChange}>
            <option value=""> Select Problem </option>
            {name2probs[contestName]?.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
        </select>
        <select onChange={handleLanguageDropdownChange}>
            <option value=""> Select Language </option>
            {progLangs?.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
        </select>
        <button type="submit">Submit</button>
      </form>
      <br></br>

      <p> Retrieving Verdicts : {verdictLoadStatus} </p>
      <table style={{border: '2px solid forestgreen', width: '800px', height: '400px', textAlign: 'center'}}>
        <thead>
          <tr>
            <th>Verdict</th>
            <th>Submissions</th>
          </tr>
        </thead>
        <tbody>
          {verdictDF.map(item => {
            return (
              <tr key={item.verdict}>
                <td>{ item.verdict }</td>
                <td>{ item.submissions }</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default App;

