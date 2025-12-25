import React, { useState } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  // State: 'white' (default), 'green', 'red'
  const [checkInState, setCheckInState] = useState('white');
  const [breakState, setBreakState] = useState('white');
  
  // Logic: White -> Green -> Red -> Green -> Red ...
  const handleToggle = (currentState, setter) => {
    if (currentState === 'white') {
      setter('green');
    } else if (currentState === 'green') {
      setter('red');
    } else {
      setter('green');
    }
  };

  const breakHistory = [
    { break: "01:25 pm", ended: "02:15 PM", date: "10/04/25" },
    { break: "01:00 pm", ended: "02:05 PM", date: "09/04/25" },
    { break: "01:05 pm", ended: "02:30 PM", date: "08/04/25" },
    { break: "01:10 pm", ended: "02:00 PM", date: "07/04/25" },
  ];

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="brand-title">Canova<span className="brand-highlight">CRM</span></h1>
        <p className="greeting-text">Good Morning</p>
        <h2 className="user-name">Rajesh Mehta</h2>
      </div>

      <div className="dashboard-content">
        {/* Timings */}
        <div className="section-wrapper">
          <h3 className="section-label">Timings</h3>
          
          {/* Check In Card */}
          <div className="blue-card">
            <div className="card-content">
              <div className="text-row">
                <div className="time-group">
                  <span className="label">Check in</span>
                  <span className="value">--:-- __</span>
                </div>
                <div className="time-group">
                  <span className="label">Check Out</span>
                  <span className="value">--:-- __</span>
                </div>
              </div>
              <div 
                className={`toggle-btn ${checkInState}`} 
                onClick={() => handleToggle(checkInState, setCheckInState)}
              ></div>
            </div>
          </div>

          {/* Break Card */}
          <div className="break-container">
            <div className="blue-card header-strip">
              <div className="card-content">
                 <div className="text-row">
                  <div className="time-group">
                    <span className="label">Break</span>
                    <span className="value">--:-- __</span>
                  </div>
                  <div className="time-group">
                    <span className="label">Ended</span>
                    <span className="value">--:-- __</span>
                  </div>
                </div>
                <div 
                  className={`toggle-btn ${breakState}`} 
                  onClick={() => handleToggle(breakState, setBreakState)}
                ></div>
              </div>
            </div>

            <div className="break-list">
              {breakHistory.map((item, i) => (
                <div key={i} className="list-row">
                  <div className="col">
                    <span className="th">Break</span>
                    <span>{item.break}</span>
                  </div>
                  <div className="col">
                    <span className="th">Ended</span>
                    <span>{item.ended}</span>
                  </div>
                  <div className="col right">
                    <span className="th">Date</span>
                    <span>{item.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity - Fixed Height Scrollable Area */}
        <div className="activity-wrapper">
          <h3 className="section-label">Recent Activity</h3>
          <div className="activity-box">
            <ul className="activity-items">
              <li>You were assigned 3 more new lead <br/> – 1 hour ago</li>
              <li>You Closed a deal today – 2 hours ago</li>
              <li>Team meeting scheduled for tomorrow <br/> – 3 hours ago</li>
              <li>New client registered: John Doe <br/> – 4 hours ago</li>
              <li>Project update: Phase 1 complete <br/> – 5 hours ago</li>
              <li>System maintenance alert <br/> – Yesterday</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;