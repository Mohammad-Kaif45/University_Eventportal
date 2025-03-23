# University Event Portal - Frontend

This is the frontend of the University Event Portal, a comprehensive web application for managing university events, registrations, and user engagement.

## Features

- **User Authentication**: Secure login, registration, and account management
- **Event Management**: Create, view, edit, and register for events
- **Dashboard**: Personalized dashboard with event statistics and upcoming events
- **Notifications**: Real-time notifications for event updates and registration confirmations
- **Responsive UI**: Mobile-friendly design for on-the-go access
- **Dark Mode**: Support for light and dark themes

## Tech Stack

- **React**: JavaScript library for building user interfaces
- **Redux Toolkit**: State management for React applications
- **React Router**: Navigation and routing
- **Axios**: HTTP client for API requests
- **TailwindCSS**: Utility-first CSS framework
- **date-fns**: JavaScript date utility library

## Getting Started

### Prerequisites

- Node.js (v14.x or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the frontend directory:
   ```
   cd university-event-portal/frontend
   ```

3. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

4. Start the development server:
   ```
   npm start
   # or
   yarn start
   ```

5. The application will open in your browser at `http://localhost:3000`

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   ├── events/           # Event-related components
│   ├── layout/           # Layout components
│   └── ui/               # Generic UI components
├── pages/                # Page components
├── store/                # Redux store setup
│   ├── slices/           # Redux slices for state management
│   └── index.js          # Store configuration
├── utils/                # Utility functions
├── App.js                # Main App component
└── index.js              # Entry point
```

## Available Scripts

- `npm start`: Run the app in development mode
- `npm build`: Build the app for production
- `npm test`: Run tests
- `npm eject`: Eject from Create React App

## Features in Development

- Event calendar integration
- Document upload for event materials
- Advanced search and filtering
- Real-time chat for event participants

## License

This project is licensed under the MIT License - see the LICENSE file for details. 