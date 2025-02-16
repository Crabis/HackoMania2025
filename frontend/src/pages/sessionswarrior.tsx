import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Typography, LinearProgress, Snackbar, AppBar, Toolbar } from '@mui/material';
import supabase from '../services/supabaseClient';
import MenuDrawer from "../components/navbar";
import Logo from "frontend/public/images/logo.png";

const SessionsWarriorPage = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState<string>('');
  const [viewAllSessions, setViewAllSessions] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Snackbar state for success message
  const [snackbarMessage, setSnackbarMessage] = useState<string>(''); // Snackbar message state

  useEffect(() => {
    const fetchUser = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError || !authData?.user) {
        setUser(null);
        console.error('Error fetching user or user not authenticated');
        return;
      }

      setUser(authData.user);

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('username, role')
        .eq('id', authData.user.id)
        .single();

      if (!userError && userData) {
        setUsername(userData.username);
      } else {
        console.error('Error fetching user details:', userError);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchSessions = async () => {
      setIsLoading(true);

      try {
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance')
          .select('session_id, status')
          .eq('warrior_id', user.id);

        if (attendanceError) throw attendanceError;

        const sessionDetailsPromises = attendanceData.map(async (attendance) => {
          const { data: sessionData, error: sessionError } = await supabase
            .from('sessions')
            .select('session_id, mentor_id, timestamp, location, addict_type')
            .eq('session_id', attendance.session_id)
            .single();

          if (sessionError) {
            console.error('Error fetching session details:', sessionError);
            return null;
          }

          const { data: mentorData, error: mentorError } = await supabase
            .from('users')
            .select('username')
            .eq('id', sessionData?.mentor_id)
            .single();

          if (mentorError) {
            console.error('Error fetching mentor username:', mentorError);
            return null;
          }

          return {
            ...sessionData,
            mentor_username: mentorData?.username,
            status: attendance.status,
            isJoined: true,
          };
        });

        const sessionDetails = await Promise.all(sessionDetailsPromises);

        setSessions(sessionDetails.filter((session) => session !== null));
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!viewAllSessions) {
      fetchSessions();
    }
  }, [user?.id, viewAllSessions]);

  useEffect(() => {
    if (viewAllSessions) {
      const fetchAllSessions = async () => {
        setIsLoading(true);

        try {
          const { data: allSessionsData, error: allSessionsError } = await supabase
            .from('sessions')
            .select('session_id, mentor_id, timestamp, location, addict_type');

          if (allSessionsError) {
            throw allSessionsError;
          }

          const allSessionDetailsPromises = allSessionsData.map(async (session) => {
            const { data: mentorData, error: mentorError } = await supabase
              .from('users')
              .select('username')
              .eq('id', session.mentor_id)
              .single();

            if (mentorError) {
              console.error('Error fetching mentor username:', mentorError);
              return null;
            }

            // Check if the user has already joined this session
            const { data: attendanceData, error: attendanceError } = await supabase
              .from('attendance')
              .select('session_id')
              .eq('session_id', session.session_id)
              .eq('warrior_id', user.id)
              .single();

            if (attendanceError) {
              console.error('Error checking attendance:', attendanceError);
            }

            return {
              ...session,
              mentor_username: mentorData?.username,
              isJoined: attendanceData ? true : false, // If data is found, user has joined
            };
          });

          const allSessionDetails = await Promise.all(allSessionDetailsPromises);

          setSessions(allSessionDetails.filter((session) => session !== null));
        } catch (error) {
          console.error('Error fetching all sessions:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchAllSessions();
    }
  }, [viewAllSessions]);

  const handleJoinSession = async (sessionId: string) => {
    const { error } = await supabase
      .from('attendance')
      .insert([
        { session_id: sessionId, warrior_id: user.id, status: 'pending' }
      ]);

    if (error) {
      console.error('Error joining session:', error);
    } else {
      setSessions((prevSessions) =>
        prevSessions.map((session) =>
          session.session_id === sessionId ? { ...session, isJoined: true } : session
        )
      );
      setSnackbarMessage('Successfully joined the session!'); // Set custom message for joining
      setSnackbarOpen(true); // Show success Snackbar
    }
  };

  const handleLeaveSession = async (sessionId: string) => {
    const { error } = await supabase
      .from('attendance')
      .delete()
      .eq('session_id', sessionId)
      .eq('warrior_id', user.id);

    if (error) {
      console.error('Error leaving session:', error);
    } else {
      setSessions((prevSessions) =>
        prevSessions.filter((session) => session.session_id !== sessionId)
      );
      setSnackbarMessage('Successfully left the session!'); // Set custom message for leaving
      setSnackbarOpen(true); // Show success Snackbar
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography variant="h6">Loading sessions...</Typography>
      </Box>
    );
  }

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
          Welcome, {username || 'Warrior'}! 🏆
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant={viewAllSessions ? 'outlined' : 'contained'}
            color="primary"
            onClick={() => setViewAllSessions(false)}
            sx={{ width: '50%' }}
          >
            Your Sessions
          </Button>
          <Button
            variant={viewAllSessions ? 'contained' : 'outlined'}
            color="primary"
            onClick={() => setViewAllSessions(true)}
            sx={{ width: '50%' }}
          >
            All Sessions
          </Button>
        </Box>

        {sessions.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: 'center', color: 'gray' }}>
            No sessions available.
          </Typography>
        ) : (
          sessions.map((session) => (
            <Card key={session.session_id} sx={{ mb: 3, width: '100%', maxWidth: '600px', p: 3 }}>
              <CardContent>
                <Typography variant="h6">{session.mentor_username}'s Session</Typography>
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
                {!viewAllSessions && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Status: {session.status}
                  </Typography>
                )}
                {viewAllSessions && !session.isJoined && (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleJoinSession(session.session_id)}
                    sx={{ mt: 2 }}
                  >
                    Join Session
                  </Button>
                )}
                {!viewAllSessions && session.isJoined && (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleLeaveSession(session.session_id)}
                    sx={{ mt: 2 }}
                  >
                    Leave Session
                  </Button>
                )}
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

export default SessionsWarriorPage;
