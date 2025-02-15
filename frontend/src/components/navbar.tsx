import { useState, useEffect } from "react";
import {
  Drawer,
  List,
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

export default function MenuDrawer() {
  const [open, setOpen] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Toggle Drawer
  const toggleDrawer = (state: boolean) => () => {
    setOpen(state);
  };

  // Fetch user and their role on mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error.message);
        return;
      }

      if (data?.user) {
        setUser(data.user);
        console.log("User fetched:", data.user);

        const { data: userMetadata, error: roleError } = await supabase
          .from("users") // Ensure 'users' table exists with 'role' field
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (roleError) {
          console.error("Error fetching role:", roleError.message);
          setUserRole("Warrior"); // Default role if there's an error
        } else {
          setUserRole(userMetadata?.role || "Warrior");
          console.log("User Role:", userMetadata?.role);
        }
      }
    };

    fetchUser();
  }, []);

  // Logout function
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    } else {
      setUser(null);
      setUserRole(null);
      window.location.reload();
    }
  };

  // Default menu options (visible to all)
  const commonMenuOptions = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" },
  ];

  // Role-specific menus (customize as needed)
  const mentorMenu = [
    { label: "Mentor Dashboard", path: "/mentor-home" },
    { label: "View Sessions", path: "/sessions-mentor" },
  ];

  const guardianMenu = [
    { label: "Guardian Panel", path: "/guardian-panel" },
    { label: "Student Reports", path: "/student-reports" },
  ];

  const warriorMenu = [
    { label: "Warrior Home", path: "/warrior-home" },
    { label: "Register a Buddy", path: "/register-a-buddy"},
    { label: "Volunteer to be a Sponsor", path: "/volunteer-as-sponsor"},
    // { label: "My Progress", path: "/my-progress" },
  ];

  const buddyMenu = [
    { label: "Register a Warrior Buddy", path: "/register-warrior-buddy "},
    { label: "Your Warrior's Home", path: "/attached-warrior-home"}
  ];

  // Select menu based on user role (case-insensitive check)
  let roleSpecificMenu = [];
  if (userRole?.toLowerCase() === "mentor") roleSpecificMenu = mentorMenu;
  else if (userRole?.toLowerCase() === "guardian") roleSpecificMenu = guardianMenu;
  else if (userRole?.toLowerCase() === "buddy") roleSpecificMenu = buddyMenu;
  else roleSpecificMenu = warriorMenu; // Default to Warrior

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

          <Box sx={{ flexGrow: 1 }}>
            {/* Common Menu Options */}
            <List sx={{ p: 0 }}> {/* Removes extra padding */}
                {commonMenuOptions.map((item, index) => (
                <ListItemButton
                    key={index}
                    component={Link}
                    to={item.path}
                    onClick={toggleDrawer(false)}
                    sx={{
                    '&:hover': { backgroundColor: "#f5f5f5" },
                    cursor: "pointer",
                    p: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    }}
                >
                    <ListItemText primary={item.label} />
                    <ArrowForwardIosIcon sx={{ fontSize: 14, color: "gray" }} />
                </ListItemButton>
                ))}
            </List>

            {/* Role-Specific Menu (Directly Below Common Menu) */}
            {userRole && (
                <List sx={{ p: 0 }}> {/* Removes extra padding to eliminate gaps */}
                {roleSpecificMenu.map((item, index) => (
                    <ListItemButton
                    key={index}
                    component={Link}
                    to={item.path}
                    onClick={toggleDrawer(false)}
                    sx={{
                        '&:hover': { backgroundColor: "#f5f5f5" },
                        cursor: "pointer",
                        p: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                    >
                    <ListItemText primary={item.label} />
                    <ArrowForwardIosIcon sx={{ fontSize: 14, color: "gray" }} />
                    </ListItemButton>
                ))}
                </List>
            )}
            </Box>

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
