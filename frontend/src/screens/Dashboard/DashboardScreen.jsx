import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import Sidebar from "../../components/Basic/Sidebar";
import { Outlet } from "react-router-dom";

const DashboardScreen = () => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main
        style={{
          marginLeft: 240,
          marginTop: 64,
          width: "calc(100vw - 240px)",
          height: "calc(100vh - 64px)",
          overflowY: "auto",
          overflowX: "hidden",
          padding: "16px",
          backgroundColor: "#f9fafb",
          boxSizing: "border-box",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardScreen;