import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { setAlert } from './uiSlice';

// Base URL
const API_URL = '/api/rewards';

// Get all rewards
export const getRewards = createAsyncThunk(
  'rewards/getRewards',
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

// Get reward by ID
export const getRewardById = createAsyncThunk(
  'rewards/getRewardById',
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

// Create new reward
export const createReward = createAsyncThunk(
  'rewards/createReward',
  async (rewardData, { rejectWithValue, dispatch, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': auth.token
        }
      };
      
      const response = await axios.post(API_URL, rewardData, config);
      
      dispatch(setAlert({
        message: 'Reward created successfully!',
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

// Update reward
export const updateReward = createAsyncThunk(
  'rewards/updateReward',
  async ({ id, rewardData }, { rejectWithValue, dispatch, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': auth.token
        }
      };
      
      const response = await axios.put(`${API_URL}/${id}`, rewardData, config);
      
      dispatch(setAlert({
        message: 'Reward updated successfully!',
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

// Delete reward
export const deleteReward = createAsyncThunk(
  'rewards/deleteReward',
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
        message: 'Reward deleted successfully!',
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

// Assign reward to user
export const assignReward = createAsyncThunk(
  'rewards/assignReward',
  async ({ userId, rewardData }, { rejectWithValue, dispatch, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': auth.token
        }
      };
      
      const response = await axios.post(`${API_URL}/assign/${userId}`, rewardData, config);
      
      dispatch(setAlert({
        message: 'Reward assigned successfully!',
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

// Get user rewards
export const getUserRewards = createAsyncThunk(
  'rewards/getUserRewards',
  async (userId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'x-auth-token': auth.token
        }
      };
      
      const response = await axios.get(`${API_URL}/user/${userId}`, config);
      return response.data;
    } catch (error) {
      const message = error.response && error.response.data.msg 
        ? error.response.data.msg 
        : error.message;
      return rejectWithValue(message);
    }
  }
);

// Redeem reward
export const redeemReward = createAsyncThunk(
  'rewards/redeemReward',
  async (userRewardId, { rejectWithValue, dispatch, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': auth.token
        }
      };
      
      const response = await axios.put(`${API_URL}/redeem/${userRewardId}`, {}, config);
      
      dispatch(setAlert({
        message: 'Reward redeemed successfully!',
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

const rewardSlice = createSlice({
  name: 'rewards',
  initialState: {
    rewards: [],
    reward: null,
    userRewards: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      pages: 1
    },
    loading: false,
    error: null,
    userRewardsLoading: false,
    userRewardsError: null
  },
  reducers: {
    clearReward: (state) => {
      state.reward = null;
    },
    clearUserRewards: (state) => {
      state.userRewards = [];
    },
    clearError: (state) => {
      state.error = null;
      state.userRewardsError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get rewards
      .addCase(getRewards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRewards.fulfilled, (state, action) => {
        state.loading = false;
        state.rewards = action.payload.data;
        state.pagination = {
          total: action.payload.total,
          page: action.payload.page,
          limit: action.payload.limit,
          pages: action.payload.pages
        };
      })
      .addCase(getRewards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get reward by ID
      .addCase(getRewardById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRewardById.fulfilled, (state, action) => {
        state.loading = false;
        state.reward = action.payload;
      })
      .addCase(getRewardById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create reward
      .addCase(createReward.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReward.fulfilled, (state, action) => {
        state.loading = false;
        state.rewards.unshift(action.payload);
      })
      .addCase(createReward.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update reward
      .addCase(updateReward.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReward.fulfilled, (state, action) => {
        state.loading = false;
        state.rewards = state.rewards.map(reward => 
          reward._id === action.payload._id ? action.payload : reward
        );
        state.reward = action.payload;
      })
      .addCase(updateReward.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete reward
      .addCase(deleteReward.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReward.fulfilled, (state, action) => {
        state.loading = false;
        state.rewards = state.rewards.filter(reward => reward._id !== action.payload);
        if (state.reward && state.reward._id === action.payload) {
          state.reward = null;
        }
      })
      .addCase(deleteReward.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Assign reward
      .addCase(assignReward.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignReward.fulfilled, (state, action) => {
        state.loading = false;
        // If we're viewing the user's rewards, add the new one
        if (state.userRewards.length > 0 && 
            state.userRewards[0].user === action.payload.user) {
          state.userRewards.unshift(action.payload);
        }
      })
      .addCase(assignReward.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get user rewards
      .addCase(getUserRewards.pending, (state) => {
        state.userRewardsLoading = true;
        state.userRewardsError = null;
      })
      .addCase(getUserRewards.fulfilled, (state, action) => {
        state.userRewardsLoading = false;
        state.userRewards = action.payload.data;
        state.pagination = {
          total: action.payload.total,
          page: action.payload.page,
          limit: action.payload.limit,
          pages: action.payload.pages
        };
      })
      .addCase(getUserRewards.rejected, (state, action) => {
        state.userRewardsLoading = false;
        state.userRewardsError = action.payload;
      })
      
      // Redeem reward
      .addCase(redeemReward.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(redeemReward.fulfilled, (state, action) => {
        state.loading = false;
        state.userRewards = state.userRewards.map(userReward => 
          userReward._id === action.payload._id ? action.payload : userReward
        );
      })
      .addCase(redeemReward.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearReward, clearUserRewards, clearError } = rewardSlice.actions;

export default rewardSlice.reducer; 