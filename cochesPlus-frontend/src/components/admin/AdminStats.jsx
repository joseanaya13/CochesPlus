// cochesPlus-frontend/src/components/admin/AdminStats.jsx
import React from 'react';
import PropTypes from 'prop-types';

const AdminStats = ({ stats, loading }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, index) => (
                    <div key={index} className="bg-background-light dark:bg-primary-dark rounded-lg shadow-md p-6 animate-pulse">
                        <div className="h-4 bg-secondary-light dark:bg-secondary-dark rounded w-3/4 mb-2"></div>
                        <div className="h-8 bg-secondary-light dark:bg-secondary-dark rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-secondary-light dark:bg-secondary-dark rounded w-full"></div>
                    </div>
                ))}
            </div>
        );
    }

    const statsConfig = [
        {
            title: 'Total Usuarios',
            value: stats?.usuarios?.total || 0,
            subtitle: `${stats?.usuarios?.nuevos_mes || 0} nuevos este mes`,
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
            ),
            color: 'primary',
            trend: stats?.usuarios?.nuevos_mes > 0 ? 'up' : 'neutral'
        },
        {
            title: 'Total Anuncios',
            value: stats?.anuncios?.total || 0,
            subtitle: `${stats?.anuncios?.activos || 0} activos`,
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            ),
            color: 'success',
            trend: 'neutral'
        },
        {
            title: 'Conversaciones',
            value: stats?.conversaciones?.total || 0,
            subtitle: `${stats?.conversaciones?.activas || 0} activas`,
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            ),
            color: 'info',
            trend: 'neutral'
        },
        {
            title: 'Pendientes Verificación',
            value: stats?.anuncios?.pendientes_verificacion || 0,
            subtitle: 'Requieren revisión',
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            ),
            color: 'warning',
            trend: stats?.anuncios?.pendientes_verificacion > 0 ? 'up' : 'neutral'
        }
    ];

    const getColorClasses = (color) => {
        const colors = {
            primary: 'border-primary text-primary bg-primary/10',
            success: 'border-success text-success bg-success/10',
            warning: 'border-warning text-warning bg-warning/10',
            error: 'border-error text-error bg-error/10',
            info: 'border-info text-info bg-info/10'
        };
        return colors[color] || colors.primary;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsConfig.map((stat, index) => (
                <div
                    key={index}
                    className={`bg-background-light dark:bg-primary-dark rounded-lg shadow-md p-6 border-l-4 ${getColorClasses(stat.color)} hover:shadow-lg transition-all duration-300 hover-lift`}
                >
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <p className="text-sm text-text-secondary dark:text-text-secondary font-medium">
                                {stat.title}
                            </p>
                            <p className="text-3xl font-bold text-text-dark dark:text-text-light mt-1">
                                {stat.value.toLocaleString()}
                            </p>
                            <p className="text-xs text-text-secondary dark:text-text-secondary mt-2">
                                {stat.subtitle}
                            </p>
                        </div>
                        <div className={`h-12 w-12 flex items-center justify-center rounded-full ${stat.color === 'primary' ? 'bg-primary/10 text-primary' :
                            stat.color === 'success' ? 'bg-success/10 text-success' :
                                stat.color === 'warning' ? 'bg-warning/10 text-warning' :
                                    stat.color === 'error' ? 'bg-error/10 text-error' :
                                        'bg-info/10 text-info'}`}>
                            {stat.icon}
                        </div>
                    </div>

                    {stat.trend === 'up' && (
                        <div className="mt-3 flex items-center">
                            <svg className="h-4 w-4 text-success mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            <span className="text-xs text-success font-medium">Atención requerida</span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

AdminStats.propTypes = {
    stats: PropTypes.object,
    loading: PropTypes.bool
};

export default AdminStats;