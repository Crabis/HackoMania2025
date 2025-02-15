import { useState, useEffect } from "react"
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Box, 
  ThemeProvider, 
  CssBaseline, 
  Button,
  Card,
  CardContent,
  TextField,
  Checkbox,
  FormControlLabel,
  Alert,
  Container,
  Grid
} from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import AccountCircleIcon from "@mui/icons-material/AccountCircle"
import InfoIcon from "@mui/icons-material/Info"
import { createTheme } from "@mui/material/styles"
import { Link, useNavigate } from 'react-router-dom'
import { createClient } from "@supabase/supabase-js"

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

enum DonationCategory {
  SMOKING = 'Smoking',
  ALCOHOL = 'Alcohol',
  DRUGS = 'Drugs'
}

const GuardianPanel = () => {
  const [selectedCategory, setSelectedCategory] = useState<DonationCategory | null>(null);
  const [donationAmount, setDonationAmount] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const navigate = useNavigate();

  // Mock data for pool amounts - will be replaced with API data
  const poolAmounts: Record<DonationCategory, number> = {
    [DonationCategory.SMOKING]: 1500,
    [DonationCategory.ALCOHOL]: 2000,
    [DonationCategory.DRUGS]: 2500
  };

  const handleDonation = () => {
    // This will be replaced with actual API integration
    console.log('Donation submitted:', {
      category: selectedCategory,
      amount: donationAmount,
      isAnonymous
    });
  };

  const isValidDonationAmount = (amount: string): boolean => {
    const numericAmount = parseFloat(amount);
    return !isNaN(numericAmount) && numericAmount > 0;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Guardian Donation Panel
            </Typography>
            <IconButton color="inherit">
              <AccountCircleIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            {Object.values(DonationCategory).map((category) => (
              <Grid item xs={12} md={4} key={category}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: selectedCategory === category ? 2 : 0,
                    borderColor: 'primary.main',
                    '&:hover': {
                      boxShadow: 3
                    }
                  }}
                  onClick={() => setSelectedCategory(category as DonationCategory)}
                >
                  <CardContent>
                    <Typography variant="h5" component="div" gutterBottom>
                      {category}
                    </Typography>
                    <Typography variant="h4" color="primary">
                      ${poolAmounts[category as DonationCategory].toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Current Pool Amount
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {selectedCategory && (
            <Card sx={{ mt: 4, mb: 4 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Make a Donation to {selectedCategory} Pool
                </Typography>
                <Box sx={{ mt: 3 }}>
                  <TextField
                    fullWidth
                    label="Donation Amount"
                    type="number"
                    InputProps={{
                      startAdornment: '$',
                    }}
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    sx={{ mb: 2 }}
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                      />
                    }
                    label="Make this donation anonymous"
                  />

                  <Alert 
                    icon={<InfoIcon />} 
                    severity="info"
                    sx={{ mt: 2, mb: 2 }}
                  >
                    Your donation will be added to the {selectedCategory} pool and will help support 
                    participants in their journey to overcome addiction.
                  </Alert>

                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleDonation}
                    disabled={!isValidDonationAmount(donationAmount)}
                    sx={{ mt: 2 }}
                  >
                    Donate ${donationAmount || '0.00'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default GuardianPanel;