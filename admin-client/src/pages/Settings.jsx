import React, { useState } from 'react';
import './Settings.css';
import Breadcrumbs from '../components/Breadcrumbs';

const Settings = () => {
  const [formData, setFormData] = useState({
    firstName: 'Sarthak',
    lastName: 'Pal',
    email: 'Sarthakpal08@gmail.com', // Non-editable per rules
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    alert("Profile Updated Successfully!");
  };

  return (
    <div className="settings-container">
      {/* Top horizontal line consistent with other pages */}
      <div className="settings-top-header"></div>

      <div className="settings-main-area">
        <div className="page-header">
          <Breadcrumbs />
        </div>

        <div className="settings-card">
          <div className="settings-tabs">
            <div className="tab-item active">Edit Profile</div>
          </div>

          <div className="settings-form-container">
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column' }}>
              
              <div className="form-group">
                <label>First name</label>
                <input 
                  type="text" 
                  name="firstName" 
                  value={formData.firstName} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Last name</label>
                <input 
                  type="text" 
                  name="lastName" 
                  value={formData.lastName} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  disabled 
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  name="password" 
                  placeholder="***********"
                  value={formData.password} 
                  onChange={handleChange} 
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input 
                  type="password" 
                  name="confirmPassword" 
                  placeholder="***********"
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                />
              </div>

              <div className="settings-footer">
                <button type="submit" className="btn-save-settings">Save</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;