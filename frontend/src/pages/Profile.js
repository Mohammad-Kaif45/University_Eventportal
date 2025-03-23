import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Grid,
  Divider,
  Chip,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import * as yup from 'yup';
import { Formik, Form } from 'formik';

const validationSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  phone: yup
    .string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .required('Phone number is required'),
  currentPassword: yup
    .string()
    .when('newPassword', {
      is: (val) => val && val.length > 0,
      then: yup.string().required('Current password is required to change password'),
    }),
  newPassword: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword'), null], 'Passwords must match'),
});

function Profile() {
  const { user, updateProfile, error } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    setSuccessMessage('');
    const success = await updateProfile(values);
    setIsSubmitting(false);

    if (success) {
      setSuccessMessage('Profile updated successfully!');
    }
  };

  if (!user) {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, mt: 8, textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            Please log in to view your profile.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Profile
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Account Information
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">{user.email}</Typography>
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Role
              </Typography>
              <Chip
                label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                color={user.role === 'admin' ? 'error' : 'primary'}
                sx={{ mt: 1 }}
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Department
              </Typography>
              <Typography variant="body1">{user.department}</Typography>
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Student ID
              </Typography>
              <Typography variant="body1">{user.studentId}</Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Update Profile
            </Typography>
            <Formik
              initialValues={{
                name: user.name,
                phone: user.phone,
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ values, errors, touched, handleChange, handleBlur }) => (
                <Form>
                  <TextField
                    fullWidth
                    id="name"
                    name="name"
                    label="Full Name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    margin="normal"
                    required
                  />

                  <TextField
                    fullWidth
                    id="phone"
                    name="phone"
                    label="Phone Number"
                    value={values.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.phone && Boolean(errors.phone)}
                    helperText={touched.phone && errors.phone}
                    margin="normal"
                    required
                  />

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="subtitle1" gutterBottom>
                    Change Password
                  </Typography>

                  <TextField
                    fullWidth
                    id="currentPassword"
                    name="currentPassword"
                    label="Current Password"
                    type="password"
                    value={values.currentPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.currentPassword && Boolean(errors.currentPassword)}
                    helperText={touched.currentPassword && errors.currentPassword}
                    margin="normal"
                  />

                  <TextField
                    fullWidth
                    id="newPassword"
                    name="newPassword"
                    label="New Password"
                    type="password"
                    value={values.newPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.newPassword && Boolean(errors.newPassword)}
                    helperText={touched.newPassword && errors.newPassword}
                    margin="normal"
                  />

                  <TextField
                    fullWidth
                    id="confirmPassword"
                    name="confirmPassword"
                    label="Confirm New Password"
                    type="password"
                    value={values.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                    helperText={touched.confirmPassword && errors.confirmPassword}
                    margin="normal"
                  />

                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                      disabled={isSubmitting}
                      sx={{ minWidth: 200 }}
                    >
                      {isSubmitting ? 'Updating...' : 'Update Profile'}
                    </Button>
                  </Box>
                </Form>
              )}
            </Formik>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default Profile; 