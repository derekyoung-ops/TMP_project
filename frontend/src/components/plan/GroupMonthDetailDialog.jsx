import React, { useMemo } from 'react'
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogTitle,
    Typography,
    Grid,
    Card,
    CardContent,
    Divider,
    Stack,
    Avatar,
    LinearProgress
} from '@mui/material'
import { deepPurple } from '@mui/material/colors'
import { useGetGroupPlanByDateQuery } from '../../slices/plan/planApiSlice'
import { useGetGroupExecutionsQuery } from '../../slices/execution/executionApiSlice'
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

/* ======================================================
   INLINE WEIGHTED PERCENTAGE CALCULATOR (Vite-safe)
====================================================== */
function calculateWeightedPercentage(planData, execData) {
    if (!planData || !execData) return 0

    const calcPercentage = (plan, actual) => {
        if ((plan <= 0 || plan === null) && actual > 0) return 100
        if (actual <= 0 || plan <= 0) return 0
        return (actual / plan) * 100
    }

    // 1️⃣ Income (weight 5)
    const incomePercentage = calcPercentage(
        planData.IncomePlan || 0,
        execData.IncomeActual || 0
    )

    // Income dominates
    if (incomePercentage >= 100) {
        return Number(incomePercentage.toFixed(2))
    }

    // 2️⃣ Bidding (weight 2)
    const jobPercentage =
        (
            calcPercentage(
                planData.biddingPlan?.offeredJobAmount || 0,
                execData.biddingActual?.offeredJobAmount || 0
            ) +
            calcPercentage(
                planData.biddingPlan?.offeredTotalBudget || 0,
                execData.biddingActual?.offeredTotalBudget || 0
            )
        ) / 2

    // 3️⃣ Realguy (weight 2)
    const realguyPercentage =
        (
            calcPercentage(
                planData.realguyPlan?.callNumber || 0,
                execData.realguyActual?.callNumber || 0
            ) +
            calcPercentage(
                planData.realguyPlan?.acquiredPeopleAmount || 0,
                execData.realguyActual?.acquiredPeopleAmount || 0
            )
        ) / 2

    // 4️⃣ Qualification (weight 1)
    const qualificationPercentage =
        (
            calcPercentage(
                planData.qualificationPlan?.majorHours || 0,
                execData.qualificationActual?.major || 0
            ) +
            calcPercentage(
                planData.qualificationPlan?.englishHours || 0,
                execData.qualificationActual?.english || 0
            )
        ) / 2

    const weightedSum =
        incomePercentage * 5 +
        jobPercentage * 2 +
        realguyPercentage * 2 +
        qualificationPercentage * 1

    return Number((weightedSum / 10).toFixed(2))
}

/* ===============================
   Reusable System Card
================================ */
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

/* ===============================
   MAIN DIALOG
================================ */
const GroupMonthDetailDialog = ({
    groupDetailOpen,
    onClose,
    monthMeta,
    userInfo,
    toLocalDateKey,
    formatDate,
    monthData,
    setMonthOffset
}) => {

    const planArgs = useMemo(() => ({
        type: 'MONTH',
        year: monthMeta.year,
        month: monthMeta.month,
        groupId: userInfo.group
    }), [monthMeta, userInfo])

    const execArgs = useMemo(() => ({
        type: 'MONTH',
        year: monthMeta.year,
        month: monthMeta.month,
        date: toLocalDateKey(monthMeta.baseDate),
        groupId: userInfo.group
    }), [monthMeta, userInfo, toLocalDateKey])

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
    }, [exeMembers])

    const sortedMembers = useMemo(() => {
        if (!members.length) return []
        const managerId = meta?.group?.manager


        return [...members].sort((a, b) => {
            if (a.userId === managerId) return -1
            if (b.userId === managerId) return 1
            return 0
        })
    }, [members, meta])

    const planGroupTotal = planData?.groupTotal ?? {}
    const execGroupTotal = execData?.groupTotal ?? {}

    return (
        <Dialog open={groupDetailOpen} onClose={onClose} maxWidth="xl" fullWidth>
            <DialogTitle>
                <Grid container >
                    <Grid size={3}>
                        <Typography fontSize={28} fontWeight={700}>
                            {meta?.group?.name}
                        </Typography>
                        <Typography color="text.secondary">
                            Monthly Plan / Execution Summary
                        </Typography>
                    </Grid>
                    <Grid size={6} textAlign='start' sx={{ pl: 5 }}>
                        <Typography fontSize={28} fontWeight={700}>
                            Total Income
                        </Typography>
                        <Typography color="text.secondary">
                            <strong>${`${planGroupTotal.income || 0} / ${execGroupTotal.income || 0}`}</strong>
                        </Typography>
                    </Grid>
                    <Grid size={3} sx={{ mt: 1 }}>
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
                    </Grid>
                </Grid>
            </DialogTitle>

            <Divider />

            <Box px={3} py={3}>
                <Grid container spacing={3}>
                    {sortedMembers.map(member => {
                        const plan = member.plan || {}
                        const exe = exeMap[member.userId] || {}
                        const percentage = calculateWeightedPercentage(plan, exe)

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

export default GroupMonthDetailDialog