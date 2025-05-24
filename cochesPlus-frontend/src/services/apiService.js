import axios from 'axios';

const API_URL = import.meta.env.PROD
    ? 'https://josefa25.iesmontenaranco.com:8000/api'
    : 'http://localhost:8000/api';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('roles');
        }
        return Promise.reject(error);
    }
);

const apiService = {
    get: async (url, config = {}) => {
        try {
            console.log('GET request to:', url); // Debug
            const response = await apiClient.get(url, config);
            console.log('GET response from:', url, response.data); // Debug
            return response.data;
        } catch (error) {
            console.error('Error GET:', error);
            throw handleApiError(error);
        }
    },

    post: async (url, data = {}, config = {}) => {
        try {
            const response = await apiClient.post(url, data, config);
            return response.data;
        } catch (error) {
            console.error('Error POST:', error);
            throw handleApiError(error);
        }
    },

    put: async (url, data = {}, config = {}) => {
        try {
            const response = await apiClient.put(url, data, config);
            return response.data;
        } catch (error) {
            console.error('Error PUT:', error);
            throw handleApiError(error);
        }
    },

    delete: async (url, config = {}) => {
        try {
            const response = await apiClient.delete(url, config);
            return response.data;
        } catch (error) {
            console.error('Error DELETE:', error);
            throw handleApiError(error);
        }
    }
};

function handleApiError(error) {
    if (error.response) {
        const errorMessage = error.response.data.message || 'Ha ocurrido un error al comunicarse con el servidor';
        return {
            message: errorMessage,
            status: error.response.status,
            errors: error.response.data.errors || {}
        };
    } else if (error.request) {
        return {
            message: 'No se pudo establecer comunicación con el servidor',
            status: 0
        };
    } else {
        return {
            message: 'Error al configurar la petición',
            status: 0
        };
    }
}

export default apiService;