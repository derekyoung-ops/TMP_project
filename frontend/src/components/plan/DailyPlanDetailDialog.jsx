import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Divider,
  LinearProgress,
  Chip,
  IconButton,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import WorkIcon from "@mui/icons-material/Work";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";

const MetricComparisonCard = ({ title, planValue, executionValue, unit = "" }) => {
  const percentage = planValue > 0 ? Math.round((executionValue / planValue) * 100) : 0;
  const percentageColor = 
    percentage >= 80 ? "success" : 
    percentage >= 50 ? "warning" : 
    "error";

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2.5, 
        height: "100%",
        border: "1px solid #e0e0e0",
        borderRadius: 2,
        transition: "all 0.2s",
        "&:hover": {
          boxShadow: 2,
          borderColor: "primary.main",
        }
      }}
    >
      <Typography variant="subtitle2" color="text.secondary" fontWeight={600} mb={2}>
        {title}
      </Typography>

      <Grid container spacing={2} mb={2}>
        <Grid item xs={6}>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
              Plan
            </Typography>
            <Typography variant="h5" fontWeight={700} color="primary.main">
              {planValue || 0}{unit}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
              Execution
            </Typography>
            <Typography variant="h5" fontWeight={700} color="success.main">
              {executionValue || 0}{unit}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Box>
        <LinearProgress
          variant="determinate"
          value={Math.min(percentage, 100)}
          color={percentageColor}
          sx={{
            height: 6,
            borderRadius: 1,
            bgcolor: "grey.200",
          }}
        />
        <Typography
          variant="caption"
          fontWeight={600}
          color={`${percentageColor}.main`}
          sx={{ mt: 0.5, display: "block", textAlign: "right" }}
        >
          {percentage}% Complete
        </Typography>
      </Box>
    </Paper>
  );
};

const SectionHeader = ({ icon, title }) => (
  <Box display="flex" alignItems="center" gap={1.5} mb={2.5} mt={3}>
    {icon}
    <Typography variant="h6" fontWeight={700}>
      {title}
    </Typography>
  </Box>
);

export default function DailyPlanDetailDialog({ open, onClose, dayData }) {
  if (!dayData) return null;

  const { planData, executionData, fullDate, day, date, isCompleted } = dayData;

  // Extract all plan and execution values
  const income = {
    plan: planData?.IncomePlan || 0,
    execution: executionData?.IncomeActual || 0,
  };

  const bidding = {
    totalBid: {
      plan: planData?.biddingPlan?.totalBidAmount || 0,
      execution: executionData?.biddingActual?.totalBidAmount || 0,
    },
    offeredJobs: {
      plan: planData?.biddingPlan?.offeredJobAmount || 0,
      execution: executionData?.biddingActual?.offeredJobAmount || 0,
    },
    offeredBudget: {
      plan: planData?.biddingPlan?.offeredTotalBudget || 0,
      execution: executionData?.biddingActual?.offeredTotalBudget || 0,
    },
  };

  const realguy = {
    posts: {
      plan: planData?.realguyPlan?.postsNumber || 0,
      execution: executionData?.realguyActual?.postsNumber || 0,
    },
    calls: {
      plan: planData?.realguyPlan?.callNumber || 0,
      execution: executionData?.realguyActual?.callNumber || 0,
    },
    acquired: {
      plan: planData?.realguyPlan?.acquiredPeopleAmount || 0,
      execution: executionData?.realguyActual?.acquiredPeopleAmount || 0,
    },
  };

  const qualification = {
    major: {
      plan: planData?.qualificationPlan?.majorHours || 0,
      execution: executionData?.qualificationActual?.major || 0,
    },
    english: {
      plan: planData?.qualificationPlan?.englishHours || 0,
      execution: executionData?.qualificationActual?.english || 0,
    },
  };

  const hasData = planData || executionData;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      {/* Header */}
      <DialogTitle
        sx={{
          bgcolor: "primary.main",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: 2,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {day}
          </Typography>
          <Box display="flex" alignItems="center" gap={1.5} mt={1}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {date} • {fullDate}
            </Typography>
            <Chip
              icon={isCompleted ? <CheckCircleIcon /> : <PendingIcon />}
              label={isCompleted ? "Completed" : "Not Completed"}
              size="small"
              sx={{ 
                bgcolor: isCompleted ? "success.light" : "grey.300",
                color: isCompleted ? "success.contrastText" : "text.primary",
              }}
            />
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {!hasData ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Data Available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No plan or execution data exists for this day.
            </Typography>
          </Box>
        ) : (
          <>
            {/* Income Section */}
            <SectionHeader 
              icon={<AttachMoneyIcon color="primary" sx={{ fontSize: 28 }} />} 
              title="Income Target" 
            />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <MetricComparisonCard
                  title="Income"
                  planValue={income.plan}
                  executionValue={income.execution}
                  unit="$"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Bidding Section */}
            <SectionHeader 
              icon={<WorkIcon color="primary" sx={{ fontSize: 28 }} />} 
              title="Job Bidding" 
            />
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <MetricComparisonCard
                  title="Total Bids"
                  planValue={bidding.totalBid.plan}
                  executionValue={bidding.totalBid.execution}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <MetricComparisonCard
                  title="Offered Jobs"
                  planValue={bidding.offeredJobs.plan}
                  executionValue={bidding.offeredJobs.execution}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <MetricComparisonCard
                  title="Offered Budget"
                  planValue={bidding.offeredBudget.plan}
                  executionValue={bidding.offeredBudget.execution}
                  unit="$"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Realguy Section */}
            <SectionHeader 
              icon={<PeopleIcon color="primary" sx={{ fontSize: 28 }} />} 
              title="Realguy (Acquisition)" 
            />
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <MetricComparisonCard
                  title="Posts"
                  planValue={realguy.posts.plan}
                  executionValue={realguy.posts.execution}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <MetricComparisonCard
                  title="Calls"
                  planValue={realguy.calls.plan}
                  executionValue={realguy.calls.execution}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <MetricComparisonCard
                  title="Acquired People"
                  planValue={realguy.acquired.plan}
                  executionValue={realguy.acquired.execution}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Qualification Section */}
            <SectionHeader 
              icon={<SchoolIcon color="primary" sx={{ fontSize: 28 }} />} 
              title="Qualification Enhancement" 
            />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <MetricComparisonCard
                  title="Major Hours"
                  planValue={qualification.major.plan}
                  executionValue={qualification.major.execution}
                  unit="h"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MetricComparisonCard
                  title="English Hours"
                  planValue={qualification.english.plan}
                  executionValue={qualification.english.execution}
                  unit="h"
                />
              </Grid>
            </Grid>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, bgcolor: "grey.50" }}>
        <Button onClick={onClose} variant="contained" size="large">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}