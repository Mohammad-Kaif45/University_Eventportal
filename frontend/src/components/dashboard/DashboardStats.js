import React from 'react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon, change, changeType, linkTo, linkText }) => {
  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`p-3 rounded-md ${
              changeType === 'increase' 
                ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200' 
                : changeType === 'decrease' 
                  ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200'
                  : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200'
            }`}>
              {icon}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                {title}
              </dt>
              <dd>
                <div className="text-lg font-medium text-gray-900 dark:text-white">
                  {value}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
        <div className="text-sm">
          {change && (
            <span className={`mr-2 ${
              changeType === 'increase' 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {changeType === 'increase' ? '↑' : '↓'} {change}
            </span>
          )}
          {linkTo ? (
            <Link to={linkTo} className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              {linkText || 'View all'}
            </Link>
          ) : (
            <span className="font-medium text-gray-600 dark:text-gray-400">
              from last month
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const DashboardStats = ({ stats }) => {
  // Default stats if none provided (for development/preview)
  const defaultStats = {
    eventsCount: 12,
    upcomingEvents: 5,
    registeredEvents: 3,
    completedEvents: 7,
    pointsEarned: 450,
    certificatesCount: 4
  };

  const statsData = stats || defaultStats;
  
  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-5">Dashboard Overview</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          title="Total Events" 
          value={statsData.eventsCount}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          change="16%"
          changeType="increase"
          linkTo="/events"
          linkText="View all events"
        />
        
        <StatCard 
          title="Upcoming Events" 
          value={statsData.upcomingEvents}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          change="8%"
          changeType="increase"
          linkTo="/events?filter=upcoming"
          linkText="View upcoming events"
        />
        
        <StatCard 
          title="Your Registered Events" 
          value={statsData.registeredEvents}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          }
          linkTo="/my-registrations"
          linkText="View your registrations"
        />
        
        <StatCard 
          title="Completed Events" 
          value={statsData.completedEvents}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
          change="25%"
          changeType="increase"
          linkTo="/events?filter=completed"
          linkText="View completed events"
        />
        
        <StatCard 
          title="Points Earned" 
          value={statsData.pointsEarned}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          change="12%"
          changeType="increase"
          linkTo="/rewards"
          linkText="View rewards"
        />
        
        <StatCard 
          title="Certificates Earned" 
          value={statsData.certificatesCount}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }
          linkTo="/my-certificates"
          linkText="View your certificates"
        />
      </div>
    </div>
  );
};

export default DashboardStats; 