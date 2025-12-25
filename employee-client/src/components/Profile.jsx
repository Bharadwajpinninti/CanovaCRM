import React from 'react';
import './Profile.css';
import { ChevronLeft } from 'lucide-react';

const Profile = ({ onBack, onLogout }) => {
  return (
    <div className="profile-container">
      {/* 1. Header */}
      <div className="profile-header">
        <h1 className="brand-title">Canova<span className="brand-highlight">CRM</span></h1>
        <div className="nav-row" onClick={onBack}>
          <ChevronLeft size={28} className="back-icon" />
          <span className="page-title">Profile</span>
        </div>
      </div>

      {/* 2. Profile Form */}
      <div className="profile-form">
        
        <div className="input-group">
          <label>First name</label>
          <input type="text"  className="profile-input" />
        </div>

        <div className="input-group">
          <label>Last name</label>
          <input type="text"  className="profile-input" />
        </div>

        <div className="input-group">
          <label>Email</label>
          <input type="email"  className="profile-input" />
        </div>

        <div className="input-group">
          <label>Password</label>
          <input type="password"  className="profile-input" />
        </div>

        <div className="input-group">
          <label>Confirm Password</label>
          <input type="password"  className="profile-input" />
        </div>

        {/* 3. Buttons */}
        <div className="button-row">
          <button className="profile-btn save">Save</button>
          <button className="profile-btn logout" onClick={onLogout}>Logout</button>
        </div>

      </div>
    </div>
  );
};

export default Profile;