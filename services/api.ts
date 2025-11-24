import axios from 'axios';

// NOTE: In a real environment, this connects to the Node.js backend.
// Ensure your backend is running on port 5000.
const API_URL = 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('planit_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('planit_token');
      localStorage.removeItem('planit_user');
      window.location.hash = '#/login';
    }
    return Promise.reject(error);
  }
);