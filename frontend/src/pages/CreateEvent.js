import React from 'react';
import { Typography, Box, Container, Paper } from '@mui/material';
import EventForm from './EventForm';
import { useAuth } from '../context/AuthContext';

function CreateEvent() {
  const { user } = useAuth();
  
  // Check if user has permission to create events
  if (!user || (user.role !== 'committee_member' && user.role !== 'admin')) {
    return (
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mt: 8, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Create Event
          </Typography>
          <Typography variant="body1" color="error">
            You don't have permission to create events. Only committee members and administrators can create events.
          </Typography>
        </Paper>
      </Container>
    );
  }
  
  return <EventForm />;
}

export default CreateEvent; 