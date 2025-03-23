import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Event as EventIcon,
  People as PeopleIcon,
  Notifications as NotificationsIcon,
  EmojiEvents as EmojiEventsIcon,
  AttachMoney as MoneyIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function CommitteeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalParticipants: 0,
    totalSponsors: 0,
    totalBudget: 0,
  });
  const [committeeEvents, setCommitteeEvents] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // TODO: Replace with actual API calls to fetch committee data
        // For now, using mock data
        setStats({
          totalEvents: 12,
          activeEvents: 5,
          totalParticipants: 250,
          totalSponsors: 8,
          totalBudget: 12500,
        });

        setCommitteeEvents([
          {
            id: 1,
            title: 'Annual Tech Summit',
            date: '2024-04-15',
            participants: 85,
            status: 'active',
          },
          {
            id: 2,
            title: 'Coding Hackathon',
            date: '2024-04-22',
            participants: 45,
            status: 'upcoming',
          },
          {
            id: 3,
            title: 'Department Sports Day',
            date: '2024-05-10',
            participants: 120,
            status: 'planning',
          },
        ]);

        setPendingTasks([
          {
            id: 1,
            title: 'Review speaker applications',
            event: 'Annual Tech Summit',
            dueDate: '2024-03-25',
            priority: 'high',
          },
          {
            id: 2,
            title: 'Finalize venue arrangements',
            event: 'Coding Hackathon',
            dueDate: '2024-03-30',
            priority: 'medium',
          },
          {
            id: 3,
            title: 'Approve budget allocation',
            event: 'Department Sports Day',
            dueDate: '2024-04-05',
            priority: 'low',
          },
        ]);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching committee dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (!user || user.role !== 'committee_member') {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, mt: 8, textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            Access denied. This dashboard is only for committee members.
          </Typography>
        </Paper>
      </Container>
    );
  }

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

  const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              backgroundColor: `${color}20`,
              borderRadius: '50%',
              p: 1,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" sx={{ mb: 1 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      default:
        return 'success';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Committee Dashboard
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/events/create')}
        >
          Create Event
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Organized Events"
            value={stats.totalEvents}
            icon={<EventIcon sx={{ color: 'primary.main' }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Active Events"
            value={stats.activeEvents}
            icon={<PeopleIcon sx={{ color: 'success.main' }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Participants"
            value={stats.totalParticipants}
            icon={<PeopleIcon sx={{ color: 'info.main' }} />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <StatCard
            title="Total Sponsors"
            value={stats.totalSponsors}
            icon={<EmojiEventsIcon sx={{ color: 'secondary.main' }} />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <StatCard
            title="Total Budget"
            value={`$${stats.totalBudget}`}
            icon={<MoneyIcon sx={{ color: 'warning.main' }} />}
            color="warning"
          />
        </Grid>

        {/* Events Managed by Committee */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Events Managed</Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/events')}
              >
                View All
              </Button>
            </Box>
            <List>
              {committeeEvents.map((event, index) => (
                <React.Fragment key={event.id}>
                  <ListItem>
                    <ListItemIcon>
                      <EventIcon color={event.status === 'active' ? 'primary' : 'action'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {event.title}
                          <Chip 
                            size="small" 
                            label={event.status} 
                            color={event.status === 'active' ? 'success' : event.status === 'upcoming' ? 'primary' : 'default'}
                            sx={{ ml: 1 }}
                          />
                        </Box>
                      }
                      secondary={`Date: ${event.date} | Participants: ${event.participants}`}
                    />
                    <Button size="small" onClick={() => navigate(`/events/${event.id}`)}>
                      Manage
                    </Button>
                  </ListItem>
                  {index < committeeEvents.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Pending Tasks */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Pending Tasks</Typography>
              <Button
                variant="outlined"
                size="small"
              >
                View All
              </Button>
            </Box>
            <List>
              {pendingTasks.map((task, index) => (
                <React.Fragment key={task.id}>
                  <ListItem>
                    <ListItemIcon>
                      <NotificationsIcon color={getPriorityColor(task.priority)} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {task.title}
                          <Chip 
                            size="small" 
                            label={task.priority} 
                            color={getPriorityColor(task.priority)}
                            sx={{ ml: 1 }}
                          />
                        </Box>
                      }
                      secondary={`Event: ${task.event} | Due: ${task.dueDate}`}
                    />
                    <Button size="small" variant="contained" color="primary">
                      Complete
                    </Button>
                  </ListItem>
                  {index < pendingTasks.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default CommitteeDashboard; 