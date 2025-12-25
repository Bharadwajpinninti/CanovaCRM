import React, { useState, useEffect, useRef } from 'react';
import './Leads.css';
import { ChevronLeft, Search } from 'lucide-react'; 

// --- ASSET IMPORTS (Replace with your actual paths) ---
import calendarImg from '../assets/schedule_icon.png'; 
import editImg from '../assets/type.png';
import timeImg from '../assets/time.png';
import arrowImg from '../assets/save.png';

const Leads = ({ onBack }) => {
  const [activeAction, setActiveAction] = useState({ index: null, type: null });
  const popupRef = useRef(null); 

  // DATA STATE
  const [leads, setLeads] = useState([
    { 
      id: 1,
      name: "Tanner Finsha", 
      email: "@Tannerfisher@gmail.com", 
      date: "December 04, 2025", 
      status: "Ongoing", 
      colorClass: "orange", 
      ringColor: "#f97316" 
    },
    { 
      id: 2,
      name: "Tanner Finsha", 
      email: "@Tannerfisher@gmail.com", 
      date: "December 04, 2025", 
      status: "Ongoing", 
      colorClass: "yellow",
      ringColor: "#facc15" 
    },
    { 
      id: 3,
      name: "Tanner Finsha", 
      email: "@Tannerfisher@gmail.com", 
      date: "December 04, 2025", 
      status: "Closed", 
      colorClass: "gray",
      ringColor: "#d1d5db" 
    }
  ]);

  // Toggle Popup
  const toggleAction = (e, index, type) => {
    e.stopPropagation(); 
    if (activeAction.index === index && activeAction.type === type) {
      setActiveAction({ index: null, type: null });
    } else {
      setActiveAction({ index, type });
    }
  };

  // Handle Tag Selection
  const handleTagClick = (index, type) => {
    const updatedLeads = [...leads];
    let newRingColor = '';
    let newColorClass = '';

    switch(type) {
      case 'HOT':
        newRingColor = '#f97316'; // Orange
        newColorClass = 'orange';
        break;
      case 'WARM':
        newRingColor = '#facc15'; // Yellow
        newColorClass = 'yellow';
        break;
      case 'COLD':
        newRingColor = '#06b6d4'; // Blue/Cyan
        newColorClass = 'cold'; 
        break;
      default: return;
    }

    updatedLeads[index] = { 
      ...updatedLeads[index], 
      ringColor: newRingColor, 
      colorClass: newColorClass 
    };
    setLeads(updatedLeads);
    setActiveAction({ index: null, type: null }); 
  };

  // Close popup on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setActiveAction({ index: null, type: null });
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeAction]);


  return (
    <div className="leads-container">
      {/* 1. Header */}
      <div className="leads-header">
        <h1 className="brand-title">Canova<span className="brand-highlight">CRM</span></h1>
        <div className="nav-row" onClick={onBack}>
          <ChevronLeft size={28} className="back-icon" />
          <span className="page-title">Leads</span>
        </div>
      </div>

      {/* 2. Search */}
      <div className="search-section">
        <div className="search-wrapper">
          <Search className="search-icon" size={22} />
          <input type="text" placeholder="Search" className="search-input" />
        </div>
      </div>

      {/* 3. Leads List (Static) */}
      <div className="leads-list">
        {leads.map((lead, i) => {
          
          // LOGIC: If it's the 3rd lead (index 2), open upwards.
          const isLastItem = i === 2; 
          const popupClass = isLastItem ? "popup-menu upwards" : "popup-menu";

          return (
            <div key={lead.id} className="lead-card-wrapper">
              
              <div className="lead-card">
                <div className={`side-strip ${lead.colorClass}`}></div>

                <div className="card-info">
                  <h4 className="lead-name">{lead.name}</h4>
                  <p className="lead-email">{lead.email}</p>
                  <div className="lead-date-row">
                    <img src={calendarImg} alt="cal" className="icon-img-small" />
                    <span>{lead.date}</span>
                  </div>
                </div>

                <div className="card-actions">
                  <div className="status-circle" style={{ borderColor: lead.ringColor }}>
                    <span className="status-text">{lead.status}</span>
                  </div>
                  
                  <div className="action-row">
                    <img src={editImg} alt="edit" className="action-img" onClick={(e) => toggleAction(e, i, 'tag')} />
                    <img src={timeImg} alt="time" className="action-img" onClick={(e) => toggleAction(e, i, 'date')} />
                    <img src={arrowImg} alt="arrow" className="action-img" onClick={(e) => toggleAction(e, i, 'status')} />
                  </div>
                </div>
              </div>

              {/* --- POPUPS --- */}
              {activeAction.index === i && activeAction.type === 'tag' && (
                <div className={`${popupClass} tag-menu`} ref={popupRef}>
                  <p className="popup-label">TYPE</p>
                  <div className="tag-options">
                    <button className="tag-btn hot" onClick={() => handleTagClick(i, 'HOT')}>HOT</button>
                    <button className="tag-btn warm" onClick={() => handleTagClick(i, 'WARM')}>WARM</button>
                    <button className="tag-btn cold" onClick={() => handleTagClick(i, 'COLD')}>COLD</button>
                  </div>
                </div>
              )}

              {activeAction.index === i && activeAction.type === 'date' && (
                <div className={`${popupClass} date-menu`} ref={popupRef}>
                  <div className="input-group">
                    <label>DATE</label>
                    <input type="text" placeholder="dd/mm/yy" />
                  </div>
                  <div className="input-group">
                    <label>TIME</label>
                    <input type="text" defaultValue="02:30 PM" />
                  </div>
                  <button className="save-btn">Save</button>
                </div>
              )}

              {activeAction.index === i && activeAction.type === 'status' && (
                <div className={`${popupClass} status-menu`} ref={popupRef}>
                  <span className="popup-label">LEAD STATUS</span>
                  <select className="status-select">
                    <option>Ongoing</option>
                    <option>Closed</option>
                  </select>
                  <button className="save-btn">Save</button>
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