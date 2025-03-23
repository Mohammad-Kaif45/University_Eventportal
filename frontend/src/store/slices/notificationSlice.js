import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { setAlert } from './uiSlice';

// Base URL
const API_URL = '/api/notifications';

// Get all notifications
export const getNotifications = createAsyncThunk(
  'notifications/getNotifications',
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

// Mark notification as read
export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'x-auth-token': auth.token
        }
      };
      
      const response = await axios.put(`${API_URL}/${notificationId}/read`, {}, config);
      return { notificationId, data: response.data };
    } catch (error) {
      const message = error.response && error.response.data.msg 
        ? error.response.data.msg 
        : error.message;
      return rejectWithValue(message);
    }
  }
);

// Mark all notifications as read
export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'x-auth-token': auth.token
        }
      };
      
      const response = await axios.put(`${API_URL}/mark-all-read`, {}, config);
      return response.data;
    } catch (error) {
      const message = error.response && error.response.data.msg 
        ? error.response.data.msg 
        : error.message;
      return rejectWithValue(message);
    }
  }
);

// Delete notification
export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId, { rejectWithValue, dispatch, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'x-auth-token': auth.token
        }
      };
      
      const response = await axios.delete(`${API_URL}/${notificationId}`, config);
      
      dispatch(setAlert({
        message: 'Notification removed',
        type: 'success'
      }));
      
      return { notificationId, data: response.data };
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

// Get unread notification count
export const getUnreadCount = createAsyncThunk(
  'notifications/getUnreadCount',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'x-auth-token': auth.token
        }
      };
      
      const response = await axios.get(`${API_URL}/unread-count`, config);
      return response.data;
    } catch (error) {
      const message = error.response && error.response.data.msg 
        ? error.response.data.msg 
        : error.message;
      return rejectWithValue(message);
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    unreadCount: 0,
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      pages: 1
    },
    loading: false,
    error: null
  },
  reducers: {
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount = state.unreadCount + 1;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get notifications
      .addCase(getNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.data;
        state.pagination = {
          total: action.payload.total,
          page: action.payload.page,
          limit: action.payload.limit,
          pages: action.payload.pages
        };
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Mark as read
      .addCase(markAsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = state.notifications.map(notification => 
          notification._id === action.payload.notificationId 
            ? { ...notification, read: true } 
            : notification
        );
        if (state.unreadCount > 0) {
          state.unreadCount -= 1;
        }
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Mark all as read
      .addCase(markAllAsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.loading = false;
        state.notifications = state.notifications.map(notification => ({
          ...notification,
          read: true
        }));
        state.unreadCount = 0;
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete notification
      .addCase(deleteNotification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.loading = false;
        const deletedNotification = state.notifications.find(
          notification => notification._id === action.payload.notificationId
        );
        
        state.notifications = state.notifications.filter(
          notification => notification._id !== action.payload.notificationId
        );
        
        // If we removed an unread notification, decrement the counter
        if (deletedNotification && !deletedNotification.read && state.unreadCount > 0) {
          state.unreadCount -= 1;
        }
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get unread count
      .addCase(getUnreadCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.loading = false;
        state.unreadCount = action.payload.count;
      })
      .addCase(getUnreadCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearNotifications, setUnreadCount, addNotification } = notificationSlice.actions;

export default notificationSlice.reducer; 