"use client"

import { useState } from "react"
import { AppBar, Toolbar, IconButton, Typography, Box, ThemeProvider, CssBaseline } from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import AccountCircleIcon from "@mui/icons-material/AccountCircle"
import { createTheme } from "@mui/material/styles"
import { TestimonialCard } from "../components/TestimonialCard"
import { DonationCard } from "../components/DonationCard"
import { type AddictionTab, addictionsTabData } from "../constants/constants"

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

export default function Page() {
  const [activeTab, setActiveTab] = useState(0)

  const renderTabContent = (tab: AddictionTab) => (
    <>
      <DonationCard value={`$${tab.donation_amount.toFixed(2)}`} label="Total Donation Pool" />

      <DonationCard value={tab.number} label="Warriors on our Program" />

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
      <Box sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: "background.default" }}>

        {/* App Bar */}
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar>
            <IconButton edge="start" color="inherit" aria-label="menu">
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: "center" }}>
              Recovering Warriors
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

          {/* Recent Donation Alert */}
          <Typography variant="body1" align="center" sx={{ mb: 2 }}>
            XXX has just donated $XXXX!
          </Typography>

          {/* Tab Content */}
          {renderTabContent(addictionsTabData[activeTab])}
        </Box>
      </Box>
    </ThemeProvider>
  )
}

