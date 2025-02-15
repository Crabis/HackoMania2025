import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
} from "@mui/material";

// Initialize Supabase client
const supabase = createClient(
  "https://qagsbbilljqjmauhylgo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhZ3NiYmlsbGpxam1hdWh5bGdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1OTczNzAsImV4cCI6MjA1NTE3MzM3MH0.5R8oQ9Zh_w6R7cDDhAU9xKZlMOk2jU3cCgO72uu91qU"
);

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
          navigate('/profile'); // Redirect to role selection if no role is set
        } else if (!userData?.username) {
          navigate('/profile'); // Redirect if no username is set
        } else {
          navigate('/'); // Redirect to homepage if role and username exist
        }
      }
    }
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      {/* Logo */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <img src="/images/logo.png" alt="BreakFree Logo" style={{ height: "60px" }} />
      </Box>

      {/* Title */}
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
        Sign in to BreakFree
      </Typography>

      {/* Login Form Box */}
      <Card elevation={3} sx={{ borderRadius: 3, width: "100%" }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="password"
              label="Password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 2 }}
            />

            {error && <Typography color="error">{error}</Typography>}

            {/* Forgot Password */}
            <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 1 }}>
              <Button onClick={() => navigate("/forgot-password")} size="small">
                Forgot Password?
              </Button>
            </Box>

            {/* Login Button */}
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 1 }}>
              Login
            </Button>

            {/* Sign Up Button (Bottom Right) */}
            
          </form>
        </CardContent>
      </Card>
      <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", mt: 3 }}>
        <Typography variant="body2" sx={{ fontSize: "0.950rem", mr: 1 }}>
            New to Break Free?
        </Typography>
        <Button onClick={() => navigate("/register")} size="small" sx={{ fontSize: "0.875rem" }}>
            Sign Up
        </Button>
      </Box>
    </Container>
  );
};

export default LoginPage;

