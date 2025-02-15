import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Card, CardContent, LinearProgress, Alert, Chip, Divider } from '@mui/material';
import supabase from '../services/supabaseClient';

interface BuddyRequest {
  buddy_id: number;
  buddy_uuid: string;
  buddy_username: string;
  warrior_uuid: string;
  warrior_username: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  timestamp: string;
}

const WarriorRegisterBuddy = () => {
  const [buddyUsername, setBuddyUsername] = useState('');
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string | null } | null>(null);
  const [incomingRequests, setIncomingRequests] = useState<BuddyRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<BuddyRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchBuddyRequests();
    }
  }, [currentUser]);

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

  const fetchBuddyRequests = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      
      // Fetch incoming requests (where user is warrior)
      const { data: incoming, error: incomingError } = await supabase
        .from('buddies')
        .select('*')
        .eq('warrior_uuid', currentUser.id)
        .order('timestamp', { ascending: false });

      if (incomingError) throw incomingError;
      setIncomingRequests(incoming || []);

      // Fetch outgoing requests (where user is buddy)
      const { data: outgoing, error: outgoingError } = await supabase
        .from('buddies')
        .select('*')
        .eq('buddy_uuid', currentUser.id)
        .order('timestamp', { ascending: false });

      if (outgoingError) throw outgoingError;
      setOutgoingRequests(outgoing || []);

    } catch (err) {
      console.error('Error fetching buddy requests:', err);
      setError('Failed to load buddy requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSendBuddyRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !currentUser.username || !buddyUsername.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Check if username exists
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, username')
        .eq('username', buddyUsername.trim())
        .single();

      if (userError || !userData) {
        setError('User not found');
        return;
      }

      if (userData.id === currentUser.id) {
        setError('You cannot send a buddy request to yourself');
        return;
      }

      // Check for existing request
      const { data: existingRequest, error: checkError } = await supabase
        .from('buddies')
        .select('*')
        .eq('buddy_uuid', currentUser.id)
        .eq('warrior_uuid', userData.id)
        .single();

      if (existingRequest) {
        if (existingRequest.status === 'pending') {
          setError('You already have a pending request to this user');
        } else if (existingRequest.status === 'accepted') {
          setError('You are already buddies with this user');
        } else {
          // Update existing request if rejected/cancelled
          const { error: updateError } = await supabase
            .from('buddies')
            .update({ 
              status: 'pending',
              timestamp: new Date().toISOString()
            })
            .eq('buddy_id', existingRequest.buddy_id);

          if (updateError) throw updateError;
          setSuccess('Buddy request sent!');
          setBuddyUsername('');
        }
        return;
      }

      // Create new request
      const { error: insertError } = await supabase
        .from('buddies')
        .insert([{
          buddy_uuid: currentUser.id,
          buddy_username: currentUser.username,
          warrior_uuid: userData.id,
          warrior_username: userData.username,
          status: 'pending'
        }]);

      if (insertError) throw insertError;

      setSuccess('Buddy request sent successfully!');
      setBuddyUsername('');
      await fetchBuddyRequests();

    } catch (err) {
      console.error('Error sending buddy request:', err);
      setError('Failed to send buddy request');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId: number, action: 'accept' | 'reject') => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const { error: updateError } = await supabase
        .from('buddies')
        .update({ 
          status: action === 'accept' ? 'accepted' : 'rejected',
          timestamp: new Date().toISOString()
        })
        .eq('buddy_id', requestId);

      if (updateError) throw updateError;

      setSuccess(`Request ${action === 'accept' ? 'accepted' : 'rejected'} successfully!`);
      await fetchBuddyRequests();

    } catch (err) {
      console.error('Error updating buddy request:', err);
      setError(`Failed to ${action} request`);
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
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom textAlign="center">
        Manage Buddy Connections
      </Typography>

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

      {/* Request a Buddy Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Request a Buddy
          </Typography>
          <form onSubmit={handleSendBuddyRequest}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Buddy's Username"
                value={buddyUsername}
                onChange={(e) => setBuddyUsername(e.target.value)}
                disabled={loading}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={loading || !buddyUsername.trim()}
              >
                Send Request
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* Incoming Requests Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Incoming Buddy Requests
          </Typography>
          {incomingRequests.length === 0 ? (
            <Typography color="text.secondary">No incoming buddy requests</Typography>
          ) : (
            incomingRequests.map((request) => (
              <Box key={request.buddy_id} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Typography>{request.buddy_username}</Typography>
                  <Chip 
                    label={request.status}
                    size="small"
                    color={getStatusChipColor(request.status) as any}
                  />
                </Box>
                {request.status === 'pending' && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => handleRequestAction(request.buddy_id, 'accept')}
                      disabled={loading}
                    >
                      Accept
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="error"
                      onClick={() => handleRequestAction(request.buddy_id, 'reject')}
                      disabled={loading}
                    >
                      Reject
                    </Button>
                  </Box>
                )}
                <Divider sx={{ mt: 2 }} />
              </Box>
            ))
          )}
        </CardContent>
      </Card>

      {/* Outgoing Requests Section */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Your Outgoing Buddy Requests
          </Typography>
          {outgoingRequests.length === 0 ? (
            <Typography color="text.secondary">No outgoing buddy requests</Typography>
          ) : (
            outgoingRequests.map((request) => (
              <Box key={request.buddy_id} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography>{request.warrior_username}</Typography>
                  <Chip 
                    label={request.status}
                    size="small"
                    color={getStatusChipColor(request.status) as any}
                  />
                </Box>
                <Divider sx={{ mt: 2 }} />
              </Box>
            ))
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default WarriorRegisterBuddy;