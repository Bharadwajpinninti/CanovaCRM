import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {Toaster} from 'react-hot-toast'

// Import your components
import Layout from './pages/Layout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Leads from './pages/Leads';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
    <Toaster 
        position="top-center" 
        reverseOrder={false} 
      />
      <Routes>
       
        
        <Route path="/" element={<Layout />}>
          
         
          
      
          <Route index element={<Dashboard />} />
          
       
          <Route path="employees" element={<Employees />} />

          <Route path="/leads" element={<Leads />} />
          
       
          <Route path="*" element={<Navigate to="/" />} />

          <Route path="/settings" element={<Settings />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;