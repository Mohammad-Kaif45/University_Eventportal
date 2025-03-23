import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    alerts: [],
    modal: {
      isOpen: false,
      content: null,
      title: '',
      size: 'md' // sm, md, lg, xl
    },
    drawer: {
      isOpen: false,
      content: null,
      side: 'right', // left, right
      size: 'md' // sm, md, lg
    },
    theme: localStorage.getItem('theme') || 'light',
    sidebarOpen: true,
    loading: {
      global: false,
      areas: {}
    }
  },
  reducers: {
    setAlert: (state, action) => {
      const id = Date.now().toString();
      const alert = {
        id,
        message: action.payload.message,
        type: action.payload.type || 'info',
        timeout: action.payload.timeout || 5000,
        createdAt: new Date().toISOString()
      };
      state.alerts.push(alert);

      // Remove alerts if more than 3
      if (state.alerts.length > 3) {
        state.alerts.shift();
      }
    },
    removeAlert: (state, action) => {
      state.alerts = state.alerts.filter(alert => alert.id !== action.payload);
    },
    clearAlerts: (state) => {
      state.alerts = [];
    },
    openModal: (state, action) => {
      state.modal = {
        isOpen: true,
        content: action.payload.content,
        title: action.payload.title || '',
        size: action.payload.size || 'md'
      };
    },
    closeModal: (state) => {
      state.modal = {
        ...state.modal,
        isOpen: false
      };
    },
    openDrawer: (state, action) => {
      state.drawer = {
        isOpen: true,
        content: action.payload.content,
        side: action.payload.side || 'right',
        size: action.payload.size || 'md'
      };
    },
    closeDrawer: (state) => {
      state.drawer = {
        ...state.drawer,
        isOpen: false
      };
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
      
      // Apply theme to HTML element
      if (action.payload === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    setLoading: (state, action) => {
      if (action.payload.area) {
        state.loading.areas[action.payload.area] = action.payload.status;
      } else {
        state.loading.global = action.payload.status;
      }
    }
  }
});

export const {
  setAlert,
  removeAlert,
  clearAlerts,
  openModal,
  closeModal,
  openDrawer,
  closeDrawer,
  toggleSidebar,
  setTheme,
  setLoading
} = uiSlice.actions;

export default uiSlice.reducer; 