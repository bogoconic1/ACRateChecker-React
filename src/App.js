import React, { useState } from 'react';
import name2id from './name2id.json';
import name2probs from './name2probs.json';
import axios from 'axios'; // Import Axios for making HTTP requests

const App = () => {
  const [contestName, setContestName] = useState('');
  const [contestDF, setContestDF] = useState([]);
  const [loadStatus, setLoadStatus] = useState("No contest is chosen");
  //const [contestHeader, setContestHeader] = useState([]);

  const handleFirstDropdownChange = (event) => {
    setContestName(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log(contestName);
    setLoadStatus("Pending")
    if (contestName) {
      try {
        const response = await axios.get('http://localhost:8000/get_contest_snapshots', {
        params: {
          contestName: contestName, // Pass contestName as a query parameter
          },
        });
        console.log(response);
        setContestDF(response.data);
        setLoadStatus("Successful")
      } catch (error) {
        console.error('Error sending request:', error);
        setLoadStatus("Failed")
      }
    }
  };

  return (
    <div>
      <div className="Intro">
          <h1> ACRateChecker </h1>
          <h2> A tool to find the acceptance rate of contest problems, and summarise verdicts from contest submissions </h2>
      </div>
      <form onSubmit={handleSubmit}>
        <select onChange={handleFirstDropdownChange}>
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
      <p> Retrieving Problem Statistics : {loadStatus} </p>
      <table style={{border: '2px solid forestgreen', width: '800px', height: '400px', 'text-align': 'center'}}>
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
    </div>
  );
};

export default App;

