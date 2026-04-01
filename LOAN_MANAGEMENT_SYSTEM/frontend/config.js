// config.js - Global configuration for LoanSphere Frontend

// Determine current environment
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Set the API Base URL automatically based on the environment
window.API_BASE_URL = isLocal 
    ? 'http://localhost:3000' 
    : 'https://your-backend-app-name.onrender.com'; // REPLACE THIS with your actual Render URL when deploying

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
    
    // Ensure endpoint doesn't start with a duplicate slash
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return fetch(`${window.API_BASE_URL}${normalizedEndpoint}`, options);
};
