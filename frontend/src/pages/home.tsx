import { useState, useEffect } from "react";
import { 
  AppBar, Toolbar, IconButton, Typography, Box, 
  Button, Avatar, ThemeProvider, CssBaseline,
  Card, CardContent, Divider, CardActionArea 
} from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Link } from "react-router-dom";
import MenuDrawer from "../components/navbar";
import { createTheme } from "@mui/material/styles";
import { createClient } from "@supabase/supabase-js";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { TestimonialCard } from "../components/TestimonialCard";
import { DonationCard } from "../components/DonationCard";
import { type AddictionTab, addictionsTabData } from "../constants/constants";
import Logo from "frontend/public/images/logo.png"; // Ensure correct import
import supabase from '../services/supabaseClient'
import DonationsFeed from "../components/DonationsFeed";


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
export default function HomePage() {
  const [activeTab, setActiveTab] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [donationTotals, setDonationTotals] = useState<DonationTotals>({ 
    Smoking: 0, 
    Alcohol: 0, 
    Drugs: 0 
  });
  const programLinks = [
    { title: "Counselling Sessions", url: "/sessions-warrior" },
    { title: "Redeem Gifts", url: "/rewards" }
  ];

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

  // ✅ Function to Fetch & Track Real-Time Donations
  const fetchDonations = async (category: string) => {
    try {
      const { data, error } = await supabase
        .from("donations")
        .select("category, amount")
        .eq("status", "completed")
        .eq("category", category);

      if (error) {
        console.error("Supabase fetch error", error);
        throw error;
      }

      console.log("Raw Donations Data", data);

      const newTotals: DonationTotals = {
        Smoking: 0,
        Alcohol: 0,
        Drugs: 0,
      };

      data.forEach((donation) => {
        const cat = donation.category as keyof DonationTotals;
        const amount = parseFloat(donation.amount);
        if (cat in newTotals) {
          newTotals[cat] += amount;
        }
      });

      setDonationTotals(newTotals);
    } catch (error) {
      console.error("Error fetching donations:", error);
    }
  };

  // ✅ `useEffect` to Track Donations Based on Active Tab
  useEffect(() => {
    fetchUser(); // Fetch user on mount
  }, []);

  useEffect(() => {
    const category = addictionsTabData[activeTab].category;
    fetchDonations(category); // Fetch donations when category changes

    // ✅ Real-time listener for new donations
    const donationSubscription = supabase
      .channel("donations")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "donations" },
        async (payload) => {
          console.log("New donation detected:", payload.new);

          const newDonation = payload.new;

          if (newDonation.status !== "completed") return; // ✅ Ignore incomplete donations

          setDonationTotals((prevTotals) => {
            const updatedTotals = { ...prevTotals };
            const cat = newDonation.category as keyof DonationTotals;
            const amount = parseFloat(newDonation.amount);

            if (cat in updatedTotals) {
              updatedTotals[cat] += amount;
            }

            return updatedTotals;
          });
        }
      )
      .subscribe();

    return () => {
      donationSubscription.unsubscribe();
    };
  }, [activeTab]);


  const renderTabContent = (tab: AddictionTab) => (
    <>
        <Box sx={{ mt: 3, alignItems: "center" }}>
        <DonationsFeed category={tab.category} />
        </Box>  
      {/* ✅ Always Side-by-Side Layout */}
      <Box sx={{ display: "flex", justifyContent: "center", width: "100%", mt: 2 }}>
        <Card
            sx={{
            width: "100%", // ✅ Ensures it takes full width
            maxWidth: "400px", // ✅ Controls width
            padding: "12px",
            maxHeight: "130px",
            display: "flex",
            flexDirection: "row", // ✅ Always side-by-side
            flexWrap: "nowrap",
            alignItems: "center", // ✅ Ensures both sections match height
            textAlign: "center",
            borderRadius: 1,
            border: "1px solid rgba(155, 155, 155, 0.8)",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)"
            }}
        >
            {/* ✅ Donation Pool Section */}
            <CardContent
            sx={{
                flex: 1,
                padding: "8px",
                minWidth: "50%",
                display: "flex", // ✅ Enables flexbox inside content
                flexDirection: "column",
                alignItems: "center", // ✅ Centers items vertically
                justifyContent: "center", // ✅ Ensures full vertical alignment
                height: "100%", // ✅ Forces equal height
            }}
            >
            <Typography sx={{ fontSize: "2.5rem", color: "#539BFF", fontFamily: "'Poppins', sans-serif" }}>
                {`$${(donationTotals[tab.category as keyof DonationTotals] || 0).toFixed(2)}`}
            </Typography>
            <Typography sx={{ fontSize: "0.8rem", letterSpacing: "1px", color: "#000", fontFamily: "'Poppins', sans-serif" }}>
                Total Donation Pool
            </Typography>
            </CardContent>

            {/* ✅ Vertical Grey Divider */}
            <Divider orientation="vertical" flexItem sx={{ backgroundColor: "rgba(155, 155, 155, 0.5)", height: "100%" }} />

            {/* ✅ Warriors Count Section */}
            <CardContent
            sx={{
                flex: 1,
                padding: "23px",
                minWidth: "50%",
                display: "flex", // ✅ Enables flexbox inside content
                flexDirection: "column",
                alignItems: "center", // ✅ Centers items vertically
                justifyContent: "center", // ✅ Ensures full vertical alignment
                height: "100%", // ✅ Forces equal height
            }}
            >
            <Typography sx={{ fontSize: "2.5rem", color: "#539BFF", fontFamily: "'Poppins', sans-serif" }}>
                {tab.number}
            </Typography>
            <Typography sx={{ fontSize: "0.8rem", letterSpacing: "1px", color: "#000", fontFamily: "'Poppins', sans-serif" }}>
                Warriors
            </Typography>
            </CardContent>
        </Card>
        </Box>
        
  
      {/* ✅ Program Title & Subtitle */}
        <Typography variant="h6" sx={{ fontWeight: "bold", ml: 1, mt: 2, mb: 0.5, color: "#000", fontFamily: "'Poppins', sans-serif" }}>
                {tab.title}
        </Typography>
        <Box
            sx={{
                mt: 0,
                padding: "16px", // ✅ Adds spacing around text
                backgroundColor: "rgb(255, 255, 255)", // ✅ Light grey background
                borderRadius: "8px", // ✅ Rounded corners
                boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)", // ✅ Subtle shadow
                border: "1px solid rgba(155, 155, 155, 0.8)",
            }}
            >
            <Typography variant="body1" color="#000" sx={{ mt: 0, fontSize: "0.8rem", fontFamily: "'Poppins', sans-serif" }}>
                {tab.subtitle}
            </Typography>
            </Box>

            {/* ✅ Programs List */}
            <Typography variant="h6" sx={{ fontWeight: "bold", mt: 1, mb: 0.5, ml: 1, color: "#000000", fontFamily: "'Poppins', sans-serif" }}>
                Programs to help {tab.category.toLowerCase()} addicts:
            </Typography>
            <Box
            // sx={{
            //     mt: 0,
            //     padding: "16px",
            //     backgroundColor: "rgba(70, 70, 70, 0)", // ✅ Clean white background
            //     borderRadius: "8px",
            //     border: "1px solid rgba(0, 0, 0, 0.1)", // ✅ Light border for structure
            //     boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.05)" // ✅ Light shadow for depth
            // }}
            >
            
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 2, mt: 1 }}>
            {programLinks.map((program, index) => (
                <Card 
                key={index} 
                sx={{ 
                    borderRadius: 2, 
                    boxShadow: "0px 4px 10px rgba(0,0,0,0.1)", 
                    backgroundColor: "#f5f5f5", // ✅ Change background color
                    border: "1px solid rgba(155, 155, 155, 0.8)",
                    "&:hover": { backgroundColor: "#e0e0e0" } // ✅ Hover effect
                }}
                >
                <CardActionArea component={Link} to={program.url} sx={{ padding: "2px" }}>
                    <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    {/* ✅ Left-Aligned Text */}
                    <Typography sx={{ fontSize: "0.9rem", fontFamily: "'Poppins', sans-serif" }}>
                        {program.title}
                    </Typography>
                        {/* ✅ Arrow Icon on the Right */}
                    <ChevronRightIcon sx={{ color: "#555" }} />
                    </CardContent>
                    </CardActionArea>
                    </Card>
                    ))}
                    </Box>
                </Box>

      {/* ✅ Testimonials Section */}
      <Box sx={{ mt: 1 }}>
      <Typography variant="h6" sx={{ fontWeight: "bold", mt: 1, mb: 0.5, ml: 1, color: "#000000", fontFamily: "'Poppins', sans-serif" }}>
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

      {/* ✅ Updated Navigation Bar */}
      <AppBar position="static" color="transparent" elevation={1} sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.2)"}}>
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
                <Typography color="inherit" sx={{ mr: 1 }}>
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

      {/* ✅ Addictions Tab Navigation */}
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
          {/* <Box sx={{ px: 2, py: 1 }}>{">"}</Box> */}
        </Box>
      </Box>

      {/* ✅ Background Image + Tab Content */}
      <Box
        sx={{
          flexGrow: 1,
          minHeight: "100vh",
          bgcolor: "background.default",
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.15)), url(${addictionsTabData[activeTab].backgroundImage})`,
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

