import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Pagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const categories = [
  'Technical',
  'Cultural',
  'Sports',
  'Academic',
  'Workshop',
  'Other',
];

const statuses = ['upcoming', 'active', 'completed', 'cancelled'];

function Events() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Get registered events from localStorage
        const registeredEvents = JSON.parse(localStorage.getItem('registeredEvents')) || {};
        
        // TODO: Replace with actual API call
        // For now, using mock data
        const mockEvents = [
          {
            id: 1,
            title: 'Annual Tech Fest',
            description: 'A celebration of technology and innovation featuring hackathons, tech talks, and workshops on AI, blockchain, and cybersecurity.',
            image: 'https://source.unsplash.com/random/800x600?technology',
            date: '2024-06-15',
            location: 'Main Auditorium',
            category: 'Technical',
            status: 'upcoming',
            participants: 75,
            maxParticipants: 200,
            organizer: 'Computer Science Department',
          },
          {
            id: 2,
            title: 'University Sports Championship',
            description: 'Annual inter-university sports competition with events in football, basketball, cricket, athletics and swimming.',
            image: 'https://source.unsplash.com/random/800x600?sports',
            date: '2024-05-10',
            location: 'University Stadium',
            category: 'Sports',
            status: 'upcoming',
            participants: 120,
            maxParticipants: 300,
            organizer: 'Sports Department',
          },
          {
            id: 3,
            title: 'Cultural Fest: Rhythms & Melodies',
            description: 'A vibrant celebration of performing arts featuring music concerts, dance competitions, theatrical performances, and art exhibitions.',
            image: 'https://source.unsplash.com/random/800x600?art',
            date: '2024-04-05',
            location: 'Arts Complex',
            category: 'Cultural',
            status: 'active',
            participants: 95,
            maxParticipants: 150,
            organizer: 'Fine Arts Department',
          },
          {
            id: 4,
            title: 'Academic Research Symposium',
            description: 'Distinguished scholars present cutting-edge research findings with panel discussions, poster presentations, and networking opportunities.',
            image: 'https://source.unsplash.com/random/800x600?education',
            date: '2024-07-20',
            location: 'Science Center',
            category: 'Academic',
            status: 'upcoming',
            participants: 45,
            maxParticipants: 100,
            organizer: 'Research & Development Center',
          },
        ];

        // Add registration status to each event
        const eventsWithRegistrationStatus = mockEvents.map(event => ({
          ...event,
          isRegistered: Boolean(registeredEvents[event.id])
        }));

        setEvents(eventsWithRegistrationStatus);
        setFilteredEvents(eventsWithRegistrationStatus);
        setTotalPages(Math.ceil(eventsWithRegistrationStatus.length / 6)); // 6 events per page
        setLoading(false);
      } catch (error) {
        console.error('Error fetching events:', error);
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    let filtered = [...events];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter((event) => event.category === categoryFilter);
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((event) => event.status === statusFilter);
    }

    setFilteredEvents(filtered);
    setTotalPages(Math.ceil(filtered.length / 6));
    setPage(1);
  }, [searchTerm, categoryFilter, statusFilter, events]);

  const handleDeleteClick = (event) => {
    setSelectedEvent(event);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      // TODO: Replace with actual API call
      setEvents(events.filter((event) => event.id !== selectedEvent.id));
      setDeleteDialogOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'info';
      case 'active':
        return 'success';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Events
        </Typography>
        {(user?.role === 'admin' || user?.role === 'committee') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/events/create')}
          >
            Create Event
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Search Events"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            select
            label="Category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All Statuses</MenuItem>
            {statuses.map((status) => (
              <MenuItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      {/* Events Grid */}
      <Grid container spacing={3}>
        {filteredEvents.slice((page - 1) * 6, page * 6).map((event) => (
          <Grid item xs={12} sm={6} md={4} key={event.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={event.image}
                alt={event.title}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6" component="h2">
                    {event.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Chip
                      label={event.status}
                      color={getStatusColor(event.status)}
                      size="small"
                    />
                    {event.isRegistered && (
                      <Chip
                        label="Registered"
                        color="success"
                        size="small"
                      />
                    )}
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {event.description}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarIcon sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2">{event.date}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationIcon sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2">{event.location}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CategoryIcon sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2">{event.category}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PeopleIcon sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2">
                    {event.participants}/{event.maxParticipants} participants
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate(`/events/${event.id}`)}
                  >
                    View Details
                  </Button>
                  {(user?.role === 'admin' || user?.role === 'committee') && (
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/events/${event.id}/edit`)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(event)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, value) => setPage(value)}
          color="primary"
        />
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedEvent?.title}"? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Events; 