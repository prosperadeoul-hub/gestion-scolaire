import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';


const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="pagination-container">
            <button 
                className="pagination-btn"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
            >
                <ChevronLeftIcon className="pagination-icon" />
            </button>

            <div className="pagination-numbers">
                {pages.map(page => (
                    <button 
                        key={page}
                        className={`pagination-number ${currentPage === page ? 'status-active' : ''}`}
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </button>
                ))}
            </div>

            <button 
                className="pagination-btn"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
            >
                <ChevronRightIcon className="pagination-icon" />
            </button>
        </div>
    );
};

export default Pagination;
