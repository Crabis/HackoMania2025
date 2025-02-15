"use client";

import { useState } from "react";
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

const menuOptions = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Services", path: "/services" },
  { label: "Contact", path: "/contact" },
];

export default function MenuDrawer() {
  const [open, setOpen] = useState<boolean>(false);

  const toggleDrawer = (state: boolean) => () => {
    setOpen(state);
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
          
          {/* Logout Button */}
          <Box sx={{ mt: "auto", p: 2 }}>
            <ListItemButton
              sx={{ color: "red", '&:hover': { backgroundColor: "#ffebee" }, cursor: "pointer", p: 2 }}
            >
              <ExitToAppIcon sx={{ color: "red", mr: 1 }} />
              <ListItemText primary="Logout" />
            </ListItemButton>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}

