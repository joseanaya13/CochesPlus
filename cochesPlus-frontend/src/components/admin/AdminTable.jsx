// cochesPlus-frontend/src/components/admin/AdminTable.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Button';
import Spinner from '../common/Spinner';

const AdminTable = ({
    columns,
    data,
    loading,
    pagination,
    onPageChange,
    actions = [],
    emptyMessage = "No hay datos disponibles"
}) => {
    if (loading) {
        return (
            <div className="bg-background-light dark:bg-primary-dark rounded-lg shadow-md p-6">
                <div className="flex justify-center items-center h-32">
                    <Spinner variant="page" />
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="bg-background-light dark:bg-primary-dark rounded-lg shadow-md p-6">
                <div className="text-center py-8">
                    <div className="text-text-secondary dark:text-text-secondary mb-4">
                        <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p className="text-text-secondary dark:text-text-secondary">{emptyMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background-light dark:bg-primary-dark rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-secondary-light dark:divide-secondary-dark">
                    <thead className="bg-secondary-light/50 dark:bg-secondary-dark/50">
                        <tr>
                            {columns.map((column, index) => (
                                <th
                                    key={index}
                                    className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary uppercase tracking-wider"
                                >
                                    {column.header}
                                </th>
                            ))}
                            {actions.length > 0 && (
                                <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary dark:text-text-secondary uppercase tracking-wider">
                                    Acciones
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary-light dark:divide-secondary-dark">
                        {data.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-secondary-light/30 dark:hover:bg-secondary-dark/30 transition-colors">
                                {columns.map((column, colIndex) => (
                                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-text-dark dark:text-text-light">
                                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                                    </td>
                                ))}
                                {actions.length > 0 && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            {actions.map((action, actionIndex) => (
                                                <Button
                                                    key={actionIndex}
                                                    variant={action.variant || 'primary'}
                                                    className="text-xs px-2 py-1"
                                                    onClick={() => action.onClick(row)}
                                                    disabled={action.disabled && action.disabled(row)}
                                                >
                                                    {action.icon && <span className="mr-1">{action.icon}</span>}
                                                    {action.label}
                                                </Button>
                                            ))}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            {pagination && pagination.totalPages > 1 && (
                <div className="bg-secondary-light/20 dark:bg-secondary-dark/20 px-6 py-3 border-t border-secondary-light dark:border-secondary-dark">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-text-secondary dark:text-text-secondary">
                            Mostrando página {pagination.currentPage} de {pagination.totalPages}
                            ({pagination.total} elementos en total)
                        </div>
                        <div className="flex space-x-2">
                            <Button
                                variant="secondary"
                                className="text-xs px-3 py-1"
                                onClick={() => onPageChange(pagination.currentPage - 1)}
                                disabled={pagination.currentPage === 1}
                            >
                                Anterior
                            </Button>
                            <Button
                                variant="secondary"
                                className="text-xs px-3 py-1"
                                onClick={() => onPageChange(pagination.currentPage + 1)}
                                disabled={pagination.currentPage >= pagination.totalPages}
                            >
                                Siguiente
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

AdminTable.propTypes = {
    columns: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string.isRequired,
        header: PropTypes.string.isRequired,
        render: PropTypes.func
    })).isRequired,
    data: PropTypes.array,
    loading: PropTypes.bool,
    pagination: PropTypes.shape({
        currentPage: PropTypes.number,
        totalPages: PropTypes.number,
        total: PropTypes.number
    }),
    onPageChange: PropTypes.func,
    actions: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string.isRequired,
        onClick: PropTypes.func.isRequired,
        variant: PropTypes.string,
        icon: PropTypes.node,
        disabled: PropTypes.func
    })),
    emptyMessage: PropTypes.string
};

export default AdminTable;