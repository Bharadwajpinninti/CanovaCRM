import React, { useState, useEffect, useRef } from 'react';
import './Schedule.css';
import { Search, ChevronLeft, SlidersHorizontal, MapPin, ChevronDown } from 'lucide-react';

const Schedule = ({ onBack }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterType, setFilterType] = useState('All'); 
  const [searchQuery, setSearchQuery] = useState('');
  
  // STATE: Tracks which card is currently BLUE (Active)
  const [activeId, setActiveId] = useState(1); 
  
  const filterRef = useRef(null);

  const scheduleData = [
    { 
      id: 1, 
      type: "Referral", 
      phone: "949-365-6533", 
      date: "10/04/25", 
      contact: "Brooklyn Williamson" 
    },
    { 
      id: 2, 
      type: "Referral", 
      phone: "365-865-8854", 
      date: "10/04/25", 
      contact: "Julie Watson"
    },
    { 
      id: 3, 
      type: "Cold call", 
      phone: "654-692-8895", 
      date: "12/04/25", 
      contact: "Jenny Alexander"
    },
  ];

  const filteredData = scheduleData.filter(item => {
    const matchesSearch = item.contact.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.phone.includes(searchQuery);
    const matchesFilter = filterType === 'All' ? true : item.date === "10/04/25";
    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="schedule-container">
      {/* 1. Header */}
      <div className="schedule-header">
        <h1 className="brand-title">Canova<span className="brand-highlight">CRM</span></h1>
        <div className="nav-row" onClick={onBack}>
          <ChevronLeft size={28} className="back-icon" />
          <span className="page-title">Schedule</span>
        </div>
      </div>

      {/* 2. Search & Filter */}
      <div className="search-filter-section">
        <div className="search-wrapper">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="Search" 
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

        {/* Popup */}
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

      {/* 3. Schedule List (Static - Fits 3 items) */}
      <div className="schedule-list">
        {filteredData.length > 0 ? (
          filteredData.map((item) => {
            // Check if this specific item is the active one
            const isActive = activeId === item.id;

            return (
              <div 
                key={item.id} 
                className={`schedule-card ${isActive ? 'active' : ''}`}
                onClick={() => setActiveId(item.id)} // <-- Click to set Blue
              >
                
                <div className="card-top-row">
                  <h4 className="card-type">{item.type}</h4>
                  <div className="card-date-group">
                    <span className="date-label">Date</span>
                    <span className="date-value">{item.date}</span>
                  </div>
                </div>

                <p className="card-phone">{item.phone}</p>

                <div className="card-details">
                  <div className="detail-row">
                    <div className="icon-box">
                      <MapPin size={14} />
                    </div>
                    <span className="detail-text">Call</span>
                  </div>
                  <div className="detail-row">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${item.contact}&background=random`} 
                      alt="avatar" 
                      className="contact-avatar" 
                    />
                    <span className="contact-name">{item.contact}</span>
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