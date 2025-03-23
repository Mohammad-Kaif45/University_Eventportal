import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { setAlert } from './uiSlice';

// Base URL
const API_URL = '/api/users';

// Get all users
export const getUsers = createAsyncThunk(
  'users/getUsers',
  async (params, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'x-auth-token': auth.token
        },
        params: params || {}
      };
      
      const response = await axios.get(API_URL, config);
      return response.data;
    } catch (error) {
      const message = error.response && error.response.data.msg 
        ? error.response.data.msg 
        : error.message;
      return rejectWithValue(message);
    }
  }
);

// Get user by ID
export const getUserById = createAsyncThunk(
  'users/getUserById',
  async (id, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'x-auth-token': auth.token
        }
      };
      
      const response = await axios.get(`${API_URL}/${id}`, config);
      return response.data;
    } catch (error) {
      const message = error.response && error.response.data.msg 
        ? error.response.data.msg 
        : error.message;
      return rejectWithValue(message);
    }
  }
);

// Create new user (Admin only)
export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData, { rejectWithValue, dispatch, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': auth.token
        }
      };
      
      const response = await axios.post(API_URL, userData, config);
      
      dispatch(setAlert({
        message: 'User created successfully!',
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

// Update user
export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, userData }, { rejectWithValue, dispatch, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': auth.token
        }
      };
      
      const response = await axios.put(`${API_URL}/${id}`, userData, config);
      
      dispatch(setAlert({
        message: 'User updated successfully!',
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

// Update user role
export const updateUserRole = createAsyncThunk(
  'users/updateUserRole',
  async ({ id, roleData }, { rejectWithValue, dispatch, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': auth.token
        }
      };
      
      const response = await axios.put(`${API_URL}/${id}/role`, roleData, config);
      
      dispatch(setAlert({
        message: 'User role updated successfully!',
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

// Update user status (activate/deactivate)
export const updateUserStatus = createAsyncThunk(
  'users/updateUserStatus',
  async ({ id, statusData }, { rejectWithValue, dispatch, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': auth.token
        }
      };
      
      const response = await axios.put(`${API_URL}/${id}/status`, statusData, config);
      
      dispatch(setAlert({
        message: `User ${statusData.isActive ? 'activated' : 'deactivated'} successfully!`,
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

// Delete user
export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id, { rejectWithValue, dispatch, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'x-auth-token': auth.token
        }
      };
      
      await axios.delete(`${API_URL}/${id}`, config);
      
      dispatch(setAlert({
        message: 'User deleted successfully!',
        type: 'success'
      }));
      
      return id;
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

// Get user statistics
export const getUserStats = createAsyncThunk(
  'users/getUserStats',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'x-auth-token': auth.token
        }
      };
      
      const response = await axios.get(`${API_URL}/stats/summary`, config);
      return response.data;
    } catch (error) {
      const message = error.response && error.response.data.msg 
        ? error.response.data.msg 
        : error.message;
      return rejectWithValue(message);
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState: {
    users: [],
    user: null,
    stats: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      pages: 1
    },
    loading: false,
    error: null,
    statsLoading: false,
    statsError: null
  },
  reducers: {
    clearUser: (state) => {
      state.user = null;
    },
    clearStats: (state) => {
      state.stats = null;
    },
    clearError: (state) => {
      state.error = null;
      state.statsError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get users
      .addCase(getUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
        state.pagination = {
          total: action.payload.total,
          page: action.payload.page,
          limit: action.payload.limit,
          pages: action.payload.pages
        };
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get user by ID
      .addCase(getUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create user
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.unshift(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.map(user => 
          user._id === action.payload._id ? action.payload : user
        );
        if (state.user && state.user._id === action.payload._id) {
          state.user = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update user role
      .addCase(updateUserRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.map(user => 
          user._id === action.payload._id ? action.payload : user
        );
        if (state.user && state.user._id === action.payload._id) {
          state.user = action.payload;
        }
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update user status
      .addCase(updateUserStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.map(user => 
          user._id === action.payload._id ? action.payload : user
        );
        if (state.user && state.user._id === action.payload._id) {
          state.user = action.payload;
        }
      })
      .addCase(updateUserStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => user._id !== action.payload);
        if (state.user && state.user._id === action.payload) {
          state.user = null;
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get user stats
      .addCase(getUserStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(getUserStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(getUserStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload;
      });
  }
});

export const { clearUser, clearStats, clearError } = userSlice.actions;

export default userSlice.reducer; 