import React from "react";
import { Snackbar, Alert } from "@mui/material";

const Notification = ({
  open,
  message,
  severity = "success",
  onClose,
  autoHideDuration = 4000,
  anchorOrigin = { vertical: "bottom", horizontal: "right" },
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Notification;
