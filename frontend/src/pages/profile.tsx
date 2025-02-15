import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

// Initialize Supabase client
const supabase = createClient('https://qagsbbilljqjmauhylgo.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhZ3NiYmlsbGpxam1hdWh5bGdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1OTczNzAsImV4cCI6MjA1NTE3MzM3MH0.5R8oQ9Zh_w6R7cDDhAU9xKZlMOk2jU3cCgO72uu91qU');

const ProfilePage = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [username, setUsername] = useState('');
  const [userUsername, setUserUsername] = useState<string | null>(null); // To store the fetched username for placeholder
  const navigate = useNavigate(); // For redirection

  useEffect(() => {
    const fetchUser = async () => {
      // Get current user
      const { data: user, error: userError } = await supabase.auth.getUser();

      if (userError || !user?.user) {
        setError('User not found');
        return;
      }

      // Query the 'users' table to get the user's username
      const { data: userData, error: queryError } = await supabase
        .from('users')
        .select('username')
        .eq('id', user.user.id)
        .single(); // Fetch a single result

      if (queryError) {
        setError(queryError.message);
        return;
      }

      // Set the username fetched from the database (for the textbox placeholder)
      setUserUsername(userData?.username || '');
    };

    fetchUser();
  }, []);

  const updateRole = async (role: 'mentor' | 'guardian' | 'warrior') => {
    setIsLoading(true);
    setError(null);

    // Get current user
    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError || !user?.user) {
      setError('User not found');
      setIsLoading(false);
      return;
    }

    // If no username is provided, use the original username
    const finalUsername = username.trim() === '' ? userUsername : username;

    // Update user's role and username in the database
    const { error: updateError } = await supabase
      .from('users')
      .update({ role, username: finalUsername })
      .eq('id', user.user.id);

    setIsLoading(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      alert(`Role updated to ${role}`);
      navigate('/'); // Redirect to a dashboard or homepage
    }
  };

  return (
    <div className="profile-page">
      <h2>Choose Your Role</h2>
      <p>Select a role and provide your username:</p>

      <div>
        <label>Username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={userUsername || 'Enter your username'}
          required
        />
      </div>

      <button onClick={() => updateRole('mentor')} disabled={isLoading}>
        Become a Mentor
      </button>
      <button onClick={() => updateRole('guardian')} disabled={isLoading}>
        Become a Guardian
      </button>
      <button onClick={() => updateRole('warrior')} disabled={isLoading}>
        Become a Warrior
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default ProfilePage;
