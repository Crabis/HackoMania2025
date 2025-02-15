import { useState, useEffect } from "react"
import { AppBar, Toolbar, IconButton, Typography, Box, ThemeProvider, CssBaseline, Button } from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import AccountCircleIcon from "@mui/icons-material/AccountCircle"
import { createTheme } from "@mui/material/styles"
import { Link, useNavigate } from 'react-router-dom';
import { TestimonialCard } from "../components/TestimonialCard"
import { DonationCard } from "../components/DonationCard"
import { type AddictionTab, addictionsTabData } from "../constants/constants"
import MenuDrawer from "../components/navbar"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabase = createClient('https://qagsbbilljqjmauhylgo.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhZ3NiYmlsbGpxam1hdWh5bGdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1OTczNzAsImV4cCI6MjA1NTE3MzM3MH0.5R8oQ9Zh_w6R7cDDhAU9xKZlMOk2jU3cCgO72uu91qU');

const theme = createTheme({
  palette: {
    background: {
      default: "#ffffff",
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
})

export default function HomePage() {
  const [activeTab, setActiveTab] = useState(0)
  const [user, setUser] = useState<any>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data?.user)
    }
    
    fetchUser()
  }, [])

  const renderTabContent = (tab: AddictionTab) => (
    <>
      <DonationCard
        value={<Typography sx={{ fontSize: "2rem", color: "#007BFF", fontWeight: "bold" }}>{`$${tab.donation_amount.toFixed(2)}`}</Typography>}
        label="Total Donation Pool"
      />

      <DonationCard
        value={<Typography sx={{ fontSize: "2rem", color: "#007BFF", fontWeight: "bold" }}>{tab.number}</Typography>}
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
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ mb: 1 }}>
          <IconButton edge="start" color="inherit" aria-label="menu">
            <MenuDrawer />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: "left" }}>
            Recovery Warriors
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {!user ? (
              <>
                <Button
                  color="inherit"
                  size="small"
                  sx={{ mr: 1 }}
                  component={Link}
                  to="/login"
                >
                  Login
                </Button>
                <Button
                  color="inherit"
                  size="small"
                  sx={{ mr: 0 }}
                  component={Link}
                  to="/register"
                >
                  Register
                </Button>
              </>
            ) : (
              <Typography color="inherit" sx={{ mr: 2 }}>
                {user.username}
              </Typography>
            )}
            {user && (
              <IconButton color="inherit" component={Link} to="/profile">
                <AccountCircleIcon />
              </IconButton>
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
  )
}
