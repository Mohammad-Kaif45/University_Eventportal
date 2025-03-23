import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const CommitteeDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchCommitteeEvents();
  }, []);

  const fetchCommitteeEvents = async () => {
    try {
      const response = await axios.get('/api/events/committee');
      setEvents(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch events. Please try again later.');
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleViewParticipants = (event) => {
    setSelectedEvent(event);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEvent(null);
  };

  const handleUpdateEventStatus = async (eventId, newStatus) => {
    try {
      await axios.patch(`/api/events/${eventId}/status`, { status: newStatus });
      fetchCommitteeEvents();
    } catch (err) {
      setError('Failed to update event status. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'primary';
      case 'ongoing':
        return 'success';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
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

  const filteredEvents = events.filter(event => {
    switch (tabValue) {
      case 0:
        return event.status === 'upcoming';
      case 1:
        return event.status === 'ongoing';
      case 2:
        return event.status === 'completed';
      case 3:
        return event.status === 'cancelled';
      default:
        return true;
    }
  });

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Committee Dashboard
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Upcoming Events" />
          <Tab label="Ongoing Events" />
          <Tab label="Completed Events" />
          <Tab label="Cancelled Events" />
        </Tabs>
      </Box>

      <Grid container spacing={3}>
        {filteredEvents.map((event) => (
          <Grid item key={event._id} xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  {event.title}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={event.status}
                    color={getStatusColor(event.status)}
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={`${event.currentParticipants}/${event.maxParticipants} participants`}
                    color="secondary"
                  />
                </Box>
                <Typography color="textSecondary" gutterBottom>
                  {new Date(event.date).toLocaleDateString()} at {event.time}
                </Typography>
                <Typography variant="body2" paragraph>
                  {event.description.substring(0, 150)}...
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Venue: {event.venue}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => handleViewParticipants(event)}
                >
                  View Participants
                </Button>
                {event.status === 'upcoming' && (
                  <>
                    <Button
                      size="small"
                      color="success"
                      onClick={() => handleUpdateEventStatus(event._id, 'ongoing')}
                    >
                      Start Event
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleUpdateEventStatus(event._id, 'cancelled')}
                    >
                      Cancel Event
                    </Button>
                  </>
                )}
                {event.status === 'ongoing' && (
                  <Button
                    size="small"
                    color="info"
                    onClick={() => handleUpdateEventStatus(event._id, 'completed')}
                  >
                    Complete Event
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Participants - {selectedEvent?.title}
        </DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Registration Date</TableCell>
                  <TableCell>Payment Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedEvent?.participants.map((participant) => (
                  <TableRow key={participant.user._id}>
                    <TableCell>{participant.user.name}</TableCell>
                    <TableCell>{participant.user.email}</TableCell>
                    <TableCell>
                      {new Date(participant.registrationDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={participant.paymentStatus}
                        color={participant.paymentStatus === 'completed' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CommitteeDashboard; 