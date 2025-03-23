import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { getCurrentUser } from '../../store/slices/authSlice';
import { getUnreadCount } from '../../store/slices/notificationSlice';

const Layout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user, loading } = useSelector(state => state.auth);
  const { sidebarOpen, theme } = useSelector(state => state.ui);

  // Fetch current user data and notification count when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getCurrentUser());
      dispatch(getUnreadCount());
    }
    // Removed redirect to allow content to display for debugging
  }, [dispatch, isAuthenticated, loading, navigate]);

  return (
    <div className={`min-h-screen bg-gray-100 ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="flex flex-col min-h-screen">
        {/* Debug message to help identify issues */}
        <div className="bg-yellow-200 p-4 text-center">
          <p className="font-bold">Debug Mode</p>
          <p>Authentication state: {isAuthenticated ? 'Logged In' : 'Not Logged In'}</p>
          <p>Loading state: {loading ? 'Loading...' : 'Not Loading'}</p>
        </div>
        
        {/* Always show content for debugging, not just when authenticated */}
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          
          <main className={`flex-1 relative overflow-y-auto focus:outline-none transition-all duration-300 ${
            sidebarOpen ? 'lg:ml-0' : 'lg:ml-0'
          }`}>
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {loading ? (
                  <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                  </div>
                ) : (
                  <Outlet />
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout; 