import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api';

const AuthContext = createContext(null);

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

      // Check credentials and fetch logged-in user profile
      const response = await API.get('/users/me', {
        headers: { Authorization: header },
      });

      const userProfile = response.data;

      localStorage.setItem('authHeader', header);
      localStorage.setItem('user', JSON.stringify(userProfile));
      setUser(userProfile);

      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Invalid email or password';
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
      // Register user
      await API.post('/users/register', {
        fullName,
        email,
        password,
      });

      // Auto-login after successful registration
      return await login(email, password);
    } catch (error) {
      console.error('Registration failed:', error);
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Registration failed';
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
