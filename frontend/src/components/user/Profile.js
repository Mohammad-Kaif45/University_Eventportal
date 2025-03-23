import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  interests: Yup.string()
    .required('Interests are required'),
  currentPassword: Yup.string()
    .min(6, 'Password must be at least 6 characters'),
  newPassword: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .when('currentPassword', {
      is: (val) => val && val.length > 0,
      then: Yup.string().required('New password is required'),
    }),
});

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchRegisteredEvents();
  }, []);

  const fetchRegisteredEvents = async () => {
    try {
      const response = await axios.get('/api/users/registered-events');
      setRegisteredEvents(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch registered events. Please try again later.');
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      name: user.name,
      interests: user.interests.join(', '),
      currentPassword: '',
      newPassword: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const { currentPassword, newPassword, ...updateData } = values;
        const updatePayload = {
          ...updateData,
          interests: updateData.interests.split(',').map(i => i.trim()),
        };

        if (currentPassword && newPassword) {
          updatePayload.currentPassword = currentPassword;
          updatePayload.newPassword = newPassword;
        }

        await updateUser(updatePayload);
        setSuccess('Profile updated successfully!');
        formik.resetForm({
          values: {
            name: updateData.name,
            interests: updateData.interests.join(', '),
            currentPassword: '',
            newPassword: '',
          },
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
      }
    },
  });

  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEvent(null);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Profile
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="name"
                  name="name"
                  label="Full Name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="interests"
                  name="interests"
                  label="Interests (comma-separated)"
                  value={formik.values.interests}
                  onChange={formik.handleChange}
                  error={formik.touched.interests && Boolean(formik.errors.interests)}
                  helperText={formik.touched.interests && formik.errors.interests}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Change Password
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="currentPassword"
                  name="currentPassword"
                  label="Current Password"
                  type="password"
                  value={formik.values.currentPassword}
                  onChange={formik.handleChange}
                  error={formik.touched.currentPassword && Boolean(formik.errors.currentPassword)}
                  helperText={formik.touched.currentPassword && formik.errors.currentPassword}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="newPassword"
                  name="newPassword"
                  label="New Password"
                  type="password"
                  value={formik.values.newPassword}
                  onChange={formik.handleChange}
                  error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
                  helperText={formik.touched.newPassword && formik.errors.newPassword}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={formik.isSubmitting}
                >
                  Update Profile
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Registered Events
          </Typography>

          <List>
            {registeredEvents.map((event, index) => (
              <React.Fragment key={event._id}>
                <ListItem>
                  <ListItemText
                    primary={event.title}
                    secondary={
                      <>
                        <Typography component="span" variant="body2">
                          {new Date(event.date).toLocaleDateString()} at {event.time}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Chip
                            label={event.status}
                            color={
                              event.status === 'upcoming'
                                ? 'primary'
                                : event.status === 'ongoing'
                                ? 'success'
                                : event.status === 'completed'
                                ? 'info'
                                : 'error'
                            }
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <Chip
                            label={`${event.currentParticipants}/${event.maxParticipants} participants`}
                            color="secondary"
                            size="small"
                          />
                        </Box>
                      </>
                    }
                  />
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => handleViewEvent(event)}
                  >
                    View Details
                  </Button>
                </ListItem>
                {index < registeredEvents.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </Box>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Event Details - {selectedEvent?.title}
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            Description
          </Typography>
          <Typography paragraph>
            {selectedEvent?.description}
          </Typography>

          <Typography variant="subtitle1" gutterBottom>
            Venue
          </Typography>
          <Typography paragraph>
            {selectedEvent?.venue}
          </Typography>

          <Typography variant="subtitle1" gutterBottom>
            Registration Fee
          </Typography>
          <Typography paragraph>
            ${selectedEvent?.registrationFee}
          </Typography>

          <Typography variant="subtitle1" gutterBottom>
            Organizer
          </Typography>
          <Typography paragraph>
            {selectedEvent?.organizer.name}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile; 