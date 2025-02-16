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
  Grid,
  CircularProgress,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Avatar
} from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import { Link } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle"
import InfoIcon from "@mui/icons-material/Info"
import { createTheme } from "@mui/material/styles"
import supabase from '../services/supabaseClient'
import Logo from "frontend/public/images/logo.png";
import MenuDrawer from "../components/navbar";
import { User } from "lucide-react";

const API_BASE_URL = 'http://localhost:3001';

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

interface PoolAmounts {
  [key: string]: number;
}

interface Amount {
  value: string;
  assetCode: string;
  assetScale: number;
}

interface Quote {
  id: string;
  walletAddress: string;
  receiveAmount: Amount;
  debitAmount: Amount;
  receiver: string;
  expiresAt: string;
  createdAt: string;
  method: string;
}

interface PaymentInteract {
  redirect: string;
  finish: string;
}

interface PaymentResponse {
  interact: PaymentInteract;
  continue: {
    access_token: {
      value: string;
    };
    uri: string;
    wait: number;
  };
}

interface PaymentState {
  quote: Quote | null;
  redirectUrl: string | null;
  walletId: string | null;
}

const GuardianPanel = () => {
  const [selectedCategory, setSelectedCategory] = useState<DonationCategory | null>(null);
  const [donationAmount, setDonationAmount] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [poolAmounts, setPoolAmounts] = useState<PoolAmounts>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState<boolean>(false);
  const [paymentState, setPaymentState] = useState<PaymentState>({
    quote: null,
    redirectUrl: null,
    walletId: null
  });
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [walletId, setWalletId] = useState<string>('');
  
    useEffect(() => {
      const fetchUser = async () => {
        const { data: authData, error: authError } = await supabase.auth.getUser();
  
        if (authError || !authData?.user) {
          setUser(null);
          return;
        }
  
        setUser(authData.user);
  
        // ✅ Fetch additional user details (username) from the "users" table
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

  useEffect(() => {
  // Listen for auth changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      // Handle signed out state
      console.log('User signed out');
    } else if (event === 'SIGNED_IN') {
      // Handle signed in state
      console.log('User signed in');
    }
  });

  // Cleanup subscription on unmount
  return () => {
    subscription.unsubscribe();
  };
}, []);
  // Initial load and health check
  useEffect(() => {
    const init = async () => {
      try {
        // Health check
        const healthResponse = await fetch(`${API_BASE_URL}/health`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        });
        if (!healthResponse.ok) {
          throw new Error('Server health check failed');
        }
        console.log('Server health check passed');
        
        // Load pool amounts
        await fetchPoolAmounts();
      } catch (error) {
        console.error('Initialization error:', error);
        setSnackbarMessage('Error connecting to server');
        setSnackbarOpen(true);
      }
    };

    init();
  }, []);

  const fetchPoolAmounts = async () => {
    try {
      console.log('Fetching pool amounts...');
      
      const { data: donations, error } = await supabase
        .from('donations')
        .select('amount, category') // Include category in the query
        .eq('status', 'completed');
  
      if (error) {
        console.error('Supabase fetch error:', error);
        throw error;
      }
  
      console.log('Raw donations data:', donations);
  
      const amounts: PoolAmounts = {
        [DonationCategory.SMOKING]: 0,
        [DonationCategory.ALCOHOL]: 0,
        [DonationCategory.DRUGS]: 0
      };
  
      if (donations) {
        donations.forEach(donation => {
          const amount = parseFloat(String(donation.amount));
          const category = donation.category as DonationCategory;
          if (category && amounts.hasOwnProperty(category)) {
            amounts[category] += amount; // Add full amount to the specific category
          }
        });
      }
  
      console.log('Calculated pool amounts:', amounts);
      setPoolAmounts(amounts);
    } catch (error) {
      console.error('Error fetching pool amounts:', error);
      setSnackbarMessage('Error loading donation pools');
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Update the getQuote function to handle the correct amount
const getQuote = async (amount: string): Promise<Quote> => {
    try {
      // Convert the amount from euros to cents to match the API expectation
      const amountInCents = Math.round(parseFloat(amount) * 100);
      console.log('Converting amount:', { 
        originalAmount: amount,
        amountInCents: amountInCents
      });
      
      const response = await fetch(`${API_BASE_URL}/quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ amount: amountInCents.toString(), id: walletId }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Quote request failed: ${response.status} ${response.statusText}. ${errorText}`);
      }
  
      const quote = await response.json();
      console.log('Quote received:', quote);
      return quote;
    } catch (error) {
      console.error('Quote error:', error);
      throw error;
    }
  };

  const initiateOutgoingPayment = async (quote: Quote) => {
    try {
      console.log('Initiating payment with quote:', quote);
      
      const response = await fetch(`${API_BASE_URL}/outgoing-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          quote: {
            id: quote.id,
            debitAmount: quote.debitAmount,
            walletId: quote.walletAddress
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Payment initiation failed: ${response.status} ${response.statusText}. ${errorText}`);
      }

      const paymentResponse = await response.json();
      console.log('Payment initiation response:', paymentResponse);
      return paymentResponse;
    } catch (error) {
      console.error('Payment initiation error:', error);
      throw error;
    }
  };

  const finishPayment = async (walletId: string, quoteId: string) => {
    try {
      console.log('Starting finishPayment with:', { walletId, quoteId });
      
      const response = await fetch(`${API_BASE_URL}/finish-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ walletId, quoteId }),
      });
  
      // Log raw response
      const responseText = await response.text();
      console.log('Finish payment raw response:', responseText);
  
      if (!response.ok) {
        throw new Error(`Payment completion failed: ${response.status} ${response.statusText}`);
      }
  
      let result;
      try {
        // Try to parse as JSON if possible
        result = JSON.parse(responseText);
      } catch (e) {
        // If not JSON, create a simple success object
        result = { 
          message: 'Payment sent successfully',
          success: true
        };
      }
  
      console.log('Payment completion result:', result);
      return result;
    } catch (error) {
      console.error('Error in finishPayment:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  };

  const handleDonation = async () => {
    try {
      setSnackbarMessage('Starting donation process...');
      setSnackbarOpen(true);
      
      // Step 1: Get quote
      const quote = await getQuote(donationAmount);
      
      // Step 2: Initiate outgoing payment
      const paymentResponse = await initiateOutgoingPayment(quote);

      if (!paymentResponse.interact?.redirect) {
        throw new Error('Missing redirect URL in payment response');
      }

      // Store payment state and show approval dialog
      setPaymentState({
        quote,
        redirectUrl: paymentResponse.interact.redirect,
        walletId: quote.walletAddress
      });

      setPaymentDialogOpen(true);
      setSnackbarMessage('Please approve the payment');
      setSnackbarOpen(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Donation error:', error);
      setSnackbarMessage(`Error: ${errorMessage}`);
      setSnackbarOpen(true);
    }
  };

  const handlePaymentCompletion = async () => {
    try {
      if (!paymentState.quote?.id || !paymentState.walletId) {
        console.error('Missing payment info:', {
          quoteId: paymentState.quote?.id,
          walletId: paymentState.walletId
        });
        throw new Error('Missing payment information');
      }
  
      console.log('Starting payment completion with:', {
        walletId: paymentState.walletId,
        quoteId: paymentState.quote.id
      });
  
      const paymentResult = await finishPayment(paymentState.walletId, paymentState.quote.id);
      console.log('Payment result:', paymentResult);
  
      if (paymentResult.success || paymentResult.message?.includes('Payment sent successfully')) {
        // Use the original amount for the database (in euros)
        const donationData = {
            amount: parseFloat(donationAmount),
            is_anonymous: isAnonymous,
            status: 'completed',
            donation_date: new Date().toISOString(),
            guardian_id: user.id,
            target_milestone_id: null,
            target_participant_id: null,
            transaction_id: paymentState.quote.id,
            category: selectedCategory, // Add the selected category
          };
  
        console.log('Attempting Supabase insertion with data:', donationData);
  
        const { data: insertedDonation, error: insertError } = await supabase
          .from('donations')
          .insert([donationData])
          .select()
          .single();
  
        if (insertError) {
          console.error('Supabase insertion error:', {
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint,
            code: insertError.code
          });
          throw new Error(`Database error: ${insertError.message}`);
        }
  
        console.log('Successfully recorded donation:', insertedDonation);
  
        // Success path
        setSnackbarMessage('Donation completed successfully!');
        setSnackbarOpen(true);
        setDonationAmount('');
        setSelectedCategory(null);
        setPaymentDialogOpen(false);
        setPaymentState({ quote: null, redirectUrl: null, walletId: null });
        
        // Refresh pool amounts
        await fetchPoolAmounts();
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment completion error:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      setSnackbarMessage(error instanceof Error ? error.message : 'Error completing donation');
      setSnackbarOpen(true);
    }
  };

  const isValidDonationAmount = (amount: string): boolean => {
    const numericAmount = parseFloat(amount);
    return !isNaN(numericAmount) && numericAmount > 0;
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
  <CssBaseline />
  <Box sx={{ flexGrow: 2 }}>
        <AppBar position="static" color="transparent" elevation={1} sx={{ px: 0 }}>
          <Toolbar sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            
            {/* ✅ Left Side - Menu + Logo + Title */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <MenuDrawer />
              <img src={Logo} alt="BreakFree Logo" style={{ height: 40, marginLeft: 10 }} />
              <Typography variant="h6" sx={{ fontWeight: "bold", ml: 1, color: "black" }}>
                BreakFree
              </Typography>
            </Box>

            {/* ✅ Right Side - Username & Profile Icon (Now Shifted Right) */}
            <Box sx={{ display: "flex", alignItems: "center", ml: "auto" }}> 
              <Typography color="inherit" sx={{ mr: 1 }}>
                {username || "User"}
              </Typography>
              <IconButton component={Link} to="/profile">
                <Avatar sx={{ bgcolor: "#007BFF" }}>
                  {username?.[0]?.toUpperCase() || <AccountCircleIcon />}
                </Avatar>
              </IconButton>
            </Box>
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
                      ${poolAmounts[category]?.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
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
                      startAdornment: '€',
                    }}
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                  fullWidth
                  label="Wallet ID"
                  type="text"
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
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
                    Donate €{donationAmount || '0.00'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Container>

        <Dialog
          open={paymentDialogOpen}
          onClose={() => setPaymentDialogOpen(false)}
        >
          <DialogTitle>Complete Your Payment</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please click the button below to approve your payment in a new window. 
              After approval, return here and click "Complete Payment" to finalize your donation.
            </DialogContentText>
            {paymentState.redirectUrl && (
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => window.open(paymentState.redirectUrl!, '_blank')}
              >
                Approve Payment
              </Button>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
            <Button onClick={handlePaymentCompletion} variant="contained">
              Complete Payment
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
        />
      </Box>
    </ThemeProvider>
  );
  
};

export default GuardianPanel;