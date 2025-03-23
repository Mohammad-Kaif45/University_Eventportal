import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (token) => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/user', {
        headers: { 'x-auth-token': token }
      });
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });
      const { token } = response.data;
      localStorage.setItem('token', token);
      await fetchUser(token);
      return true;
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', userData);
      const { token } = response.data;
      localStorage.setItem('token', token);
      await fetchUser(token);
      return true;
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:5000/api/auth/user',
        profileData,
        {
          headers: { 'x-auth-token': token }
        }
      );
      setUser(response.data);
      return true;
    } catch (error) {
      setError(error.response?.data?.message || 'Profile update failed');
      return false;
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:5000/api/auth/password',
        { currentPassword, newPassword },
        {
          headers: { 'x-auth-token': token }
        }
      );
      return true;
    } catch (error) {
      setError(error.response?.data?.message || 'Password update failed');
      return false;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    updatePassword
  };

  return (
    <AuthContext.Provider value={value}>
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