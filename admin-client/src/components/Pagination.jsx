import React from 'react';
import './Pagination.css';

const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);


  if (totalPages === 0) return null;

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Generate Page Numbers (1, 2, ..., 10)
  const renderPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      // Logic to show start, end, and current neighbors (e.g., 1 ... 4 5 6 ... 10)
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(
          <button
            key={i}
            className={`pg-num ${currentPage === i ? 'active' : ''}`}
            onClick={() => onPageChange(i)}
          >
            {i}
          </button>
        );
      } else if (i === 2 || i === totalPages - 1) {
        pages.push(<span key={i} className="pg-dots">...</span>);
      }
    }
    return pages;
  };

  return (
    <div className="pagination-container">
      {/* PREVIOUS BUTTON */}
      <button 
        className="pg-btn" 
        onClick={handlePrevious} 
        disabled={currentPage === 1}
      >
        <span className="arrow-icon">←</span> Previous
      </button>

      {/* PAGE NUMBERS */}
      <div className="pg-numbers">
        {renderPageNumbers()}
      </div>

      {/* NEXT BUTTON */}
      <button 
        className="pg-btn" 
        onClick={handleNext} 
        disabled={currentPage === totalPages}
      >
        Next <span className="arrow-icon">→</span>
      </button>
    </div>
  );
};

export default Pagination;