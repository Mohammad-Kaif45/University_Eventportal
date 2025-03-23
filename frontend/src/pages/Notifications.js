import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Event as EventIcon,
  EmojiEvents as EmojiEventsIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const notificationTypes = {
  event: {
    icon: EventIcon,
    color: 'primary',
  },
  reward: {
    icon: EmojiEventsIcon,
    color: 'warning',
  },
  success: {
    icon: CheckCircleIcon,
    color: 'success',
  },
  error: {
    icon: ErrorIcon,
    color: 'error',
  },
  info: {
    icon: InfoIcon,
    color: 'info',
  },
};

function Notifications() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // TODO: Replace with actual API call
        // For now, using mock data
        const mockNotifications = [
          {
            id: 1,
            title: 'New Event Registration',
            message: 'You have successfully registered for Annual Tech Fest',
            type: 'success',
            timestamp: '2024-03-10T10:30:00Z',
            read: false,
          },
          {
            id: 2,
            title: 'Reward Points Earned',
            message: 'You earned 50 points for participating in Sports Day',
            type: 'reward',
            timestamp: '2024-03-09T15:45:00Z',
            read: true,
          },
          {
            id: 3,
            title: 'Event Update',
            message: 'The workshop schedule has been updated. Please check the event details.',
            type: 'info',
            timestamp: '2024-03-08T09:15:00Z',
            read: true,
          },
        ];

        setNotifications(mockNotifications);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setError('Failed to load notifications');
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleDeleteClick = (notification) => {
    setSelectedNotification(notification);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      // TODO: Replace with actual API call
      setNotifications(notifications.filter((n) => n.id !== selectedNotification.id));
      setDeleteDialogOpen(false);
      setSelectedNotification(null);
    } catch (error) {
      console.error('Error deleting notification:', error);
      setError('Failed to delete notification');
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      // TODO: Replace with actual API call
      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setError('Failed to update notification status');
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
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

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Chip
              label={`${unreadCount} unread`}
              color="primary"
              variant="outlined"
            />
          )}
        </Box>

        {notifications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          <List>
            {notifications.map((notification, index) => {
              const Icon = notificationTypes[notification.type].icon;
              const color = notificationTypes[notification.type].color;

              return (
                <React.Fragment key={notification.id}>
                  <ListItem
                    sx={{
                      backgroundColor: notification.read ? 'transparent' : 'action.hover',
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <ListItemIcon>
                      <Icon color={color} />
                    </ListItemIcon>
                    <ListItemText
                      primary={notification.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatTimestamp(notification.timestamp)}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      {!notification.read && (
                        <IconButton
                          edge="end"
                          onClick={() => handleMarkAsRead(notification.id)}
                          sx={{ mr: 1 }}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      )}
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteClick(notification)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Notification</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this notification? This action cannot be
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

export default Notifications; 