// components/Welcome.js
import React from "react";
import { IconButton, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const Welcome = ({ setSidebarOpen, sidebarOpen }) => {
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="d-flex flex-column justify-content-center align-items-center flex-grow-1 bg-light position-relative">
      {/* Hamburger in top-left */}
      <IconButton
        className="d-md-none"
        onClick={toggleSidebar}
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
        }}
      >
        <MenuIcon />
      </IconButton>

      <Typography variant="h5" gutterBottom>
        Welcome to ChatApp!
      </Typography>
      <Typography variant="body1" color="textSecondary">
        Wanna chat? Pick a victim 😄
      </Typography>
    </div>
  );
};

export default Welcome;
