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
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddIcon from "@mui/icons-material/Add";
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

const getMonthMeta = (offset = 0) => {
  const base = new Date();
  base.setMonth(base.getMonth() + offset);

  return {
    year: base.getFullYear(),
    month: base.getMonth() + 1,
    monthName: base.toLocaleDateString("en-US", { month: "long" }),
    createdAt: base.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }),
    baseDate: base,
  };
};

export default function MonthlyPlans({ openPlanDialog, setType, userInfo }) {
  const [monthOffset, setMonthOffset] = useState(0);

  // Calculate month metadata - triggers refetch when offset changes
  const monthMeta = useMemo(() => getMonthMeta(monthOffset), [monthOffset]);

  // Query arguments for plans
  const planQueryArgs = useMemo(
    () => ({
      type: "MONTH",
      year: monthMeta.year,
      month: monthMeta.month,
      createdBy: userInfo._id,
    }),
    [monthMeta.year, monthMeta.month,]
  );

  // Query arguments for executions
  const execQueryArgs = useMemo(
    () => ({
      type: "MONTH",
      date: toLocalDateKey(monthMeta.baseDate),
      createdBy: userInfo._id,
    }),
    [monthMeta.baseDate]
  );

  // RTK Query hooks
  const {
    data: monthData = {},
    isLoading: planLoading,
    error: planError,
  } = useGetPlanByDateQuery(planQueryArgs);

  const {
    data: exeData = {},
    isLoading: execLoading,
    error: execError,
  } = useGetExecutionsQuery(execQueryArgs);

  // Calculate completion percentage using weighted calculation
  const completionPercentage = useMemo(() => {
    return calculateWeightedPercentage(monthData, exeData);
  }, [monthData, exeData]);

  // Calculate performance data for charts
  const performanceData = useMemo(() => {
    if (!monthData || !exeData) return null;

    return {
      income: {
        plan: monthData.IncomePlan || 0,
        actual: exeData.IncomeActual || 0,
      },
      job: {
        offeredJob: {
          plan: monthData.biddingPlan?.offeredJobAmount || 0,
          actual: exeData.biddingActual?.offeredJobAmount || 0,
        },
        totalAmount: {
          plan: monthData.biddingPlan?.offeredTotalBudget || 0,
          actual: exeData.biddingActual?.offeredTotalBudget || 0,
        },
      },
      realguy: {
        acquiredPeople: {
          plan: monthData.realguyPlan?.acquiredPeopleAmount || 0,
          actual: exeData.realguyActual?.acquiredPeopleAmount || 0,
        },
        calls: {
          plan: monthData.realguyPlan?.callNumber || 0,
          actual: exeData.realguyActual?.callNumber || 0,
        },
        posts: {
          plan: monthData.realguyPlan?.postsNumber || 0,
          actual: exeData.realguyActual?.postsNumber || 0,
        },
      },
      qualification: {
        major: {
          plan: Number(monthData.qualificationPlan?.majorHours || 0),
          actual: Number(exeData.qualificationActual?.major || exeData.qualificationActual?.majorHours || 0),
        },
        english: {
          plan: Number(monthData.qualificationPlan?.englishHours || 0),
          actual: Number(exeData.qualificationActual?.english || exeData.qualificationActual?.englishHours || 0),
        },
      },
    };
  }, [monthData, exeData]);

  // Check if monthly plan button should be active (only on last and first days of month)
  const isMonthlyPlanButtonActive = useMemo(() => {
    const now = new Date();
    const day = now.getDate();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return day === 1 || day === lastDayOfMonth;
  }, []);

  const isLoading = planLoading || execLoading;
  const hasError = planError || execError;

  // Error state
  if (hasError) {
    return (
      <Box sx={{ width: "100%", p: 3 }}>
        <Alert severity="error">
          Failed to load monthly plan: {planError?.message || execError?.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", bgcolor: "rgba(245, 245, 245, 0.7)", p: 3, borderRadius: 2 }}>
      {/* Header */}
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Monthly Plans
      </Typography>
      <Typography color="text.secondary" mb={3}>
        Create and manage monthly planning cycles
      </Typography>

      {/* Loading State */}
      {isLoading && (
        <Box display="flex" justifyContent="center" alignItems="center" py={8}>
          <CircularProgress />
        </Box>
      )}

      {/* Plan Card */}
      {!isLoading && (
        <Card sx={{ borderRadius: 3, boxShadow: 3, marginRight: 2 }}>
          <CardContent>
            {/* Card Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <div className="d-flex">
                <ChevronLeftIcon
                  sx={{ cursor: "pointer", my: 2, mr: 2 }}
                  onClick={() => setMonthOffset((v) => v - 1)}
                />
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {monthMeta.monthName} {monthMeta.year} Monthly Plan
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Created on {formatDate(monthData?.createdAt || "")}
                  </Typography>
                </Box>
                <ChevronRightIcon
                  sx={{ cursor: "pointer", my: 2, ml: 2 }}
                  onClick={() => setMonthOffset((v) => v + 1)}
                />
              </div>
              <Box display="flex" gap={1} alignItems="center">
                <Chip label="Progress" color="success" size="small" />
                <Button variant="text" onClick={() => {
                  openPlanDialog();
                  setType("MONTH");
                  // Store current month data for editing
                  sessionStorage.setItem('editingPlan', JSON.stringify({
                    type: "MONTH",
                    year: monthMeta.year,
                    month: monthMeta.month,
                    planData: monthData
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
                  ${monthData?.IncomePlan ?? 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Target deposit
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={
                    exeData?.IncomeActual && monthData?.IncomePlan
                      ? (exeData.IncomeActual / monthData.IncomePlan) * 100
                      : 0
                  }
                  sx={{ height: 8, borderRadius: 5, mb: 1 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {exeData?.IncomeActual ?? 0} collected
                </Typography>
              </Grid>

              {/* Bidding Plan */}
              <Grid size={3} sx={{ px: 2, border: "1px solid #e0e0e0", borderRadius: 3, p: 2, bgcolor: "rgba(255, 235, 238, 0.7)" }}>
                <Typography fontWeight={600} textAlign="center" mb={1}>
                  Bidding Plan
                </Typography>
                <Box display="flex" justifyContent="space-between" my={1}>
                  <Typography>Jobs Plan</Typography>
                  <Typography>{monthData?.biddingPlan?.offeredJobAmount ?? 0}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" my={1}>
                  <Typography>TotalBudget</Typography>
                  <Typography>{monthData?.biddingPlan?.offeredTotalBudget ?? 0}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" my={1}>
                  <Typography>Bids Plan</Typography>
                  <Typography>{monthData?.biddingPlan?.totalBidAmount ?? 0}</Typography>
                </Box>
              </Grid>

              {/* Realguy Plan */}
              <Grid size={3} sx={{ px: 2, border: "1px solid #e0e0e0", borderRadius: 3, p: 2, bgcolor: "rgba(243, 229, 245, 0.7)" }}>
                <Typography fontWeight={600} textAlign="center" mb={1}>
                  Realguy Plan
                </Typography>
                <Box display="flex" justifyContent="space-between" my={1}>
                  <Typography>Realguy</Typography>
                  <Typography>{monthData?.realguyPlan?.acquiredPeopleAmount ?? 0}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" my={1}>
                  <Typography>Calls</Typography>
                  <Typography>{monthData?.realguyPlan?.callNumber ?? 0}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" my={1}>
                  <Typography>Posts</Typography>
                  <Typography>{monthData?.realguyPlan?.postsNumber ?? 0}</Typography>
                </Box>
              </Grid>

              {/* Qualification Plan */}
              <Grid size={3} sx={{ px: 2, border: "1px solid #e0e0e0", borderRadius: 3, p: 2, bgcolor: "rgba(255, 243, 224, 0.7)" }}>
                <Typography fontWeight={600} textAlign="center" mb={1}>
                  Qualification Plan
                </Typography>
                <Box display="flex" justifyContent="space-between" my={1}>
                  <Typography>Major</Typography>
                  <Typography>{monthData?.qualificationPlan?.majorHours ?? 0}h</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" my={1}>
                  <Typography>English</Typography>
                  <Typography>{monthData?.qualificationPlan?.englishHours ?? 0}h</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" my={1}>
                  <Typography>Total</Typography>
                  <Typography>
                    {Number(monthData?.qualificationPlan?.majorHours ?? 0) +
                      Number(monthData?.qualificationPlan?.englishHours ?? 0)}
                    h
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Performance Chart */}
            {performanceData && (
              <Card sx={{ borderRadius: 3, mb: 3 }}>
                <CardContent>
                  <Typography fontWeight={600} mb={3}>
                    Monthly Performance
                  </Typography>

                  <Grid container spacing={3} textAlign="center">
                    {/* Income */}
                    <Grid size={{ xs: 12, md: 3 }}>
                      <Typography variant="h4" sx={{ mt: 2 }} fontWeight={700}>
                        ${performanceData.income.plan}/{performanceData.income.actual}
                      </Typography>
                      <Typography color="text.secondary" sx={{ mt: 2 }}>Income</Typography>
                    </Grid>

                    {/* Job */}
                    <Grid size={{ xs: 12, md: 3 }}>
                      <Typography variant="h6" fontWeight={600} color="success.main">
                        Jobs: {performanceData.job.offeredJob.plan}/{performanceData.job.offeredJob.actual}
                      </Typography>
                      <Typography variant="h6" fontWeight={600} color="success.main">
                        Budget: ${performanceData.job.totalAmount.plan}/{performanceData.job.totalAmount.actual}
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
                        Major: {performanceData.qualification.major.plan}/{performanceData.qualification.major.actual}h
                      </Typography>
                      <Typography variant="h6" fontWeight={600} color="#7c3aed">
                        English: {performanceData.qualification.english.plan}/{performanceData.qualification.english.actual}h
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
                  Last Updated: <b>{formatDate(monthData?.updatedAt || "")}</b> &nbsp; | &nbsp; Overall Completion: <b>{completionPercentage.toFixed(2)}%</b>
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                size="large"
                sx={{ borderRadius: 3, px: 4 }}
                // disabled={!isMonthlyPlanButtonActive}
                onClick={() => {
                  openPlanDialog();
                  setType("MONTH");
                }}
              >
                Create New Monthly Plan
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}