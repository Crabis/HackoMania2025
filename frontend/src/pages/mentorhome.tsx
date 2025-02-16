import React, { useState, useEffect } from 'react';
import { Box, Button, Card, CardContent, Typography, TextField, MenuItem, Snackbar, AppBar, Toolbar } from '@mui/material';
import supabase from '../services/supabaseClient';
import MenuDrawer from "../components/navbar";
import Logo from "frontend/public/images/logo.png";

const MentorHomePage = () => {
  const [addictType, setAddictType] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError || !authData?.user) {
        setUser(null);
        return;
      }

      setUser(authData.user);

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("username")
        .eq("id", authData.user.id)
        .single();

      if (!userError && userData?.username) {
        setUsername(userData.username);
      }
    };

    fetchUser();
  }, []);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleCreateSession = async () => {
    if (!addictType || !timestamp || !user) {
      setSnackbarMessage('Please fill in all fields and ensure you are logged in!');
      setSnackbarOpen(true);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert([
          {
            mentor_id: user.id,
            addict_type: addictType,
            timestamp: timestamp,
          },
        ]);

      if (error) {
        throw error;
      }

      setSnackbarMessage('Session created successfully!');
      setAddictType('');
      setTimestamp('');
    } catch (error) {
      console.error('Error creating session:', error);
      setSnackbarMessage('Error creating session.');
    } finally {
      setIsLoading(false);
      setSnackbarOpen(true);
    }
  };

  return (
    <>
      <AppBar position="static" color="transparent" elevation={1} sx={{ px: 0 }}>
        <Toolbar sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <MenuDrawer />
            <img src={Logo} alt="BreakFree Logo" style={{ height: 40, marginLeft: 10 }} />
            <Typography variant="h6" sx={{ fontWeight: "bold", ml: 1, color: "black" }}>
              BreakFree
            </Typography>
          </Box>
          </Toolbar>
        </AppBar>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10, px: 3 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 2, textAlign: 'center' }}>
          Welcome, Mentor {username || 'Warrior'}! 🎓
        </Typography>

        {user ? (
          <Card sx={{ width: '100%', maxWidth: '600px', p: 3, mt: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Create a Session</Typography>

              <TextField
                select
                label="Select Addict Type"
                value={addictType}
                onChange={(e) => setAddictType(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
              >
                <MenuItem value="alcohol">Alcohol</MenuItem>
                <MenuItem value="drugs">Drugs</MenuItem>
                <MenuItem value="smoking">Smoking</MenuItem>
              </TextField>

              <TextField
                type="datetime-local"
                label="Select Timestamp"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />

              <Button
                variant="contained"
                color="secondary"
                fullWidth
                onClick={handleCreateSession}
                disabled={isLoading}
              >
                {isLoading ? 'Creating Session...' : 'Create Session'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Typography variant="body1" sx={{ textAlign: 'center', color: 'gray' }}>
            Please log in to create a session.
          </Typography>
        )}
      </Box>

      {/* Snackbar for success or error messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </>
  );
};

export default MentorHomePage;
