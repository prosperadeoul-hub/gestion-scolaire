import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const Pagination = ({ currentPage, totalPages, onPageChange, showInfo = true }) => {
    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
        const delta = 2; // Number of pages to show around current page
        const range = [];
        const rangeWithDots = [];

        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else if (totalPages > 1) {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    const visiblePages = getVisiblePages();

    return (
        <div className="modern-pagination">
            {showInfo && (
                <div className="pagination-info">
                    Page {currentPage} sur {totalPages}
                </div>
            )}

            <div className="pagination-controls">
                <button
                    className="pagination-btn pagination-btn--prev"
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    aria-label="Page précédente"
                >
                    <ChevronLeftIcon className="pagination-icon" />
                    <span className="pagination-text">Précédent</span>
                </button>

                <div className="pagination-numbers">
                    {visiblePages.map((page, index) => {
                        if (page === '...') {
                            return (
                                <span key={`dots-${index}`} className="pagination-dots">
                                    ...
                                </span>
                            );
                        }

                        return (
                            <button
                                key={page}
                                className={`pagination-number ${
                                    currentPage === page
                                        ? 'pagination-number--active'
                                        : ''
                                }`}
                                onClick={() => onPageChange(page)}
                                aria-label={`Aller à la page ${page}`}
                                aria-current={currentPage === page ? 'page' : undefined}
                            >
                                {page}
                            </button>
                        );
                    })}
                </div>

                <button
                    className="pagination-btn pagination-btn--next"
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    aria-label="Page suivante"
                >
                    <span className="pagination-text">Suivant</span>
                    <ChevronRightIcon className="pagination-icon" />
                </button>
            </div>

            {totalPages > 5 && (
                <div className="pagination-jump">
                    <span className="pagination-jump-text">Aller à :</span>
                    <input
                        type="number"
                        min="1"
                        max={totalPages}
                        placeholder={currentPage}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                const page = parseInt(e.target.value);
                                if (page >= 1 && page <= totalPages) {
                                    onPageChange(page);
                                    e.target.value = '';
                                }
                            }
                        }}
                        className="pagination-jump-input"
                    />
                </div>
            )}
        </div>
    );
};

export default Pagination;
