import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Button,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TablePagination,
    Stack,
    MenuItem,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";

import {
    useGetRealguyListQuery,
    useCreateRealguyMutation,
    useUpdateRealguyMutation,
    useDeleteRealguyMutation,
} from "../../slices/realguy/realguyApiSlice";

import { useGetUsersQuery } from "../../slices/member/usersApiSlice";
import Notification from "../../components/Basic/Notification";
import { CountryNames } from "../../constant/country";
import { useSelector } from "react-redux";

const emptyForm = {
    name: "",
    nationality: "",
    gender: "",
    user: "",
    catcher: "",
    when: "",
};

const RealguyScreen = () => {
    const { userInfo } = useSelector((state) => state.auth);

    /* -------------------- STATE -------------------- */
    const [formData, setFormData] = useState(emptyForm);
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState("create");
    const [editId, setEditId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const [selectedUser, setSelectedUser] = useState("");
    const [selectedCatcher, setSelectedCatcher] = useState("");
    const [fromMonth, setFromMonth] = useState("");
    const getCurrentMonth = () =>
        new Date().toISOString().slice(0, 7);

    const [toMonth, setToMonth] = useState(getCurrentMonth());

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    /* -------------------- DATA -------------------- */
    const { data: realguysRes = [] } = useGetRealguyListQuery();
    const { data: usersRes = [] } = useGetUsersQuery();

    const [createRealguy] = useCreateRealguyMutation();
    const [updateRealguy] = useUpdateRealguyMutation();
    const [deleteRealguy] = useDeleteRealguyMutation();

    /* -------------------- FILTERING -------------------- */
    const realguys = realguysRes.filter((item) => {
        const matchesUser = selectedUser
            ? item.user?._id === selectedUser
            : true;

        const matchesCatcher = selectedCatcher
            ? item.catcher?._id === selectedCatcher
            : true;

        if (!fromMonth && !toMonth) {
            return matchesUser && matchesCatcher;
        }

        if (!item.when) return false;

        const itemMonth = new Date(item.when).toISOString().slice(0, 7);

        const isAfterFrom = fromMonth ? itemMonth >= fromMonth : true;
        const isBeforeTo = toMonth ? itemMonth <= toMonth : true;

        return matchesUser && matchesCatcher && isAfterFrom && isBeforeTo;
    });



    useEffect(() => setPage(0), [selectedUser, selectedCatcher, fromMonth, toMonth]);

    /* -------------------- PAGINATION -------------------- */
    const paginatedRealguy = realguys.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    /* -------------------- HANDLERS -------------------- */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            if (mode === "edit") {
                await updateRealguy({ id: editId, data: formData }).unwrap();
            } else {
                await createRealguy(formData).unwrap();
            }
            setOpen(false);
            setFormData(emptyForm);
        } catch (err) {
            showNotification("Operation failed", "error");
        }
    };

    /* -------------------- NOTIFICATION -------------------- */
    const [notification, setNotification] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const showNotification = (message, severity = "success") =>
        setNotification({ open: true, message, severity });

    const closeNotification = () =>
        setNotification((prev) => ({ ...prev, open: false }));

    /* -------------------- UI -------------------- */
    return (
        <Box className="mx-3 my-5" style={{ width: "calc(100vw-240px)" }}>
            <Typography variant="h4" gutterBottom>
                Realguys
            </Typography>

            {/* ACTION BAR */}
            <Stack direction="row" spacing={2} mb={3}>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => {
                        setMode("create");
                        setEditId(null);
                        setFormData(emptyForm);
                        setOpen(true);
                    }}
                >
                    Add Realguy
                </Button>

                <TextField
                    select
                    size="small"
                    label="Filter by User"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    sx={{ minWidth: 200 }}
                >
                    <MenuItem value="">All Users</MenuItem>
                    {usersRes.map((u) => (
                        <MenuItem key={u._id} value={u._id}>
                            {u.name}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    select
                    size="small"
                    label="Filter by Catcher"
                    value={selectedCatcher}
                    onChange={(e) => setSelectedCatcher(e.target.value)}
                    sx={{ minWidth: 200 }}
                >
                    <MenuItem value="">All Catchers</MenuItem>
                    {usersRes.map((u) => (
                        <MenuItem key={u._id} value={u._id}>
                            {u.name}
                        </MenuItem>
                    ))}
                </TextField>


                <TextField
                    size="small"
                    type="month"
                    label="From Month"
                    InputLabelProps={{ shrink: true }}
                    value={fromMonth}
                    onChange={(e) => setFromMonth(e.target.value)}
                />

                <TextField
                    size="small"
                    type="month"
                    label="To Month"
                    InputLabelProps={{ shrink: true }}
                    value={toMonth}
                    onChange={(e) => setToMonth(e.target.value)}
                />
            </Stack>

            {/* TABLE */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>No</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Nationality</TableCell>
                            <TableCell>Gender</TableCell>
                            <TableCell>User</TableCell>
                            <TableCell>Catcher</TableCell>
                            <TableCell>When</TableCell>
                            {userInfo.role === "admin" && (<TableCell>Actions</TableCell>)}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {paginatedRealguy.map((item, index) => (
                            <TableRow key={item._id}>
                                <TableCell>
                                    {page * rowsPerPage + index + 1}
                                </TableCell>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{item.nationality}</TableCell>
                                <TableCell>{item.gender}</TableCell>
                                <TableCell>{item.user?.name}</TableCell>
                                <TableCell>{item.catcher?.name}</TableCell>
                                <TableCell>
                                    {item.when
                                        ? new Date(item.when).toLocaleDateString()
                                        : "-"}
                                </TableCell>

                                {userInfo.role === "admin" && (<TableCell>
                                    <IconButton
                                        onClick={() => {
                                            setMode("edit");
                                            setEditId(item._id);
                                            setFormData({
                                                name: item.name,
                                                nationality: item.nationality,
                                                gender: item.gender,
                                                user: item.user?._id || "",
                                                catcher: item.catcher?._id || "",
                                                when: item.when
                                                    ? new Date(item.when).toISOString().split("T")[0]
                                                    : "",
                                            });
                                            setOpen(true);
                                        }}
                                    >
                                        <Edit color="primary" />
                                    </IconButton>

                                    <IconButton onClick={() => setDeleteId(item._id)}>
                                        <Delete color="error" />
                                    </IconButton>
                                </TableCell>)}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* PAGINATION */}
            <Box display="flex" justifyContent="flex-end" mt={2}>
                <TablePagination
                    component="div"
                    count={realguys.length}
                    page={page}
                    onPageChange={(e, p) => setPage(p)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    shape="rounded"
                    showFirstButton
                    showLastButton
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    sx={{
                        ".MuiTablePagination-toolbar": {
                            paddingLeft: 0,
                            paddingRight: 0,
                        },
                        ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
                            fontSize: "1rem",
                        },
                        "p.MuiTablePagination-selectLabel": {
                            marginTop: "0.3rem",
                            marginBottom: "0.3rem"
                        },
                        "p.MuiTablePagination-displayedRows": {
                            marginTop: "0.3rem",
                            marginBottom: "0.3rem"
                        }
                    }}
                />
            </Box>

            <Notification {...notification} onClose={closeNotification} />

            {/* ADD / EDIT DIALOG */}
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>
                    {mode === "create" ? "Add Realguy" : "Edit Realguy"}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField label="Name" name="name" value={formData.name} onChange={handleChange} />
                        <TextField
                            select
                            label="Nationality"
                            name="nationality"
                            value={formData.nationality}
                            onChange={handleChange}
                        >
                            {CountryNames.map((country) => (
                                <MenuItem key={country} value={country}>
                                    {country}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField select label="Gender" name="gender" value={formData.gender} onChange={handleChange}>
                            <MenuItem value="male">Male</MenuItem>
                            <MenuItem value="female">Female</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                        </TextField>

                        <TextField
                            select label="User"
                            name="user"
                            value={userInfo.role === "admin"
                                ? formData.user
                                : userInfo._id}
                            onChange={handleChange}
                            fullWidth
                            disabled={userInfo.role !== "admin"}
                        >
                            {usersRes.map((u) => (
                                <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="Catcher"
                            name="catcher"
                            value={userInfo.role === "admin"
                                ? formData.catcher
                                : userInfo._id}
                            onChange={handleChange}
                            disabled={userInfo.role !== "admin"}
                        >
                            {usersRes.map((u) => (
                                <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="When"
                            name="when"
                            type="date"
                            value={formData.when}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit}>
                        {mode === "create" ? "Save" : "Update"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* DELETE */}
            <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
                <DialogTitle>Delete Realguy</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setDeleteId(null)}>Cancel</Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={async () => {
                            await deleteRealguy(deleteId);
                            setDeleteId(null);
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default RealguyScreen;
