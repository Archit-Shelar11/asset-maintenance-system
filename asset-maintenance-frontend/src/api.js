import axios from 'axios';

const api = axios.create({
  baseURL: 'https://asset-maintenance-system-liri.onrender.com',
  timeout: 10000,
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
