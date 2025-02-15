import React, { useEffect, useState } from 'react';
import supabase from '../services/supabaseClient';

const SessionsWarriorPage = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null); // To store the logged-in user
  const [username, setUsername] = useState<string>(''); // To store the logged-in user's username
  const [viewAllSessions, setViewAllSessions] = useState<boolean>(false); // To toggle between "Your Sessions" and "All Sessions"

  // Fetch user and their role
  useEffect(() => {
    const fetchUser = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError || !authData?.user) {
        setUser(null);
        console.error('Error fetching user or user not authenticated');
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
        console.log('User data fetched:', userData);
        setUsername(userData.username);
      } else {
        console.error('Error fetching user details:', userError);
      }
    };

    fetchUser();
  }, []);

  // Fetch sessions if the user is a warrior (for "Your Sessions")
  useEffect(() => {
    if (!user) return; // Skip if user is not authenticated

    const fetchSessions = async () => {
      console.log('Fetching sessions for warrior ID:', user.id);

      setIsLoading(true);

      try {
        // Fetch session details from the attendance table
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance')
          .select('session_id, status')
          .eq('warrior_id', user.id);

        if (attendanceError) {
          throw attendanceError;
        }

        // For each session_id in the attendance data, fetch session details
        const sessionDetailsPromises = attendanceData.map(async (attendance) => {
          const { data: sessionData, error: sessionError } = await supabase
            .from('sessions')
            .select('session_id, mentor_id, timestamp, location, addict_type') // Added addict_type
            .eq('session_id', attendance.session_id)
            .single();

          if (sessionError) {
            console.error('Error fetching session details:', sessionError);
            return null;
          }

          // Fetch the mentor's username based on mentor_id
          const { data: mentorData, error: mentorError } = await supabase
            .from('users')
            .select('username')
            .eq('id', sessionData?.mentor_id)
            .single();

          if (mentorError) {
            console.error('Error fetching mentor username:', mentorError);
            return null;
          }

          // Combine session details with mentor username and addict_type
          return {
            ...sessionData,
            mentor_username: mentorData?.username,
            status: attendance.status,
          };
        });

        // Wait for all session details to be fetched
        const sessionDetails = await Promise.all(sessionDetailsPromises);

        // Filter out any null results
        setSessions(sessionDetails.filter((session) => session !== null));
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch sessions for "Your Sessions"
    if (!viewAllSessions) {
      fetchSessions();
    }
  }, [user?.id, viewAllSessions]); // Fetch sessions only when the user is available or their ID changes or when the tab view changes

  // Fetch all sessions (for "All Sessions")
  useEffect(() => {
    if (viewAllSessions) {
      const fetchAllSessions = async () => {
        console.log('Fetching all sessions');

        setIsLoading(true);

        try {
          // Fetch all sessions from the sessions table
          const { data: allSessionsData, error: allSessionsError } = await supabase
            .from('sessions')
            .select('session_id, mentor_id, timestamp, location, addict_type'); // Added addict_type

          if (allSessionsError) {
            throw allSessionsError;
          }

          // For each session, fetch mentor username
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

            return {
              ...session,
              mentor_username: mentorData?.username,
            };
          });

          // Wait for all session details to be fetched
          const allSessionDetails = await Promise.all(allSessionDetailsPromises);

          // Filter out any null results
          setSessions(allSessionDetails.filter((session) => session !== null));
        } catch (error) {
          console.error('Error fetching all sessions:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchAllSessions();
    }
  }, [viewAllSessions]); // Fetch all sessions only when the tab is set to "All Sessions"

  if (isLoading) {
    return <div>Loading sessions...</div>;
  }

  return (
    <div>
      <h1>Sessions List</h1>
      
      {/* Tab buttons */}
      <div>
        <button onClick={() => setViewAllSessions(false)} disabled={!user}>Your Sessions</button>
        <button onClick={() => setViewAllSessions(true)}>All Sessions</button>
      </div>

      {/* Display sessions */}
      {sessions.length === 0 ? (
        <p>No sessions available.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Mentor Username</th>
              <th>Addict Type</th>
              <th>Timestamp</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.session_id}>
                <td>{session.mentor_username}</td>
                <td>{session.addict_type}</td>
                <td>{new Date(session.timestamp).toLocaleString()}</td>
                <td>{session.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SessionsWarriorPage;
