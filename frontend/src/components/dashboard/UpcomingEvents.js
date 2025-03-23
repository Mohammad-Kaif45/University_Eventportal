import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const EventCard = ({ event }) => {
  // Format date and time
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'MMM dd, yyyy');
  };
  
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'h:mm a');
  };
  
  // Calculate days remaining
  const getDaysRemaining = (dateString) => {
    const today = new Date();
    const eventDate = new Date(dateString);
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days left`;
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden flex flex-col">
      {/* Event image or color banner */}
      {event.image ? (
        <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${event.image})` }}></div>
      ) : (
        <div className={`h-20 ${
          event.category === 'workshop' ? 'bg-blue-600' : 
          event.category === 'seminar' ? 'bg-green-600' : 
          event.category === 'competition' ? 'bg-yellow-600' : 
          event.category === 'conference' ? 'bg-purple-600' : 
          'bg-indigo-600'
        }`}></div>
      )}
      
      {/* Event details */}
      <div className="flex-1 p-4">
        <div className="flex justify-between items-start mb-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            event.category === 'workshop' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' : 
            event.category === 'seminar' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 
            event.category === 'competition' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' : 
            event.category === 'conference' ? 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100' : 
            'bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-100'
          }`}>
            {event.category}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
            {getDaysRemaining(event.startDate)}
          </span>
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{event.title}</h3>
        
        <div className="mt-3 flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(event.startDate)}
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatTime(event.startDate)}
          </div>
        </div>
        
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {event.location || event.venue?.name || 'Online Event'}
        </div>
        
        {event.description && (
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{event.description}</p>
        )}
      </div>
      
      {/* Event actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          {event.isRegistered ? (
            <span className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Registered
            </span>
          ) : (
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {event.capacity ? `${event.registrations || 0}/${event.capacity} registered` : `${event.registrations || 0} registered`}
            </span>
          )}
          <Link 
            to={`/events/${event._id}`} 
            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-100 dark:hover:bg-indigo-800 focus:outline-none"
          >
            View details
          </Link>
        </div>
      </div>
    </div>
  );
};

const UpcomingEvents = ({ events = [] }) => {
  // Default events if none provided (for development/preview)
  const defaultEvents = [
    {
      _id: '1',
      title: 'Web Development Workshop',
      category: 'workshop',
      startDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
      location: 'Tech Building, Room 101',
      registrations: 45,
      capacity: 50,
      isRegistered: true,
      description: 'Learn the fundamentals of web development including HTML, CSS and JavaScript.'
    },
    {
      _id: '2',
      title: 'Data Science Conference',
      category: 'conference',
      startDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
      location: 'Science Center Auditorium',
      registrations: 120,
      capacity: 200,
      isRegistered: false,
      description: 'Join leading data scientists as they discuss the latest trends and innovations in data science.'
    },
    {
      _id: '3',
      title: 'Coding Competition',
      category: 'competition',
      startDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
      location: 'Online Event',
      registrations: 75,
      capacity: 100,
      isRegistered: false,
      description: 'Test your programming skills in this fast-paced coding competition with prizes for the top performers.'
    }
  ];

  const displayEvents = events.length > 0 ? events : defaultEvents;
  
  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Upcoming Events</h2>
        <Link to="/events" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
          View all events
        </Link>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {displayEvents.map(event => (
          <EventCard key={event._id} event={event} />
        ))}
      </div>
      
      {displayEvents.length === 0 && (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No upcoming events. Check back later for new events.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingEvents; 