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
  DialogContentText,
  DialogActions,
  TablePagination,
  Stack,
  MenuItem,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";

import {
  useGetAccountsQuery,
  useCreateAccountMutation,
  useUpdateAccountMutation,
  useDeleteAccountMutation,
} from "../../slices/account/accountApiSlice";

import Notification from "../../components/Basic/Notification";
import { useGetUsersQuery } from "../../slices/member/usersApiSlice";
import { getAccountTypeIcon } from "../../utils/accountTypeIcon";
import { useSelector } from "react-redux";

const emptyForm = {
  account_type: "",
  account_user: "",
  account_content: {
    email: "",
    phone_number: "",
    password: "",
    status: "",
    two_step: "",
    note: "",
  },
};

const AccountScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState(emptyForm);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create"); // create | edit
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data: accountsRes = [] } = useGetAccountsQuery();
  const accounts = accountsRes.filter((item) => {
    const matchesSearch = search
      ? `${item.account_type} ${item.account_user?.name} ${item.account_content?.email}`
        .toLowerCase()
        .includes(search.toLowerCase())
      : true;

    const matchesUser = selectedUser
      ? item.account_user?._id === selectedUser
      : true;

    return matchesSearch && matchesUser;
  });

  useEffect(() => {
    setPage(0);
  }, [search, selectedUser]);

  const { data: usersRes } = useGetUsersQuery();
  const users = usersRes || [];

  useEffect(() => setPage(0), [search]);

  const [createAccount] = useCreateAccountMutation();
  const [updateAccount] = useUpdateAccountMutation();
  const [deleteAccount] = useDeleteAccountMutation();

  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showNotification = (message, severity = "success") =>
    setNotification({ open: true, message, severity });

  const closeNotification = () =>
    setNotification((prev) => ({ ...prev, open: false }));

  // ✅ Proper dot-notation handler
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("account_content.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        account_content: { ...prev.account_content, [key]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {

    try {
      if (mode === "edit") {
        await updateAccount({ id: editId, data: formData }).unwrap();
        showNotification("Account updated successfully!");
      } else {
        await createAccount(formData).unwrap();
        showNotification("Account created successfully!");
      }
      setOpen(false);
      setFormData(emptyForm);
    } catch (err) {
      showNotification(err?.data?.message || err.error, "error");
    }
  };

  const paginatedAccounts = accounts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleDeleteConfirm = async () => {
    try {
      await deleteAccount(deleteId).unwrap();
      showNotification("Account deleted successfully!");
      setDeleteId(null);
    } catch (err) {
      showNotification("Failed to delete account", "error");
    }
  };

  return (
    <Box className="mx-3 my-5" style={{ width: "calc(100vw-240px)" }}>
      <Typography variant="h4" gutterBottom>
        Accounts
      </Typography>

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
        Add Account
      </Button>

      <TextField
        size="small"
        label="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ ml: 2 }}
      />

      <TextField
        select
        size="small"
        label="Filter by User"
        value={selectedUser}
        onChange={(e) => setSelectedUser(e.target.value)}
        sx={{ ml: 2, minWidth: 200 }}
      >
        <MenuItem value="">All Users</MenuItem>
        {users.map((user) => (
          <MenuItem key={user._id} value={user._id}>
            {user.name}
          </MenuItem>
        ))}
      </TextField>

      {/* TABLE */}
      <TableContainer component={Paper} sx={{ mt: 5 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              {userInfo.role === "admin" && (<TableCell>Actions</TableCell>)}
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedAccounts.map((acc) => (
              <TableRow key={acc._id}>
                <TableCell>
                  <Box color='text.secondary' display="flex" alignItems="center" gap={1}>
                    {getAccountTypeIcon(acc.account_type, 18)}
                    <Typography variant="body2">
                      {acc.account_type}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{acc.account_user?.name}</TableCell>
                <TableCell>{acc.account_content?.email}</TableCell>
                <TableCell>{acc.account_content?.status}</TableCell>
                {userInfo.role === "admin" && (<TableCell>
                  <IconButton
                    onClick={() => {
                      setMode("edit");
                      setEditId(acc._id);
                      setFormData({
                        account_type: acc.account_type,
                        account_user: acc.account_user?._id || "",
                        account_content: {
                          email: acc.account_content?.email || "",
                          phone_number: acc.account_content?.phone_number || "",
                          password: acc.account_content?.password || "",
                          status: acc.account_content?.status || "",
                          two_step: acc.account_content?.two_step || "",
                          note: acc.account_content?.note || "",
                        },
                      });
                      setOpen(true);
                    }}
                  >
                    <Edit color="primary" />
                  </IconButton>

                  <IconButton onClick={() => setDeleteId(acc._id)}>
                    <Delete color="error" />
                  </IconButton>
                </TableCell>)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Notification {...notification} onClose={closeNotification} />

      {/* ADD / EDIT DIALOG */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{mode === "create" ? "Add Account" : "Edit Account"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Account Type" name="account_type" value={formData.account_type} onChange={handleChange} />
            <TextField
              select
              label="Account User"
              name="account_user"
              value={
                userInfo.role === "admin"
                  ? formData.account_user
                  : userInfo._id
              }
              onChange={handleChange}
              fullWidth
              disabled={userInfo.role !== "admin"} // 🔒 important
            >
              {users.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.name}
                  </MenuItem>
                ))
              }
            </TextField>
            <TextField label="Email" name="account_content.email" value={formData.account_content.email} onChange={handleChange} />
            <TextField label="Phone" name="account_content.phone_number" value={formData.account_content.phone_number} onChange={handleChange} />
            <TextField label="Password" name="account_content.password" value={formData.account_content.password} onChange={handleChange} />
            <TextField label="Two_step" name="account_content.two_step" value={formData.account_content.two_step} onChange={handleChange} />
            <TextField select label="Status" name="account_content.status" value={formData.account_content.status} onChange={handleChange}>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
            <TextField label="Note" name="account_content.note" value={formData.account_content.note} onChange={handleChange} multiline rows={3} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {mode === "create" ? "Save" : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE CONFIRM */}
      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this account?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Box display="flex" justifyContent="flex-end" mt={2}>
        <TablePagination
          component="div"
          count={accounts.length}
          page={page}
          onPageChange={(e, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(e.target.value);
            setPage(0);
          }}
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
    </Box>
  );
};

export default AccountScreen;
