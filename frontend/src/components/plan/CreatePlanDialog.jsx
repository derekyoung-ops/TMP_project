import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Grid,
    Typography,
    IconButton,
    CircularProgress,
    Alert,
    Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Autocomplete from "@mui/material/Autocomplete";
import { useGetAccountsQuery } from "../../slices/account/accountApiSlice";
import { useCreatePlanMutation, useGetPlanByDateQuery } from "../../slices/plan/planApiSlice";
import { useSelector } from "react-redux";
import Notification from "../Basic/Notification";

export default function CreateMonthlyPlanDialog({ open, onClose, type, makePlanTimeMeta }) {

    const { userInfo } = useSelector((state) => state.auth);
    const { data: accountsRes = [], loading: accountsLoading } = useGetAccountsQuery();

    const [createPlan, { isLoading }] = useCreatePlanMutation();

    const [form, setForm] = useState({
        type: "",
        incomeTarget: "",
        bidAmount: "",
        accountForBid: "",
        offeredProjectAmount: "",
        offeredTotalBudget: "",
        postsAmount: "",
        callsAmount: "",
        acquiredPeopleAmount: "",
        majorHours: "",
        englishHours: "",
    });

    // Get time meta for the plan being created
    const timeMeta = makePlanTimeMeta(type);

    const [notification, setNotification] = useState({
        open: false,
        message: "",
        severity: "success", // success | error | warning | info
    });

    const showNotification = (message, severity = "success") => {
        setNotification({
            open: true,
            message,
            severity,
        });
    };

    const closeNotification = () => {
        setNotification((prev) => ({ ...prev, open: false }));
    };

    // Fetch monthly plan when creating a weekly plan
    const { data: monthlyPlan, isLoading: isLoadingMonthlyPlan } = useGetPlanByDateQuery(
        type === "WEEK" && timeMeta.year && timeMeta.month
            ? {
                type: "MONTH",
                year: timeMeta.year,
                month: timeMeta.month,
                createdBy: userInfo._id,
            }
            : { type: "MONTH", year: 0, month: 0 }, // Skip query when not needed
        { skip: type !== "WEEK" || !timeMeta.year || !timeMeta.month }
    );

    // Calculate number of weeks in a month
    const getWeeksInMonth = (year, month) => {
        const firstDay = new Date(year, month - 1, 1);
        const lastDay = new Date(year, month, 0);
        const daysInMonth = lastDay.getDate();
        const firstDayOfWeek = firstDay.getDay();
        const weeks = Math.ceil((daysInMonth + firstDayOfWeek) / 7);
        return weeks;
    };

    // Pre-populate form when monthly plan is available for weekly plans
    useEffect(() => {
        if (type === "WEEK" && monthlyPlan && open) {
            const weeksInMonth = getWeeksInMonth(timeMeta.year, timeMeta.month);

            if (weeksInMonth > 0) {
                setForm((prev) => ({
                    ...prev,
                    incomeTarget: monthlyPlan.IncomePlan
                        ? Math.round(monthlyPlan.IncomePlan / weeksInMonth)
                        : "",
                    bidAmount: monthlyPlan.biddingPlan?.totalBidAmount
                        ? Math.round(monthlyPlan.biddingPlan.totalBidAmount / weeksInMonth)
                        : "",
                    accountForBid: monthlyPlan.biddingPlan?.AccountForBid || "",
                    offeredProjectAmount: monthlyPlan.biddingPlan?.offeredJobAmount
                        ? Math.round(monthlyPlan.biddingPlan.offeredJobAmount / weeksInMonth)
                        : "",
                    offeredTotalBudget: monthlyPlan.biddingPlan?.offeredTotalBudget
                        ? Math.round(monthlyPlan.biddingPlan.offeredTotalBudget / weeksInMonth)
                        : "",
                    postsAmount: monthlyPlan.realguyPlan?.postsNumber
                        ? Math.round(monthlyPlan.realguyPlan.postsNumber / weeksInMonth)
                        : "",
                    callsAmount: monthlyPlan.realguyPlan?.callNumber
                        ? Math.round(monthlyPlan.realguyPlan.callNumber / weeksInMonth)
                        : "",
                    acquiredPeopleAmount: monthlyPlan.realguyPlan?.acquiredPeopleAmount
                        ? Math.round(monthlyPlan.realguyPlan.acquiredPeopleAmount / weeksInMonth)
                        : "",
                    majorHours: monthlyPlan.qualificationPlan?.majorHours
                        ? Math.round(monthlyPlan.qualificationPlan?.majorHours / weeksInMonth)
                        : "",
                    englishHours: monthlyPlan.qualificationPlan?.englishHours
                        ? Math.round(monthlyPlan.qualificationPlan?.englishHours / weeksInMonth)
                        : "",
                }));
            }
        }
    }, [type, monthlyPlan, open, timeMeta.year, timeMeta.month]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setForm({
            type: "",
            incomeTarget: "",
            bidAmount: "",
            accountForBid: "",
            offeredProjectAmount: "",
            offeredTotalBudget: "",
            postsAmount: "",
            callsAmount: "",
            acquiredPeopleAmount: "",
            majorHours: "",
            englishHours: "",
        });
    };

    const onSubmit = async (payload) => {
        try {
            const res = await createPlan(payload).unwrap();
            showNotification("Plan created successfully!", "success")
            resetForm();
            onClose();
        } catch (err) {
            showNotification("Failed to create plan", "error")
            console.error("Failed to create plan", err);
        }
    };

    // Reset form when dialog closes
    useEffect(() => {
        if (!open) {
            resetForm();
        }
    }, [open]);

    const handleSubmit = async () => {
        const timeMeta = makePlanTimeMeta(type);
        const payload = {
            type: type,
            ...timeMeta,
            createdBy: userInfo._id,
            IncomePlan: form.incomeTarget,
            biddingPlan: {
                totalBidAmount: form.bidAmount,
                AccountForBid: form.accountForBid,
                offeredJobAmount: form.offeredProjectAmount,
                offeredTotalBudget: form.offeredTotalBudget,
            },
            realguyPlan: {
                postsNumber: form.postsAmount,
                callNumber: form.callsAmount,
                acquiredPeopleAmount: form.acquiredPeopleAmount,
            },
            qualificationPlan: {
                majorHours: form.majorHours,
                englishHours: form.englishHours,
            },
        };

        onSubmit(payload)
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                {/* Header */}
                <DialogTitle
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontWeight: 600,
                    }}
                >
                    {
                        type === "MONTH"
                            ? `${makePlanTimeMeta(type).year}.${makePlanTimeMeta(type).month} Monthly Plan`
                            : type === "WEEK"
                                ? `${makePlanTimeMeta(type).year}.${makePlanTimeMeta(type).month} Week ${makePlanTimeMeta(type).weekOfMonth} Plan`
                                : type === "DAY"
                                    ? `${makePlanTimeMeta(type).date} Daily Plan`
                                    : "Plan"
                    }
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    {type === "WEEK" && isLoadingMonthlyPlan && (
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <CircularProgress size={20} />
                            <Typography variant="body2" color="text.secondary">
                                Loading monthly plan data...
                            </Typography>
                        </Box>
                    )}
                    {type === "WEEK" && !isLoadingMonthlyPlan && !monthlyPlan && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            Monthly plan not found. Please create a monthly plan first.
                        </Alert>
                    )}
                    {/* Deposit Plan */}
                    <Typography fontWeight={600} mb={1}>
                        Income Plan
                    </Typography>
                    <TextField
                        fullWidth
                        label="Income Target ($)"
                        name="incomeTarget"
                        type="number"
                        value={form.incomeTarget}
                        onChange={handleChange}
                        margin="dense"
                    />
                    {/* Bidding Plan */}
                    <Typography fontWeight={600} mt={3} mb={1}>
                        Bidding Plan
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <TextField
                                fullWidth
                                name="bidAmount"
                                label="Bids Amount"
                                type="number"
                                value={form.bidAmount}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 3 }}>
                            <Autocomplete
                                options={accountsRes}
                                loading={accountsLoading}

                                getOptionLabel={(option) =>
                                    `${option.account_type} — ${option.account_content.email}`
                                }

                                isOptionEqualToValue={(option, value) =>
                                    option._id === value._id
                                }

                                value={
                                    accountsRes.find((a) => a._id === form.accountForBid) || null
                                }

                                onChange={(_, newValue) => {
                                    setForm((prev) => ({
                                        ...prev,
                                        accountForBid: newValue ? newValue._id : "",
                                    }));
                                }}

                                renderOption={(props, option) => (
                                    <li {...props} key={option._id}>
                                        <strong>{option.account_type}</strong>
                                        &nbsp;—&nbsp;
                                        {option.account_content.email}
                                    </li>
                                )}

                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Account For Bid"
                                        placeholder="Select account"
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {accountsLoading && <CircularProgress size={20} />}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 3 }}>
                            <TextField
                                fullWidth
                                name="offeredProjectAmount"
                                type="number"
                                label="Offered Projects Amount"
                                value={form.offeredProjectAmount}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 3 }}>
                            <TextField
                                fullWidth
                                name="offeredTotalBudget"
                                type="number"
                                label="Offered Total Budget ($)"
                                value={form.offeredTotalBudget}
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>

                    {/* Acquisition Plan */}
                    <Typography fontWeight={600} mt={3} mb={1}>
                        Realguy Plan
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                fullWidth
                                name="postsAmount"
                                label="Posts Amount"
                                type="number"
                                value={form.postsAmount}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                fullWidth
                                name="callsAmount"
                                label="Calls Amount"
                                type="number"
                                value={form.callsAmount}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                fullWidth
                                name="acquiredPeopleAmount"
                                label="Acquired People Amount"
                                type="number"
                                value={form.acquiredPeopleAmount}
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>

                    {/* Qualification Plan */}
                    <Typography fontWeight={600} mt={3} mb={1}>
                        Qualification Plan
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                name="majorHours"
                                label="Major (hours)"
                                type="number"
                                value={form.majorHours}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                name="englishHours"
                                label="English (hours)"
                                type="number"
                                value={form.englishHours}
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>

                {/* Actions */}
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={onClose} variant="outlined">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} variant="contained">
                        Create Plan
                    </Button>
                </DialogActions>
            </Dialog>
            <Notification {...notification} onClose={closeNotification} />
        </>
    );
}
