// API Configuration
// Automatically uses the correct API URL based on environment
const getApiBaseUrl = () => {
  // In production (Vercel), use relative URLs (same domain)
  // Vercel serves API at /api/* routes
  if (process.env.NODE_ENV === 'production' || window.location.hostname !== 'localhost') {
    return ''; // Empty string means same origin - API routes are at /api/*
  }
  // In development, use localhost
  return process.env.REACT_APP_API_URL || 'http://localhost:5000';
};

export const API_BASE_URL = getApiBaseUrl();

