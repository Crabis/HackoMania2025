import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, LinearProgress, Button, Snackbar } from '@mui/material';
import supabase from '../services/supabaseClient';
import MenuDrawer from "../components/navbar";
import Logo from "frontend/public/images/logo.png";

const SessionsMentorPage = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null); // To store the logged-in user
  const [username, setUsername] = useState<string>(''); // To store the logged-in user's username
  const [isMentor, setIsMentor] = useState<boolean>(false); // To check if user is a mentor
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false); // To control snackbar visibility
  const [snackbarMessage, setSnackbarMessage] = useState<string>(''); // To display success message

  // Fetch user and their role
  useEffect(() => {
    const fetchUser = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError || !authData?.user) {
        setUser(null);
        return;
      }

      setUser(authData.user);

      // Fetch the user's details from the 'users' table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('username, role') // assuming the role is stored in the 'users' table
        .eq('id', authData.user.id)
        .single();

      if (!userError && userData) {
        setUsername(userData.username);
        setIsMentor(userData.role === 'mentor');
      }
    };

    fetchUser();
  }, []);

  // Fetch sessions if the user is a mentor
  useEffect(() => {
    const fetchSessions = async () => {
      if (!isMentor) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const { data, error } = await supabase
          .from('sessions')
          .select('session_id, addict_type, timestamp, location, mentor_id, users(username)')
          .eq('mentor_id', user?.id) // Fetch sessions where mentor_id matches logged-in user's ID
          .order('timestamp', { ascending: false }); // Sort by latest timestamp

        if (error) {
          throw error;
        }

        setSessions(data || []);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [isMentor, user?.id]);

  // Snackbar handling
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleSessionUpdate = (sessionId: string, action: string) => {
    // This function will update session status or handle mentor's actions like confirming a session.
    setSnackbarMessage(`${action} session successfully.`);
    setSnackbarOpen(true);
  };

  if (isLoading) {
    return <div>Loading sessions...</div>;
  }

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', padding: 2, position: 'absolute', top: 0, left: 0 }}>
        <MenuDrawer />
        <img src={Logo} alt="BreakFree Logo" style={{ height: 40, marginLeft: 10 }} />
        <Typography variant="h6" sx={{ marginLeft: 1, fontWeight: 'bold', color: 'black' }}>
          BreakFree
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10, px: 3 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 2, textAlign: 'center' }}>
          Welcome, Mentor {username || 'Warrior'}! 🎓
        </Typography>

        {sessions.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: 'center', color: 'gray' }}>
            No sessions available.
          </Typography>
        ) : (
          sessions.map((session) => (
            <Card key={session.session_id} sx={{ mb: 3, width: '100%', maxWidth: '600px', p: 3 }}>
              <CardContent>
                <Typography variant="h6">{session.users.username}'s Session</Typography>
                <Typography variant="body2" sx={{ mt: 1, color: 'gray' }}>
                  {new Date(session.timestamp).toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Location: {session.location}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: 'blue' }}>
                  Addict Type: {session.addict_type}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={session.status === 'Completed' ? 100 : 50}
                  sx={{ mt: 2, height: 10, borderRadius: 5 }}
                />
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleSessionUpdate(session.session_id, 'Confirm')}
                  sx={{ mt: 2 }}
                >
                  Confirm Session
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </Box>

      {/* Snackbar for success message */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage} // Display the custom message
      />
    </>
  );
};

export default SessionsMentorPage;
