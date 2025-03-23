import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  MenuItem,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import * as yup from 'yup';
import { Formik, Form, FieldArray } from 'formik';

const categories = [
  'Technical',
  'Cultural',
  'Sports',
  'Academic',
  'Workshop',
  'Other',
];

const statuses = ['upcoming', 'active', 'completed', 'cancelled'];

const sponsorLevels = ['Gold', 'Silver', 'Bronze'];

const validationSchema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  date: yup.string().required('Date is required'),
  time: yup.string().required('Time is required'),
  location: yup.string().required('Location is required'),
  category: yup.string().required('Category is required'),
  status: yup.string().required('Status is required'),
  maxParticipants: yup
    .number()
    .required('Maximum participants is required')
    .min(1, 'Must be at least 1'),
  image: yup.string().required('Image URL is required'),
  requirements: yup.array().of(yup.string()),
  rewards: yup.array().of(yup.string()),
  sponsors: yup.array().of(
    yup.object({
      name: yup.string().required('Sponsor name is required'),
      logo: yup.string().required('Sponsor logo URL is required'),
      level: yup.string().required('Sponsor level is required'),
    })
  ),
});

function EventForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialValues, setInitialValues] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: '',
    status: 'upcoming',
    maxParticipants: 100,
    image: '',
    requirements: [''],
    rewards: [''],
    sponsors: [{ name: '', logo: '', level: '' }],
  });

  useEffect(() => {
    const fetchEvent = async () => {
      if (id) {
        setLoading(true);
        try {
          // TODO: Replace with actual API call
          // For now, using mock data
          const mockEvent = {
            id: parseInt(id),
            title: 'Annual Tech Fest',
            description: 'A celebration of technology and innovation',
            date: '2024-03-15',
            time: '09:00 AM - 05:00 PM',
            location: 'Main Auditorium',
            category: 'Technical',
            status: 'upcoming',
            maxParticipants: 100,
            image: 'https://source.unsplash.com/random/800x600?technology',
            requirements: [
              'Student ID Card',
              'Laptop (for workshops)',
              'Registration Fee: $10',
            ],
            rewards: [
              'Participation Certificate',
              'Points for University Activities',
              'Chance to win prizes',
            ],
            sponsors: [
              {
                name: 'Tech Corp',
                logo: 'https://source.unsplash.com/random/100x100?logo',
                level: 'Gold',
              },
              {
                name: 'Innovation Labs',
                logo: 'https://source.unsplash.com/random/100x100?logo',
                level: 'Silver',
              },
            ],
          };
          setInitialValues(mockEvent);
        } catch (error) {
          console.error('Error fetching event:', error);
          setError('Failed to load event details');
        }
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Replace with actual API call
      console.log('Submitting event:', values);
      navigate('/events');
    } catch (error) {
      console.error('Error saving event:', error);
      setError('Failed to save event');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  if (loading && !initialValues.title) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {id ? 'Edit Event' : 'Create New Event'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
            <Form>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="title"
                    label="Event Title"
                    value={values.title}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.title && Boolean(errors.title)}
                    helperText={touched.title && errors.title}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="description"
                    label="Description"
                    multiline
                    rows={4}
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.description && Boolean(errors.description)}
                    helperText={touched.description && errors.description}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="date"
                    label="Date"
                    type="date"
                    value={values.date}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.date && Boolean(errors.date)}
                    helperText={touched.date && errors.date}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="time"
                    label="Time"
                    value={values.time}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.time && Boolean(errors.time)}
                    helperText={touched.time && errors.time}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="location"
                    label="Location"
                    value={values.location}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.location && Boolean(errors.location)}
                    helperText={touched.location && errors.location}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="maxParticipants"
                    label="Maximum Participants"
                    type="number"
                    value={values.maxParticipants}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.maxParticipants && Boolean(errors.maxParticipants)}
                    helperText={touched.maxParticipants && errors.maxParticipants}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    name="category"
                    label="Category"
                    value={values.category}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.category && Boolean(errors.category)}
                    helperText={touched.category && errors.category}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    name="status"
                    label="Status"
                    value={values.status}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.status && Boolean(errors.status)}
                    helperText={touched.status && errors.status}
                  >
                    {statuses.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="image"
                    label="Image URL"
                    value={values.image}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.image && Boolean(errors.image)}
                    helperText={touched.image && errors.image}
                  />
                </Grid>

                {/* Requirements */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Requirements
                  </Typography>
                  <FieldArray name="requirements">
                    {({ push, remove }) => (
                      <Box>
                        {values.requirements.map((_, index) => (
                          <Box key={index} sx={{ display: 'flex', mb: 1 }}>
                            <TextField
                              fullWidth
                              name={`requirements.${index}`}
                              label={`Requirement ${index + 1}`}
                              value={values.requirements[index]}
                              onChange={handleChange}
                              onBlur={handleBlur}
                            />
                            <IconButton
                              onClick={() => remove(index)}
                              disabled={values.requirements.length === 1}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        ))}
                        <Button
                          startIcon={<AddIcon />}
                          onClick={() => push('')}
                          sx={{ mt: 1 }}
                        >
                          Add Requirement
                        </Button>
                      </Box>
                    )}
                  </FieldArray>
                </Grid>

                {/* Rewards */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Rewards
                  </Typography>
                  <FieldArray name="rewards">
                    {({ push, remove }) => (
                      <Box>
                        {values.rewards.map((_, index) => (
                          <Box key={index} sx={{ display: 'flex', mb: 1 }}>
                            <TextField
                              fullWidth
                              name={`rewards.${index}`}
                              label={`Reward ${index + 1}`}
                              value={values.rewards[index]}
                              onChange={handleChange}
                              onBlur={handleBlur}
                            />
                            <IconButton
                              onClick={() => remove(index)}
                              disabled={values.rewards.length === 1}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        ))}
                        <Button
                          startIcon={<AddIcon />}
                          onClick={() => push('')}
                          sx={{ mt: 1 }}
                        >
                          Add Reward
                        </Button>
                      </Box>
                    )}
                  </FieldArray>
                </Grid>

                {/* Sponsors */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Sponsors
                  </Typography>
                  <FieldArray name="sponsors">
                    {({ push, remove }) => (
                      <Box>
                        {values.sponsors.map((_, index) => (
                          <Box key={index} sx={{ mb: 3 }}>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={4}>
                                <TextField
                                  fullWidth
                                  name={`sponsors.${index}.name`}
                                  label="Sponsor Name"
                                  value={values.sponsors[index].name}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                />
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <TextField
                                  fullWidth
                                  name={`sponsors.${index}.logo`}
                                  label="Logo URL"
                                  value={values.sponsors[index].logo}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                />
                              </Grid>
                              <Grid item xs={12} sm={3}>
                                <TextField
                                  fullWidth
                                  select
                                  name={`sponsors.${index}.level`}
                                  label="Level"
                                  value={values.sponsors[index].level}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                >
                                  {sponsorLevels.map((level) => (
                                    <MenuItem key={level} value={level}>
                                      {level}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              </Grid>
                              <Grid item xs={12} sm={1}>
                                <IconButton
                                  onClick={() => remove(index)}
                                  disabled={values.sponsors.length === 1}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Grid>
                            </Grid>
                          </Box>
                        ))}
                        <Button
                          startIcon={<AddIcon />}
                          onClick={() => push({ name: '', logo: '', level: '' })}
                          sx={{ mt: 1 }}
                        >
                          Add Sponsor
                        </Button>
                      </Box>
                    )}
                  </FieldArray>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/events')}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isSubmitting || loading}
                    >
                      {loading ? 'Saving...' : id ? 'Update Event' : 'Create Event'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Paper>
    </Container>
  );
}

export default EventForm; 