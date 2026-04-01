// config.js - Global configuration for LMS-Sphere-Simulator Frontend

// Determine current environment
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// API Base URL — switches automatically between dev and production
window.API_BASE_URL = isLocal
    ? 'http://localhost:3000'
    : 'https://loansphere-tlqd.onrender.com';

/**
 * Common fetch wrapper that automatically uses the base URL
 */
window.apiFetch = async function(endpoint, options = {}) {
    const defaultHeaders = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('lms_token');
    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    options.headers = { ...defaultHeaders, ...options.headers };

    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return fetch(`${window.API_BASE_URL}${normalizedEndpoint}`, options);
};
