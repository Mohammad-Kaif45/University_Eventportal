import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar, setTheme } from '../../store/slices/uiSlice';
import NotificationBell from '../ui/NotificationBell';

// Debug-friendly simplified Navbar
const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const dispatch = useDispatch();
  const { theme } = useSelector(state => state.ui || { theme: 'light' });

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  const toggleSidebarHandler = () => {
    dispatch(toggleSidebar());
  };
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    dispatch(setTheme(newTheme));
  };

  return (
    <nav className="bg-indigo-600 shadow-md">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-white font-bold text-xl">University Events Portal</span>
            </div>
            <div className="hidden sm:block sm:ml-6">
              <div className="flex space-x-4">
                <Link to="/" className="text-white px-3 py-2 rounded-md text-sm font-medium">
                  Home
                </Link>
                <Link to="/events" className="text-white px-3 py-2 rounded-md text-sm font-medium">
                  Events
                </Link>
              </div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <Link to="/login" className="text-white bg-indigo-700 hover:bg-indigo-800 px-3 py-2 rounded-md text-sm font-medium">
              Login
            </Link>
            <Link to="/register" className="text-white bg-indigo-700 hover:bg-indigo-800 ml-2 px-3 py-2 rounded-md text-sm font-medium">
              Register
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              className="ml-3 p-1 rounded-full text-white hover:text-gray-200 focus:outline-none"
            >
              <span className="sr-only">Toggle theme</span>
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 