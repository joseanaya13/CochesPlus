import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button';

const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    maxPagesToShow = 5,
    className = '',
    showFirstLast = true,
    showPrevNext = true,
    size = 'normal' // 'small', 'normal', 'large'
}) => {
    // Función para generar el array de páginas a mostrar
    const getPageNumbers = () => {
        const pages = [];

        if (totalPages <= maxPagesToShow) {
            // Si el total de páginas es menor o igual al máximo a mostrar
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Lógica para mostrar páginas con elipsis
            const halfRange = Math.floor(maxPagesToShow / 2);

            if (currentPage <= halfRange + 1) {
                // Al principio
                for (let i = 1; i <= maxPagesToShow - 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - halfRange) {
                // Al final
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - maxPagesToShow + 2; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // En el medio
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - halfRange + 1; i <= currentPage + halfRange - 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            onPageChange(page);
        }
    };

    // Si no hay páginas, no mostrar nada
    if (totalPages <= 0) return null;

    // Determinar el tamaño de los botones
    const sizeClasses = {
        small: 'px-2 py-1 text-xs',
        normal: 'px-3 py-1.5 text-sm',
        large: 'px-4 py-2 text-base'
    };

    const buttonSize = sizeClasses[size] || sizeClasses.normal;

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <nav className="flex items-center gap-1" role="navigation" aria-label="Paginación">
                {/* Botón Primera página */}
                {showFirstLast && currentPage > 2 && (
                    <Button
                        variant="background-light"
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className={`${buttonSize} hover-lift !border-secondary-light dark:!border-secondary-dark`}
                        aria-label="Primera página"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                    </Button>
                )}

                {/* Botón Anterior */}
                {showPrevNext && (
                    <Button
                        variant="background-light"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`${buttonSize} hover-lift flex items-center gap-1 !border-secondary-light dark:!border-secondary-dark`}
                        aria-label="Página anterior"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="hidden sm:inline">Anterior</span>
                    </Button>
                )}

                {/* Números de página */}
                <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => {
                        if (page === '...') {
                            return (
                                <span
                                    key={`ellipsis-${index}`}
                                    className="px-2 text-text-secondary dark:text-text-secondary"
                                >
                                    •••
                                </span>
                            );
                        }

                        const isActive = page === currentPage;

                        return (
                            <Button
                                key={page}
                                variant={isActive ? 'primary' : 'background-light'}
                                onClick={() => handlePageChange(page)}
                                className={`
                                    ${buttonSize} 
                                    ${isActive ? 'hover-glow !bg-primary !text-white' : 'hover-lift !border-secondary-light dark:!border-secondary-dark'}
                                    ${isActive ? 'font-semibold shadow-md' : ''}
                                    min-w-[40px]
                                `}
                                aria-label={`Ir a página ${page}`}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                {page}
                            </Button>
                        );
                    })}
                </div>

                {/* Botón Siguiente */}
                {showPrevNext && (
                    <Button
                        variant="background-light"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`${buttonSize} hover-lift flex items-center gap-1 !border-secondary-light dark:!border-secondary-dark`}
                        aria-label="Página siguiente"
                    >
                        <span className="hidden sm:inline">Siguiente</span>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Button>
                )}

                {/* Botón Última página */}
                {showFirstLast && currentPage < totalPages - 1 && (
                    <Button
                        variant="background-light"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className={`${buttonSize} hover-lift !border-secondary-light dark:!border-secondary-dark`}
                        aria-label="Última página"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                    </Button>
                )}
            </nav>

            {/* Información adicional (opcional) */}
            <div className="hidden lg:flex items-center ml-4 text-sm text-text-secondary dark:text-text-secondary">
                Página {currentPage} de {totalPages}
            </div>
        </div>
    );
};

Pagination.propTypes = {
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    maxPagesToShow: PropTypes.number,
    className: PropTypes.string,
    showFirstLast: PropTypes.bool,
    showPrevNext: PropTypes.bool,
    size: PropTypes.oneOf(['small', 'normal', 'large'])
};

export default Pagination;