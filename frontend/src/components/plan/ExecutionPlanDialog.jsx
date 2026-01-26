import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  useCreateExecutionMutation,
  useUpdateExecutionMutation,
} from "../../slices/execution/executionApiSlice";
import { useSelector } from "react-redux";

export default function ExecutionDialog({
  open,
  onClose,
  type, // "DAY", "WEEK", or "MONTH"
  executionDay, // The date for the execution
  existingExecution = null, // If editing
}) {
  const { userInfo } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    IncomeActual: "",
    biddingActual: {
      totalBidAmount: "",
      offeredJobAmount: "",
      offeredTotalBudget: "",
    },
    realguyActual: {
      acquiredPeopleAmount: "",
      callNumber: "",
      postsNumber: "",
    },
    qualificationActual: {
      majorHours: "",
      englishHours: "",
    },
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // RTK Query mutations
  const [createExecution, { isLoading: isCreating }] = useCreateExecutionMutation();
  const [updateExecution, { isLoading: isUpdating }] = useUpdateExecutionMutation();

  // Populate form if editing
  useEffect(() => {
    if (existingExecution) {
      setFormData({
        IncomeActual: existingExecution.IncomeActual || "",
        biddingActual: {
          totalBidAmount: existingExecution.biddingActual?.totalBidAmount || "",
          offeredJobAmount: existingExecution.biddingActual?.offeredJobAmount || "",
          offeredTotalBudget: existingExecution.biddingActual?.offeredTotalBudget || "",
        },
        realguyActual: {
          acquiredPeopleAmount: existingExecution.realguyActual?.acquiredPeopleAmount || "",
          callNumber: existingExecution.realguyActual?.callNumber || "",
          postsNumber: existingExecution.realguyActual?.postsNumber || "",
        },
        qualificationActual: {
          majorHours: existingExecution.qualificationActual?.majorHours || "",
          englishHours: existingExecution.qualificationActual?.englishHours || "",
        },
      });
    }
  }, [existingExecution]);

  const handleChange = (field, value, nested = null) => {
    if (nested) {
      setFormData((prev) => ({
        ...prev,
        [nested]: {
          ...prev[nested],
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        type,
        date: executionDay,
        createdBy: userInfo._id,
      };

      if (existingExecution) {
        // Update existing execution
        await updateExecution({
          id: existingExecution.id,
          ...payload,
        }).unwrap();

        setSnackbar({
          open: true,
          message: "Execution updated successfully!",
          severity: "success",
        });
      } else {
        // Create new execution
        await createExecution(payload).unwrap();

        setSnackbar({
          open: true,
          message: "Execution created successfully!",
          severity: "success",
        });
      }

      // Close dialog after short delay
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1000);
    } catch (error) {
      console.error("Failed to save execution:", error);
      setSnackbar({
        open: true,
        message: `Failed to save: ${error.data?.message || error.message}`,
        severity: "error",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      IncomeActual: "",
      biddingActual: {
        totalBidAmount: "",
        offeredJobAmount: "",
        offeredTotalBudget: "",
      },
      realguyActual: {
        acquiredPeopleAmount: "",
        callNumber: "",
        postsNumber: "",
      },
      qualificationActual: {
        majorHours: "",
        englishHours: "",
      },
    });
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const isLoading = isCreating || isUpdating;

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {existingExecution ? "Edit" : "Create"} Execution - {executionDay}
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Income Section */}
            <Typography variant="h6" gutterBottom>
              Income
            </Typography>
            <TextField
              fullWidth
              label="Actual Income"
              type="number"
              value={formData.IncomeActual}
              onChange={(e) => handleChange("IncomeActual", e.target.value)}
              sx={{ mb: 3 }}
            />

            {/* Bidding Section */}
            <Typography variant="h6" gutterBottom>
              Bidding Actual
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Total Bids"
                  type="number"
                  value={formData.biddingActual.totalBidAmount}
                  onChange={(e) =>
                    handleChange("totalBidAmount", e.target.value, "biddingActual")
                  }
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Jobs Offered"
                  type="number"
                  value={formData.biddingActual.offeredJobAmount}
                  onChange={(e) =>
                    handleChange("offeredJobAmount", e.target.value, "biddingActual")
                  }
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Total Budget"
                  type="number"
                  value={formData.biddingActual.offeredTotalBudget}
                  onChange={(e) =>
                    handleChange("offeredTotalBudget", e.target.value, "biddingActual")
                  }
                />
              </Grid>
            </Grid>

            {/* Realguy Section */}
            <Typography variant="h6" gutterBottom>
              Realguy Actual
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="People Acquired"
                  type="number"
                  value={formData.realguyActual.acquiredPeopleAmount}
                  onChange={(e) =>
                    handleChange("acquiredPeopleAmount", e.target.value, "realguyActual")
                  }
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Calls Made"
                  type="number"
                  value={formData.realguyActual.callNumber}
                  onChange={(e) =>
                    handleChange("callNumber", e.target.value, "realguyActual")
                  }
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Posts Made"
                  type="number"
                  value={formData.realguyActual.postsNumber}
                  onChange={(e) =>
                    handleChange("postsNumber", e.target.value, "realguyActual")
                  }
                />
              </Grid>
            </Grid>

            {/* Qualification Section */}
            <Typography variant="h6" gutterBottom>
              Qualification Actual
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Major Hours"
                  type="number"
                  value={formData.qualificationActual.majorHours}
                  onChange={(e) =>
                    handleChange("majorHours", e.target.value, "qualificationActual")
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="English Hours"
                  type="number"
                  value={formData.qualificationActual.englishHours}
                  onChange={(e) =>
                    handleChange("englishHours", e.target.value, "qualificationActual")
                  }
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading && <CircularProgress size={20} />}
          >
            {isLoading ? "Saving..." : existingExecution ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}