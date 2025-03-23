import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { setAlert } from './uiSlice';

// Base URL
const API_URL = '/api/events';

// Get all events
export const getEvents = createAsyncThunk(
  'events/getEvents',
  async (params, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'x-auth-token': auth.token || ''
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

// Get event by ID
export const getEventById = createAsyncThunk(
  'events/getEventById',
  async (id, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'x-auth-token': auth.token || ''
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

// Create new event
export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (eventData, { rejectWithValue, dispatch, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': auth.token
        }
      };
      
      const response = await axios.post(API_URL, eventData, config);
      
      dispatch(setAlert({
        message: 'Event created successfully!',
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

// Update event
export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ id, eventData }, { rejectWithValue, dispatch, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': auth.token
        }
      };
      
      const response = await axios.put(`${API_URL}/${id}`, eventData, config);
      
      dispatch(setAlert({
        message: 'Event updated successfully!',
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

// Delete event
export const deleteEvent = createAsyncThunk(
  'events/deleteEvent',
  async (id, { rejectWithValue, dispatch, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'x-auth-token': auth.token
        }
      };
      
      const response = await axios.delete(`${API_URL}/${id}`, config);
      
      dispatch(setAlert({
        message: 'Event deleted successfully!',
        type: 'success'
      }));
      
      return { id, data: response.data };
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

// Register for event
export const registerForEvent = createAsyncThunk(
  'events/registerForEvent',
  async ({ eventId, registrationData }, { rejectWithValue, dispatch, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': auth.token
        }
      };
      
      const response = await axios.post(`${API_URL}/${eventId}/register`, registrationData || {}, config);
      
      dispatch(setAlert({
        message: 'Registration successful!',
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

// Cancel registration
export const cancelRegistration = createAsyncThunk(
  'events/cancelRegistration',
  async (eventId, { rejectWithValue, dispatch, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'x-auth-token': auth.token
        }
      };
      
      const response = await axios.delete(`${API_URL}/${eventId}/register`, config);
      
      dispatch(setAlert({
        message: 'Registration cancelled successfully!',
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

// Get event participants
export const getEventParticipants = createAsyncThunk(
  'events/getEventParticipants',
  async ({ eventId, params }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'x-auth-token': auth.token
        },
        params: params || {}
      };
      
      const response = await axios.get(`${API_URL}/${eventId}/participants`, config);
      return response.data;
    } catch (error) {
      const message = error.response && error.response.data.msg 
        ? error.response.data.msg 
        : error.message;
      return rejectWithValue(message);
    }
  }
);

const eventSlice = createSlice({
  name: 'events',
  initialState: {
    events: [],
    event: null,
    participants: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      pages: 1
    },
    loading: false,
    error: null,
    participantsLoading: false,
    participantsError: null
  },
  reducers: {
    clearEvent: (state) => {
      state.event = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearParticipants: (state) => {
      state.participants = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Get events
      .addCase(getEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload.data;
        state.pagination = {
          total: action.payload.total,
          page: action.payload.page,
          limit: action.payload.limit,
          pages: action.payload.pages
        };
      })
      .addCase(getEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get event by ID
      .addCase(getEventById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEventById.fulfilled, (state, action) => {
        state.loading = false;
        state.event = action.payload;
      })
      .addCase(getEventById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create event
      .addCase(createEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events.unshift(action.payload);
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update event
      .addCase(updateEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events = state.events.map(event => 
          event._id === action.payload._id ? action.payload : event
        );
        state.event = action.payload;
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete event
      .addCase(deleteEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events = state.events.filter(event => event._id !== action.payload.id);
        if (state.event && state.event._id === action.payload.id) {
          state.event = null;
        }
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Register for event
      .addCase(registerForEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerForEvent.fulfilled, (state, action) => {
        state.loading = false;
        if (state.event) {
          state.event = {
            ...state.event,
            isRegistered: true,
            participants: state.event.participants ? state.event.participants + 1 : 1
          };
        }
      })
      .addCase(registerForEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Cancel registration
      .addCase(cancelRegistration.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelRegistration.fulfilled, (state, action) => {
        state.loading = false;
        if (state.event) {
          state.event = {
            ...state.event,
            isRegistered: false,
            participants: state.event.participants && state.event.participants > 0 
              ? state.event.participants - 1 
              : 0
          };
        }
      })
      .addCase(cancelRegistration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get event participants
      .addCase(getEventParticipants.pending, (state) => {
        state.participantsLoading = true;
        state.participantsError = null;
      })
      .addCase(getEventParticipants.fulfilled, (state, action) => {
        state.participantsLoading = false;
        state.participants = action.payload.data;
        state.pagination = {
          total: action.payload.total,
          page: action.payload.page,
          limit: action.payload.limit,
          pages: action.payload.pages
        };
      })
      .addCase(getEventParticipants.rejected, (state, action) => {
        state.participantsLoading = false;
        state.participantsError = action.payload;
      });
  }
});

export const { clearEvent, clearError, clearParticipants } = eventSlice.actions;

export default eventSlice.reducer; 