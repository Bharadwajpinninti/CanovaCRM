import React, { useState } from 'react';
import axios from 'axios';
import './Profile.css';
import { ChevronLeft } from 'lucide-react';

const Profile = ({ onBack, onLogout }) => {
  
  // --- 1. INITIALIZE STATE DIRECTLY FROM LOCAL STORAGE ---
  const [formData, setFormData] = useState(() => {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : {};
    
    return {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '', // Email is loaded but read-only
      password: '',
      confirmPassword: ''
    };
  });

  const [loading, setLoading] = useState(false);

  // --- 2. HANDLE INPUT CHANGES ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- 3. SAVE FUNCTION (Updates First & Last Name Only) ---
  const handleSave = async () => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
    const user = JSON.parse(storedUser);
    
    // Get ID from local storage object
    const id = user.employeeId || user._id || user.id;

    setLoading(true);

    try {
      // API Call: Update Name Only
      const res = await axios.put(`http://localhost:5000/api/employee/update-profile/${id}`, {
        firstName: formData.firstName,
        lastName: formData.lastName
      });

      // Update Local Storage immediately so Dashboard reflects changes
      const updatedUser = { ...user, firstName: res.data.firstName, lastName: res.data.lastName };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      {/* Header */}
      <div className="profile-header">
        <h1 className="brand-title">Canova<span className="brand-highlight">CRM</span></h1>
        <div className="nav-row" onClick={onBack}>
          <ChevronLeft size={28} className="back-icon" />
          <span className="page-title">Profile</span>
        </div>
      </div>

      {/* Form */}
      <div className="profile-form">
        
        <div className="input-group">
          <label>First name</label>
          <input 
            type="text" 
            name="firstName"
            className="profile-input" 
            value={formData.firstName} 
            onChange={handleChange} 
          />
        </div>

        <div className="input-group">
          <label>Last name</label>
          <input 
            type="text" 
            name="lastName"
            className="profile-input" 
            value={formData.lastName} 
            onChange={handleChange} 
          />
        </div>

        <div className="input-group">
          <label>Email</label>
          {/* Read Only & Greyed Out */}
          <input 
            type="email" 
            className="profile-input" 
            value={formData.email} 
            readOnly 
            style={{ opacity: 0.7, cursor: 'not-allowed', backgroundColor: '#e5e7eb' }}
          />
        </div>

        <div className="input-group">
          <label>Password</label>
          <input 
            type="password" 
            name="password"
            className="profile-input" 
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>Confirm Password</label>
          <input 
            type="password" 
            name="confirmPassword"
            className="profile-input" 
            value={formData.confirmPassword}
            onChange={handleChange}
            
          />
        </div>

        {/* Buttons */}
        <div className="button-row">
          <button className="profile-btn save" onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
          <button className="profile-btn logout" onClick={onLogout}>Logout</button>
        </div>

      </div>
    </div>
  );
};

export default Profile;