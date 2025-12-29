// import React, { useState } from 'react';
// import './App.css'; 
// import Dashboard from './components/Dashboard';
// import Leads from './components/Leads';
// import Schedule from './components/Schedule';
// import Profile from './components/Profile'; 
// import Footer from './components/Footer'; 
// import Login from './components/Login'; 

// function App() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [currentPage, setCurrentPage] = useState('home');

//   const renderPage = () => {
//     switch(currentPage) {
//       case 'home': return <Dashboard />;
//       case 'leads': return <Leads onBack={() => setCurrentPage('home')} />;
//       case 'schedule': return <Schedule onBack={() => setCurrentPage('home')} />;
//       case 'profile': 
//         return (
//           <Profile 
//             onBack={() => setCurrentPage('home')} 
//             onLogout={() => {
//               setIsLoggedIn(false);
//               // Optional: Reset to home when logging out too, 
//               // so next login starts fresh logically
//               setCurrentPage('home'); 
//             }} 
//           />
//         );
//       default: return <Dashboard />;
//     }
//   };

//   return (
//     <div className="app-container">
//       <div className="phone-container">
        
//         {!isLoggedIn ? (
//           /* --- LOGIN LOGIC --- */
//           <Login onLoginSuccess={() => {
//             setIsLoggedIn(true);
//             setCurrentPage('home'); // <--- CRITICAL FIX: Forces Dashboard after login
//           }} />
//         ) : (
//           /* --- MAIN APP --- */
//           <>
//             <div className="content-area">
//               {renderPage()}
//             </div>
            
//             <Footer 
//               activeTab={currentPage} 
//               onTabChange={setCurrentPage} 
//             />
//           </>
//         )}

//       </div> 
//     </div>
//   );
// }

// export default App;

import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css'; 
import Dashboard from './components/Dashboard';
import Leads from './components/Leads';
import Schedule from './components/Schedule';
import Profile from './components/Profile'; 
import Footer from './components/Footer'; 
import Login from './components/Login'; 

function App() {
  const navigate = useNavigate();
  const location = useLocation(); // To track which page we are on

  // Determine active tab for Footer based on current URL
  // If path is '/leads', activeTab is 'leads'. Default is 'home'.
  const currentPath = location.pathname.replace('/', '') || 'home';
  const activeTab = currentPath === 'dashboard' ? 'home' : currentPath;

  // --- Login Logic ---
  const handleLoginSuccess = () => {
    // Save login state if needed, then go to Dashboard
    navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('user'); // Clear data
    navigate('/'); // Go back to Login
  };

  // --- Footer Navigation Handler ---
  const handleTabChange = (tab) => {
    if (tab === 'home') navigate('/dashboard');
    else navigate(`/${tab}`);
  };

  return (
    <div className="app-container">
      <div className="phone-container">
        
        <div className="content-area">
          <Routes>
            {/* Login Route (Root Path) */}
            <Route path="/" element={<Login onLoginSuccess={handleLoginSuccess} />} />

            {/* App Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leads" element={<Leads onBack={() => navigate('/dashboard')} />} />
            <Route path="/schedule" element={<Schedule onBack={() => navigate('/dashboard')} />} />
            
            <Route path="/profile" element={
              <Profile 
                onBack={() => navigate('/dashboard')} 
                onLogout={handleLogout} 
              />
            } />
          </Routes>
        </div>

        {/* Show Footer ONLY if we are NOT on the Login page */}
        {location.pathname !== '/' && (
          <Footer 
            activeTab={activeTab} 
            onTabChange={handleTabChange} 
          />
        )}

      </div> 
    </div>
  );
}

export default App;