import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { setAlert } from './uiSlice';

// Base URL
const API_URL = '/api/auth';

// Get user from localStorage
const token = localStorage.getItem('token');

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      const response = await axios.post(`${API_URL}/register`, userData, config);
      
      // Set token in localStorage
      localStorage.setItem('token', response.data.token);
      
      dispatch(setAlert({
        message: 'Registration successful! Welcome aboard.',
        type: 'success'
      }));
      
      return response.data;
    } catch (error) {
      const message = error.response && error.response.data.msg 
        ? error.response.data.msg 
        : error.message;
        
      dispatch(setAlert({
        message,
        type: 'error'
      }));
      
      return rejectWithValue(message);
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (userData, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      const response = await axios.post(`${API_URL}/login`, userData, config);
      
      // Set token in localStorage
      localStorage.setItem('token', response.data.token);
      
      dispatch(setAlert({
        message: 'Login successful!',
        type: 'success'
      }));
      
      return response.data;
    } catch (error) {
      const message = error.response && error.response.data.msg 
        ? error.response.data.msg 
        : error.message;
        
      dispatch(setAlert({
        message,
        type: 'error'
      }));
      
      return rejectWithValue(message);
    }
  }
);

// Get current user
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      
      const config = {
        headers: {
          'x-auth-token': auth.token
        }
      };
      
      const response = await axios.get(`${API_URL}/me`, config);
      return response.data;
    } catch (error) {
      const message = error.response && error.response.data.msg 
        ? error.response.data.msg 
        : error.message;
      return rejectWithValue(message);
    }
  }
);

// Logout user
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue, dispatch, getState }) => {
    try {
      const { auth } = getState();
      
      const config = {
        headers: {
          'x-auth-token': auth.token
        }
      };
      
      await axios.post(`${API_URL}/logout`, {}, config);
      
      // Remove token from localStorage
      localStorage.removeItem('token');
      
      dispatch(setAlert({
        message: 'Logged out successfully',
        type: 'success'
      }));
      
      return true;
    } catch (error) {
      // Even if there's an error, we still want to log the user out locally
      localStorage.removeItem('token');
      
      const message = error.response && error.response.data.msg 
        ? error.response.data.msg 
        : error.message;
      return rejectWithValue(message);
    }
  }
);

// Change password
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData, { rejectWithValue, dispatch, getState }) => {
    try {
      const { auth } = getState();
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': auth.token
        }
      };
      
      const response = await axios.post(`${API_URL}/change-password`, passwordData, config);
      
      dispatch(setAlert({
        message: response.data.msg || 'Password changed successfully',
        type: 'success'
      }));
      
      return response.data;
    } catch (error) {
      const message = error.response && error.response.data.msg 
        ? error.response.data.msg 
        : error.message;
        
      dispatch(setAlert({
        message,
        type: 'error'
      }));
      
      return rejectWithValue(message);
    }
  }
);

// Request password reset
export const requestPasswordReset = createAsyncThunk(
  'auth/requestPasswordReset',
  async (email, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      const response = await axios.post(`${API_URL}/reset-password-request`, { email }, config);
      
      dispatch(setAlert({
        message: response.data.msg || 'Password reset link sent to your email',
        type: 'success'
      }));
      
      return response.data;
    } catch (error) {
      const message = error.response && error.response.data.msg 
        ? error.response.data.msg 
        : error.message;
        
      dispatch(setAlert({
        message,
        type: 'error'
      }));
      
      return rejectWithValue(message);
    }
  }
);

// Reset password with token
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (resetData, { rejectWithValue, dispatch }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      const response = await axios.post(`${API_URL}/reset-password`, resetData, config);
      
      dispatch(setAlert({
        message: response.data.msg || 'Password reset successful',
        type: 'success'
      }));
      
      return response.data;
    } catch (error) {
      const message = error.response && error.response.data.msg 
        ? error.response.data.msg 
        : error.message;
        
      dispatch(setAlert({
        message,
        type: 'error'
      }));
      
      return rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: token || null,
    isAuthenticated: token ? true : false,
    user: null,
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.token = null;
      })
      
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.token = null;
      })
      
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        localStorage.removeItem('token');
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
      })
      
      // Change password
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Password reset request
      .addCase(requestPasswordReset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Reset password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError } = authSlice.actions;

export default authSlice.reducer; 