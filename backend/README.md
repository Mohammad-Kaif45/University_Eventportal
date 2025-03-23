# University Event Portal - Backend

This is the backend API for the University Event Portal, providing comprehensive endpoints for event management, user authentication, and other features.

## Features

- **User Authentication**: JWT-based authentication with account management
- **Role-Based Access Control**: Different access levels for students, faculty, committees, and administrators
- **Event Management**: Complete CRUD operations for events with registration handling
- **Attendance Tracking**: Track event attendance with QR code integration
- **Notification System**: Email and in-app notifications for event updates
- **Certificate Generation**: Create and verify participation certificates
- **Payment Processing**: Handle event registration payments
- **Committee Management**: Create and manage committees with permission settings
- **Venue Management**: Manage venues with availability checking
- **Rewards System**: Gamification through rewards for participation

## Tech Stack

- **Node.js**: JavaScript runtime
- **Express**: Web framework for Node.js
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: JSON Web Tokens for authentication
- **Multer**: File upload handling
- **Express Validator**: Input validation
- **Helmet**: Security middleware
- **Morgan**: HTTP request logger

## API Endpoints

### Authentication
- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Authenticate a user
- `GET /api/auth/me`: Get current user details
- `POST /api/auth/logout`: Log out a user
- `POST /api/auth/reset-password-request`: Request password reset
- `POST /api/auth/reset-password`: Reset password with token

### Users
- `GET /api/users`: Get all users (paginated)
- `GET /api/users/:id`: Get user by ID
- `PUT /api/users/:id`: Update user
- `POST /api/users`: Create new user (admin only)
- `DELETE /api/users/:id`: Delete user
- `PUT /api/users/:id/role`: Update user role
- `PUT /api/users/:id/status`: Activate/deactivate user
- `GET /api/users/stats/summary`: Get user statistics

### Events
- `GET /api/events`: Get all events (paginated)
- `GET /api/events/:id`: Get event by ID
- `POST /api/events`: Create new event
- `PUT /api/events/:id`: Update event
- `DELETE /api/events/:id`: Delete event
- `POST /api/events/:id/register`: Register for event
- `GET /api/events/:id/participants`: Get event participants

### Committees
- `GET /api/committees`: Get all committees
- `GET /api/committees/:id`: Get committee by ID
- `POST /api/committees`: Create new committee
- `PUT /api/committees/:id`: Update committee
- `DELETE /api/committees/:id`: Delete committee
- `POST /api/committees/:id/members`: Add committee members
- `DELETE /api/committees/:id/members/:userId`: Remove committee member

### Venues
- `GET /api/venues`: Get all venues
- `GET /api/venues/:id`: Get venue by ID
- `POST /api/venues`: Create new venue
- `PUT /api/venues/:id`: Update venue
- `DELETE /api/venues/:id`: Delete venue
- `GET /api/venues/:id/availability`: Check venue availability

### Attendance
- `GET /api/attendance/event/:eventId`: Get attendance for event
- `POST /api/attendance/event/:eventId`: Mark attendance
- `POST /api/attendance/event/:eventId/bulk`: Bulk mark attendance
- `GET /api/attendance/user/:userId`: Get user attendance history

### Payments
- `GET /api/payments`: Get all payments
- `GET /api/payments/event/:eventId`: Get payments for event
- `GET /api/payments/user/:userId`: Get user payments
- `POST /api/payments/event/:eventId/user/:userId`: Create payment
- `PUT /api/payments/:paymentId/verify`: Verify payment
- `PUT /api/payments/:paymentId/refund`: Process refund

### Certificates
- `GET /api/certificates`: Get all certificates
- `GET /api/certificates/event/:eventId`: Get certificates for event
- `GET /api/certificates/user/:userId`: Get user certificates
- `GET /api/certificates/verify/:code`: Verify certificate
- `POST /api/certificates/event/:eventId/generate`: Generate certificates
- `GET /api/certificates/download/:id`: Download certificate

### Rewards
- `GET /api/rewards`: Get all rewards
- `GET /api/rewards/user/:userId`: Get user rewards
- `POST /api/rewards`: Create new reward
- `DELETE /api/rewards/:id`: Delete reward
- `POST /api/rewards/redeem/:id`: Redeem reward

## Getting Started

### Prerequisites

- Node.js (v14.x or later)
- MongoDB (v4.x or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the backend directory:
   ```
   cd university-event-portal/backend
   ```

3. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

4. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/university-event-portal
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=7d
   EMAIL_SERVICE=smtp.example.com
   EMAIL_USER=your_email@example.com
   EMAIL_PASS=your_email_password
   FRONTEND_URL=http://localhost:3000
   ```

5. Start the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

6. The API will be available at `http://localhost:5000`

## Project Structure

```
backend/
├── config/              # Configuration files
├── controllers/         # Request handlers
├── middleware/          # Custom middleware
├── models/              # Mongoose models
├── routes/              # API routes
├── utils/               # Utility functions
├── server.js            # Entry point
└── package.json         # Project metadata
```

## License

This project is licensed under the MIT License - see the LICENSE file for details. 