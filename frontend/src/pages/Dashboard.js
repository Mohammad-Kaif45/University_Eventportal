import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getEvents } from '../store/slices/eventSlice';
import DashboardStats from '../components/dashboard/DashboardStats';
import UpcomingEvents from '../components/dashboard/UpcomingEvents';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { events = [], loading } = useSelector(state => state.events || { events: [], loading: false });

  // Fetch upcoming events when component mounts
  useEffect(() => {
    dispatch(getEvents({ 
      status: 'upcoming',
      limit: 3, 
      sort: 'startDate' 
    }));
  }, [dispatch]);

  // Filter events to show only upcoming events (with safety checks)
  const upcomingEvents = Array.isArray(events) 
    ? events.filter(event => {
        if (!event || !event.startDate) return false;
        const eventDate = new Date(event.startDate);
        return eventDate > new Date();
      }) 
    : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Welcome{user ? `, ${user.name?.split(' ')[0] || ''}` : ''}!</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Here's what's happening in your university event portal.
        </p>
      </div>

      {/* Dashboard Statistics */}
      <DashboardStats />

      {/* Upcoming Events */}
      <UpcomingEvents events={upcomingEvents} />

      {/* Recent Notifications */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Announcements</h2>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {loading ? (
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center sm:text-left">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">Summer Internship Fair</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      The annual Summer Internship Fair will be held next month. Make sure to update your profile and prepare your resume.
                    </p>
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Posted 2 days ago</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">New Course Registration Open</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Registration for the new AI and Machine Learning course is now open. Limited seats available!
                    </p>
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Posted 5 days ago</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Quick Access</h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAccessCard 
            title="My Certificates"
            description="View and download your certificates"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
            link="/my-certificates"
          />
          
          <QuickAccessCard 
            title="My Rewards"
            description="Check your points and rewards"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            link="/rewards"
          />
          
          <QuickAccessCard 
            title="Calendar"
            description="View your event schedule"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            link="/calendar"
          />
          
          <QuickAccessCard 
            title="My Profile"
            description="Update your personal information"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
            link="/profile"
          />
        </div>
      </div>
    </div>
  );
};

const QuickAccessCard = ({ title, description, icon, link }) => {
  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="p-3 rounded-md bg-indigo-50 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-200">
              {icon}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                {title}
              </dt>
              <dd>
                <div className="text-sm text-gray-900 dark:text-white">
                  {description}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
        <div className="text-sm">
          <a href={link} className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
            Access
            <span className="ml-1">→</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 