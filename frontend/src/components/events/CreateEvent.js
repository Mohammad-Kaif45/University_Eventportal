import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const validationSchema = Yup.object({
  title: Yup.string()
    .required('Title is required')
    .min(3, 'Title must be at least 3 characters'),
  description: Yup.string()
    .required('Description is required')
    .min(50, 'Description must be at least 50 characters'),
  category: Yup.string()
    .required('Category is required'),
  date: Yup.date()
    .required('Date is required')
    .min(new Date(), 'Date must be in the future'),
  time: Yup.string()
    .required('Time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  venue: Yup.string()
    .required('Venue is required'),
  maxParticipants: Yup.number()
    .required('Maximum participants is required')
    .min(1, 'Must have at least 1 participant')
    .integer('Must be a whole number'),
  registrationFee: Yup.number()
    .required('Registration fee is required')
    .min(0, 'Fee cannot be negative'),
});

const CreateEvent = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      category: '',
      date: null,
      time: '',
      venue: '',
      maxParticipants: '',
      registrationFee: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        await axios.post('/api/events', values);
        navigate('/events');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to create event. Please try again.');
      }
    },
  });

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Event
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 4 }}>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="title"
                  name="title"
                  label="Event Title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="description"
                  name="description"
                  label="Event Description"
                  multiline
                  rows={4}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    id="category"
                    name="category"
                    value={formik.values.category}
                    onChange={formik.handleChange}
                    error={formik.touched.category && Boolean(formik.errors.category)}
                    label="Category"
                  >
                    <MenuItem value="academic">Academic</MenuItem>
                    <MenuItem value="sports">Sports</MenuItem>
                    <MenuItem value="cultural">Cultural</MenuItem>
                    <MenuItem value="technical">Technical</MenuItem>
                    <MenuItem value="social">Social</MenuItem>
                  </Select>
                  {formik.touched.category && formik.errors.category && (
                    <Typography color="error" variant="caption">
                      {formik.errors.category}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Event Date"
                  value={formik.values.date}
                  onChange={(newValue) => formik.setFieldValue('date', newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={formik.touched.date && Boolean(formik.errors.date)}
                      helperText={formik.touched.date && formik.errors.date}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="time"
                  name="time"
                  label="Event Time (HH:MM)"
                  value={formik.values.time}
                  onChange={formik.handleChange}
                  error={formik.touched.time && Boolean(formik.errors.time)}
                  helperText={formik.touched.time && formik.errors.time}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="venue"
                  name="venue"
                  label="Venue"
                  value={formik.values.venue}
                  onChange={formik.handleChange}
                  error={formik.touched.venue && Boolean(formik.errors.venue)}
                  helperText={formik.touched.venue && formik.errors.venue}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="maxParticipants"
                  name="maxParticipants"
                  label="Maximum Participants"
                  type="number"
                  value={formik.values.maxParticipants}
                  onChange={formik.handleChange}
                  error={formik.touched.maxParticipants && Boolean(formik.errors.maxParticipants)}
                  helperText={formik.touched.maxParticipants && formik.errors.maxParticipants}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="registrationFee"
                  name="registrationFee"
                  label="Registration Fee ($)"
                  type="number"
                  value={formik.values.registrationFee}
                  onChange={formik.handleChange}
                  error={formik.touched.registrationFee && Boolean(formik.errors.registrationFee)}
                  helperText={formik.touched.registrationFee && formik.errors.registrationFee}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/events')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={formik.isSubmitting}
                  >
                    Create Event
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default CreateEvent; 