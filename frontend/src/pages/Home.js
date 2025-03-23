import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function Home() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
      }}
    >
      <Typography variant="h2" component="h1" gutterBottom>
        Welcome to University Event Portal
      </Typography>
      <Typography variant="h5" component="h2" gutterBottom color="text.secondary">
        Discover and participate in exciting university events
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          component={RouterLink}
          to="/events"
          sx={{ mr: 2 }}
        >
          Browse Events
        </Button>
        <Button
          variant="outlined"
          size="large"
          component={RouterLink}
          to="/register"
        >
          Get Started
        </Button>
      </Box>
    </Box>
  );
}

export default Home; 