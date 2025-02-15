import React, { useEffect, useState } from 'react';
import supabase from '../services/supabaseClient';

const SessionsMentorPage = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null); // To store the logged-in user
  const [username, setUsername] = useState<string>(''); // To store the logged-in user's username
  const [isMentor, setIsMentor] = useState<boolean>(false); // To check if user is a mentor

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
  }, [isMentor, user?.id]); // Fetch sessions only when the user is a mentor or their ID changes

  if (isLoading) {
    return <div>Loading sessions...</div>;
  }

  return (
    <div>
      <h1>Sessions List</h1>
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
                <td>{session.users.username}</td>
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

export default SessionsMentorPage;
