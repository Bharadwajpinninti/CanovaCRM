import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      {/* Brand Logo */}
      <div className="brand">
        <span className="brand-text">Canova<span className="brand-highlight">CRM</span></span>
      </div>

      {/* Navigation Menu */}
      <nav className="nav-menu">
        {/* Dashboard Link */}
        <NavLink 
          to="/" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span>Dashboard</span>
        </NavLink>
        
        {/* Leads Link */}
        <NavLink 
          to="/leads" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span>Leads</span>
        </NavLink>
        
        {/* Employees Link */}
        <NavLink 
          to="/employees" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span>Employees</span>
        </NavLink>
        
        {/* Settings Link */}
        <NavLink 
          to="/settings" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span>Settings</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;