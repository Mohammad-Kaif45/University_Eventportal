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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Event as EventIcon,
  People as PeopleIcon,
  Notifications as NotificationsIcon,
  EmojiEvents as EmojiEventsIcon,
  Dashboard as DashboardIcon,
  DonutSmall as DonutSmallIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    pendingApprovals: 0,
    activeUsers: 0,
    systemReports: 0,
  });
  const [userDistribution, setUserDistribution] = useState({
    students: 0,
    committeeMembers: 0,
    admins: 0,
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // TODO: Replace with actual API calls to fetch admin data
        // For now, using mock data
        setStats({
          totalUsers: 1250,
          totalEvents: 42,
          pendingApprovals: 7,
          activeUsers: 850,
          systemReports: 3,
        });

        setUserDistribution({
          students: 1150,
          committeeMembers: 95,
          admins: 5,
        });

        setRecentEvents([
          {
            id: 1,
            title: 'Annual Tech Summit',
            date: '2024-04-15',
            organizer: 'CS Department',
            status: 'approved',
          },
          {
            id: 2,
            title: 'Coding Hackathon',
            date: '2024-04-22',
            organizer: 'Software Engineering Club',
            status: 'approved',
          },
          {
            id: 3,
            title: 'University Sports Day',
            date: '2024-05-10',
            organizer: 'Physical Education Department',
            status: 'pending',
          },
        ]);

        setPendingApprovals([
          {
            id: 1,
            type: 'Event',
            title: 'University Sports Day',
            requestedBy: 'Physical Education Department',
            date: '2024-03-15',
          },
          {
            id: 2,
            type: 'Committee Role',
            title: 'Jane Smith',
            requestedBy: 'Jane Smith',
            date: '2024-03-16',
          },
          {
            id: 3,
            type: 'Budget Increase',
            title: 'Tech Summit Additional Funding',
            requestedBy: 'CS Department',
            date: '2024-03-17',
          },
        ]);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (!user || user.role !== 'admin') {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, mt: 8, textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            Access denied. This dashboard is only for administrators.
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<PeopleIcon sx={{ color: 'primary.main' }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Events"
            value={stats.totalEvents}
            icon={<EventIcon sx={{ color: 'success.main' }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            icon={<NotificationsIcon sx={{ color: 'error.main' }} />}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <StatCard
            title="Active Users"
            value={stats.activeUsers}
            icon={<DashboardIcon sx={{ color: 'info.main' }} />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <StatCard
            title="System Reports"
            value={stats.systemReports}
            icon={<DonutSmallIcon sx={{ color: 'warning.main' }} />}
            color="warning"
          />
        </Grid>

        {/* User Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              User Distribution
            </Typography>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Role</TableCell>
                    <TableCell align="right">Count</TableCell>
                    <TableCell align="right">Percentage</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Students</TableCell>
                    <TableCell align="right">{userDistribution.students}</TableCell>
                    <TableCell align="right">
                      {Math.round((userDistribution.students / stats.totalUsers) * 100)}%
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Committee Members</TableCell>
                    <TableCell align="right">{userDistribution.committeeMembers}</TableCell>
                    <TableCell align="right">
                      {Math.round((userDistribution.committeeMembers / stats.totalUsers) * 100)}%
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Administrators</TableCell>
                    <TableCell align="right">{userDistribution.admins}</TableCell>
                    <TableCell align="right">
                      {Math.round((userDistribution.admins / stats.totalUsers) * 100)}%
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<SettingsIcon />}
                onClick={() => navigate('/user-management')}
              >
                Manage Users
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Pending Approvals */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Pending Approvals</Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/approvals')}
              >
                View All
              </Button>
            </Box>
            <List>
              {pendingApprovals.map((approval, index) => (
                <React.Fragment key={approval.id}>
                  <ListItem>
                    <ListItemIcon>
                      {approval.type === 'Event' ? (
                        <EventIcon color="primary" />
                      ) : approval.type === 'Committee Role' ? (
                        <PeopleIcon color="secondary" />
                      ) : (
                        <DonutSmallIcon color="warning" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {approval.title}
                          <Chip 
                            size="small" 
                            label={approval.type} 
                            color="default"
                            sx={{ ml: 1 }}
                          />
                        </Box>
                      }
                      secondary={`By: ${approval.requestedBy} | Date: ${approval.date}`}
                    />
                    <Box>
                      <Button size="small" color="success" sx={{ mr: 1 }}>
                        Approve
                      </Button>
                      <Button size="small" color="error">
                        Reject
                      </Button>
                    </Box>
                  </ListItem>
                  {index < pendingApprovals.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Recent Events */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Recent Events</Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/events')}
              >
                View All Events
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Event Title</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Organizer</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>{event.title}</TableCell>
                      <TableCell>{event.date}</TableCell>
                      <TableCell>{event.organizer}</TableCell>
                      <TableCell>
                        <Chip 
                          size="small" 
                          label={event.status} 
                          color={event.status === 'approved' ? 'success' : 'warning'} 
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button 
                          size="small" 
                          variant="outlined" 
                          onClick={() => navigate(`/events/${event.id}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default AdminDashboard; 