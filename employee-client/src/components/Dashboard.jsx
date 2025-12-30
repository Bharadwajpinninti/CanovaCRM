
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; 
import './Dashboard.css';

const Dashboard = () => {
  // FIXED: Environment variable check
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // --- 1. USER ID ---
  const getUserData = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?.employeeId || user?._id || user?.id || null;
    } catch { return null; }
  };

  const currentUserId = getUserData();
  
  // --- 2. STATE (2-Variable Strategy) ---
  const [employeeName, setEmployeeName] = useState("Employee");
  const [activities, setActivities] = useState([]);

  // Variables: null (Grey), true (Green), false (Red)
  const [checkInStatus, setCheckInStatus] = useState(null);
  const [breakStatus, setBreakStatus] = useState(null);

  // Display Data
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [breakHistory, setBreakHistory] = useState([]);

  // --- 3. LOAD DATA (FROM API) ---
  useEffect(() => {
    if (!currentUserId) return;

    // 1. Set Name
    const userObj = JSON.parse(localStorage.getItem("user"));
    if (userObj) setEmployeeName(`${userObj.firstName || ""} ${userObj.lastName || ""}`.trim());

    // 2. Fetch Persistent Status from Backend
    const fetchStatus = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/employee/dashboard-status/${currentUserId}`);
            if (data.success) {
                setCheckInStatus(data.checkInStatus);
                setBreakStatus(data.breakStatus);
                setCheckInTime(data.checkInTime);
                setCheckOutTime(data.checkOutTime);
                setBreakHistory(data.breakHistory);
            }
        } catch (error) {
            console.error("Failed to load status", error);
        }
    };

    fetchStatus();
    fetchEmployeeLeads(currentUserId);

  }, [currentUserId, backendUrl]); 

  // --- 4. LOGIC & API ---
  const fetchEmployeeLeads = async (id) => {
    try {
      const res = await axios.get(`${backendUrl}/api/leads/assigned/${id}`);
      generateActivity(res.data);
    } catch (e) { console.error(e); }
  };

  const generateActivity = (leads) => {
    const list = [];
    const grouped = {};
    
    // Group "Assigned" actions
    leads.forEach(l => {
      const k = l.createdAt?.slice(0, 16) || 'Unknown';
      if (!grouped[k]) grouped[k] = { count: 0, date: l.createdAt };
      grouped[k].count++;
    });

    Object.values(grouped).forEach(g => list.push({
      message: `You were assigned ${g.count} more new lead${g.count > 1 ? 's' : ''}`,
      time: calcTime(g.date), raw: new Date(g.date)
    }));

    // Add "Closed" actions
    leads.filter(l => l.status?.toLowerCase() === 'closed').forEach(l => {
      const d = l.updatedAt || l.createdAt;
      list.push({
        message: `You Closed a deal ${getRelDay(d)}`,
        time: calcTime(d), raw: new Date(d)
      });
    });

    setActivities(list.sort((a, b) => b.raw - a.raw));
  };

  // --- Helpers ---
  const getRelDay = (dStr) => {
    const days = Math.floor((new Date().setHours(0,0,0,0) - new Date(dStr).setHours(0,0,0,0)) / 86400000);
    return days === 0 ? "today" : days === 1 ? "yesterday" : `${days} days ago`;
  };

  const calcTime = (dStr) => {
    if (!dStr) return "";
    const diff = (new Date() - new Date(dStr)) / 36e5;
    if (diff < 1) return "Just now";
    if (diff < 24) return Math.floor(diff) + (Math.floor(diff) === 1 ? " hr ago" : " hrs ago");
    const days = Math.floor(diff / 24);
    return days + (days === 1 ? " day ago" : " days ago");
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good Morning" : h < 18 ? "Good Afternoon" : "Good Evening";
  };

  
  
  const handleMainToggle = async () => {
    if (!currentUserId) return;

   
    if (checkInStatus === null) {
      try {
        const { data } = await axios.put(`${backendUrl}/api/employee/${currentUserId}/status`, { status: 'Active' });
        if(data.success) {
            setCheckInStatus(true); // Green
            setCheckInTime(data.time);
        }
      } catch (error) { console.error(error); }
    } 
    
    else if (checkInStatus === true) {
      // Prevent checkout if break is active
      if (breakStatus === true) return alert("Please end your break before checking out.");

      try {
        const { data } = await axios.put(`${backendUrl}/api/employee/${currentUserId}/status`, { status: 'Inactive' });
        if(data.success) {
            setCheckInStatus(false); // Red
            setCheckOutTime(data.time);
        }
      } catch (error) { console.error(error); }
    }
  };

  const handleBreakToggle = async () => {
    if (!currentUserId) return;
    // Prevent break if not checked in or if checked out
    if (checkInStatus !== true) return; 

    // A. Start Break (Grey -> Green)
    if (breakStatus === null) {
        try {
            const { data } = await axios.put(`${backendUrl}/api/employee/${currentUserId}/break`);
            if(data.success) {
                setBreakStatus(true); // Green
                setBreakHistory(data.history);
            }
        } catch (error) { console.error(error); }
    }
    // B. End Break (Green -> Red)
    else if (breakStatus === true) {
        try {
            const { data } = await axios.put(`${backendUrl}/api/employee/${currentUserId}/break`);
            if(data.success) {
                setBreakStatus(false); // Red
                setBreakHistory(data.history);
            }
        } catch (error) { console.error(error); }
    }
  };

  
  const mainBtnClass = checkInStatus === null ? 'white' : (checkInStatus === true ? 'green' : 'red');
  
 
  const breakBtnClass = breakStatus === null ? 'white' : (breakStatus === true ? 'green' : 'red');

  const isBreakDisabled = checkInStatus !== true;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="brand-title">Canova<span className="brand-highlight">CRM</span></h1>
        <p className="greeting-text">{getGreeting()}</p>
        <h2 className="user-name">{employeeName}</h2>
      </div>

      <div className="dashboard-content">
        <div className="section-wrapper">
          <h3 className="section-label">Timings</h3>
          
          <div className="blue-card">
            <div className="card-content">
              <div className="text-row">
                <div className="time-group">
                  <span className="label">Check in</span>
                  <span className="value">{checkInTime || "--:-- __"}</span>
                </div>
                <div className="time-group">
                  <span className="label">Check Out</span>
                  <span className="value">{checkOutTime || "--:-- __"}</span>
                </div>
              </div>
              <div 
                className={`toggle-btn ${mainBtnClass}`} 
                onClick={handleMainToggle}
                style={{ cursor: checkInStatus === false ? 'not-allowed' : 'pointer' }}
              />
            </div>
          </div>

          <div className="break-container">
            <div className="blue-card header-strip">
              <div className="card-content">
                 <div className="text-row">
                  <div className="time-group">
                    <span className="label">Break</span>
                    {/* Show Start Time of most recent break */}
                    <span className="value">{breakHistory[0]?.break || "--:-- __"}</span>
                  </div>
                  <div className="time-group">
                    <span className="label">Ended</span>
                     {/* Show End Time of most recent break */}
                    <span className="value">{breakHistory[0]?.ended !== "..." ? breakHistory[0]?.ended : "--:-- __"}</span>
                  </div>
                </div>
                <div 
                  className={`toggle-btn ${breakBtnClass}`} 
                  onClick={handleBreakToggle}
                  style={{ 
                    cursor: isBreakDisabled || breakStatus === false ? 'not-allowed' : 'pointer',
                    opacity: isBreakDisabled ? 0.5 : 1 
                  }}
                />
              </div>
            </div>

            <div className="break-list-wrapper">
              <div className="break-list">
                {breakHistory.length > 0 ? (
                  breakHistory.slice(0, 4).map((item, i) => (
                    <div key={i} className="list-row">
                      <div className="info-col">
                        <span className="label-text">Break</span>
                        <span className="value-text">{item.break}</span>
                      </div>
                      <div className="info-col">
                        <span className="label-text">Ended</span>
                        <span className="value-text">{item.ended}</span>
                      </div>
                      <div className="info-col right">
                        <span className="label-text">Date</span>
                        <span className="value-text">{item.date}</span>
                      </div>
                    </div>
                  ))
                ) : <div className="empty-state">No breaks taken yet</div>}
              </div>
            </div>
          </div>
        </div>

        <div className="activity-wrapper">
          <h3 className="section-label">Recent Activity</h3>
          <div className="activity-box">
            <ul className="activity-items">
              {activities.length > 0 ? activities.map((act, i) => (
                <li key={i}>{act.message} <br/> – <span className="time-text">{act.time}</span></li>
              )) : <li className="empty-state">No recent activity found.</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
