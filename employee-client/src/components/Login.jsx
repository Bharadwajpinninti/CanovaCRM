
import React, { useState } from 'react';
import axios from 'axios';

import './Login.css';

const Login = ({ onLoginSuccess }) => {
  const backendUrl =import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError(''); // Clear previous errors

    try {
        // 1. Call the Backend
        const { data } = await axios.post(`${backendUrl}/api/employee/login`, { 
            email, 
            password 
        });

        if (data.success) {
            // 2. SAVE THE USER DATA (Name, ID) to LocalStorage
            // This is how the Dashboard will know the name!
            localStorage.setItem('user', JSON.stringify(data.user));

            // 3. Move to Dashboard
            onLoginSuccess();
        } else {
            // Show error from backend (e.g. "User not found")
            setError(data.message);
            // toast.error(data.message); // If you have toast installed
        }

    } catch (err) {
        console.error("Login Error", err);
        setError("Server connection failed");
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-brand">
        Canova<span className="brand-highlight">CRM</span>
      </h1>

      <div className="login-form">
        {/* Error Message Display */}
        {error && <div style={{color: 'red', marginBottom: '10px', fontSize: '0.9rem'}}>{error}</div>}

        <input
          type="email"
          placeholder="email"
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="password" /* In your case, this is also the email */
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        <button className="login-submit-btn" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default Login;