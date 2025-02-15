import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

// Initialize Supabase client
const supabase = createClient('https://qagsbbilljqjmauhylgo.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhZ3NiYmlsbGpxam1hdWh5bGdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1OTczNzAsImV4cCI6MjA1NTE3MzM3MH0.5R8oQ9Zh_w6R7cDDhAU9xKZlMOk2jU3cCgO72uu91qU');

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSigningUp, setIsSigningUp] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null); // Clear any previous errors

    if (isSigningUp) {
      // Handle sign-up
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        alert('Check your email for the confirmation link!');
      }
    } else {
      // Handle login
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setError(error.message);
      } else if (data.user) {
        // Check if user has a role and username
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role, username')
          .eq('id', data.user.id)
          .single();

        if (userError || !userData?.role) {
          navigate('/choose-role'); // Redirect to role selection if no role is set
        } else if (!userData?.username) {
          navigate('/choose-role'); // Redirect if no username is set
        } else {
          navigate('/'); // Redirect to homepage if role and username exist
        }
      }
    }
  };

  return (
    <div className="login-page">
      <h2>{isSigningUp ? 'Sign Up' : 'Login'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">{isSigningUp ? 'Sign Up' : 'Login'}</button>
      </form>

      <div>
        <button onClick={() => setIsSigningUp(!isSigningUp)}>
          {isSigningUp ? 'Already have an account? Login' : 'Don’t have an account? Sign Up'}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
