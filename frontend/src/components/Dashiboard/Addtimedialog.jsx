import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  Box,
  Stack,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { useGetUsersQuery } from "../../slices/member/usersApiSlice";
import { useAddTimeToMemberMutation } from "../../slices/workingtime/worklogApiSlice";

function AddTimeDialog({ open, onClose, selectedMemberId = null }) {
  // Form state
  const [selectedMember, setSelectedMember] = React.useState(null);
  const [hours, setHours] = React.useState("");
  const [minutes, setMinutes] = React.useState("");
  const [date, setDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = React.useState("");
  const [isAllDayWork, setIsAllDayWork] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [submitStatus, setSubmitStatus] = React.useState(null); // 'success' | 'error' | null

  // API hooks
  const { data: users = [], isLoading: usersLoading } = useGetUsersQuery();
  const [addTimeToMember, { isLoading: submitting }] = useAddTimeToMemberMutation();

  // Filter out admin users
  const memberOptions = React.useMemo(() => {
    return (users || [])
      .filter((u) => u.role !== "admin")
      .map((u) => ({
        id: u._id,
        label: u.name || u.fullName || "Unknown",
        ...u,
      }));
  }, [users]);

  // Set pre-selected member if provided
  React.useEffect(() => {
    if (selectedMemberId && !selectedMember && memberOptions.length > 0) {
      const member = memberOptions.find((m) => m.id === selectedMemberId);
      if (member) {
        setSelectedMember(member);
      }
    }
  }, [selectedMemberId, memberOptions, selectedMember]);

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setHours("");
      setMinutes("");
      setDate(new Date().toISOString().split("T")[0]);
      setDescription("");
      setIsAllDayWork(false);
      setErrors({});
      setSubmitStatus(null);
    }
  }, [open]);

  const validateForm = () => {
    const newErrors = {};

    if (!selectedMember?.id) {
      newErrors.member = "Please select a member";
    }

    const hoursNum = parseInt(hours) || 0;
    const minutesNum = parseInt(minutes) || 0;
    const totalSeconds = hoursNum * 3600 + minutesNum * 60;

    if (totalSeconds === 0 && !isAllDayWork) {
      newErrors.time = "Please enter valid hours or minutes";
    }

    if (hoursNum > 24) {
      newErrors.hours = "Hours cannot exceed 24";
    }

    if (minutesNum >= 60) {
      newErrors.minutes = "Minutes must be less than 60";
    }

    if (!date) {
      newErrors.date = "Please select a date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const hoursNum = parseInt(hours) || 0;
      const minutesNum = parseInt(minutes) || 0;
      const totalSeconds = hoursNum * 3600 + minutesNum * 60;

      const payload = {
        memberId: selectedMember.id,
        date: date,
        hours: hoursNum,
        minutes: minutesNum,
        totalSeconds: isAllDayWork ? 28800 : totalSeconds, // 8 hours for all-day work
        description: description.trim(),
        isAllDayWork: isAllDayWork,
      };

      console.log(payload);
      await addTimeToMember(payload).unwrap();

      setSubmitStatus("success");
      setTimeout(() => {
        onClose();
        setSubmitStatus(null);
      }, 1500);
    } catch (err) {
      setSubmitStatus("error");
      setErrors({ submit: err?.data?.message || "Failed to add time" });
    }
  };

  const hoursNum = parseInt(hours) || 0;
  const minutesNum = parseInt(minutes) || 0;
  const totalSeconds = hoursNum * 3600 + minutesNum * 60;
  const totalHours = (totalSeconds / 3600).toFixed(2);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #0f766e 0%, #115e59 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 1,
          fontSize: "1.25rem",
          fontWeight: 700,
          borderRadius: "12px 12px 0 0",
        }}
      >
        <Clock size={24} />
        Add Working Time
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3}>
          {/* Success/Error Alert */}
          {submitStatus === "success" && (
            <Alert
              icon={<CheckCircle2 size={20} />}
              severity="success"
              sx={{ borderRadius: "8px" }}
            >
              Working time added successfully!
            </Alert>
          )}

          {submitStatus === "error" && (
            <Alert
              icon={<AlertCircle size={20} />}
              severity="error"
              sx={{ borderRadius: "8px" }}
            >
              {errors.submit || "Failed to add working time"}
            </Alert>
          )}

          {/* Member Selection */}
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ mb: 1, fontWeight: 600, color: "#0f766e" }}
            >
              Select Member
            </Typography>
            {usersLoading ? (
              <Box display="flex" justifyContent="center" py={2}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Autocomplete
                options={memberOptions}
                getOptionLabel={(option) => option.label}
                value={selectedMember}
                onChange={(_, value) => {
                  setSelectedMember(value);
                  setErrors((prev) => ({ ...prev, member: "" }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Search by name..."
                    error={!!errors.member}
                    helperText={errors.member}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        transition: "all 0.2s",
                        "&:hover": {
                          borderColor: "#0f766e",
                        },
                        "&.Mui-focused": {
                          boxShadow: "0 0 0 3px rgba(15, 118, 110, 0.1)",
                        },
                      },
                    }}
                  />
                )}
              />
            )}
          </Box>

          {/* Date Input */}
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ mb: 1, fontWeight: 600, color: "#0f766e" }}
            >
              Date
            </Typography>
            <TextField
              type="date"
              fullWidth
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setErrors((prev) => ({ ...prev, date: "" }));
              }}
              error={!!errors.date}
              helperText={errors.date}
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: "#0f766e",
                  },
                  "&.Mui-focused": {
                    boxShadow: "0 0 0 3px rgba(15, 118, 110, 0.1)",
                  },
                },
              }}
            />
          </Box>

          {/* All Day Work Checkbox */}
          <FormControlLabel
            control={
              <Checkbox
                checked={isAllDayWork}
                onChange={(e) => setIsAllDayWork(e.target.checked)}
              />
            }
            label={
              <Typography variant="body2" sx={{ color: "#475569" }}>
                All-day work (8 hours)
              </Typography>
            }
            sx={{
              "& .MuiCheckbox-root": {
                color: "#0f766e",
                "&.Mui-checked": {
                  color: "#0f766e",
                },
              },
            }}
          />

          {/* Time Input (conditionally shown) */}
          {!isAllDayWork && (
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ mb: 1.5, fontWeight: 600, color: "#0f766e" }}
              >
                Working Hours & Minutes
              </Typography>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Hours"
                  type="number"
                  value={hours}
                  onChange={(e) => {
                    setHours(e.target.value);
                    setErrors((prev) => ({ ...prev, hours: "", time: "" }));
                  }}
                  error={!!errors.hours || !!errors.time}
                  helperText={errors.hours}
                  inputProps={{ min: 0, max: 24 }}
                  sx={{
                    flex: 1,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      transition: "all 0.2s",
                      "&:hover": {
                        borderColor: "#0f766e",
                      },
                      "&.Mui-focused": {
                        boxShadow: "0 0 0 3px rgba(15, 118, 110, 0.1)",
                      },
                    },
                  }}
                />
                <TextField
                  label="Minutes"
                  type="number"
                  value={minutes}
                  onChange={(e) => {
                    setMinutes(e.target.value);
                    setErrors((prev) => ({ ...prev, minutes: "", time: "" }));
                  }}
                  error={!!errors.minutes || !!errors.time}
                  helperText={errors.minutes || (errors.time && "")}
                  inputProps={{ min: 0, max: 59 }}
                  sx={{
                    flex: 1,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      transition: "all 0.2s",
                      "&:hover": {
                        borderColor: "#0f766e",
                      },
                      "&.Mui-focused": {
                        boxShadow: "0 0 0 3px rgba(15, 118, 110, 0.1)",
                      },
                    },
                  }}
                />
              </Stack>
              {errors.time && (
                <Typography variant="caption" sx={{ color: "#ef4444", display: "block", mt: 1 }}>
                  {errors.time}
                </Typography>
              )}
            </Box>
          )}

          {/* Total Time Display */}
          {!isAllDayWork && (hoursNum > 0 || minutesNum > 0) && (
            <Box
              sx={{
                p: 2,
                borderRadius: "8px",
                background: "linear-gradient(135deg, rgba(15, 118, 110, 0.05) 0%, rgba(15, 118, 110, 0.02) 100%)",
                border: "1px solid rgba(15, 118, 110, 0.1)",
              }}
            >
              <Typography variant="body2" sx={{ color: "#0f766e", fontWeight: 600 }}>
                Total: {hoursNum}h {minutesNum}m ({totalHours} hours)
              </Typography>
            </Box>
          )}

          {isAllDayWork && (
            <Box
              sx={{
                p: 2,
                borderRadius: "8px",
                background: "linear-gradient(135deg, rgba(15, 118, 110, 0.05) 0%, rgba(15, 118, 110, 0.02) 100%)",
                border: "1px solid rgba(15, 118, 110, 0.1)",
              }}
            >
              <Typography variant="body2" sx={{ color: "#0f766e", fontWeight: 600 }}>
                Total: 8h 0m (8.00 hours)
              </Typography>
            </Box>
          )}

          {/* Description */}
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ mb: 1, fontWeight: 600, color: "#0f766e" }}
            >
              Description (Optional)
            </Typography>
            <TextField
              multiline
              rows={3}
              fullWidth
              placeholder="Add notes about this working time..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: "#0f766e",
                  },
                  "&.Mui-focused": {
                    boxShadow: "0 0 0 3px rgba(15, 118, 110, 0.1)",
                  },
                },
              }}
            />
          </Box>
        </Stack>
      </DialogContent>

      {/* Actions */}
      <DialogActions
        sx={{
          p: 2,
          pt: 1,
          background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          gap: 1,
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: "#cbd5e1",
            color: "#475569",
            borderRadius: "6px",
            textTransform: "none",
            fontWeight: 600,
            "&:hover": {
              backgroundColor: "#f1f5f9",
              borderColor: "#94a3b8",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting}
          sx={{
            background: "linear-gradient(135deg, #0f766e 0%, #115e59 100%)",
            borderRadius: "6px",
            textTransform: "none",
            fontWeight: 600,
            "&:hover": {
              background: "linear-gradient(135deg, #115e59 0%, #0d5653 100%)",
              boxShadow: "0 10px 25px rgba(15, 118, 110, 0.3)",
            },
            "&:disabled": {
              background: "linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)",
            },
          }}
        >
          {submitting ? (
            <>
              <CircularProgress size={16} sx={{ mr: 1 }} color="inherit" />
              Adding...
            </>
          ) : (
            "Add Time"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default React.memo(AddTimeDialog);