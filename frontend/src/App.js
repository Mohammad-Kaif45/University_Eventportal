import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import Layout from './components/layout/Layout';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Dashboard from './pages/Dashboard';
import { setTheme } from './store/slices/uiSlice';
import { AuthProvider } from './contexts/AuthContext';

// Initialize theme from localStorage
const savedTheme = localStorage.getItem('theme') || 'light';
store.dispatch(setTheme(savedTheme));

const App = () => {
  // Apply dark mode class to HTML element when app loads
  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <Provider store={store}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            
            {/* Protected routes within Layout */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Add more routes here */}
              <Route path="events" element={<div>Events Page (Coming Soon)</div>} />
              <Route path="events/:id" element={<div>Event Details (Coming Soon)</div>} />
              <Route path="my-registrations" element={<div>My Registrations (Coming Soon)</div>} />
              <Route path="manage-events" element={<div>Manage Events (Coming Soon)</div>} />
              <Route path="venues" element={<div>Venues (Coming Soon)</div>} />
              <Route path="committees" element={<div>Committees (Coming Soon)</div>} />
              <Route path="users" element={<div>Users (Coming Soon)</div>} />
              <Route path="reports" element={<div>Reports (Coming Soon)</div>} />
              <Route path="rewards" element={<div>Rewards (Coming Soon)</div>} />
              <Route path="my-certificates" element={<div>My Certificates (Coming Soon)</div>} />
              <Route path="notifications" element={<div>Notifications (Coming Soon)</div>} />
              <Route path="settings" element={<div>Settings (Coming Soon)</div>} />
              <Route path="profile" element={<div>Profile (Coming Soon)</div>} />
              <Route path="calendar" element={<div>Calendar (Coming Soon)</div>} />
            </Route>
            
            {/* 404 route */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 text-center">
                  <h1 className="text-4xl font-extrabold text-indigo-600">404</h1>
                  <h2 className="text-2xl font-bold text-gray-900">Page Not Found</h2>
                  <p className="mt-2 text-sm text-gray-600">
                    The page you are looking for doesn't exist or has been moved.
                  </p>
                  <div className="mt-5">
                    <a
                      href="/"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Go back home
                    </a>
                  </div>
                </div>
              </div>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </Provider>
  );
};

export default App; 