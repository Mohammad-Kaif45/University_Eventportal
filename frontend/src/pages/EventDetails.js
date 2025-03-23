import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  EmojiEvents as EmojiEventsIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isParticipating, setIsParticipating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState(''); // 'register' or 'unregister'

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        // Get registered events from localStorage or initialize empty object
        const registeredEvents = JSON.parse(localStorage.getItem('registeredEvents')) || {};
        
        // TODO: Replace with actual API call
        // For now, using mock data based on event ID
        const mockEvents = {
          '1': {
            id: 1,
            title: 'Annual Tech Fest',
            description: 'A celebration of technology and innovation featuring hackathons, tech talks, and workshops on AI, blockchain, and cybersecurity. This flagship event brings together students, faculty, and industry professionals to showcase the latest technological advancements and foster collaboration.',
            image: 'https://www.lingayasvidyapeeth.edu.in/sanmax/wp-content/uploads/2025/02/Lingayass-Tech-Fest-2025.png',
            date: '2024-06-15',
            time: '09:00 AM - 06:00 PM',
            location: 'Main Auditorium',
            category: 'Technical',
            status: 'upcoming',
            participants: 75,
            maxParticipants: 200,
            organizer: 'Computer Science Department',
            requirements: [
              'Student ID Card',
              'Laptop (for workshops)',
              'Registration Fee: $15',
            ],
            rewards: [
              'Cash prizes up to $1000',
              'Internship opportunities with sponsor companies',
              'Certificates of Excellence',
              'Networking with industry experts'
            ],
            sponsors: [
              {
                name: 'TechCorp',
                logo: 'https://www.lingayasvidyapeeth.edu.in/sanmax/wp-content/uploads/2025/02/Lingayass-Tech-Fest-2025.png',
                level: 'Platinum',
              },
              {
                name: 'Innovation Labs',
                logo: 'https://resources.finalsite.net/images/f_auto,q_auto,t_image_size_2/v1689289276/vistausdorg/d6rsxaeium3poqrn8nvo/Screenshot2023-07-13at40011PM.png',
                level: 'Gold',
              },
            ],
          },
          '2': {
            id: 2,
            title: 'University Sports Championship',
            description: 'Annual inter-university sports competition with events in football, basketball, cricket, athletics and swimming. Teams from various universities compete in this prestigious tournament that promotes sportsmanship and physical excellence.',
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcReVZOuzzJNrBJ13Z7dvjbOHf0FlBqrxZOfjg&s',
            date: '2024-05-10',
            time: '08:00 AM - 07:00 PM',
            location: 'University Stadium',
            category: 'Sports',
            status: 'upcoming',
            participants: 120,
            maxParticipants: 300,
            organizer: 'Sports Department',
            requirements: [
              'Student ID Card',
              'Sports uniform',
              'Team registration form',
              'Medical fitness certificate'
            ],
            rewards: [
              'Championship trophy',
              'Medals for winners',
              'Sports scholarship opportunities',
              'University athletic honors'
            ],
            sponsors: [
              {
                name: 'SportX',
                logo: 'https://www.lingayasvidyapeeth.edu.in/sanmax/wp-content/uploads/2025/02/Lingayass-Tech-Fest-2025.png',
                level: 'Gold',
              },
              {
                name: 'Fitness Pro',
                logo: 'https://www.lingayasvidyapeeth.edu.in/sanmax/wp-content/uploads/2025/02/Lingayass-Tech-Fest-2025.png',
                level: 'Silver',
              },
            ],
          },
          '3': {
            id: 3,
            title: 'Cultural Fest: Rhythms & Melodies',
            description: 'A vibrant celebration of performing arts featuring music concerts, dance competitions, theatrical performances, and art exhibitions. This cultural extravaganza showcases diverse talents and promotes cultural exchange among students.',
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtz2lcitXMr5fjY8WlXVsLvPk2mXjtKeLb4Q&s',
            date: '2024-04-05',
            time: '11:00 AM - 09:00 PM',
            location: 'Arts Complex',
            category: 'Cultural',
            status: 'active',
            participants: 95,
            maxParticipants: 150,
            organizer: 'Fine Arts Department',
            requirements: [
              'Student ID Card',
              'Performance equipment (if applicable)',
              'Registration Fee: $5',
            ],
            rewards: [
              'Talent recognition awards',
              'Performance opportunities at partner institutions',
              'Cultural exchange program eligibility',
              'Gift hampers from sponsors'
            ],
            sponsors: [
              {
                name: 'ArtStyle',
                logo: 'https://www.lingayasvidyapeeth.edu.in/sanmax/wp-content/uploads/2025/02/Lingayass-Tech-Fest-2025.png',
                level: 'Platinum',
              },
              {
                name: 'Creative Studios',
                logo: 'https://www.lingayasvidyapeeth.edu.in/sanmax/wp-content/uploads/2025/02/Lingayass-Tech-Fest-2025.png',
                level: 'Gold',
              },
            ],
          },
          '4': {
            id: 4,
            title: 'Academic Research Symposium',
            description: 'Distinguished scholars present cutting-edge research findings with panel discussions, poster presentations, and networking opportunities. This symposium facilitates knowledge exchange and collaboration among researchers across different disciplines.',
            image: 'https://i0.wp.com/www.interhacktives.com/wp-content/uploads/2023/03/academicresearch.png?fit=1920%2C1080&ssl=1',
            date: '2024-07-20',
            time: '10:00 AM - 04:00 PM',
            location: 'Science Center',
            category: 'Academic',
            status: 'upcoming',
            participants: 45,
            maxParticipants: 100,
            organizer: 'Research & Development Center',
            requirements: [
              'Academic ID',
              'Research abstract submission',
              'Registration Fee: $20',
            ],
            rewards: [
              'Publication opportunities in university journal',
              'Research grants for outstanding presentations',
              'Academic recognition certificates',
              'Research collaboration opportunities'
            ],
            sponsors: [
              {
                name: 'ScienceAdvance',
                logo: 'https://www.lingayasvidyapeeth.edu.in/sanmax/wp-content/uploads/2025/02/Lingayass-Tech-Fest-2025.png',
                level: 'Diamond',
              },
              {
                name: 'Research Foundation',
                logo: 'https://www.lingayasvidyapeeth.edu.in/sanmax/wp-content/uploads/2025/02/Lingayass-Tech-Fest-2025.png',
                level: 'Platinum',
              },
            ],
          },
        };

        const selectedEvent = mockEvents[id];
        
        if (!selectedEvent) {
          setError('Event not found');
          setLoading(false);
          return;
        }

        const mockParticipants = [
          { id: 1, name: 'John Doe', department: 'Computer Science' },
          { id: 2, name: 'Jane Smith', department: 'Information Technology' },
          { id: 3, name: 'Robert Johnson', department: 'Engineering' },
          { id: 4, name: 'Emily Brown', department: 'Business' },
          { id: 5, name: 'Michael Wilson', department: 'Arts' },
        ];

        // If the user is logged in and this event is in their registeredEvents
        const userRegisteredForEvent = user && registeredEvents[id];
        
        // If the user is already in mockParticipants, or they're registered via localStorage
        const userParticipating = userRegisteredForEvent || 
          (user && mockParticipants.some((p) => p.id === user.id));

        setEvent(selectedEvent);
        setParticipants(mockParticipants);
        setIsParticipating(userParticipating);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching event details:', error);
        setError('Failed to load event details');
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id, user]);

  const handleParticipateClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setDialogType(isParticipating ? 'unregister' : 'register');
    setDialogOpen(true);
  };

  const handleDialogConfirm = async () => {
    try {
      // Get current registered events from localStorage
      const registeredEvents = JSON.parse(localStorage.getItem('registeredEvents')) || {};
      
      if (dialogType === 'register') {
        // Add this event to user's registered events
        registeredEvents[id] = true;
        
        setParticipants([
          ...participants,
          { id: user.id, name: user.name || 'Current User', department: user.department || 'Your Department' },
        ]);
        setIsParticipating(true);
        setEvent((prev) => ({
          ...prev,
          participants: prev.participants + 1,
        }));
      } else {
        // Remove this event from user's registered events
        delete registeredEvents[id];
        
        setParticipants(participants.filter((p) => p.id !== user.id));
        setIsParticipating(false);
        setEvent((prev) => ({
          ...prev,
          participants: prev.participants - 1,
        }));
      }
      
      // Save updated registered events to localStorage
      localStorage.setItem('registeredEvents', JSON.stringify(registeredEvents));
      setDialogOpen(false);
    } catch (error) {
      console.error('Error updating participation:', error);
      setError('Failed to update participation status');
    }
  };

  if (loading) {
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

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container maxWidth="md">
        <Alert severity="warning" sx={{ mt: 4 }}>
          Event not found
        </Alert>
      </Container>
    );
  }

  const participationProgress = (event.participants / event.maxParticipants) * 100;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Event Image and Basic Info */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ overflow: 'hidden' }}>
            <Box
              component="img"
              src={event.image}
              alt={event.title}
              sx={{
                width: '100%',
                height: 400,
                objectFit: 'cover',
              }}
            />
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4" component="h1">
                  {event.title}
                </Typography>
                <Chip
                  label={event.status}
                  color={
                    event.status === 'upcoming'
                      ? 'info'
                      : event.status === 'active'
                      ? 'success'
                      : 'default'
                  }
                />
              </Box>
              <Typography variant="body1" paragraph>
                {event.description}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarIcon sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {event.date} | {event.time}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationIcon sx={{ mr: 1 }} />
                    <Typography variant="body2">{event.location}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CategoryIcon sx={{ mr: 1 }} />
                    <Typography variant="body2">{event.category}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PeopleIcon sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {event.participants}/{event.maxParticipants} participants
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={participationProgress}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Participation Section */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Event Participation
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {event.participants}/{event.maxParticipants} spots filled
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={handleParticipateClick}
              disabled={event.status !== 'upcoming'}
            >
              {isParticipating ? 'Unregister' : 'Register for Event'}
            </Button>
          </Paper>

          {/* Requirements */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Requirements
            </Typography>
            <List>
              {event.requirements.map((req, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <DescriptionIcon />
                  </ListItemIcon>
                  <ListItemText primary={req} />
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* Rewards */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Rewards
            </Typography>
            <List>
              {event.rewards.map((reward, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <EmojiEventsIcon />
                  </ListItemIcon>
                  <ListItemText primary={reward} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Sponsors */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sponsors
            </Typography>
            <Grid container spacing={3}>
              {event.sponsors.map((sponsor, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                    }}
                  >
                    <Box
                      component="img"
                      src={sponsor.logo}
                      alt={sponsor.name}
                      sx={{
                        width: 100,
                        height: 100,
                        objectFit: 'contain',
                        mb: 1,
                      }}
                    />
                    <Typography variant="subtitle1">{sponsor.name}</Typography>
                    <Chip
                      label={sponsor.level}
                      size="small"
                      color="primary"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Participation Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          {dialogType === 'register' ? 'Register for Event' : 'Unregister from Event'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {dialogType === 'register'
              ? 'Are you sure you want to register for this event?'
              : 'Are you sure you want to unregister from this event?'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDialogConfirm} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default EventDetails; 