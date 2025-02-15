import { useState, useEffect } from "react";
import { 
  AppBar, Toolbar, IconButton, Typography, Box, 
  Button, Avatar, ThemeProvider, CssBaseline 
} from "@mui/material";
import { Link } from "react-router-dom";
import MenuDrawer from "../components/navbar";
import { createTheme } from "@mui/material/styles";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { TestimonialCard } from "../components/TestimonialCard";
import { DonationCard } from "../components/DonationCard";
import { type AddictionTab, addictionsTabData } from "../constants/constants";
import Logo from "frontend/public/images/logo.png";
import supabase from '../services/supabaseClient'

const theme = createTheme({
  palette: {
    background: {
      default: "#ffffff",
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
});

interface DonationTotals {
  Smoking: number;
  Alcohol: number;
  Drugs: number;
}

interface WarriorCounts {
  Smoking: number;
  Alcohol: number;
  Drugs: number;
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [donationTotals, setDonationTotals] = useState<DonationTotals>({ 
    Smoking: 0, 
    Alcohol: 0, 
    Drugs: 0 
  });
  const [warriorCounts, setWarriorCounts] = useState<WarriorCounts>({
    Smoking: 0,
    Alcohol: 0,
    Drugs: 0
  });

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

    const fetchDonations = async () => {
      try {
        const { data, error } = await supabase
          .from("donations")
          .select("category, amount")
          .eq('status', 'completed');
    
        if (error) {
          console.error('Supabase fetch error', error);
          throw error;
        }
    
        const newTotals = {
          Smoking: 0,
          Alcohol: 0,
          Drugs: 0
        };
    
        data.forEach(donation => {
          const category = donation.category as keyof typeof newTotals;
          const amount = parseFloat(donation.amount);
          if (category in newTotals) {
            newTotals[category] += amount;
          }
        });
    
        setDonationTotals(newTotals);
      } catch (error) {
        console.error('Error fetching donations:', error);
      }
    };

    const fetchWarriorCounts = async () => {
      try {
        const { data, error } = await supabase
          .from("warriors")
          .select("addict_type")
          
        if (error) {
          console.error('Error fetching warrior counts:', error);
          throw error;
        }

        const counts = {
          Smoking: 0,
          Alcohol: 0,
          Drugs: 0
        };

        data.forEach(warrior => {
          const type = warrior.addict_type.charAt(0).toUpperCase() + warrior.addict_type.slice(1);
          if (type in counts) {
            counts[type as keyof WarriorCounts]++;
          }
        });

        setWarriorCounts(counts);
      } catch (error) {
        console.error('Error fetching warrior counts:', error);
      }
    };

    fetchUser();
    fetchDonations();
    fetchWarriorCounts();
  }, []);

  const renderTabContent = (tab: AddictionTab) => (
    <>
      <DonationCard
        value={
          <Typography sx={{ fontSize: "2rem", color: "#007BFF", fontWeight: "bold" }}>
            {`$${(donationTotals[tab.category as keyof DonationTotals] || 0).toFixed(2)}`}
          </Typography>
        }
        label="Total Donation Pool"
      />
      <DonationCard
        value={
          <Typography sx={{ fontSize: "2rem", color: "#007BFF", fontWeight: "bold" }}>
            {warriorCounts[tab.category as keyof WarriorCounts]}
          </Typography>
        }
        label="Warriors on our Program"
      />
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
          {tab.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {tab.subtitle}
        </Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
          Programs to help {tab.category.toLowerCase()} addicts:
        </Typography>
        <ul style={{ paddingLeft: "20px", margin: 0 }}>
          <li>Counselling Sessions</li>
          <li>Sharing Sessions</li>
          <li>Redeem gifts to guide you on your journey</li>
        </ul>
      </Box>
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
          Testimonials from our Warriors:
        </Typography>
        {tab.imageSrc.map((src, index) => (
          <TestimonialCard key={index} imageSrc={src} />
        ))}
      </Box>
    </>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <AppBar position="static" color="transparent" elevation={1} sx={{ px: 2 }}>
        <Toolbar sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <MenuDrawer />
            <img src={Logo} alt="BreakFree Logo" style={{ height: 40, marginLeft: 10 }} />
            <Typography variant="h6" sx={{ fontWeight: "bold", ml: 1, color: "black" }}>
              BreakFree
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            {!user ? (
              <>
                <Button color="inherit" size="small" component={Link} to="/login" sx={{ mr: 1 }}>
                  Login
                </Button>
                <Button color="inherit" size="small" component={Link} to="/register">
                  Register
                </Button>
              </>
            ) : (
              <>
                <Typography color="inherit" sx={{ mr: 2 }}>
                  {username || "User"}
                </Typography>
                <IconButton component={Link} to="/profile">
                  <Avatar sx={{ bgcolor: "#007BFF" }}>
                    {username?.[0]?.toUpperCase() || <AccountCircleIcon />}
                  </Avatar>
                </IconButton>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ px: 3, py: 0, backgroundColor: "#fff" }}>
        <Box sx={{ display: "flex", borderBottom: 1, borderColor: "divider", mb: 1 }}>
          {addictionsTabData.map((tab, index) => (
            <Box
              key={index}
              onClick={() => setActiveTab(index)}
              sx={{
                px: 2,
                py: 1,
                cursor: "pointer",
                borderBottom: activeTab === index ? 2 : 0,
                borderColor: activeTab === index ? "black" : "transparent",
                fontWeight: activeTab === index ? "bold" : "normal",
              }}
            >
              {tab.category}
            </Box>
          ))}
          <Box sx={{ px: 2, py: 1 }}>{">"}</Box>
        </Box>
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          minHeight: "100vh",
          bgcolor: "background.default",
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url(${addictionsTabData[activeTab].backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "scroll",
          color: "#fff",
          px: 3,
          py: 2,
        }}
      >
        {renderTabContent(addictionsTabData[activeTab])}
      </Box>
    </ThemeProvider>
  );
}