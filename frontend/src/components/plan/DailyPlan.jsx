import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useGetPlanByDateQuery } from "../../slices/plan/planApiSlice";
import { useGetExecutionsQuery } from "../../slices/execution/executionApiSlice";
import ExecutionDialog from "./ExecutionPlanDialog.jsx";
import DailyPlanDetailDialog from "./DailyPlanDetailDialog.jsx"; // ✅ Import new dialog
import { calculateWeightedPercentage } from "../../utils/percentageCalculator";
import { useGetUserByGroupQuery } from "../../slices/member/usersApiSlice.js";

const toLocalDateKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const todayKey = toLocalDateKey(new Date());

const getWeekDates = (baseDate) => {
  const start = new Date(baseDate);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
};

// Color scheme for each day of the week with opacity
const dayColors = {
  0: { bg: "rgba(255, 243, 224, 0.7)", border: "#ff9800", text: "#e65100" }, // Sunday
  1: { bg: "rgba(227, 242, 253, 0.7)", border: "#2196f3", text: "#0d47a1" }, // Monday
  2: { bg: "rgba(243, 229, 245, 0.7)", border: "#9c27b0", text: "#4a148c" }, // Tuesday
  3: { bg: "rgba(232, 245, 233, 0.7)", border: "#4caf50", text: "#1b5e20" }, // Wednesday
  4: { bg: "rgba(255, 249, 196, 0.7)", border: "#fbc02d", text: "#f57f17" }, // Thursday
  5: { bg: "rgba(252, 228, 236, 0.7)", border: "#e91e63", text: "#880e4f" }, // Friday
  6: { bg: "rgba(224, 242, 241, 0.7)", border: "#009688", text: "#004d40" }, // Saturday
};

const createEmptyDay = (dateObj) => ({
  fullDate: toLocalDateKey(dateObj),
  day: dateObj.toLocaleDateString("en-US", { weekday: "long" }),
  date: dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  dayOfWeek: dateObj.getDay(),
  income: "-",
  bids: "0/0",
  posts: "0/0",
  calls: "0/0",
  status: "Not Started",
  statusColor: "default",
  active: toLocalDateKey(dateObj) === todayKey,
});

const normalizeByDate = (items = []) =>
  items.reduce((acc, item) => {
    const dateKey = item.date?.slice(0, 10);
    if (dateKey) acc[dateKey] = item;
    return acc;
  }, {});

const getWeekRange = (offset = 0) => {
  const base = new Date();
  base.setDate(base.getDate() + offset * 7);

  const dayOfWeek = base.getDay();
  const start = new Date(base);
  start.setDate(base.getDate() - dayOfWeek);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const format = (date) =>
    date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  return {
    label: `${format(start)}–${format(end)}, ${end.getFullYear()}`,
    startDate: start,
    endDate: end,
  };
};

export default function DailyPlan({
  setOpenExcutionDialog,
  openPlanDialog,
  setType,
  setExecutionDay,
  userInfo,
}) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [executionDialogOpen, setExecutionDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false); // ✅ New state for detail dialog
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedMember, setSelectedMember] = useState("me");

  const isManager = userInfo?.role === "manager";

  const effectiveUserId = useMemo(() => {
    if (!isManager) return userInfo._id;
    if (selectedMember === "me") return userInfo._id;
    return selectedMember;
  }, [isManager, selectedMember, userInfo._id]);

  const baseDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [weekOffset]);

  const queryArgs = useMemo(
    () => ({
      type: "DAY",
      date: toLocalDateKey(baseDate),
      createdBy: effectiveUserId,
    }),
    [baseDate, effectiveUserId]
  );

  const {
    data: Groupmembers = []
  } = useGetUserByGroupQuery(userInfo.group, {
    skip: !isManager,
  });

  const members = Groupmembers.filter((member) => member._id !== userInfo._id);

  const {
    data: plans = [],
    isLoading: plansLoading,
    error: plansError,
    refetch: refetchPlans,
  } = useGetPlanByDateQuery(queryArgs);

  const {
    data: executions = [],
    isLoading: executionsLoading,
    error: executionsError,
    refetch: refetchExecutions,
  } = useGetExecutionsQuery(queryArgs);

  const days = useMemo(() => {
    const skeleton = getWeekDates(baseDate).map(createEmptyDay);
    const planMap = normalizeByDate(plans);
    const execMap = normalizeByDate(executions);

    return skeleton.map((day) => {
      const plan = planMap[day.fullDate];
      const exec = execMap[day.fullDate];

      const isPast = day.fullDate < todayKey;
      const isToday = day.fullDate === todayKey;
      const isCompleted = !!exec;

      let merged = { ...day };

      if (plan || exec) {
        merged.income = `${plan?.IncomePlan || 0}/${exec?.IncomeActual || 0}`;
        merged.bids = `${plan?.biddingPlan?.totalBidAmount || 0}/${exec?.biddingActual?.totalBidAmount || 0}`;
        merged.posts = `${plan?.realguyPlan?.postsNumber || 0}/${exec?.realguyActual?.postsNumber || 0}`;
        merged.calls = `${plan?.realguyPlan?.callNumber || 0}/${exec?.realguyActual?.callNumber || 0}`;
      }

      if (exec) {
        merged.status = "Completed";
        merged.statusColor = "success";
        merged.completionPercentage = calculateWeightedPercentage(plan, exec);
      } else if (isToday) {
        merged.status = "In Progress";
        merged.statusColor = "warning";
      } else if (isPast) {
        merged.status = "Completed";
        merged.statusColor = "success";
      } else {
        merged.status = "Not Started";
        merged.statusColor = "default";
      }

      merged.executionData = exec;
      merged.planData = plan;
      merged.isCompleted = isCompleted;

      return merged;
    });
  }, [plans, executions, baseDate]);

  const weekMeta = useMemo(() => getWeekRange(weekOffset), [weekOffset]);

  const handleRefresh = async () => {
    await Promise.all([refetchPlans(), refetchExecutions()]);
  };

  const handleOpenExecutionDialog = (day) => {
    setSelectedDay(day);
    setExecutionDialogOpen(true);
  };

  const handleCloseExecutionDialog = () => {
    setExecutionDialogOpen(false);
    setSelectedDay(null);
  };

  // ✅ New handler for detail dialog
  const handleOpenDetailDialog = (day) => {
    setSelectedDay(day);
    setDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedDay(null);
  };

  const isLoading = plansLoading || executionsLoading;
  const hasError = plansError || executionsError;

  if (hasError) {
    return (
      <Box sx={{ width: "100%", p: 3 }}>
        <Alert severity="error">
          Failed to load plans: {plansError?.message || executionsError?.message}
        </Alert>
      </Box>
    );
  }

  useEffect(() => {
    setWeekOffset(0);
  }, [selectedMember]);

  return (
    <Box sx={{ width: "100%", bgcolor: "rgba(255, 255, 255, 0.7)", p: 3, borderRadius: 2 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Daily Plans
      </Typography>
      <Typography color="text.secondary" mb={3}>
        Execute your weekly goals day by day
      </Typography>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} mr={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <ChevronLeftIcon
            color="action"
            sx={{ cursor: "pointer" }}
            onClick={() => setWeekOffset((prev) => prev - 1)}
          />
          <Typography fontWeight={600}>{weekMeta.label}</Typography>
          <ChevronRightIcon
            color="action"
            sx={{ cursor: "pointer" }}
            onClick={() => setWeekOffset((prev) => prev + 1)}
          />
          <IconButton
            size="small"
            onClick={handleRefresh}
            disabled={isLoading}
            title="Refresh data"
          >
            <RefreshIcon />
          </IconButton>
        </Box>
        {isManager && members?.length > 0 && (
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="member-select-label">Group Member</InputLabel>
            <Select
              labelId="member-select-label"
              label="Group Member"
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
            >
              <MenuItem value="me">My Plan</MenuItem>
              {members.map((member) => (
                <MenuItem key={member._id} value={member._id}>
                  {member.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <Button
          variant="contained"
          sx={{ borderRadius: 2 }}
          onClick={() => {
            openPlanDialog();
            setType("DAY");
          }}
        >
          Create Tomorrow's Plan
        </Button>
      </Box>

      {isLoading && (
        <Box display="flex" justifyContent="center" alignItems="center" py={8}>
          <CircularProgress />
        </Box>
      )}

      {!isLoading && (
        <Grid container rowSpacing={1} columnSpacing={2} sx={{ marginRight: 2 }} mb={2}>
          {days.map((d) => {
            const dayColor = dayColors[d.dayOfWeek];
            const isCompleted = d.isCompleted;

            return (
              <Grid size={12 / days.length} key={d.fullDate}>
                <Card
                  sx={{
                    position: "relative",
                    height: "100%",
                    borderRadius: 2,
                    border: d.active ? "3px solid #000" : "none",
                    boxShadow: d.active ? "0 4px 8px rgba(0,0,0,0.3)" : "none",
                    bgcolor: dayColor.bg,
                    overflow: "hidden",
                    "&:hover .overlay": {
                      opacity: 1,
                    },
                  }}
                >
                  <Box
                    className="overlay"
                    sx={{
                      position: "absolute",
                      inset: 0,
                      bgcolor: "rgba(0,0,0,0.4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                      gap: 1,
                      opacity: 0,
                      transition: "opacity 0.25s ease",
                      zIndex: 2,
                    }}
                  >
                    {d.active && !isCompleted && (
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ borderRadius: 2 }}
                        onClick={() => handleOpenExecutionDialog(d)}
                      >
                        Add Execution
                      </Button>
                    )}
                    {/* ✅ Updated View Details button */}
                    <Button
                      variant="outlined"
                      sx={{ borderRadius: 2, bgcolor: "white" }}
                      onClick={() => handleOpenDetailDialog(d)}
                    >
                      View Details
                    </Button>
                  </Box>
                  <CardContent>
                    <Typography fontWeight={600} sx={{ color: dayColor.text }}>
                      {d.day}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {d.date}
                    </Typography>

                    <Typography variant="body1" sx={{ mb: 1.5 }}>
                      Income <Box component="span" sx={{ fontWeight: 700, fontSize: "1.1em", ml: 1 }}>{d.income}</Box>
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1.5 }}>
                      Bids <Box component="span" sx={{ fontWeight: 700, fontSize: "1.1em", ml: 1 }}>{d.bids}</Box>
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1.5 }}>
                      Posts <Box component="span" sx={{ fontWeight: 700, fontSize: "1.1em", ml: 1 }}>{d.posts}</Box>
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      Calls <Box component="span" sx={{ fontWeight: 700, fontSize: "1.1em", ml: 1 }}>{d.calls}</Box>
                    </Typography>

                    <Divider />

                    <Box mt={1} display="flex" alignItems="center" gap={1}>
                      {isCompleted && d.completionPercentage !== undefined && (
                        <Typography variant="body2" fontWeight={600} color="text.secondary">
                          {d.completionPercentage}%
                        </Typography>
                      )}
                      <Chip
                        label={d.status}
                        color={d.statusColor}
                        size="small"
                        variant={d.status === "Not Started" ? "outlined" : "filled"}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Execution Dialog */}
      {selectedDay && (
        <ExecutionDialog
          open={executionDialogOpen}
          onClose={handleCloseExecutionDialog}
          type="DAY"
          executionDay={selectedDay.fullDate}
          existingExecution={selectedDay.executionData}
        />
      )}

      {/* ✅ Detail Dialog */}
      {selectedDay && (
        <DailyPlanDetailDialog
          open={detailDialogOpen}
          onClose={handleCloseDetailDialog}
          dayData={selectedDay}
        />
      )}
    </Box>
  );
}