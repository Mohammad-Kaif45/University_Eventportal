import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import eventReducer from './slices/eventSlice';
import notificationReducer from './slices/notificationSlice';
import uiReducer from './slices/uiSlice';
import userReducer from './slices/userSlice';
import rewardReducer from './slices/rewardSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventReducer,
    notifications: notificationReducer,
    ui: uiReducer,
    users: userReducer,
    rewards: rewardReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types (socket.io actions, etc)
        ignoredActions: ['socket/connected', 'socket/disconnected'],
        // Ignore these field paths in all actions and state
        ignoredPaths: ['socket.instance']
      }
    }),
  devTools: process.env.NODE_ENV !== 'production'
});

export default store; 