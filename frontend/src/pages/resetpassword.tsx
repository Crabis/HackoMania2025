import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useNavigate, useLocation } from "react-router-dom";
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

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the URL query parameter (the access_token)
  const queryParams = new URLSearchParams(location.search);
  const accessToken = queryParams.get("access_token");

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!accessToken) {
      setError("Invalid or expired token.");
      return;
    }

    setIsLoading(true);

    // Update the password using the token
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setIsLoading(false);

    if (error) {
      setError(error.message);
    } else {
      alert('Your password has been updated successfully!');
      navigate("/login"); // Redirect to login page after successful reset
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
        Reset your Password
      </Typography>

      {/* Reset Password Form Box */}
      <Card elevation={3} sx={{ borderRadius: 3, width: "100%" }}>
        <CardContent>
          <form onSubmit={handleResetPassword}>
            <TextField
              fullWidth
              type="password"
              label="New Password"
              variant="outlined"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              sx={{ mb: 2 }}
            />

            {error && <Typography color="error">{error}</Typography>}

            {/* Reset Password Button */}
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 1 }} disabled={isLoading}>
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ResetPasswordPage;
