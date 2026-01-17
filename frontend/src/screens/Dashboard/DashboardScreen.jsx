import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import Sidebar from "../../components/Basic/Sidebar";
import { Outlet } from "react-router-dom";

const DashboardScreen = () => {
  return (
    <>
      <Box
        sx={{
          display: "flex",
          width: "100%",
          height: "calc(100vh - 64px)" // header height
        }}
      >
        <Sidebar />
        <Outlet />
      </Box>
    </>
  );
};

export default DashboardScreen;