import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Toolbar,
  AppBar
} from '@mui/material';
import MenuDrawer from "../components/navbar"
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SecurityIcon from '@mui/icons-material/Security';
import GroupIcon from '@mui/icons-material/Group';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SupportIcon from '@mui/icons-material/Support';
import Logo from "frontend/public/images/logo.png";

const AboutPage = () => {
  const features = [
    {
      title: "Recovery Journey",
      description: "Track your progress, earn rewards for milestones, and maintain daily streaks. Set personalized goals and celebrate your achievements with community support.",
      icon: <CheckCircleOutlineIcon color="primary" />
    },
    {
      title: "Privacy & Security",
      description: "Your privacy is our priority. Choose between verified or anonymous participation, with all personal data encrypted and protected.",
      icon: <SecurityIcon color="primary" />
    },
    {
      title: "Support Network",
      description: "Connect with peer mentors, join support groups, and access professional counselors. Build your support network while maintaining privacy.",
      icon: <GroupIcon color="primary" />
    }
  ];

  const roles = [
    {
      title: "Warriors",
      description: "As a Warrior in recovery, you'll have access to:",
      points: [
        "Daily check-in system with streak tracking",
        "Milestone-based rewards and achievements",
        "Anonymous community support groups",
        "Emergency support access",
        "Personal progress dashboard"
      ]
    },
    {
      title: "Guardians",
      description: "As a Guardian (donor), you can:",
      points: [
        "Contribute to recovery milestone rewards",
        "Track the impact of your support",
        "Sponsor community programs",
        "Participate in community events",
        "View anonymized success stories"
      ]
    },
    {
      title: "Mentors",
      description: "As a Mentor, you'll be able to:",
      points: [
        "Guide Warriors through their recovery journey",
        "Verify milestone achievements",
        "Facilitate support groups",
        "Contribute to resource library",
        "Participate in emergency support"
      ]
    }
  ];

  return (
    <>
      <AppBar position="static" color="transparent" elevation={1} sx={{ px: 0 }}>
        <Toolbar sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <MenuDrawer />
            <img src={Logo} alt="BreakFree Logo" style={{ height: 40, marginLeft: 10 }} />
            <Typography variant="h6" sx={{ fontWeight: "bold", ml: 1, color: "black" }}>
              BreakFree
            </Typography>
          </Box>
          </Toolbar>
        </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        {/* Hero Section */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Welcome to Recovery Support Network
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            A community-driven platform supporting long-term recovery through incentives, 
            peer support, and milestone achievements
          </Typography>
        </Box>

        {/* Key Features */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {feature.icon}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {feature.title}
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* How It Works Section */}
        <Paper elevation={3} sx={{ p: 4, mb: 6 }}>
          <Typography variant="h4" gutterBottom>
            How It Works
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EmojiEventsIcon sx={{ mr: 1 }} color="primary" />
                  Achievement System
                </Typography>
                <Typography variant="body1">
                  Track your recovery journey through daily check-ins, milestone achievements, 
                  and community engagement. Earn badges and rewards as you progress.
                </Typography>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccountBalanceWalletIcon sx={{ mr: 1 }} color="primary" />
                  Reward Structure
                </Typography>
                <Typography variant="body1">
                  Receive milestone-based rewards funded by Guardian donations. Rewards are 
                  distributed automatically upon verified achievement completion.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SupportIcon sx={{ mr: 1 }} color="primary" />
                  Support Network
                </Typography>
                <Typography variant="body1">
                  Access a comprehensive support network including peer mentors, professional 
                  counselors, and community support groups. Emergency support is available 24/7.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Role Descriptions */}
        <Typography variant="h4" gutterBottom>
          Platform Roles
        </Typography>
        <Grid container spacing={4}>
          {roles.map((role, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    {role.title}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {role.description}
                  </Typography>
                  <List dense>
                    {role.points.map((point, pointIndex) => (
                      <ListItem key={pointIndex}>
                        <ListItemIcon>
                          <CheckCircleOutlineIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={point} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
};

export default AboutPage;