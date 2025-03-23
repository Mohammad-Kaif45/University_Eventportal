import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  MenuItem,
  FormControl,
  FormHelperText,
  Grid,
  Divider,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import * as yup from 'yup';
import { Formik, Form } from 'formik';

const departments = [
  'Computer Science',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Business Administration',
  'Economics',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Psychology',
  'Sociology',
  'English',
  'History',
  'Political Science',
  'Physical Education',
  'Other',
];

const roles = [
  { value: 'student', label: 'Student' },
  { value: 'committee_member', label: 'Committee Member' },
];

const validationSchema = yup.object({
  name: yup
    .string()
    .required('Name is required'),
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  studentId: yup
    .string()
    .required('Student ID is required'),
  department: yup
    .string()
    .required('Department is required'),
  role: yup
    .string()
    .required('Role is required'),
});

function Register() {
  const navigate = useNavigate();
  const { register, error } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setIsSubmitting(true);
    
    // Remove confirmPassword as it's not needed for API call
    const { confirmPassword, ...userData } = values;
    
    const success = await register(userData);
    setIsSubmitting(false);
    
    if (success) {
      setRegistrationSuccess(true);
      resetForm();
      // Redirect to home page after successful registration
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 8, mb: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Create Your Account
        </Typography>
        
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Join our university event portal to register for events, track participation, and earn rewards.
        </Typography>
        
        {registrationSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Registration successful! Redirecting to homepage...
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Formik
          initialValues={{
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            studentId: '',
            department: '',
            role: 'student',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            isValid,
            dirty,
          }) => (
            <Form>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Personal Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>
                
                <Grid item xs={12} sm={6}>
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
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="email"
                    name="email"
                    label="Email Address"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="password"
                    name="password"
                    label="Password"
                    type="password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="confirmPassword"
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    value={values.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                    helperText={touched.confirmPassword && errors.confirmPassword}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                    Academic Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="studentId"
                    name="studentId"
                    label="Student ID"
                    value={values.studentId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.studentId && Boolean(errors.studentId)}
                    helperText={touched.studentId && errors.studentId}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={touched.department && Boolean(errors.department)}>
                    <TextField
                      select
                      id="department"
                      name="department"
                      label="Department"
                      value={values.department}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.department && Boolean(errors.department)}
                      helperText={touched.department && errors.department}
                      required
                    >
                      {departments.map((department) => (
                        <MenuItem key={department} value={department}>
                          {department}
                        </MenuItem>
                      ))}
                    </TextField>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth error={touched.role && Boolean(errors.role)}>
                    <TextField
                      select
                      id="role"
                      name="role"
                      label="Role"
                      value={values.role}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.role && Boolean(errors.role)}
                      helperText={touched.role && errors.role}
                      required
                    >
                      {roles.map((role) => (
                        <MenuItem key={role.value} value={role.value}>
                          {role.label}
                        </MenuItem>
                      ))}
                    </TextField>
                    <FormHelperText>
                      Committee member requests require admin approval
                    </FormHelperText>
                  </FormControl>
                </Grid>
              </Grid>

              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={isSubmitting || !(isValid && dirty)}
                  sx={{ minWidth: 200 }}
                >
                  {isSubmitting ? 'Registering...' : 'Register'}
                </Button>
              </Box>
            </Form>
          )}
        </Formik>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Button
              color="primary"
              onClick={() => navigate('/login')}
              sx={{ textTransform: 'none' }}
            >
              Log in here
            </Button>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default Register; 