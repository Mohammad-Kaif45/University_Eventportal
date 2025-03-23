# University Event Portal

A comprehensive web application for managing university events, registrations, and user engagement. This full-stack application enables universities to organize, promote, and manage events, while providing students and faculty with a platform to discover, register, and participate in events.

## Project Overview

The University Event Portal is built with a modern tech stack:

- **Frontend**: React.js with Redux Toolkit and TailwindCSS
- **Backend**: Node.js with Express and MongoDB
- **Authentication**: JWT-based authentication with role-based access control

## Key Features

- **Comprehensive Event Management**
  - Create, edit, and manage events
  - Register for events and track attendance
  - Generate certificates for participation

- **User Role Management**
  - Student, Faculty, Committee, and Admin roles
  - Role-specific dashboards and permissions

- **Venue Management**
  - Add and manage venues
  - Check venue availability
  - Schedule events at available venues

- **Committee Management**
  - Create and manage event committees
  - Assign permissions to committee members
  - Track committee activities

- **Payment Processing**
  - Handle event registration payments
  - Process refunds
  - Generate payment reports

- **Rewards System**
  - Gamify event participation
  - Earn and redeem points for rewards
  - Track user achievements

- **Notification System**
  - Real-time notifications for event updates
  - Email notifications for registration confirmation
  - Reminder notifications for upcoming events

## Project Structure

This project is organized into two main directories:

- `frontend/`: Contains the React application
- `backend/`: Contains the Express API server

Each directory has its own README with specific instructions for setup and development.

## Getting Started

### Prerequisites

- Node.js (v14.x or later)
- MongoDB (v4.x or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd university-event-portal
   ```

2. Set up the backend:
   ```
   cd backend
   npm install
   # Configure environment variables (see backend README)
   npm run dev
   ```

3. Set up the frontend:
   ```
   cd ../frontend
   npm install
   npm start
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Development Roadmap

- **Phase 1**: Core functionality (user authentication, event management)
- **Phase 2**: Advanced features (payments, certificates, rewards)
- **Phase 3**: Mobile application development
- **Phase 4**: Analytics and reporting dashboard

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [React](https://reactjs.org/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Node.js](https://nodejs.org/)
