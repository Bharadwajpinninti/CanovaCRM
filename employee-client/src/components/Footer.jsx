import React from 'react';
import './Footer.css';

// --- ASSET IMPORTS (Replace with your actual file paths) ---
import homeIcon from '../assets/home_icon.png';
import leadsIcon from '../assets/leads_icon.png';
import scheduleIcon from '../assets/schedule_icon.png';
import profileIcon from '../assets/profile_icon.png';

const Footer = ({ activeTab, onTabChange }) => {
  return (
    <div className="footer-container">
      
      {/* Home Tab */}
      <div 
        className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} 
        onClick={() => onTabChange('home')}
      >
        <img src={homeIcon} alt="Home" className="nav-icon" />
        {/* <span className="nav-label">Home</span> */}
      </div>

      {/* Leads Tab */}
      <div 
        className={`nav-item ${activeTab === 'leads' ? 'active' : ''}`} 
        onClick={() => onTabChange('leads')}
      >
        <img src={leadsIcon} alt="Leads" className="nav-icon" />
        {/* <span className="nav-label">Leads</span> */}
      </div>

      {/* Schedule Tab */}
      <div 
        className={`nav-item ${activeTab === 'schedule' ? 'active' : ''}`} 
        onClick={() => onTabChange('schedule')}
      >
        <img src={scheduleIcon} alt="Schedule" className="nav-icon" />
        {/* <span className="nav-label">Schedule</span> */}
      </div>

      {/* Profile Tab */}
      <div 
        className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} 
        onClick={() => onTabChange('profile')}
      >
        <img src={profileIcon} alt="Profile" className="nav-icon" />
        {/* <span className="nav-label">Profile</span> */}
      </div>

    </div>
  );
};

export default Footer;