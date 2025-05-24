/**
 * Formatea un número como precio en euros
 * @param {number} price - El precio a formatear
 * @returns {string} El precio formateado
 */
export const formatPrice = (price) => {
    if (typeof price !== 'number' || isNaN(price)) {
        return '0 €';
    }

    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
};

/**
 * Formatea un número grande con separadores de miles
 * @param {number} number - El número a formatear
 * @returns {string} El número formateado
 */
export const formatNumber = (number) => {
    if (typeof number !== 'number' || isNaN(number)) {
        return '0';
    }

    return new Intl.NumberFormat('es-ES').format(number);
};

/**
 * Formatea una fecha en formato largo
 * @param {string|Date} date - La fecha a formatear
 * @returns {string} La fecha formateada
 */
export const formatDate = (date) => {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(dateObj);
};

/**
 * Formatea una fecha en formato corto
 * @param {string|Date} date - La fecha a formatear
 * @returns {string} La fecha formateada
 */
export const formatShortDate = (date) => {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(dateObj);
};