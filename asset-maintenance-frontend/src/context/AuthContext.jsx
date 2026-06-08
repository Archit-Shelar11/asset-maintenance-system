import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Configure a custom Axios instance
export const api = axios.create({
  timeout: 10000,
});

// Inject the HTTP Basic authentication header on every request
api.interceptors.request.use(
  (config) => {
    const authHeader = localStorage.getItem('authHeader');
    if (authHeader) {
      config.headers.Authorization = authHeader;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedAuthHeader = localStorage.getItem('authHeader');

    if (storedUser && storedAuthHeader) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const credentials = btoa(`${email}:${password}`);
      const header = `Basic ${credentials}`;

      // Call the profiles endpoint to check credentials and get user profile
      const response = await axios.get('/users/me', {
        headers: { Authorization: header },
      });

      const userProfile = response.data;

      // Save credentials & user details in state and localStorage
      localStorage.setItem('authHeader', header);
      localStorage.setItem('user', JSON.stringify(userProfile));
      setUser(userProfile);

      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      const message = error.response?.data?.message || 'Invalid email or password';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('authHeader');
    localStorage.removeItem('user');
    setUser(null);
  };

  const register = async (fullName, email, password) => {
    try {
      // POST registration details
      const response = await axios.post('/users/register', {
        fullName,
        email,
        password,
      });

      // Auto login user after registration
      return await login(email, password);
    } catch (error) {
      console.error('Registration failed:', error);
      const message = error.response?.data?.message || 'Registration failed';
      return { success: false, error: message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
