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
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar
} from '@mui/material';
import { LocalDrink, SmokeFree, Psychology, FitnessCenter } from '@mui/icons-material';
import MenuDrawer from "../components/navbar";
import supabase from '../services/supabaseClient';
import Logo from "frontend/public/images/logo.png";

interface RewardItem {
  id: number;
  name: string;
  description: string;
  points: number;
  category: 'smoking' | 'alcohol' | 'drugs' | 'all';
  icon: React.ReactNode;
}

const rewardItems: RewardItem[] = [
  {
    id: 1,
    name: 'Smoke Substitute Pack',
    description: 'A variety pack of nicotine-free candy and oral substitutes',
    points: 100,
    category: 'smoking',
    icon: <SmokeFree className="h-6 w-6" />
  },
  {
    id: 2,
    name: 'Premium Non-Alcoholic Beverages',
    description: 'Selection of craft mocktails and alcohol-free alternatives',
    points: 150,
    category: 'alcohol',
    icon: <LocalDrink className="h-6 w-6" />
  },
  {
    id: 3,
    name: 'Therapy Session Voucher',
    description: 'One-hour session with a licensed therapist',
    points: 300,
    category: 'drugs',
    icon: <Psychology className="h-6 w-6" />
  },
  {
    id: 4,
    name: 'Yoga Class Package',
    description: '5-class package at participating studios',
    points: 250,
    category: 'all',
    icon: <FitnessCenter className="h-6 w-6" />
  },
  {
    id: 5,
    name: 'Gym Membership',
    description: '1-month membership at partner gyms',
    points: 400,
    category: 'all',
    icon: <FitnessCenter className="h-6 w-6" />
  }
];

const RewardsShop = () => {
  const [userPoints, setUserPoints] = useState<number>(0);
  const [username, setUsername] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<RewardItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [userCategory, setUserCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          throw new Error('Authentication error');
        }

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

        if (warriorData) {
          setUserCategory(warriorData.addict_type);
        }

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
  };

  const handleConfirmRedeem = async () => {
    if (!selectedItem) return;

    try {
      if (userPoints < selectedItem.points) {
        throw new Error('Insufficient points');
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Authentication error');
      }

      const newPoints = userPoints - selectedItem.points;

      const { error: updateError } = await supabase
        .from('users')
        .update({ warrior_points: newPoints })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setUserPoints(newPoints);
      showSnackbar('Reward redeemed successfully!');
      setDialogOpen(false);
    } catch (error) {
      console.error('Error redeeming reward:', error);
      showSnackbar('Error redeeming reward');
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  const isItemAvailable = (item: RewardItem) => {
    return true;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: 2, 
        borderBottom: 1, 
        borderColor: 'divider'
      }}>
        <MenuDrawer />
        <img src={Logo} alt="BreakFree Logo" style={{ height: 40, marginLeft: 10 }} />
        <Typography variant="h6" sx={{ marginLeft: 1, fontWeight: 'bold', color: 'black' }}>
          BreakFree Rewards
        </Typography>
      </Box>

      <Box sx={{ p: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">Welcome to the Rewards Shop</Typography>
          <Card sx={{ minWidth: 200 }}>
            <CardContent>
              <Typography variant="h6">Your Points</Typography>
              <Typography variant="h4" color="primary">{userPoints}</Typography>
            </CardContent>
          </Card>
        </Box>

        <Grid container spacing={3}>
          {rewardItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  opacity: isItemAvailable(item) ? 1 : 0.6
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      {item.icon}
                    </Avatar>
                    <Typography variant="h6" component="div">
                      {item.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                    {item.points} points
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    fullWidth 
                    variant="contained"
                    disabled={!isItemAvailable(item) || userPoints < item.points}
                    onClick={() => handleRedeemClick(item)}
                  >
                    Redeem
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Confirm Redemption</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to redeem {selectedItem?.name} for {selectedItem?.points} points?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmRedeem} variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default RewardsShop;