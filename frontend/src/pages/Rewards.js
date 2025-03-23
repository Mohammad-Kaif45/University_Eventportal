import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  EmojiEvents as EmojiEventsIcon,
  Star as StarIcon,
  History as HistoryIcon,
  LocalOffer as LocalOfferIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

function Rewards() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPoints, setUserPoints] = useState(0);
  const [rewards, setRewards] = useState([]);
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [redeemHistory, setRedeemHistory] = useState([]);

  useEffect(() => {
    const fetchRewardsData = async () => {
      try {
        // TODO: Replace with actual API calls
        // For now, using mock data
        setUserPoints(750);

        const mockRewards = [
          {
            id: 1,
            title: 'University Merchandise',
            description: 'Get exclusive university merchandise',
            image: 'https://source.unsplash.com/random/400x300?merchandise',
            points: 500,
            available: true,
            category: 'Merchandise',
          },
          {
            id: 2,
            title: 'Event Priority Registration',
            description: 'Get early access to event registrations',
            image: 'https://source.unsplash.com/random/400x300?event',
            points: 1000,
            available: true,
            category: 'Privilege',
          },
          {
            id: 3,
            title: 'Library Fine Waiver',
            description: 'Get your library fines waived',
            image: 'https://source.unsplash.com/random/400x300?library',
            points: 300,
            available: true,
            category: 'Service',
          },
        ];

        const mockHistory = [
          {
            id: 1,
            reward: 'University T-Shirt',
            points: 500,
            date: '2024-03-01T10:30:00Z',
            status: 'completed',
          },
          {
            id: 2,
            reward: 'Event Priority Registration',
            points: 1000,
            date: '2024-02-15T15:45:00Z',
            status: 'completed',
          },
        ];

        setRewards(mockRewards);
        setRedeemHistory(mockHistory);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching rewards data:', error);
        setError('Failed to load rewards data');
        setLoading(false);
      }
    };

    fetchRewardsData();
  }, []);

  const handleRedeemClick = (reward) => {
    setSelectedReward(reward);
    setRedeemDialogOpen(true);
  };

  const handleRedeemConfirm = async () => {
    try {
      // TODO: Replace with actual API call
      setUserPoints((prev) => prev - selectedReward.points);
      setRewards((prev) =>
        prev.map((r) =>
          r.id === selectedReward.id ? { ...r, available: false } : r
        )
      );
      setRedeemHistory((prev) => [
        {
          id: prev.length + 1,
          reward: selectedReward.title,
          points: selectedReward.points,
          date: new Date().toISOString(),
          status: 'pending',
        },
        ...prev,
      ]);
      setRedeemDialogOpen(false);
      setSelectedReward(null);
    } catch (error) {
      console.error('Error redeeming reward:', error);
      setError('Failed to redeem reward');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Points Overview */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <StarIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
              <Box>
                <Typography variant="h4" component="h1">
                  Your Points
                </Typography>
                <Typography variant="h3" color="primary">
                  {userPoints}
                </Typography>
              </Box>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(userPoints / 1000) * 100}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Paper>
        </Grid>

        {/* Available Rewards */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Available Rewards
            </Typography>
            <Grid container spacing={3}>
              {rewards.map((reward) => (
                <Grid item xs={12} sm={6} key={reward.id}>
                  <Card>
                    <CardMedia
                      component="img"
                      height="200"
                      image={reward.image}
                      alt={reward.title}
                    />
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {reward.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                      >
                        {reward.description}
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Chip
                          icon={<EmojiEventsIcon />}
                          label={`${reward.points} points`}
                          color="primary"
                        />
                        <Button
                          variant="contained"
                          onClick={() => handleRedeemClick(reward)}
                          disabled={!reward.available || userPoints < reward.points}
                        >
                          Redeem
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Redeem History */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Redeem History
            </Typography>
            <List>
              {redeemHistory.map((item, index) => (
                <React.Fragment key={item.id}>
                  <ListItem>
                    <ListItemIcon>
                      <HistoryIcon color={item.status === 'completed' ? 'success' : 'warning'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.reward}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {item.points} points • {formatDate(item.date)}
                          </Typography>
                          <Chip
                            label={item.status}
                            size="small"
                            color={item.status === 'completed' ? 'success' : 'warning'}
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < redeemHistory.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Redeem Confirmation Dialog */}
      <Dialog open={redeemDialogOpen} onClose={() => setRedeemDialogOpen(false)}>
        <DialogTitle>Redeem Reward</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to redeem "{selectedReward?.title}" for{' '}
            {selectedReward?.points} points?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRedeemDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRedeemConfirm} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Rewards; 