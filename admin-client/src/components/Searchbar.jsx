import React from 'react';
import './Searchbar.css';

// --- IMAGE IMPORT ---
// Make sure 'icon-search.png' exists in src/assets/
import searchIcon from '../assets/icon-search.png';

const Search = ({ value, onChange, placeholder = "Search here..." }) => {
  return (
    <header className="top-header">
      <div className="search-container">
        
        {/* 1. Icon (Absolute Positioned) */}
        <img src={searchIcon} alt="Search" className="search-icon" />
        
        {/* 2. Input Field */}
        <input 
          type="text" 
          placeholder={placeholder}
          className="search-input" 
          value={value}
          onChange={onChange}
        />
        
      </div>
    </header>
  );
};

export default Search;