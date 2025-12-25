import React, { useState } from 'react';
import './App.css'; 
import Dashboard from './components/Dashboard';
import Leads from './components/Leads';
import Schedule from './components/Schedule';
import Profile from './components/Profile'; 
import Footer from './components/Footer'; 
import Login from './components/Login'; 

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch(currentPage) {
      case 'home': return <Dashboard />;
      case 'leads': return <Leads onBack={() => setCurrentPage('home')} />;
      case 'schedule': return <Schedule onBack={() => setCurrentPage('home')} />;
      case 'profile': 
        return (
          <Profile 
            onBack={() => setCurrentPage('home')} 
            onLogout={() => {
              setIsLoggedIn(false);
              // Optional: Reset to home when logging out too, 
              // so next login starts fresh logically
              setCurrentPage('home'); 
            }} 
          />
        );
      default: return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <div className="phone-container">
        
        {!isLoggedIn ? (
          /* --- LOGIN LOGIC --- */
          <Login onLoginSuccess={() => {
            setIsLoggedIn(true);
            setCurrentPage('home'); // <--- CRITICAL FIX: Forces Dashboard after login
          }} />
        ) : (
          /* --- MAIN APP --- */
          <>
            <div className="content-area">
              {renderPage()}
            </div>
            
            <Footer 
              activeTab={currentPage} 
              onTabChange={setCurrentPage} 
            />
          </>
        )}

      </div> 
    </div>
  );
}

export default App;