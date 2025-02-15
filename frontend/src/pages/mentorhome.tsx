import React, { useState, useEffect } from 'react';
import supabase from '../services/supabaseClient';

const MentorHomePage = () => {
  const [addictType, setAddictType] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState('');

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

  const handleAddictTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAddictType(e.target.value);
  };

  const handleTimestampChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimestamp(e.target.value);
  };

  const handleCreateSession = async () => {
    if (!addictType || !timestamp || !user) {
      alert('Please fill in both fields and ensure you are logged in!');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert([
          {
            mentor_id: user.id, // Use the fetched user id
            addict_type: addictType,
            timestamp: timestamp,
          },
        ]);

      if (error) {
        throw error;
      }

      alert('Session created successfully!');
      setAddictType('');
      setTimestamp('');
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Error creating session.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Mentor Home</h1>
      {user ? (
        <>
          <p>Welcome, {username || user.email}!</p>
          <div>
            <label htmlFor="addictType">Select Addict Type:</label>
            <select id="addictType" value={addictType} onChange={handleAddictTypeChange}>
              <option value="">Select...</option>
              <option value="alcohol">Alcohol</option>
              <option value="drugs">Drugs</option>
              <option value="smoking">Smoking</option>
              {/* Add more options as needed */}
            </select>
          </div>
          <div>
            <label htmlFor="timestamp">Select Timestamp:</label>
            <input
              type="datetime-local"
              id="timestamp"
              value={timestamp}
              onChange={handleTimestampChange}
            />
          </div>
          <div>
            <button onClick={handleCreateSession} disabled={isLoading}>
              {isLoading ? 'Creating Session...' : 'Create Session'}
            </button>
          </div>
        </>
      ) : (
        <p>Please log in to create a session.</p>
      )}
    </div>
  );
};

export default MentorHomePage;
