import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Settings.css';
import toast from 'react-hot-toast'; // Ensure this is imported
import Breadcrumbs from '../components/Breadcrumbs';

const Settings = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: ''
  });

  const [loading, setLoading] = useState(true);

  // 1. Fetch Current Data (FIXED)
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/admin/settings`);
        if (data.success) {
          setFormData(prev => ({
            ...prev,
            firstName: data.admin.firstName,
            lastName: data.admin.lastName,
            email: data.admin.email
          }));
        }
      } catch (error) {
        toast.error("Failed to load settings.");
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, [backendUrl]);

  // 2. Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 3. Handle Save (Updated to use Toast)
  const handleSave = async (e) => {
    e.preventDefault();

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!"); // Use toast here too
      return;
    }

    try {
      const { data } = await axios.put(`${backendUrl}/api/admin/settings`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      });

      if (data.success) {
        // ✅ CORRECT PLACE: Show success message only when SAVE button is clicked
        toast.success("Profile Updated Successfully!");
        
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  if (loading) {
        return (
            <div className="settings-container">
                <div className="page-content">
                    {/* The Loading Logic */}
                    <div className="loading-container">
                        <div className="spinner"></div>
                    </div>
                </div>
            </div>
        );
    }

  return (
    <div className="settings-container">
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
                  type="text" name="firstName" 
                  value={formData.firstName} onChange={handleChange} required 
                />
              </div>

              <div className="form-group">
                <label>Last name</label>
                <input 
                  type="text" name="lastName" 
                  value={formData.lastName} onChange={handleChange} required 
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" name="email" 
                  value={formData.email} disabled 
                  style={{ backgroundColor: '#f9fafb', cursor: 'not-allowed', color: '#6b7280' }}
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" name="password" placeholder="" 
                  value={formData.password} onChange={handleChange} 
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input 
                  type="password" name="confirmPassword" placeholder="" 
                  value={formData.confirmPassword} onChange={handleChange} 
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