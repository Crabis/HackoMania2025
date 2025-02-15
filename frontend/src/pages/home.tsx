"use client"

import { useState } from "react"
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  ThemeProvider,
  CssBaseline,
  Card,
  CardContent,
} from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import AccountCircleIcon from "@mui/icons-material/AccountCircle"
import { createTheme } from "@mui/material/styles"

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

const tabData = [
  { category: "Smoking", amount: "$1,048.64", count: 205 },
  { category: "Alcohol", amount: "$2,356.12", count: 312 },
  { category: "Drugs", amount: "$3,789.50", count: 178 },
]

export default function Page() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: "background.default" }}>
        {/* Status Bar */}
        <Box sx={{ display: "flex", justifyContent: "space-between", px: 2, py: 1, bgcolor: "white" }}>
          <Typography variant="body2">9:41</Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            {[...Array(3)].map((_, i) => (
              <Box key={i} sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: "black" }} />
            ))}
          </Box>
        </Box>

        {/* App Bar */}
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar>
            <IconButton edge="start" color="inherit" aria-label="menu">
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: "center" }}>
              Title
            </Typography>
            <IconButton color="inherit">
              <AccountCircleIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Box sx={{ px: 2, py: 3 }}>
          {/* Tabs */}
          <Box sx={{ display: "flex", borderBottom: 1, borderColor: "divider", mb: 2 }}>
            {tabData.map((tab, index) => (
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

          {/* Recent Donation Alert */}
          <Typography variant="body1" align="center" sx={{ mb: 2 }}>
            XXX has just donated $XXXX!
          </Typography>

          {/* Donation Stats */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h4" component="div" align="center" sx={{ fontWeight: "bold", mb: 1 }}>
                {tabData[activeTab].amount}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Total Donation Pool
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h4" component="div" align="center" sx={{ fontWeight: "bold", mb: 1 }}>
                {tabData[activeTab].count}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Warriors on our Program
              </Typography>
            </CardContent>
          </Card>

          {/* Programs Section */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
              Programs to help addicts:
            </Typography>
            <ul style={{ paddingLeft: "20px", margin: 0 }}>
              <li>Counselling Sessions</li>
              <li>Sharing Sessions</li>
              <li>Redeem gifts to guide you on your journey</li>
            </ul>
          </Box>

          {/* Testimonials */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
              Testimonials from our Warriors:
            </Typography>
            <Box sx={{ position: "relative", paddingTop: "56.25%", borderRadius: 2, overflow: "hidden" }}>
              <Box
                component="img"
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%7B3A7A57D7-3709-428A-A232-15F783970920%7D-Jd8MAhDpANR4lUeVTJQxMf9xfnVuc6.png"
                alt="Testimonial video thumbnail"
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  p: 2,
                  background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)",
                }}
              >
                <Typography variant="body2" color="white">
                  Damn this shit fire
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  )
}

