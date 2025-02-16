import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  LinearProgress,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import { LocalDrink, SmokeFree, Psychology, FitnessCenter, NoDrinks, Mood, SelfImprovement } from '@mui/icons-material';
import MenuDrawer from '../components/navbar';
import supabase from '../services/supabaseClient';
import Logo from 'frontend/public/images/logo.png';

interface RewardItem {
  id: number;
  name: string;
  description: string;
  points: number;
  category: 'smoking' | 'alcohol' | 'drugs' | 'all';
  icon: React.ReactNode;
}

const allRewards: RewardItem[] = [
  // smoking-specific rewards
  { id: 1, name: 'Smoke-Free Pack', description: 'Enjoy a healthier alternative!', points: 100, category: 'smoking', icon: <SmokeFree /> },
  { id: 2, name: 'Lung Health Checkup', description: 'Monitor your lung health!', points: 200, category: 'smoking', icon: <Psychology /> },
  { id: 3, name: 'Nicotine Gum Pack', description: 'Aiding your smoke-free journey.', points: 150, category: 'smoking', icon: <Mood /> },

  // alcohol-specific rewards
  { id: 4, name: 'Premium Mocktails', description: 'Indulge in refreshing non-alcoholic drinks!', points: 150, category: 'alcohol', icon: <LocalDrink /> },
  { id: 5, name: 'Liver Function Test', description: 'Stay on top of your health!', points: 250, category: 'alcohol', icon: <NoDrinks /> },
  { id: 6, name: 'Sober Club Entry', description: 'Experience alcohol-free nightlife.', points: 180, category: 'alcohol', icon: <Mood /> },

  // drug-related rewards
  { id: 7, name: 'Counseling Session', description: 'Receive expert guidance.', points: 300, category: 'drugs', icon: <Psychology /> },
  { id: 8, name: 'Mindfulness Retreat', description: 'Relax and reset your mind.', points: 350, category: 'drugs', icon: <SelfImprovement /> },
  { id: 9, name: 'Detox Plan Consultation', description: 'Personalized recovery plan.', points: 280, category: 'drugs', icon: <Mood /> },

  // common
  { id: 10, name: 'Therapy Session', description: 'Invest in your mental well-being.', points: 300, category: 'all', icon: <Psychology /> },
  { id: 11, name: 'Yoga Classes', description: 'Achieve inner peace and strength.', points: 250, category: 'all', icon: <FitnessCenter /> },
  { id: 12, name: 'Gym Membership', description: 'Stay active and strong!', points: 400, category: 'all', icon: <FitnessCenter /> }
];

const RewardsShop: React.FC = () => {
  const [userPoints, setUserPoints] = useState<number>(0);
  const [username, setUsername] = useState<string>('Warrior');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedItem, setSelectedItem] = useState<RewardItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [userCategory, setUserCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error('Authentication error');

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('username, warrior_points')
          .eq('id', user.id)
          .single();

        if (userError) throw userError;

        const { data: warriorData, error: warriorError } = await supabase
          .from('warriors')
          .select('addict_type')
          .eq('uuid', user.id)
          .single();

        if (warriorData) setUserCategory(warriorData.addict_type);
        if (userData) {
          setUsername(userData.username || 'Warrior');
          setUserPoints(userData.warrior_points || 0);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        showSnackbar('Error loading user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleRedeemClick = (item: RewardItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
    handleConfirmRedeem();
  };

  const handleConfirmRedeem = async () => {
    if (!selectedItem || !userPoints || !userCategory) return;
    
    if (userPoints < selectedItem.points) {
      showSnackbar('Not enough points! Keep going!');
      return;
    }
  
    const newPoints = userPoints - selectedItem.points;
    setUserPoints(newPoints); 
  
    try {
      // Get the logged-in user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('Authentication error');
  
      const { data, error } = await supabase
        .from('users')
        .update({ warrior_points: newPoints }) 
        .eq('id', user.id); 
  
      if (error) throw error;
  
      showSnackbar(`Great choice! You redeemed ${selectedItem.name}.`);
    } catch (error) {
      showSnackbar('An error occurred while updating points.');
      console.error('Error updating points:', error);
    }
  
    setDialogOpen(false);
  };

  const filteredRewards = allRewards.filter(
    (item) => item.category === 'all' || item.category === userCategory
  );

  if (loading) return <LinearProgress sx={{ mt: 4 }} />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', padding: 2, borderBottom: 1, borderColor: 'divider' }}>
        <MenuDrawer />
        <img src={Logo} alt="BreakFree Logo" style={{ height: 40, marginLeft: 10 }} />
        <Typography variant="h6" sx={{ marginLeft: 1, fontWeight: 'bold' }}>BreakFree Rewards</Typography>
      </Box>

      <Box sx={{ p: 4 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Welcome, {username}!</Typography>
          <Typography variant="h6" color="textSecondary">Your journey to a healthier life is rewarding!</Typography>
        </Box>

        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Card sx={{ display: 'inline-block', padding: 2, backgroundColor: '#ff9800', color: 'white' }}>
            <Typography variant="h6">Your Points</Typography>
            <Typography variant="h4">{userPoints}</Typography>
          </Card>
        </Box>

        <Grid container spacing={3} justifyContent="center">
          {filteredRewards.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 3 }}>
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>{item.icon}</Box>
                  <Typography variant="h6" sx={{ mt: 2 }}>{item.name}</Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>{item.description}</Typography>
                  <Typography variant="h6" color="primary" sx={{ mt: 2 }}>{item.points} points</Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center' }}>
                  <Button variant="contained" disabled={userPoints < item.points} onClick={() => handleRedeemClick(item)}>
                    Redeem
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{
            width: '100%', // Make it take the full width of Snackbar
            fontSize: '1.2rem', // Increase font size
            padding: '16px', // Add more padding for a bigger feel
            minWidth: '300px', // Ensure a minimum width
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
    
  );
};

export default RewardsShop;
