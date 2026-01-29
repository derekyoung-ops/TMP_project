import { Avatar, Box, Button, Card, CardContent, Dialog, DialogActions, DialogTitle, Divider, Grid, LinearProgress, Stack, Typography } from '@mui/material'
import React from 'react'
import { useMemo } from 'react';
import { deepPurple } from '@mui/material/colors'
import { useGetGroupPlanByDateQuery } from '../../slices/plan/planApiSlice';
import { useGetGroupExecutionsQuery } from '../../slices/execution/executionApiSlice';
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { calculateWeightedPercentage } from '../../utils/percentageCalculator';

const GroupWeekDetailDialog = ({
    groupDetailOpen,
    onClose,
    userInfo,
    weekMeta,
    toLocalDateKey,
    setWeekOffset
}) => {

    const SystemCard = ({ title, bg, children }) => (
        <Card sx={{ backgroundColor: bg, borderRadius: 2 }}>
            <CardContent>
                <Typography fontWeight={700} mb={1}>
                    {title}
                </Typography>
                <Stack spacing={0.8}>{children}</Stack>
            </CardContent>
        </Card>
    )

    const RowItem = ({ label, value }) => (
        <Box display="flex" justifyContent="space-between">
            <Typography fontSize={13} color="text.secondary">
                {label}
            </Typography>
            <Typography fontWeight={600}>{value}</Typography>
        </Box>
    )

    const planArgs = useMemo(() => ({
        type: "WEEK",
        year: weekMeta.year,
        month: weekMeta.month,
        weekOfMonth: weekMeta.weekOfMonth,
        createdBy: userInfo._id,
        groupId: userInfo.group,
    }), [weekMeta, userInfo])

    const execArgs = useMemo(() => ({
        type: "WEEK",
        date: toLocalDateKey(weekMeta.startDate),
        year: weekMeta.year,
        month: weekMeta.month,
        weekOfMonth: weekMeta.weekOfMonth,
        createdBy: userInfo._id,
        groupId: userInfo.group,
    }), [weekMeta.year, weekMeta.month, weekMeta.weekOfMonth, userInfo])

    const { data: planData = {} } = useGetGroupPlanByDateQuery(planArgs);
    const { data: execData = {} } = useGetGroupExecutionsQuery(execArgs);

    const { members = [], meta = {} } = planData;
    const exeMembers = execData?.members || [];

    const exeMap = useMemo(() => {
        const map = {}
        exeMembers.forEach(m => {
            map[m.userId] = m.execution
        })
        return map
    }, [exeMembers]);

    const sortedMembers = useMemo(() => {
        if (!members.length) return [];
        const managerId = meta?.group?.manager

        return [...members].sort((a, b) => {
            if (a.userId === managerId) return -1;
            if (b.userId === managerId) return 1;
            return 0
        })
    }, [members, meta]);

    const planGroupTotal = planData?.groupTotal ?? {};
    const execGroupTotal = execData?.groupTotal ?? {};

    return (
        <Dialog open={groupDetailOpen} onClose={onClose} maxWidth="xl" fullWidth>
            <DialogTitle>
                <Grid container>
                    <Grid size={3}>
                        <Typography fontSize={28} fontWeight={700}>
                            {meta?.group?.name}
                        </Typography>
                        <Typography color='text.secondary'>
                            Weekly Plan / Execution Summary
                        </Typography>
                    </Grid>
                    <Grid size={6} textAlign="start" xs={{ pl: 5 }}>
                        <Typography fontSize={28} fontWeight={700}>
                            Total Income
                        </Typography>
                        <Typography color="text.secondary">
                            <strong>${`${planGroupTotal.income || 0} / ${execGroupTotal.income || 0}`}</strong>
                        </Typography>
                    </Grid>
                    <Grid size={3} sx={{ mt: 1 }}>
                        <div className='d-flex'>
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
                    </Grid>
                </Grid>
            </DialogTitle>

            <Divider />
            <Box px={3} py={3}>
                <Grid container spacing={3}>
                    {sortedMembers.map(member => {
                        const plan = member.plan || {};
                        const exe = exeMap[member.userId] || {};
                        const percentage = calculateWeightedPercentage(plan, exe);

                        return (
                            <Grid size={6} key={member.userId}>
                                <Card sx={{ backgroundColor: '#fafafa', borderRadius: 2 }}>
                                    <CardContent>
                                        {/* Header */}
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar sx={{ bgcolor: deepPurple[500] }}>
                                                {member.name?.[0]}
                                            </Avatar>
                                            <Box flex={1}>
                                                <Typography fontWeight={700}>
                                                    {member.name}
                                                </Typography>
                                                <Typography fontSize={12} color="text.secondary">
                                                    Completion {percentage}%
                                                </Typography>
                                                <LinearProgress
                                                    value={Math.min(percentage, 100)}
                                                    variant="determinate"
                                                    sx={{ mt: 0.5, height: 6, borderRadius: 5 }}
                                                />
                                            </Box>
                                        </Stack>

                                        <Divider sx={{ my: 2 }} />

                                        <Grid container spacing={2}>
                                            <Grid item size={3} width={150}>
                                                <SystemCard title="Income" bg="#e3f2fd">
                                                    <RowItem label="Target" value={`$${plan.IncomePlan || 0}`} />
                                                    <RowItem label="Actual" value={`$${exe.IncomeActual || 0}`} />
                                                </SystemCard>
                                            </Grid>

                                            <Grid item xs={3} width={200}>
                                                <SystemCard title="Bidding" bg="#fdecea">
                                                    <RowItem
                                                        label="Jobs"
                                                        value={`${plan.biddingPlan?.offeredJobAmount || 0} / ${exe.biddingActual?.offeredJobAmount || 0}`}
                                                    />
                                                    <RowItem
                                                        label="Budget"
                                                        value={`$${plan.biddingPlan?.offeredTotalBudget || 0} / $${exe.biddingActual?.offeredTotalBudget || 0}`}
                                                    />
                                                </SystemCard>
                                            </Grid>

                                            <Grid item xs={3} width={150}>
                                                <SystemCard title="Realguy" bg="#f3e5f5">
                                                    <RowItem
                                                        label="People"
                                                        value={`${plan.realguyPlan?.acquiredPeopleAmount || 0} / ${exe.realguyActual?.acquiredPeopleAmount || 0}`}
                                                    />
                                                    <RowItem
                                                        label="Calls"
                                                        value={`${plan.realguyPlan?.callNumber || 0} / ${exe.realguyActual?.callNumber || 0}`}
                                                    />
                                                </SystemCard>
                                            </Grid>

                                            <Grid item xs={3}>
                                                <SystemCard title="Qualification" bg="#fff8e1">
                                                    <RowItem
                                                        label="Major"
                                                        value={`${plan.qualificationPlan?.majorHours || 0}h / ${exe.qualificationActual?.major || 0}h`}
                                                    />
                                                    <RowItem
                                                        label="English"
                                                        value={`${plan.qualificationPlan?.englishHours || 0}h / ${exe.qualificationActual?.english || 0}h`}
                                                    />
                                                </SystemCard>
                                            </Grid>
                                        </Grid>

                                    </CardContent>
                                </Card>
                            </Grid>
                        )
                    })}
                </Grid>
            </Box>
            <DialogActions>
                <Button onClick={onClose} variant="outlined">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default GroupWeekDetailDialog