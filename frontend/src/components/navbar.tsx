import { useState, useEffect } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Divider,
  Box,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { Link } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient("https://qagsbbilljqjmauhylgo.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhZ3NiYmlsbGpxam1hdWh5bGdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1OTczNzAsImV4cCI6MjA1NTE3MzM3MH0.5R8oQ9Zh_w6R7cDDhAU9xKZlMOk2jU3cCgO72uu91qU");

const menuOptions = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Services", path: "/services" },
  { label: "Contact", path: "/contact" },
];

export default function MenuDrawer() {
  const [open, setOpen] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);

  // Toggle Drawer
  const toggleDrawer = (state: boolean) => () => {
    setOpen(state);
  };

  // Fetch user on mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user);
    };

    fetchUser();
  }, []);

  // Logout function
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    } else {
      setUser(null); // Clear user state
      window.location.reload(); 
    }
  };

  return (
    <>
      <IconButton onClick={toggleDrawer(true)} color="inherit">
        <MenuIcon />
      </IconButton>

      <Drawer anchor="left" open={open} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 250, display: "flex", flexDirection: "column", height: "100vh" }}>
          {/* Drawer Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
            <Typography variant="h6">Menu</Typography>
            <IconButton onClick={toggleDrawer(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />

          {/* Menu Options */}
          <List>
            {menuOptions.map((item, index) => (
              <>
                <ListItemButton
                  key={index}
                  component={Link}
                  to={item.path}
                  onClick={toggleDrawer(false)}
                  sx={{ '&:hover': { backgroundColor: "#f5f5f5" }, cursor: "pointer", p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <ListItemText primary={item.label} />
                  <ArrowForwardIosIcon sx={{ fontSize: 14, color: "gray" }} />
                </ListItemButton>
                <Divider />
              </>
            ))}
          </List>

          {/* Logout Button - Only show if user is logged in */}
          {user && (
            <Box sx={{ mt: "auto", p: 2 }}>
              <ListItemButton
                sx={{ color: "red", '&:hover': { backgroundColor: "#ffebee" }, cursor: "pointer", p: 2 }}
                onClick={handleLogout}
              >
                <ExitToAppIcon sx={{ color: "red", mr: 1 }} />
                <ListItemText primary="Logout" />
              </ListItemButton>
            </Box>
          )}
        </Box>
      </Drawer>
    </>
  );
}
