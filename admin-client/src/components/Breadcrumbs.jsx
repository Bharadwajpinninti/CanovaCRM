import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import './Breadcrumbs.css';

const Breadcrumbs = () => {
  const location = useLocation();
  
  
  const breadcrumbMap = {
    '/': 'Dashboard',
    '/employees': 'Employees',
    '/leads': 'Leads',
    '/settings': 'Settings'
  };

  // 2. Get the current page name (Default to 'Dashboard' if path not found)
  const currentPath = location.pathname;
  const pageName = breadcrumbMap[currentPath] || 'Dashboard';

  return (
    <div className="breadcrumb-wrapper">
      {/* 3. HOME LINK (Clickable -> Redirects to Dashboard) */}
      <Link to="/" className="crumb-link">
        Home
      </Link>

   
      <span className="crumb-separator"> › </span>

      {/* 4. CURRENT PAGE (Static Text) */}
      <span className="crumb-current">
        {pageName}
      </span>
    </div>
  );
};

export default Breadcrumbs;