import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import your components
import Layout from './pages/Layout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Leads from './pages/Leads';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PARENT ROUTE: 
           This renders the <Layout /> (Sidebar) permanently. 
        */}
        <Route path="/" element={<Layout />}>
          
          {/* CHILD ROUTES: 
             These render *inside* the <Outlet /> of Layout.jsx 
          */}
          
          {/* Default page (localhost:5173/) -> Dashboard */}
          <Route index element={<Dashboard />} />
          
          {/* Employees page (localhost:5173/employees) */}
          <Route path="employees" element={<Employees />} />

          <Route path="/leads" element={<Leads />} />
          
          {/* Catch-all: Redirect unknown URLs to Dashboard */}
          <Route path="*" element={<Navigate to="/" />} />

          <Route path="/settings" element={<Settings />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;