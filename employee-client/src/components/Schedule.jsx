import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Schedule.css';
import { Search, ChevronLeft, SlidersHorizontal, MapPin, ChevronDown } from 'lucide-react';

const Schedule = ({ onBack }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterType, setFilterType] = useState('All'); 
  const [searchQuery, setSearchQuery] = useState('');
  
  const [activeId, setActiveId] = useState(null); 
  const filterRef = useRef(null);

  // --- HELPER: GET AVATAR INITIALS ---
  const getAvatarInitials = (name) => {
    if (!name) return "NA";
    const cleanName = name.trim();
    const parts = cleanName.split(" ").filter(p => p.length > 0);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    if (parts.length === 1) {
      const letters = parts[0].match(/[a-zA-Z]/g);
      if (!letters) return parts[0].slice(0, 2).toUpperCase();
      if (letters.length === 1) return letters[0].toUpperCase();
      return (letters[0] + letters[letters.length - 1]).toUpperCase();
    }
    return "NA";
  };

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchSchedules = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;
      
      const user = JSON.parse(storedUser);
      const employeeId = user.employeeId || user._id || user.id;

      try {
        // ✅ Updated URL to use variable
        const res = await axios.get(`${backendUrl}/api/leads/scheduled/${employeeId}`);
        setScheduleData(res.data);
        if(res.data.length > 0) setActiveId(res.data[0]._id);
      } catch (error) {
        console.error("Error fetching schedules:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  // --- FILTERING LOGIC (Fixed) ---
  const filteredData = scheduleData.filter(item => {
    // FIX 2: Handle Name (Check multiple fields)
    const fName = item.firstName || "";
    const lName = item.lastName || "";
    const singleName = item.name || item.contact || ""; // Fallback
    
    const fullName = (fName || lName) ? `${fName} ${lName}`.trim() : singleName;
    
    // Search Logic
    const matchesSearch = fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.leadId && item.leadId.toString().includes(searchQuery));
    
    // FIX 1: Today Filter Logic
    let matchesFilter = true;
    if (filterType === 'Today') {
      if (!item.scheduleDate) return false;
      
      // Convert both to YYYY-MM-DD for accurate comparison
      const today = new Date().toLocaleDateString('en-CA'); // 'en-CA' gives YYYY-MM-DD
      const itemDate = new Date(item.scheduleDate).toLocaleDateString('en-CA');
      
      matchesFilter = itemDate === today;
    }

    return matchesSearch && matchesFilter;
  });

  // Close filter popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) setIsFilterOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="schedule-container">
      {/* Header */}
      <div className="schedule-header">
        <h1 className="brand-title">Canova<span className="brand-highlight">CRM</span></h1>
        <div className="nav-row" onClick={onBack}>
          <ChevronLeft size={28} className="back-icon" />
          <span className="page-title">Schedule</span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="search-filter-section">
        <div className="search-wrapper">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="Search Name or ID" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input" 
          />
        </div>
        <button 
          className={`filter-btn ${isFilterOpen ? 'active' : ''}`}
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <SlidersHorizontal size={22} />
        </button>
        {isFilterOpen && (
          <div className="filter-popup" ref={filterRef}>
            <p className="filter-label">FILTER</p>
            <div className="filter-dropdown">
              <div className="filter-header">
                {filterType} <ChevronDown size={16} />
              </div>
              <div className="filter-options">
                <div className="filter-option" onClick={() => setFilterType('Today')}>Today</div>
                <div className="filter-option" onClick={() => setFilterType('All')}>All</div>
              </div>
            </div>
            <button className="save-filter-btn" onClick={() => setIsFilterOpen(false)}>Save</button>
          </div>
        )}
      </div>

      {/* List */}
      <div className="schedule-list">
        {loading ? (
          <div className="empty-state">Loading schedules...</div>
        ) : filteredData.length > 0 ? (
          filteredData.map((item) => {
            const isActive = activeId === item._id;
            
            // Name Logic for Display
            const fName = item.firstName || "";
            const lName = item.lastName || "";
            const singleName = item.name || item.contact || "Unknown Lead";
            const displayName = (fName || lName) ? `${fName} ${lName}`.trim() : singleName;
            
            const initials = getAvatarInitials(displayName);

            return (
              <div 
                key={item._id} 
                className={`schedule-card ${isActive ? 'active' : ''}`}
                onClick={() => setActiveId(item._id)}
              >
                <div className="card-top-row">
                  <h4 className="card-type">{item.source || "Lead"}</h4>
                  <div className="card-date-group">
                    <span className="date-label">Date</span>
                    <span className="date-value">
                      {new Date(item.scheduleDate).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                </div>

                <p className="card-phone">ID: {item.leadId || item._id.slice(-6)}</p>

                <div className="card-details">
                  <div className="detail-row">
                    <div className="icon-box"><MapPin size={14} /></div>
                    <span className="detail-text">{item.location || "No Location"}</span>
                  </div>
                  <div className="detail-row">
                    <div className="contact-avatar-placeholder">{initials}</div>
                    <span className="contact-name">{displayName}</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state">No schedules found</div>
        )}
      </div>
    </div>
  );
};

export default Schedule;