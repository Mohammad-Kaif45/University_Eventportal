import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState('');

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const response = await axios.get(`/api/events/${id}`);
      setEvent(response.data);
      checkRegistrationStatus(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch event details. Please try again later.');
      setLoading(false);
    }
  };

  const checkRegistrationStatus = (eventData) => {
    if (!isAuthenticated) {
      setRegistrationStatus('not_logged_in');
      return;
    }

    const isRegistered = eventData.participants.some(
      participant => participant.user._id === user._id
    );

    if (isRegistered) {
      setRegistrationStatus('registered');
    } else if (eventData.currentParticipants >= eventData.maxParticipants) {
      setRegistrationStatus('full');
    } else {
      setRegistrationStatus('available');
    }
  };

  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await axios.post(`/api/events/${id}/register`);
      setOpenDialog(true);
      fetchEventDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

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
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container>
        <Typography align="center" sx={{ mt: 4 }}>
          Event not found.
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" component="h1" gutterBottom>
              {event.title}
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Chip
                label={event.category}
                color="primary"
                sx={{ mr: 1 }}
              />
              <Chip
                label={`${event.currentParticipants}/${event.maxParticipants} participants`}
                color="secondary"
              />
            </Box>
            <Typography variant="body1" paragraph>
              {event.description}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Event Details
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Date"
                  secondary={new Date(event.date).toLocaleDateString()}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Time"
                  secondary={event.time}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Venue"
                  secondary={event.venue}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Registration Fee"
                  secondary={`$${event.registrationFee}`}
                />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Registration
              </Typography>
              {registrationStatus === 'registered' && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  You are registered for this event!
                </Alert>
              )}
              {registrationStatus === 'full' && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  This event is full.
                </Alert>
              )}
              {registrationStatus === 'not_logged_in' && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Please log in to register for this event.
                </Alert>
              )}
              {registrationStatus === 'available' && (
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleRegister}
                >
                  Register Now
                </Button>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Registration Successful!</DialogTitle>
        <DialogContent>
          <Typography>
            You have successfully registered for {event.title}.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EventDetail; 