import axios from 'axios';

const api = axios.create({
  baseURL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8080'
    : 'https://asset-maintenance-system-ftim.onrender.com',
  timeout: 60000,
});

api.interceptors.request.use(
  (config) => {
    const authHeader = localStorage.getItem('authHeader');
    if (authHeader) {
      config.headers.Authorization = authHeader;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
