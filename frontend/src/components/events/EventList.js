import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import axios from 'axios';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    date: null,
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/api/events');
      setEvents(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch events. Please try again later.');
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const filteredEvents = events.filter(event => {
    const matchesCategory = !filters.category || event.category === filters.category;
    const matchesSearch = !filters.search || 
      event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      event.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchesDate = !filters.date || 
      new Date(event.date).toDateString() === filters.date.toDateString();

    return matchesCategory && matchesSearch && matchesDate;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" align="center" sx={{ mt: 4 }}>
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Events
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Search events"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                label="Category"
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="academic">Academic</MenuItem>
                <MenuItem value="sports">Sports</MenuItem>
                <MenuItem value="cultural">Cultural</MenuItem>
                <MenuItem value="technical">Technical</MenuItem>
                <MenuItem value="social">Social</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <DatePicker
              label="Date"
              value={filters.date}
              onChange={(newValue) => handleFilterChange('date', newValue)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3}>
        {filteredEvents.map((event) => (
          <Grid item key={event._id} xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  {event.title}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {new Date(event.date).toLocaleDateString()} at {event.time}
                </Typography>
                <Typography variant="body2" paragraph>
                  {event.description.substring(0, 150)}...
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={event.category}
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={`${event.currentParticipants}/${event.maxParticipants} participants`}
                    color="secondary"
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Venue: {event.venue}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  component={RouterLink}
                  to={`/events/${event._id}`}
                >
                  Learn More
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredEvents.length === 0 && (
        <Typography align="center" sx={{ mt: 4 }}>
          No events found matching your criteria.
        </Typography>
      )}
    </Container>
  );
};

export default EventList; 