import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  // Ensure this matches your backend port
  const backendUrl = 'http://localhost:5000'; 

  // --- 1. USER ID ---
  const getUserData = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?.employeeId || user?._id || user?.id || null;
    } catch { return null; }
  };

  const currentUserId = getUserData();
  
  // Ref prevents overwriting DB with empty state on load
  const isDataReady = useRef(false);

  const getKey = useCallback((key) => `dash_${currentUserId}_${key}`, [currentUserId]);

  // --- 2. STATE ---
  const [employeeName, setEmployeeName] = useState("Employee");
  const [activities, setActivities] = useState([]);

  // Timing State
  const [status, setStatus] = useState('inactive');
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [breakStartTime, setBreakStartTime] = useState(null);
  const [breakEndTime, setBreakEndTime] = useState(null);
  const [hasTakenBreak, setHasTakenBreak] = useState(false);
  const [breakHistory, setBreakHistory] = useState([]);

  // --- 3. LOAD DATA ---
  useEffect(() => {
    if (!currentUserId) return;

    isDataReady.current = false;

    // 1. Set Name
    const userObj = JSON.parse(localStorage.getItem("user"));
    if (userObj) setEmployeeName(`${userObj.firstName || ""} ${userObj.lastName || ""}`.trim());

    // 2. Midnight Reset Logic
    const today = new Date().toLocaleDateString();
    const lastDate = localStorage.getItem(`dash_${currentUserId}_lastActiveDate`);
    const isNewDay = lastDate !== today;

    const load = (key, def) => {
      if (isNewDay) return def; 
      const val = localStorage.getItem(`dash_${currentUserId}_${key}`);
      return val ? val : def;
    };
    
    const loadBool = (key) => {
      if (isNewDay) return false;
      return localStorage.getItem(`dash_${currentUserId}_${key}`) === 'true';
    };

    // If new day, clear old local storage
    if (isNewDay) {
      ['status', 'checkInTime', 'checkOutTime', 'breakStartTime', 'breakEndTime', 'hasTakenBreak'].forEach(k => {
        localStorage.removeItem(`dash_${currentUserId}_${k}`);
      });
      localStorage.setItem(`dash_${currentUserId}_lastActiveDate`, today);
    }

    // Load State
    setStatus(load('status', 'inactive'));
    setCheckInTime(load('checkInTime', null));
    setCheckOutTime(load('checkOutTime', null));
    setBreakStartTime(load('breakStartTime', null));
    setBreakEndTime(load('breakEndTime', null));
    setHasTakenBreak(loadBool('hasTakenBreak'));

    const savedHist = localStorage.getItem(`dash_${currentUserId}_breakHistory`);
    setBreakHistory(savedHist ? JSON.parse(savedHist) : []);

    setTimeout(() => {
      isDataReady.current = true;
    }, 50);

    // Fetch My Leads for Activity Feed
    fetchEmployeeLeads(currentUserId);

  }, [currentUserId]); 

  // --- 4. PERSIST STATE ---
  useEffect(() => {
    if (!currentUserId || !isDataReady.current) return;

    const today = new Date().toLocaleDateString();
    localStorage.setItem(getKey('lastActiveDate'), today);

    localStorage.setItem(getKey('status'), status);
    localStorage.setItem(getKey('hasTakenBreak'), hasTakenBreak);
    
    const saveOrRemove = (key, val) => {
      if (val) localStorage.setItem(getKey(key), val);
      else localStorage.removeItem(getKey(key));
    };
    
    saveOrRemove('checkInTime', checkInTime);
    saveOrRemove('checkOutTime', checkOutTime);
    saveOrRemove('breakStartTime', breakStartTime);
    saveOrRemove('breakEndTime', breakEndTime);
    
    localStorage.setItem(getKey('breakHistory'), JSON.stringify(breakHistory));

  }, [status, checkInTime, checkOutTime, breakStartTime, breakEndTime, hasTakenBreak, breakHistory, currentUserId, getKey]);

  // --- 5. LOGIC & API ---
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

    // Add Check-in/out actions from local state
    if (checkInTime) list.push({ message: "Checked in for the day", time: "Today at " + checkInTime, raw: new Date() });
    if (checkOutTime) list.push({ message: "Checked out", time: "Today at " + checkOutTime, raw: new Date() });

    setActivities(list.sort((a, b) => b.raw - a.raw));
  };

  // --- Helpers ---
  const getCurrentTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
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

  // --- 6. HANDLERS (API CALLS) ---
  const handleMainToggle = async () => {
    if (!currentUserId) return;

    // --- CHECK IN ---
    if (!checkInTime) {
      try {
        // API: Set status to Active
        await axios.put(`${backendUrl}/api/employee/${currentUserId}/status`, { status: 'Active' });
        
        setCheckInTime(getCurrentTime());
        setStatus('active');
      } catch (error) {
        console.error("Check-in Error:", error);
        alert("Failed to check in.");
      }
    } 
    // --- CHECK OUT ---
    else if (checkInTime && !checkOutTime) {
      if (status === 'on_break') return alert("Please end your break before checking out.");
      
      try {
        // API: Set status to Inactive
        await axios.put(`${backendUrl}/api/employee/${currentUserId}/status`, { status: 'Inactive' });
        
        setCheckOutTime(getCurrentTime());
        setStatus('completed'); 
      } catch (error) {
        console.error("Check-out Error:", error);
        alert("Failed to check out.");
      }
    }
  };

  const handleBreakToggle = () => {
    if (!checkInTime || checkOutTime || hasTakenBreak) return;
    const now = getCurrentTime();

    if (!breakStartTime) {
      setBreakStartTime(now);
      setStatus('on_break');
    } else if (!breakEndTime) {
      setBreakEndTime(now);
      setStatus('active');
      setHasTakenBreak(true);
      setBreakHistory(prev => [{ break: breakStartTime, ended: now, date: new Date().toLocaleDateString() }, ...prev]);
    }
  };

  // --- 7. UI HELPERS ---
  const getGreeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good Morning" : h < 18 ? "Good Afternoon" : "Good Evening";
  };
  
  const mainBtnClass = !checkInTime ? 'white' : (!checkOutTime ? 'green' : 'red');
  const breakBtnClass = hasTakenBreak ? 'red' : (status === 'on_break' ? 'green' : 'white');

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
                style={{ cursor: checkOutTime ? 'not-allowed' : 'pointer' }}
              />
            </div>
          </div>

          <div className="break-container">
            <div className="blue-card header-strip">
              <div className="card-content">
                 <div className="text-row">
                  <div className="time-group">
                    <span className="label">Break</span>
                    <span className="value">{breakStartTime || "--:-- __"}</span>
                  </div>
                  <div className="time-group">
                    <span className="label">Ended</span>
                    <span className="value">{breakEndTime || "--:-- __"}</span>
                  </div>
                </div>
                <div 
                  className={`toggle-btn ${breakBtnClass}`} 
                  onClick={handleBreakToggle}
                  style={{ 
                    cursor: (!checkInTime || checkOutTime || hasTakenBreak) ? 'not-allowed' : 'pointer',
                    opacity: (!checkInTime || checkOutTime) ? 0.5 : 1 
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




