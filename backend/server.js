const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(express.json({ extended: false }));
app.use(cors());
app.use(morgan('dev'));
app.use(helmet());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/university-events')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/events', require('./routes/events'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/sponsors', require('./routes/sponsors'));
app.use('/api/rewards', require('./routes/rewards'));
app.use('/api/venues', require('./routes/venues'));
app.use('/api/committees', require('./routes/committees'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/certificates', require('./routes/certificates'));

// Route for health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client', 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    error: {
      message,
      status: statusCode,
      timestamp: new Date()
    }
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
}); 