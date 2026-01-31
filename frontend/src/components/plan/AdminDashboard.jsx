import React, { useEffect, useMemo, useState } from 'react'
import { useGetGroupsQuery } from '../../slices/group/groupApiSlice';
import { Box, Divider, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, Typography, CircularProgress, Alert, Chip } from '@mui/material';
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import { useGetGroupPlanByDateQuery } from '../../slices/plan/planApiSlice'
import { useGetGroupExecutionsQuery } from '../../slices/execution/executionApiSlice'

// MetricCard Component
const MetricCard = ({ title, planValue, executionValue, type, showType = false, details = null }) => {
    const [expanded, setExpanded] = useState(false);

    const formatValue = (value) => {
        if (typeof value === 'number' && value > 1000) {
            return value.toLocaleString();
        }
        return value || 0;
    };

    const calculatePercentage = () => {
        if (!planValue || planValue === 0) return 0;
        return Math.round((executionValue / planValue) * 100);
    };

    const percentage = calculatePercentage();
    const percentageColor = percentage >= 80 ? 'success.main' : percentage >= 50 ? 'warning.main' : 'error.main';

    return (
        <Box
            sx={{
                p: 3,
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                backgroundColor: '#fff',
                height: '100%',
                transition: 'box-shadow 0.3s',
                '&:hover': {
                    boxShadow: 3,
                }
            }}
        >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={600}>
                    {title}
                </Typography>
                <Box display="flex" gap={1}>
                    {showType && (
                        <Chip
                            label={type}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontSize: 10, height: 20 }}
                        />
                    )}
                    {details && (
                        <IconButton
                            size="small"
                            onClick={() => setExpanded(!expanded)}
                            sx={{ width: 24, height: 24 }}
                        >
                            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                        </IconButton>
                    )}
                </Box>
            </Box>

            {/* Main Summary */}
            <Box>
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                    Plan
                </Typography>
                <Typography variant="h4" fontWeight={700} color="primary.main">
                    {formatValue(planValue)}
                </Typography>
            </Box>

            <Box mt={2}>
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                    Execution
                </Typography>
                <Box display="flex" alignItems="baseline" gap={1}>
                    <Typography variant="h5" fontWeight={600} color="success.main">
                        {formatValue(executionValue)}
                    </Typography>
                    {planValue > 0 && (
                        <Typography
                            variant="caption"
                            fontWeight={600}
                            color={percentageColor}
                        >
                            ({percentage}%)
                        </Typography>
                    )}
                </Box>
            </Box>

            {/* Detailed Breakdown */}
            {details && expanded && (
                <Box mt={3} pt={2} sx={{ borderTop: '1px solid #e0e0e0' }}>
                    <Typography variant="subtitle2" fontWeight={600} mb={1.5} color="text.secondary">
                        Breakdown
                    </Typography>
                    {details.map((detail, idx) => (
                        <Box key={idx} mb={1.5}>
                            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                                {detail.label}
                            </Typography>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Box display="flex" gap={2}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Plan:</Typography>
                                        <Typography variant="body2" fontWeight={600} color="primary.main">
                                            {formatValue(detail.planValue)}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Exec:</Typography>
                                        <Typography variant="body2" fontWeight={600} color="success.main">
                                            {formatValue(detail.execValue)}
                                        </Typography>
                                    </Box>
                                </Box>
                                {detail.planValue > 0 && (
                                    <Typography variant="caption" fontWeight={600} color={
                                        detail.planValue > 0 
                                            ? (detail.execValue / detail.planValue >= 0.8 ? 'success.main' : 
                                               detail.execValue / detail.planValue >= 0.5 ? 'warning.main' : 'error.main')
                                            : 'text.secondary'
                                    }>
                                        {detail.planValue > 0 ? Math.round((detail.execValue / detail.planValue) * 100) : 0}%
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
};

// MetricsGrid Component
const MetricsGrid = ({ selectedMember, groupPlan, groupExe, type, isLoading, hasError }) => {
    const { planData, exeData } = useMemo(() => {
        // console.log('MetricsGrid - selectedMember:', selectedMember);
        // console.log('MetricsGrid - groupPlan:', groupPlan);
        // console.log('MetricsGrid - groupExe:', groupExe);

        if (selectedMember === "ALL") {
            // Backend returns 'groupTotal' (not groupTotals)
            return {
                planData: groupPlan?.groupTotal,
                exeData: groupExe?.groupTotal
            };
        } else {
            // Find the selected member's data from the members array
            const memberPlanData = groupPlan?.members?.find(m => m.userId === selectedMember);
            const memberExeData = groupExe?.members?.find(m => m.userId === selectedMember);

            // console.log('MetricsGrid - memberPlanData:', memberPlanData);
            // console.log('MetricsGrid - memberExeData:', memberExeData);

            return {
                planData: memberPlanData?.plan,
                exeData: memberExeData?.execution
            };
        }
    }, [selectedMember, groupPlan, groupExe]);

    // console.log('MetricsGrid - planData:', planData);
    // console.log('MetricsGrid - exeData:', exeData);

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
                <CircularProgress />
            </Box>
        );
    }

    if (hasError) {
        return (
            <Alert severity="error" sx={{ my: 4 }}>
                Failed to load data. Please try again or select different filters.
            </Alert>
        );
    }

    // Define only 4 key metrics to display with detailed breakdowns
    // Match field names from backend:
    // Plan: IncomePlan, biddingPlan, realguyPlan, qualificationPlan
    // Execution: IncomeActual, biddingActual, realguyActual, qualificationActual
    const metrics = [
        {
            title: 'Income',
            getPlanValue: (data) => data?.IncomePlan || data?.income || 0,
            getExeValue: (data) => data?.IncomeActual || data?.income || 0,
            // No details for income - it's a single value
        },
        {
            title: 'Realguy',
            getPlanValue: (data) => data?.realguyPlan?.acquiredPeopleAmount || data?.acquiredPeopleAmount || 0,
            getExeValue: (data) => data?.realguyActual?.acquiredPeopleAmount || data?.acquiredPeopleAmount || 0,
            getDetails: (planData, exeData) => [
                {
                    label: 'Posts Number',
                    planValue: planData?.realguyPlan?.postsNumber || planData?.postsNumber || 0,
                    execValue: exeData?.realguyActual?.postsNumber || exeData?.postsNumber || 0,
                },
                {
                    label: 'Call Number',
                    planValue: planData?.realguyPlan?.callNumber || planData?.callNumber || 0,
                    execValue: exeData?.realguyActual?.callNumber || exeData?.callNumber || 0,
                },
                {
                    label: 'Acquired People',
                    planValue: planData?.realguyPlan?.acquiredPeopleAmount || planData?.acquiredPeopleAmount || 0,
                    execValue: exeData?.realguyActual?.acquiredPeopleAmount || exeData?.acquiredPeopleAmount || 0,
                }
            ]
        },
        {
            title: 'Job Bidding',
            getPlanValue: (data) => data?.biddingPlan?.offeredJobAmount || data?.offeredJobAmount || 0,
            getExeValue: (data) => data?.biddingActual?.offeredJobAmount || data?.offeredJobAmount || 0,
            getDetails: (planData, exeData) => [
                {
                    label: 'Total Bid Amount',
                    planValue: planData?.biddingPlan?.totalBidAmount || planData?.totalBidAmount || 0,
                    execValue: exeData?.biddingActual?.totalBidAmount || exeData?.totalBidAmount || 0,
                },
                {
                    label: 'Offered Job Amount',
                    planValue: planData?.biddingPlan?.offeredJobAmount || planData?.offeredJobAmount || 0,
                    execValue: exeData?.biddingActual?.offeredJobAmount || exeData?.offeredJobAmount || 0,
                },
                {
                    label: 'Offered Total Budget',
                    planValue: planData?.biddingPlan?.offeredTotalBudget || planData?.offeredTotalBudget || 0,
                    execValue: exeData?.biddingActual?.offeredTotalBudget || exeData?.offeredTotalBudget || 0,
                }
            ]
        },
        {
            title: 'Qualification',
            getPlanValue: (data) => {
                const major = data?.qualificationPlan?.majorHours || data?.majorHours || 0;
                const english = data?.qualificationPlan?.englishHours || data?.englishHours || 0;
                return major + english;
            },
            getExeValue: (data) => {
                const major = data?.qualificationActual?.major || data?.major || 0;
                const english = data?.qualificationActual?.english || data?.english || 0;
                return major + english;
            },
            getDetails: (planData, exeData) => [
                {
                    label: 'Major Hours',
                    planValue: planData?.qualificationPlan?.majorHours || planData?.majorHours || 0,
                    execValue: exeData?.qualificationActual?.major || exeData?.major || 0,
                },
                {
                    label: 'English Hours',
                    planValue: planData?.qualificationPlan?.englishHours || planData?.englishHours || 0,
                    execValue: exeData?.qualificationActual?.english || exeData?.english || 0,
                }
            ]
        }
    ];

    return (
        <Grid container spacing={3}>
            {metrics.map((metric, index) => (
                <Grid key={metric.title} size={3}>
                    <MetricCard
                        title={metric.title}
                        planValue={metric.getPlanValue(planData)}
                        executionValue={metric.getExeValue(exeData)}
                        type={type}
                        showType={index === 0}
                        details={metric.getDetails ? metric.getDetails(planData, exeData) : null}
                    />
                </Grid>
            ))}
        </Grid>
    );
};

export const AdminDashboard = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    const toLocalDateKey = (d) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
            d.getDate()
        ).padStart(2, "0")}`;

    // calculate current week of month
    const getCurrentWeekOfMonth = (date) => {
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
        return Math.ceil((date.getDate() + firstDay) / 7);
    };

    const currentWeek = getCurrentWeekOfMonth(today);

    const [year, setYear] = useState(currentYear);
    const [month, setMonth] = useState(currentMonth);
    const [weekOfMonth, setWeekOfMonth] = useState(currentWeek);
    const [groupIndex, setGroupIndex] = useState(0);
    const [selectedMember, setSelectedMember] = useState("ALL");

    const yearOptions = [2026, 2027, 2028, 2029];

    const {
        data: groups = [],
        isLoading: isGroupsLoading,
        error: groupsError
    } = useGetGroupsQuery();

    // Reset when groups change
    useEffect(() => {
        setGroupIndex(0);
        setSelectedMember("ALL");
    }, [groups]);

    const currentGroup = groups[groupIndex] || null;

    const handlePrev = () => {
        if (groupIndex > 0) {
            setGroupIndex((prev) => prev - 1);
            setSelectedMember("ALL");
        }
    };

    const handleNext = () => {
        if (groupIndex < groups.length - 1) {
            setGroupIndex((prev) => prev + 1);
            setSelectedMember("ALL");
        }
    };

    /* helpers */
    const getWeeksInMonth = (year, month) => {
        if (!year || !month) return [];
        const firstDay = new Date(year, month - 1, 1).getDay();
        const days = new Date(year, month, 0).getDate();
        return Array.from(
            { length: Math.ceil((firstDay + days) / 7) },
            (_, i) => i + 1
        );
    };

    const getWeekRange = (year, month, weekOfMonth) => {
        if (!year || !month || !weekOfMonth) return null;

        const first = new Date(year, month - 1, 1);
        const start = new Date(
            year,
            month - 1,
            1 + (weekOfMonth - 1) * 7 - first.getDay()
        );
        const end = new Date(start);
        end.setDate(start.getDate() + 6);

        return { start, end };
    };

    const formatRange = (range) =>
        range
            ? `${range.start.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            })} – ${range.end.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            })}`
            : "";

    const shouldSkipGroupQuery =
        !currentGroup?._id ||
        !year ||
        !month;

    const weeks = useMemo(() => getWeeksInMonth(year, month), [year, month]);

    // Determine type based on weekOfMonth selection
    const type = weekOfMonth ? "WEEK" : "MONTH";

    const planArgs = useMemo(() => {
        const base = {
            year,
            month,
            groupId: currentGroup?._id,
        };

        // If weekOfMonth is selected, use WEEK type
        if (weekOfMonth) {
            base.type = "WEEK";
            base.weekOfMonth = weekOfMonth;
        } else {
            // Otherwise use MONTH type
            base.type = "MONTH";
        }

        return base;
    }, [year, month, weekOfMonth, currentGroup?._id]);

    const exeArgs = useMemo(() => {
        const todayKey = toLocalDateKey(new Date());
        const base = {
            year,
            month,
            date: todayKey,
            groupId: currentGroup?._id,
        };

        if (weekOfMonth) {
            base.type = "WEEK";
            base.weekOfMonth = weekOfMonth;
        } else {
            base.type = "MONTH";
        }

        return base;
    }, [year, month, weekOfMonth, currentGroup?._id]);

    const {
        data: groupPlan,
        isLoading: isGroupPlanLoading,
        error: groupPlanError,
    } = useGetGroupPlanByDateQuery(planArgs, {
        skip: shouldSkipGroupQuery,
        refetchOnMountOrArgChange: 1,
    });

    const {
        data: groupExe,
        isLoading: isGroupExeLoading,
        error: groupExeError,
    } = useGetGroupExecutionsQuery(exeArgs, {
        skip: shouldSkipGroupQuery,
        refetchOnMountOrArgChange: 1,
    });

    const isLoading = isGroupsLoading || isGroupPlanLoading || isGroupExeLoading;
    const hasError = (groupPlanError || groupExeError) && !isGroupsLoading; // Don't show plan/exe errors if groups are still loading

    // Calculate team income summary using correct backend field names
    // Backend returns 'groupTotal' (not groupTotals)
    // Plan uses 'IncomePlan' or 'income', Execution uses 'IncomeActual' or 'income'
    const teamPlanIncome = groupPlan?.groupTotal?.IncomePlan || groupPlan?.groupTotal?.income || 0;
    const teamExeIncome = groupExe?.groupTotal?.IncomeActual || groupExe?.groupTotal?.income || 0;
    const teamIncomePercentage = teamPlanIncome > 0 ? Math.round((teamExeIncome / teamPlanIncome) * 100) : 0;
    const teamIncomePercentageColor = teamIncomePercentage >= 80 ? 'success.main' : teamIncomePercentage >= 50 ? 'warning.main' : 'error.main';

    const getTypeLabel = () => {
        if (type === 'WEEK' && weekOfMonth) {
            return `Week ${weekOfMonth}`;
        }
        if (type === 'MONTH' && month) {
            return new Date(2000, month - 1).toLocaleString('en-US', { month: 'long' });
        }
        return type;
    };

    return (
        <div>
            <Box sx={{ mb: 4 }}>
                <Typography
                    fontSize={24}
                    fontWeight={700}
                    letterSpacing={0.5}
                >
                    Team Plan / Execution Overview
                </Typography>
                <Typography
                    variant='body1'
                    color='text.secondary'
                    sx={{ mt: 0.5 }}
                >
                    Track plans and real execution across teams, groups, and individuals
                </Typography>

                <Divider sx={{ mt: 2 }} />
            </Box>

            <Box sx={{ mb: 4 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid display="flex" justifyContent="space-around" size={6}>
                        {/* Year */}
                        <Grid size={4}>
                            <FormControl fullWidth>
                                <InputLabel>Year</InputLabel>
                                <Select
                                    value={year}
                                    label="Year"
                                    onChange={(e) => {
                                        setYear(e.target.value);
                                        setMonth("");
                                        setWeekOfMonth("");
                                    }}
                                >
                                    {yearOptions.map((y) => (
                                        <MenuItem key={y} value={y}>
                                            {y}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Month */}
                        <Grid size={4}>
                            <FormControl fullWidth disabled={!year}>
                                <InputLabel>Month</InputLabel>
                                <Select
                                    value={month}
                                    label="Month"
                                    onChange={(e) => {
                                        setMonth(e.target.value);
                                        setWeekOfMonth("");
                                    }}
                                >
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                        <MenuItem key={m} value={m}>
                                            {new Date(2000, m - 1).toLocaleString('en-US', { month: 'long' })}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Week */}
                        <Grid size={4}>
                            <FormControl fullWidth disabled={!month}>
                                <InputLabel>Week of Month</InputLabel>
                                <Select
                                    value={weekOfMonth}
                                    label="Week of Month"
                                    onChange={(e) => {
                                        setWeekOfMonth(e.target.value);
                                    }}
                                >
                                    <MenuItem value="">
                                        <em>Full Month</em>
                                    </MenuItem>
                                    {weeks.map((w) => {
                                        const range = getWeekRange(year, month, w);
                                        return (
                                            <MenuItem key={w} value={w}>
                                                WEEK {w} ({formatRange(range)})
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    <Grid size={6}>
                        <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="flex-end"
                            height="100%"
                        >
                            <Box
                                sx={{
                                    border: "1px solid #e0e0e0",
                                    borderRadius: 2,
                                    px: 3,
                                    py: 1.5,
                                    minWidth: 320,
                                    backgroundColor: "#fafafa",
                                }}
                            >
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                    <Typography
                                        fontSize={14}
                                        fontWeight={600}
                                        color="text.secondary"
                                    >
                                        Team Income
                                    </Typography>
                                    <Chip
                                        label={getTypeLabel()}
                                        size="small"
                                        color="info"
                                        variant="outlined"
                                    />
                                </Box>

                                <Box display="flex" alignItems="baseline" gap={1.5}>
                                    <Typography fontSize={16} fontWeight={600}>
                                        Plan:
                                    </Typography>
                                    <Typography fontSize={18} fontWeight={700}>
                                        {teamPlanIncome.toLocaleString()}
                                    </Typography>

                                    <Typography fontSize={16} fontWeight={600}>
                                        |
                                    </Typography>

                                    <Typography fontSize={16} fontWeight={600}>
                                        Execution:
                                    </Typography>
                                    <Typography fontSize={18} fontWeight={700} color="success.main">
                                        {teamExeIncome.toLocaleString()}
                                    </Typography>

                                    <Typography
                                        fontSize={14}
                                        fontWeight={600}
                                        color={teamIncomePercentageColor}
                                    >
                                        ({teamIncomePercentage}%)
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {currentGroup && (
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    px={2.5}
                    py={1.5}
                    sx={{
                        backgroundColor: "#fff",
                        borderRadius: 2,
                        boxShadow: 1,
                    }}
                >
                    {/* LEFT — Group Navigation */}
                    <Box display="flex" alignItems="center" gap={2}>
                        <IconButton
                            size="small"
                            onClick={handlePrev}
                            disabled={groupIndex === 0}
                        >
                            <ArrowBackIosNewIcon fontSize="small" />
                        </IconButton>

                        <Box>
                            <Box display="flex" alignItems="center" gap={1}>
                                <Typography fontWeight={600} fontSize={16}>
                                    {currentGroup.name}
                                </Typography>

                                <Typography
                                    fontSize={13}
                                    color="text.secondary"
                                    sx={{ whiteSpace: "nowrap" }}
                                >
                                    · Manager:{" "}
                                    <Box component="span" fontWeight={600} color="text.primary">
                                        {currentGroup.manager?.name || "—"}
                                    </Box>
                                </Typography>

                                <Chip
                                    label={weekOfMonth ? `Week ${weekOfMonth}` : "Month"}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                />
                            </Box>

                            <Typography variant="caption" color="text.secondary">
                                Plan / Execution Overview · {type === "WEEK" ? "Weekly" : "Monthly"} Data
                            </Typography>
                        </Box>

                        <IconButton
                            size="small"
                            onClick={handleNext}
                            disabled={groupIndex === groups.length - 1}
                        >
                            <ArrowForwardIosIcon fontSize="small" />
                        </IconButton>
                    </Box>

                    {/* RIGHT — Member Dropdown */}
                    <Select
                        size="small"
                        value={selectedMember}
                        onChange={(e) => setSelectedMember(e.target.value)}
                        sx={{ minWidth: 220 }}
                    >
                        <MenuItem value="ALL">
                            All Members ({currentGroup.members.length})
                        </MenuItem>

                        {currentGroup.members.map((member) => (
                            <MenuItem key={member._id} value={member._id}>
                                {member.name}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>
            )}

            <Box sx={{ mt: 4 }}>
                <MetricsGrid
                    selectedMember={selectedMember}
                    groupPlan={groupPlan}
                    groupExe={groupExe}
                    type={type}
                    isLoading={isLoading}
                    hasError={hasError}
                />
            </Box>
        </div>
    )
}