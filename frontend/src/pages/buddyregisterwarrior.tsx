import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Card, CardContent, LinearProgress, Alert, Chip, AppBar, Toolbar, } from '@mui/material';
import supabase from '../services/supabaseClient';
import Logo from "frontend/public/images/logo.png";
import MenuDrawer from '../components/navbar';

interface WarriorData {
  addict_id: number;
  uuid: string;
  addict_type: string;
  days_clean: number;
  goal_weeks: number;
  username: string;
  timestamp: string;
}

interface BuddyData {
  buddy_id: number;
  buddy_uuid: string;
  buddy_username: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  timestamp: string;
}

const RegisterWarrior = () => {
  const [username, setUsername] = useState('');
  const [warriorData, setWarriorData] = useState<WarriorData[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string | null } | null>(null);
  const [buddies, setBuddies] = useState<BuddyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error('Not authenticated');

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('username')
          .eq('id', user.id)
          .single();

        if (userError) throw userError;

        setCurrentUser({
          id: user.id,
          username: userData?.username
        });
      } catch (err) {
        console.error('Error fetching current user:', err);
        setError('Failed to load user data');
      }
    };

    fetchCurrentUser();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !currentUser) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setWarriorData([]);
      setBuddies([]);

      if (username.trim().toLowerCase() === currentUser.username?.toLowerCase()) {
        setError('You cannot be your own buddy');
        return;
      }

      const { data: warriors, error: warriorError } = await supabase
        .from('warriors')
        .select('*')
        .eq('username', username.trim());

      if (warriorError) throw warriorError;

      if (!warriors || warriors.length === 0) {
        setError('No warrior found with this username');
        return;
      }

      const { data: existingBuddies, error: buddyError } = await supabase
        .from('buddies')
        .select('*')
        .eq('warrior_uuid', warriors[0].uuid);

      if (buddyError) throw buddyError;

      setWarriorData(warriors);
      setBuddies(existingBuddies || []);
    } catch (err) {
      console.error('Error searching warrior:', err);
      setError('Failed to search for warrior');
    } finally {
      setLoading(false);
    }
  };

  const handleSendBuddyRequest = async (warriorUuid: string) => {
    if (!currentUser || !currentUser.username) {
      setError('You must have a username to send a buddy request');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Check if already has any request
      const { data: existingBuddy, error: checkError } = await supabase
        .from('buddies')
        .select('*')
        .eq('buddy_uuid', currentUser.id)
        .eq('warrior_uuid', warriorUuid)
        .single();

      if (existingBuddy) {
        if (existingBuddy.status === 'pending') {
          setError('You already have a pending buddy request');
        } else if (existingBuddy.status === 'accepted') {
          setError('You are already a buddy');
        } else {
          // If rejected or cancelled, allow new request
          const { error: updateError } = await supabase
            .from('buddies')
            .update({ 
              status: 'pending', 
              timestamp: new Date().toISOString() 
            })
            .eq('buddy_id', existingBuddy.buddy_id);

          if (updateError) throw updateError;
          setSuccess('Buddy request sent!');
        }
        return;
      }

      // Create new buddy request
      const { error: insertError } = await supabase
        .from('buddies')
        .insert([{
          buddy_uuid: currentUser.id,
          buddy_username: currentUser.username,
          warrior_uuid: warriorUuid,
          warrior_username: username,
          status: 'pending'
        }]);

      if (insertError) throw insertError;

      // Refresh buddies list
      const { data: updatedBuddies, error: refreshError } = await supabase
        .from('buddies')
        .select('*')
        .eq('warrior_uuid', warriorUuid);

      if (refreshError) throw refreshError;
      
      setBuddies(updatedBuddies || []);
      setSuccess('Buddy request sent! Waiting for warrior approval.');
    } catch (err) {
      console.error('Error sending buddy request:', err);
      setError('Failed to send buddy request');
    } finally {
      setLoading(false);
    }
  };

  const getStatusChipColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
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

    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom textAlign="center">
        Find a Warrior to Support
      </Typography>

      <Typography variant="body1" gutterBottom textAlign="center" sx={{ mb: 4 }}>
        Search for a warrior by username to offer your support as a buddy
      </Typography>

      <form onSubmit={handleSearch}>
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <TextField
            fullWidth
            label="Warrior Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !username.trim() || !currentUser}
          >
            Search
          </Button>
        </Box>
      </form>

      {loading && <LinearProgress sx={{ mb: 2 }} />}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {warriorData.length > 0 && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {username}'s Recovery Journey
            </Typography>
            
            <Typography variant="subtitle1" gutterBottom>
              Current Support Team:
            </Typography>
            {buddies.length > 0 ? (
              <Box sx={{ mb: 2 }}>
                {buddies.map((buddy) => (
                  <Box key={buddy.buddy_id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body2">
                      • {buddy.buddy_username}
                    </Typography>
                    <Chip 
                      label={buddy.status}
                      size="small"
                      color={getStatusChipColor(buddy.status) as any}
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                No buddies supporting yet
              </Typography>
            )}

            <Typography variant="subtitle1" gutterBottom>
              Active Recovery Goals:
            </Typography>
            {warriorData.map((warrior) => (
              <Box key={warrior.addict_id} sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  • {warrior.addict_type.charAt(0).toUpperCase() + warrior.addict_type.slice(1)}
                  {' - '}{warrior.days_clean} days clean (Goal: {warrior.goal_weeks} weeks)
                </Typography>
              </Box>
            ))}

            {currentUser && (
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => handleSendBuddyRequest(warriorData[0].uuid)}
                disabled={loading || buddies.some(b => 
                  b.buddy_uuid === currentUser.id && 
                  (b.status === 'pending' || b.status === 'accepted')
                )}
                sx={{ mt: 2 }}
              >
                {buddies.some(b => b.buddy_uuid === currentUser.id && b.status === 'accepted')
                  ? 'Already Supporting'
                  : buddies.some(b => b.buddy_uuid === currentUser.id && b.status === 'pending')
                  ? 'Request Pending'
                  : 'Offer Support as Buddy'}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
    </>
  );
};

export default RegisterWarrior;