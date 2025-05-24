import { useState, useEffect } from 'react';

/**
 * Hook personalizado para crear un valor con debounce
 * @param {any} value - Valor inicial
 * @param {number} delay - Retardo en milisegundos
 * @returns {any} - Valor con debounce
 */
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default useDebounce;