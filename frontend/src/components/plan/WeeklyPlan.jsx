import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Card,
  CardContent,
  Divider,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useGetPlanByDateQuery } from "../../slices/plan/planApiSlice";
import { useGetExecutionsQuery } from "../../slices/execution/executionApiSlice";
import { calculateWeightedPercentage } from "../../utils/percentageCalculator";

const toLocalDateKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const formatDate = (date) => {
  if (!date) return "-";
  return date.split("T")[0];
};

const getWeekMeta = (offset = 0) => {
  const base = new Date();
  base.setDate(base.getDate() + offset * 7);

  const start = new Date(base);
  start.setDate(base.getDate() - base.getDay());

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const year = start.getFullYear();
  const monthIndex = start.getMonth();

  const weekOfMonth = Math.ceil(
    (start.getDate() + new Date(year, monthIndex, 1).getDay()) / 7
  );

  const format = (d) =>
    d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  return {
    year,
    month: monthIndex + 1,
    monthIndex,
    monthName: start.toLocaleDateString("en-US", { month: "long" }),
    weekOfMonth,
    rangeLabel: `${format(start)}–${format(end)}, ${year}`,
    startDate: start,
    endDate: end,
  };
};

const getDaysLeftInWeek = (weekMeta) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { endDate } = weekMeta;
  const weekEnd = new Date(endDate);
  weekEnd.setHours(0, 0, 0, 0);

  // Week already finished
  if (today >= weekEnd) return 0;

  // Week not started yet
  if (today < weekMeta.startDate) return 6;

  // Days remaining (excluding today)
  const diff = Math.floor((weekEnd - today) / (1000 * 60 * 60 * 24));
  return Math.max(diff, 0);
};

export default function WeeklyPlans({ openPlanDialog, setType, getPlanTimeMeta, makePlanTimeMeta }) {
  const [weekOffset, setWeekOffset] = useState(0);

  // Calculate week metadata - triggers refetch when offset changes
  const weekMeta = useMemo(() => getWeekMeta(weekOffset), [weekOffset]);

  // Query arguments for plans
  const planQueryArgs = useMemo(
    () => ({
      type: "WEEK",
      year: weekMeta.year,
      month: weekMeta.month,
      weekOfMonth: weekMeta.weekOfMonth,
    }),
    [weekMeta.year, weekMeta.month, weekMeta.weekOfMonth]
  );

  // Query arguments for executions - FIXED: now includes year, month, weekOfMonth
  const execQueryArgs = useMemo(
    () => ({
      type: "WEEK",
      date: toLocalDateKey(weekMeta.startDate),
      year: weekMeta.year,
      month: weekMeta.month,
      weekOfMonth: weekMeta.weekOfMonth,
    }),
    [weekMeta.startDate, weekMeta.year, weekMeta.month, weekMeta.weekOfMonth]
  );

  // RTK Query hooks
  const {
    data: weekData = {},
    isLoading: planLoading,
    error: planError,
  } = useGetPlanByDateQuery(planQueryArgs);

  const {
    data: weekExeData = {},
    isLoading: execLoading,
    error: execError,
  } = useGetExecutionsQuery(execQueryArgs);


  // Calculate completion percentage using weighted calculation
  const completionPercentage = useMemo(() => {
    return calculateWeightedPercentage(weekData, weekExeData);
  }, [weekData, weekExeData]);

  // Calculate performance data for charts
  const performanceData = useMemo(() => {
    if (!weekData || !weekExeData) return null;

    return {
      income: {
        plan: weekData.IncomePlan || 0,
        actual: weekExeData.IncomeActual || 0,
      },
      job: {
        offeredJob: {
          plan: weekData.biddingPlan?.offeredJobAmount || 0,
          actual: weekExeData.biddingActual?.offeredJobAmount || 0,
        },
        totalAmount: {
          plan: weekData.biddingPlan?.offeredTotalBudget || 0,
          actual: weekExeData.biddingActual?.offeredTotalBudget || 0,
        },
      },
      realguy: {
        acquiredPeople: {
          plan: weekData.realguyPlan?.acquiredPeopleAmount || 0,
          actual: weekExeData.realguyActual?.acquiredPeopleAmount || 0,
        },
        calls: {
          plan: weekData.realguyPlan?.callNumber || 0,
          actual: weekExeData.realguyActual?.callNumber || 0,
        },
        posts: {
          plan: weekData.realguyPlan?.postsNumber || 0,
          actual: weekExeData.realguyActual?.postsNumber || 0,
        },
      },
      qualification: {
        major: {
          plan: Number(weekData.qualificationPlan?.majorHours || 0),
          actual: Number(weekExeData.qualificationActual?.major || weekExeData.qualificationActual?.majorHours || 0),
        },
        english: {
          plan: Number(weekData.qualificationPlan?.englishHours || 0),
          actual: Number(weekExeData.qualificationActual?.english || weekExeData.qualificationActual?.englishHours || 0),
        },
      },
    };
  }, [weekData, weekExeData]);

  const daysLeft = useMemo(() => getDaysLeftInWeek(weekMeta), [weekMeta]);

  // Check if weekly plan button should be active (only on Saturday and Sunday)
  const isWeeklyPlanButtonActive = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
  }, []);

  const isLoading = planLoading || execLoading;
  const hasError = planError || execError;

  // Error state
  if (hasError) {
    return (
      <Box sx={{ width: "100%", p: 3 }}>
        <Alert severity="error">
          Failed to load weekly plan: {planError?.message || execError?.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", bgcolor: "rgba(250, 250, 250, 0.7)", p: 3, borderRadius: 2 }}>
      {/* Header */}
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Weekly Plans
      </Typography>
      <Typography color="text.secondary" mb={3}>
        Break down monthly goals into weekly milestones
      </Typography>

      {/* Loading State */}
      {isLoading && (
        <Box display="flex" justifyContent="center" alignItems="center" py={8}>
          <CircularProgress />
        </Box>
      )}

      {/* Active Week Card */}
      {!isLoading && (
        <Card sx={{ borderRadius: 3, boxShadow: 3, marginRight: 2 }}>
          <CardContent>
            {/* Card Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <div className="d-flex">
                <ChevronLeftIcon
                  sx={{ cursor: "pointer", my: 2, mr: 2 }}
                  onClick={() => setWeekOffset((v) => v - 1)}
                />
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Week {weekMeta.weekOfMonth} Plan – {weekMeta.monthName} {weekMeta.year}
                  </Typography>

                  <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                    <Typography fontWeight={600}>Week of {weekMeta.rangeLabel}</Typography>
                  </Box>
                </Box>
                <ChevronRightIcon
                  sx={{ cursor: "pointer", my: 2, ml: 2 }}
                  onClick={() => setWeekOffset((v) => v + 1)}
                />
              </div>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip label="Progress" color="success" size="small" />
                <Button variant="text" onClick={() => { 
                  openPlanDialog(); 
                  setType("WEEK");
                  // Store current week data for editing
                  sessionStorage.setItem('editingPlan', JSON.stringify({
                    type: "WEEK",
                    year: weekMeta.year,
                    month: weekMeta.month,
                    weekOfMonth: weekMeta.weekOfMonth,
                    planData: weekData
                  }));
                }}>Edit</Button>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Content */}
            <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 3, md: 5 }}>
              {/* Income Plan */}
              <Grid size={3} sx={{ px: 2, border: "1px solid #e0e0e0", borderRadius: 3, p: 2, bgcolor: "rgba(227, 242, 253, 0.7)" }}>
                <Typography fontWeight={600} textAlign="center" mb={1}>
                  Income Plan
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  ${weekData?.IncomePlan ?? 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Target deposit
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={completionPercentage}
                  sx={{ height: 8, borderRadius: 5, mb: 1 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {weekExeData?.IncomeActual ?? 0} collected
                </Typography>
              </Grid>

              {/* Bidding Plan */}
              <Grid size={3} sx={{ px: 2, border: "1px solid #e0e0e0", borderRadius: 3, p: 2, bgcolor: "rgba(255, 235, 238, 0.7)" }}>
                <Typography fontWeight={600} textAlign="center" mb={1}>
                  Bidding Plan
                </Typography>
                <Box display="flex" justifyContent="space-between" my={1}>
                  <Typography>Jobs Plan</Typography>
                  <Typography>{weekData?.biddingPlan?.offeredJobAmount ?? 0}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" my={1}>
                  <Typography>TotalBudget</Typography>
                  <Typography>{weekData?.biddingPlan?.offeredTotalBudget ?? 0}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" my={1}>
                  <Typography>Bids Plan</Typography>
                  <Typography>{weekData?.biddingPlan?.totalBidAmount ?? 0}</Typography>
                </Box>
              </Grid>

              {/* Realguy Plan */}
              <Grid size={3} sx={{ px: 2, border: "1px solid #e0e0e0", borderRadius: 3, p: 2, bgcolor: "rgba(243, 229, 245, 0.7)" }}>
                <Typography fontWeight={600} textAlign="center" mb={1}>
                  Realguy Plan
                </Typography>
                <Box display="flex" justifyContent="space-between" my={1}>
                  <Typography>Realguy</Typography>
                  <Typography>{weekData?.realguyPlan?.acquiredPeopleAmount ?? 0}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" my={1}>
                  <Typography>Calls</Typography>
                  <Typography>{weekData?.realguyPlan?.callNumber ?? 0}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" my={1}>
                  <Typography>Posts</Typography>
                  <Typography>{weekData?.realguyPlan?.postsNumber ?? 0}</Typography>
                </Box>
              </Grid>

              {/* Qualification Plan */}
              <Grid size={3} sx={{ px: 2, border: "1px solid #e0e0e0", borderRadius: 3, p: 2, bgcolor: "rgba(255, 243, 224, 0.7)" }}>
                <Typography fontWeight={600} textAlign="center" mb={1}>
                  Qualification Plan
                </Typography>
                <Box display="flex" justifyContent="space-between" my={1}>
                  <Typography>Major</Typography>
                  <Typography>{weekData?.qualificationPlan?.majorHours ?? 0}h</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" my={1}>
                  <Typography>English</Typography>
                  <Typography>{weekData?.qualificationPlan?.englishHours ?? 0}h</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" my={1}>
                  <Typography>Total</Typography>
                  <Typography>
                    {Number(weekData?.qualificationPlan?.majorHours ?? 0) +
                      Number(weekData?.qualificationPlan?.englishHours ?? 0)}
                    h
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Performance Chart */}
            {performanceData && (
              <Card sx={{ borderRadius: 3, mb: 3 }}>
                <CardContent>
                  <Typography fontWeight={600} mb={3}>
                    Weekly Performance
                  </Typography>

                  <Grid container spacing={3} textAlign="center">
                    {/* Income */}
                    <Grid size={{ xs: 12, md: 3 }}>
                      <Typography variant="h4" sx={{mt : 2}} fontWeight={700}>
                        ${performanceData.income.plan}/${performanceData.income.actual}
                      </Typography>
                      <Typography color="text.secondary" sx={{mt : 2}}>Income</Typography>
                    </Grid>

                    {/* Job */}
                    <Grid size={{ xs: 12, md: 3 }}>
                      <Typography variant="h6" fontWeight={600} color="success.main">
                        Jobs: {performanceData.job.offeredJob.plan}/{performanceData.job.offeredJob.actual}
                      </Typography>
                      <Typography variant="h6" fontWeight={600} color="success.main">
                        Budget: ${performanceData.job.totalAmount.plan}/${performanceData.job.totalAmount.actual}
                      </Typography>
                      <Typography color="text.secondary" mt={1}>Bidding</Typography>
                    </Grid>

                    {/* Realguy */}
                    <Grid size={{ xs: 12, md: 3 }}>
                      <Typography variant="h6" fontWeight={600} color="primary.main">
                        Acquired: {performanceData.realguy.acquiredPeople.plan}/{performanceData.realguy.acquiredPeople.actual}
                      </Typography>
                      <Typography variant="h6" fontWeight={600} color="primary.main">
                        Calls: {performanceData.realguy.calls.plan}/{performanceData.realguy.calls.actual}
                      </Typography>
                      <Typography color="text.secondary" mt={1}>Realguy</Typography>
                    </Grid>

                    {/* Qualification */}
                    <Grid size={{ xs: 12, md: 3 }}>
                      <Typography variant="h6" fontWeight={600} color="#7c3aed">
                        Major: {performanceData.qualification.major.plan}h/{performanceData.qualification.major.actual}h
                      </Typography>
                      <Typography variant="h6" fontWeight={600} color="#7c3aed">
                        English: {performanceData.qualification.english.plan}h/{performanceData.qualification.english.actual}h
                      </Typography>
                      <Typography color="text.secondary" mt={1}>Qualification</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* Footer */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
              <Box>
                <Typography variant="body1" color="text.secondary">
                  Last Updated: <b>{formatDate(weekData?.updatedAt || "")}</b>
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Weekly Completion: <b>{completionPercentage}%</b> &nbsp; | &nbsp; Days Left:{" "}
                  <b>{daysLeft}</b>
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                size="large"
                sx={{ borderRadius: 3, px: 4 }}
                disabled={!isWeeklyPlanButtonActive}
                onClick={() => {
                  openPlanDialog();
                  setType("WEEK");
                }}
              >
                Create New Weekly Plan
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}