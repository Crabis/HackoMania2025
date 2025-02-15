import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Avatar,
  Stack,
  Alert,
  Box,
  Typography,
  TextField,
  Button,
  Container,
  CircularProgress
} from '@mui/material';
import { deepOrange, deepPurple, green, blue } from '@mui/material/colors';
import CheckIcon from '@mui/icons-material/Check';
import MenuDrawer from "../components/navbar"

// Initialize Supabase client
const supabase = createClient('https://qagsbbilljqjmauhylgo.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhZ3NiYmlsbGpxam1hdWh5bGdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1OTczNzAsImV4cCI6MjA1NTE3MzM3MH0.5R8oQ9Zh_w6R7cDDhAU9xKZlMOk2jU3cCgO72uu91qU');

const ProfilePage = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [username, setUsername] = useState('');
  const [userUsername, setUserUsername] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      const { data: user, error: userError } = await supabase.auth.getUser();

      if (userError || !user?.user) {
        setError('User not found');
        setIsLoading(false);
        return;
      }

      const { data: userData, error: queryError } = await supabase
        .from('users')
        .select('username, role')
        .eq('id', user.user.id)
        .single();

      if (queryError) {
        setError(queryError.message);
      } else {
        setUserUsername(userData?.username || '');
        setCurrentRole(userData?.role || null);
      }
      setIsLoading(false);
    };

    fetchUser();
  }, []);

  const updateRole = async (role: 'mentor' | 'guardian' | 'warrior' | 'buddy') => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError || !user?.user) {
      setError('User not found');
      setIsLoading(false);
      return;
    }

    const finalUsername = username.trim() === '' ? userUsername : username;

    const { error: updateError } = await supabase
      .from('users')
      .update({ role, username: finalUsername })
      .eq('id', user.user.id);

    setIsLoading(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(`Successfully updated role to ${role}`);
      setCurrentRole(role);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }
  };

  const getAvatarColor = (role: string | null) => {
    switch (role?.toLowerCase()) {
      case 'mentor':
        return deepPurple[500];
      case 'guardian':
        return deepOrange[500];
      case 'warrior':
      
      case 'buddy':
        return green[500];
      default:
        return blue[500];
    }
  };

  return (
    <>
      <MenuDrawer />
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Card elevation={3}>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: getAvatarColor(currentRole),
                    fontSize: '2rem',
                    mb: 1
                  }}
                >
                  {userUsername?.[0]?.toUpperCase() || '?'}
                </Avatar>
                <Typography variant="h6" component="div">
                  {userUsername || 'No username set'}
                </Typography>
              </Box>

              <Typography variant="h5" component="h1" gutterBottom>
                Profile Settings
              </Typography>

              {error && (
                <Alert severity="error" sx={{ width: '100%' }}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert icon={<CheckIcon fontSize="inherit" />} severity="success" sx={{ width: '100%' }}>
                  {success}
                </Alert>
              )}

              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={userUsername || 'Enter your username'}
                variant="outlined"
                disabled={isLoading}
              />

              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Current Role: {currentRole || 'None'}
              </Typography>

              <Stack 
                direction="row" 
                spacing={2} 
                sx={{ 
                  width: '100%', 
                  mt: 2,
                  justifyContent: 'center',
                  flexWrap: { xs: 'wrap', sm: 'nowrap' },
                  gap: 2
                }}
              >
                <Button
                  variant="contained"
                  onClick={() => updateRole('mentor')}
                  disabled={isLoading}
                  sx={{ 
                    bgcolor: deepPurple[500], 
                    '&:hover': { bgcolor: deepPurple[700] },
                    minWidth: '100px',
                    flex: { xs: '1 1 100%', sm: '1 1 0' }
                  }}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Mentor'}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => updateRole('guardian')}
                  disabled={isLoading}
                  sx={{ 
                    bgcolor: deepOrange[500], 
                    '&:hover': { bgcolor: deepOrange[700] },
                    minWidth: '100px',
                    flex: { xs: '1 1 100%', sm: '1 1 0' }
                  }}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Guardian'}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => updateRole('warrior')}
                  disabled={isLoading}
                  sx={{ 
                    bgcolor: blue[500], 
                    '&:hover': { bgcolor: blue[700] },
                    minWidth: '100px',
                    flex: { xs: '1 1 100%', sm: '1 1 0' }
                  }}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Warrior'}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => updateRole('buddy')}
                  disabled={isLoading}
                  sx={{ 
                    bgcolor: green[500], 
                    '&:hover': { bgcolor: green[500] },
                    minWidth: '100px',
                    flex: { xs: '1 1 100%', sm: '1 1 0' }
                  }}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Buddy'}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </>
  );
};

export default ProfilePage;