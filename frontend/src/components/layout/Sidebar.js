import React from 'react';
import { NavLink } from 'react-router-dom';

// Simplified Sidebar for debugging
const Sidebar = () => {
  // Basic navigation items
  const navigation = [
    { name: 'Dashboard', to: '/dashboard' },
    { name: 'Events', to: '/events' },
    { name: 'Settings', to: '/settings' }
  ];
  
  return (
    <div className="w-64 bg-white shadow-lg lg:static lg:inset-0">
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <div className="flex items-center">
          <span className="text-xl font-semibold text-gray-800">Debug Menu</span>
        </div>
      </div>

      <div className="px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          {navigation.map((item, index) => (
            <NavLink
              key={index}
              to={item.to}
              className={({ isActive }) => 
                `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive 
                    ? 'bg-indigo-100 text-indigo-900' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 