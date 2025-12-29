import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Leads.css';
import { ChevronLeft, Search, Info } from 'lucide-react'; // ✅ Restored Lucide Icons

// --- ASSETS ---
import calendarImg from '../assets/schedule_icon.png';
import editImg from '../assets/type.png';
import timeImg from '../assets/time.png';
import arrowImg from '../assets/save.png';

const Leads = ({ onBack }) => {
  const [activeAction, setActiveAction] = useState({ index: null, type: null });
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 1. SEARCH STATE ---
  const [searchTerm, setSearchTerm] = useState(""); 

  // Inputs
  const [tempDate, setTempDate] = useState("");
  const [tempTime, setTempTime] = useState("");
  
  // Status Logic
  const [tempStatus, setTempStatus] = useState("Ongoing");
  const [showStatusError, setShowStatusError] = useState(false);

  const popupRef = useRef(null);

  // --- 2. FETCH LEADS ---
  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;
      const user = JSON.parse(userStr);
      const employeeId = user.employeeId || user._id || user.id;

      const res = await axios.get(`http://localhost:5000/api/leads/assigned/${employeeId}`);
      setLeads(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching leads:", error);
      setLoading(false);
    }
  };

  // --- 3. FILTER LOGIC (Search by Name) ---
  const filteredLeads = leads.filter((lead) => {
    if (!searchTerm) return true;
    const name = lead.name ? lead.name.toLowerCase() : "";
    return name.includes(searchTerm.toLowerCase());
  });

  // --- 4. HELPERS ---
  const formatDate = (dateString) => {
    if (!dateString || dateString === "-") return "No Date";
    let date;
    if (typeof dateString === 'string' && dateString.includes('-') && dateString.length === 10) {
      const parts = dateString.split('-');
      if (parts[0].length === 2 && parts[2].length === 4) {
         date = new Date(parts[2], parts[1] - 1, parts[0]); 
      }
    }
    if (!date || isNaN(date.getTime())) date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const month = date.toLocaleString('default', { month: 'long' });
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();

    return `${month} ${day}, ${year}`;
  };

  const getLeadStyle = (type) => {
    const safeType = type ? type.toUpperCase() : 'HOT'; 
    switch (safeType) {
      case 'COLD': return { colorClass: 'cold', ringColor: '#06b6d4' }; 
      case 'WARM': return { colorClass: 'yellow', ringColor: '#facc15' }; 
      case 'HOT':  return { colorClass: 'orange', ringColor: '#f97316' }; 
      default:     return { colorClass: 'orange', ringColor: '#f97316' }; 
    }
  };

  const isClosable = (dateString) => {
    if (!dateString || dateString === "-") return false;
    const scheduleTime = new Date(dateString);
    const now = new Date();
    return now > scheduleTime;
  };

  // --- 5. HANDLERS ---
  const handleTagClick = async (leadId, newType) => {
    try {
      // Optimistic Update
      const updatedLeads = leads.map(l => 
        l._id === leadId ? { ...l, type: newType } : l
      );
      setLeads(updatedLeads);
      
      setActiveAction({ index: null, type: null });
      await axios.put(`http://localhost:5000/api/leads/${leadId}`, { type: newType });
    } catch (error) {
      console.error("Error updating tag:", error);
      fetchLeads();
    }
  };

  const handleDateSave = async (leadId) => {
    try {
      if (!tempDate || !tempTime) return alert("Please enter date and time");
      const scheduledDateTime = new Date(`${tempDate}T${tempTime}`);
      const isoString = scheduledDateTime.toISOString();

      const updatedLeads = leads.map(l => 
        l._id === leadId ? { ...l, scheduleDate: isoString } : l
      );
      setLeads(updatedLeads);

      setActiveAction({ index: null, type: null });
      await axios.put(`http://localhost:5000/api/leads/${leadId}`, { scheduleDate: isoString });
    } catch (error) {
      console.error("Error updating date:", error);
    }
  };

  const handleStatusSaveClick = async (leadId) => {
    const lead = leads.find(l => l._id === leadId);
    if (!lead) return;

    const closable = isClosable(lead.scheduleDate);

    if (tempStatus === 'Closed' && !closable) {
      setShowStatusError(true);
      setTimeout(() => setShowStatusError(false), 3000);
      return; 
    }

    try {
      const updatedLeads = leads.map(l => 
        l._id === leadId ? { ...l, status: tempStatus } : l
      );
      setLeads(updatedLeads);

      setActiveAction({ index: null, type: null });
      await axios.put(`http://localhost:5000/api/leads/${leadId}`, { status: tempStatus });
    } catch (error) {
      alert(error.response?.data?.message || "Error updating status");
      fetchLeads();
    }
  };

  const toggleAction = (e, leadId, type) => {
    e.stopPropagation();
    const lead = leads.find(l => l._id === leadId);
    if (!lead) return;
    
    if (lead.status && lead.status.toLowerCase() === 'closed') return;

    if (activeAction.index === leadId && activeAction.type === type) {
      setActiveAction({ index: null, type: null });
    } else {
      setActiveAction({ index: leadId, type });
      if (type === 'date') {
        setTempDate("");
        setTempTime("");
      }
      if (type === 'status') {
        setTempStatus(lead.status || "Ongoing");
        setShowStatusError(false); 
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setActiveAction({ index: null, type: null });
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeAction]);

  return (
    <div className="leads-container">
      <div className="leads-header">
        <h1 className="brand-title">Canova<span className="brand-highlight">CRM</span></h1>
        
        {/* Back Button (Lucide Icon) */}
        <div className="nav-row" onClick={onBack}>
          <ChevronLeft size={28} className="back-icon" />
          <span className="page-title">Leads</span>
        </div>
      </div>

      <div className="search-section">
        <div className="search-wrapper">
          {/* Search Icon (Lucide Icon) */}
          <Search className="search-icon" size={22} />
          
          {/* Search Input (Bound to State) */}
          <input 
            type="text" 
            placeholder="Search" 
            className="search-input" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="leads-list">
        {loading ? <p style={{ textAlign: 'center', marginTop: 20 }}>Loading Leads...</p> :
          // --- USE filteredLeads HERE ---
          filteredLeads.map((lead, i) => {
            const { colorClass, ringColor } = getLeadStyle(lead.type);
            const isBottomThree = i >= filteredLeads.length - 3 && filteredLeads.length > 3;
            const popupClass = isBottomThree ? "popup-menu upwards" : "popup-menu";
            const isClosed = lead.status && lead.status.toLowerCase() === 'closed';

            return (
              <div key={lead._id} className="lead-card-wrapper">
                <div className="lead-card">
                  <div className={`side-strip ${colorClass}`}></div>
                  <div className="card-info">
                    <h4 className="lead-name">{lead.name}</h4>
                    <p className="lead-email">{lead.email}</p>
                    <div className="lead-date-row">
                      <img src={calendarImg} alt="cal" className="icon-img-small" />
                      <span>{formatDate(lead.date || lead.createdAt)}</span>
                    </div>
                  </div>
                  <div className="card-actions">
                    <div className="status-circle" style={{ borderColor: ringColor }}>
                      <span className="status-text">{lead.status || "Open"}</span>
                    </div>
                    <div className="action-row" style={{ opacity: isClosed ? 0.5 : 1 }}>
                      <img src={editImg} alt="Type" className="action-img" onClick={(e) => toggleAction(e, lead._id, 'tag')} />
                      <img src={timeImg} alt="Date" className="action-img" onClick={(e) => toggleAction(e, lead._id, 'date')} />
                      <img src={arrowImg} alt="Status" className="action-img" onClick={(e) => toggleAction(e, lead._id, 'status')} />
                    </div>
                  </div>
                </div>

                {/* TAG MENU */}
                {activeAction.index === lead._id && activeAction.type === 'tag' && (
                  <div className={`${popupClass} tag-menu`} ref={popupRef}>
                    <p className="popup-label">TYPE</p>
                    <div className="tag-options">
                      <button className="tag-btn hot" onClick={() => handleTagClick(lead._id, 'HOT')}>HOT</button>
                      <button className="tag-btn warm" onClick={() => handleTagClick(lead._id, 'WARM')}>WARM</button>
                      <button className="tag-btn cold" onClick={() => handleTagClick(lead._id, 'COLD')}>COLD</button>
                    </div>
                  </div>
                )}

                {/* DATE MENU */}
                {activeAction.index === lead._id && activeAction.type === 'date' && (
                  <div className={`${popupClass} date-menu`} ref={popupRef}>
                    <div className="input-group">
                      <label>DATE</label>
                      <input type="date" onChange={(e) => setTempDate(e.target.value)} />
                    </div>
                    <div className="input-group">
                      <label>TIME</label>
                      <input type="time" onChange={(e) => setTempTime(e.target.value)} />
                    </div>
                    <button className="save-btn" onClick={() => handleDateSave(lead._id)}>Save</button>
                  </div>
                )}

                {/* STATUS MENU */}
                {activeAction.index === lead._id && activeAction.type === 'status' && (
                  <div className={`${popupClass} status-popup-styled`} ref={popupRef}>
                    
                    {/* Header Row (Lucide Icon) */}
                    <div className="status-popup-header">
                      <span className="status-popup-title">Lead Status</span>
                      <Info size={18} className="info-icon" />
                    </div>

                    {/* ERROR TOOLTIP */}
                    {showStatusError && (
                      <div className="error-tooltip-bubble">
                        Lead can not be closed if scheduled
                      </div>
                    )}

                    {/* Dropdown */}
                    <div className="status-select-wrapper">
                      <select 
                        className="status-select-box"
                        value={tempStatus} 
                        onChange={(e) => setTempStatus(e.target.value)}
                      >
                        <option value="Ongoing">Ongoing</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>

                    <button className="save-btn-dark" onClick={() => handleStatusSaveClick(lead._id)}>
                      Save
                    </button>
                  </div>
                )}

              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Leads;