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
  Tabs,
  Tab,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import Autocomplete from "@mui/material/Autocomplete";

import {
  useGetServiceListQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} from "../../slices/service/serviceApiSlice";

import { useGetUsersQuery } from "../../slices/member/usersApiSlice";
import { useGetGroupsQuery } from "../../slices/group/groupApiSlice";
import { useGetAccountsQuery } from "../../slices/account/accountApiSlice";
import Notification from "../../components/Basic/Notification";
import { useSelector } from "react-redux";

const emptyForm = {
  serve_name: "",
  serve_unit: null,
  serve_member: null,
  serve_account: null,
  due_date: "",
};

const getCurrentMonth = () =>
  new Date().toISOString().slice(0, 7);

const ServiceScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);

  /* -------------------- STATE -------------------- */
  const [formData, setFormData] = useState(emptyForm);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [activeServeName, setActiveServeName] = useState("all");

  const [selectedMember, setSelectedMember] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [fromMonth, setFromMonth] = useState("");
  const [toMonth, setToMonth] = useState(getCurrentMonth());

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  /* -------------------- DATA -------------------- */
  const { data: servicesRes = [] } = useGetServiceListQuery();
  const { data: usersRes = [] } = useGetUsersQuery();
  const { data: groupsRes = [] } = useGetGroupsQuery();
  const { data: accountsRes = [] } = useGetAccountsQuery();

  const [createService] = useCreateServiceMutation();
  const [updateService] = useUpdateServiceMutation();
  const [deleteService] = useDeleteServiceMutation();

  /** ----- Tabs structure ----- */

  const serveNameList = React.useMemo(() => {
    return Array.from(
      new Set(
        servicesRes
          .map(s => s.serve_name)
          .filter(Boolean)
      )
    );
  }, [servicesRes]);

  const serveNameCount = serveNameList.length;

  /* -------------------- FILTERING -------------------- */
  const services = servicesRes.filter((item) => {
    const matchServeName =
      activeServeName === "all"
        ? true
        : item.serve_name === activeServeName;

    const matchesMember = selectedMember
      ? item.serve_member?._id === selectedMember
      : true;

    const matchesUnit = selectedUnit
      ? item.serve_unit?._id === selectedUnit
      : true;

    const matchAccount = selectedAccount
      ? item.serve_account?._id === selectedAccount
      : true;

    if (!item.due_date) return false;

    const itemMonth = new Date(item.due_date)
      .toISOString()
      .slice(0, 7);

    const isAfterFrom = fromMonth ? itemMonth >= fromMonth : true;
    const isBeforeTo = toMonth ? itemMonth <= toMonth : true;

    return (
      matchServeName &&
      matchesMember &&
      matchesUnit &&
      matchAccount &&
      isAfterFrom &&
      isBeforeTo
    );
  });

  useEffect(() => {
    if (
      selectedMember ||
      selectedUnit ||
      selectedAccount ||
      fromMonth ||
      toMonth
    ) {
      setPage(0);
    }
  }, [
    selectedMember,
    selectedUnit,
    selectedAccount,
    fromMonth,
    toMonth,
  ]);

  /* -------------------- PAGINATION -------------------- */
  const paginatedServices = services.slice(
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
      const payload = {
        ...formData,
        serve_member: formData.serve_member || undefined,
        serve_unit: formData.serve_unit || undefined,
        serve_account: formData.serve_account || undefined,
      };

      if (mode === "edit") {
        await updateService({ id: editId, data: payload }).unwrap();
      } else {
        await createService(payload).unwrap();
      }
      setOpen(false);
      setFormData(emptyForm);
    } catch {
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
        Services
      </Typography>

      {/* ACTION BAR */}
      <Stack direction="row" spacing={2} mb={3}>
        {userInfo.role === "admin" && (<Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setMode("create");
            setEditId(null);
            setFormData(emptyForm);
            setOpen(true);
          }}
        >
          Add Service
        </Button>)}

        <Autocomplete
          size="small"
          sx={{ minWidth: 180 }}
          options={[...usersRes].sort((a, b) => a.name.localeCompare(b.name))}
          getOptionLabel={(option) => option.name || ""}
          value={usersRes.find(u => u._id === selectedMember) || null}
          onChange={(e, newValue) => {
            setSelectedMember(newValue?._id || "");
          }}
          renderInput={(params) => (
            <TextField {...params} label="Filter by Member" />
          )}
        />

        <Autocomplete
          size="small"
          sx={{ minWidth: 150 }}
          options={[...groupsRes].sort((a, b) => a.name.localeCompare(b.name))}
          getOptionLabel={(option) => option.name || ""}
          value={groupsRes.find(g => g._id === selectedUnit) || null}
          onChange={(e, newValue) => {
            setSelectedUnit(newValue?._id || "");
          }}
          renderInput={(params) => (
            <TextField {...params} label="Filter by Unit" />
          )}
        />


        <Autocomplete
          size="small"
          sx={{ minWidth: 180 }}
          options={accountsRes}
          getOptionLabel={(option) =>
            `${option.account_content?.email || ""}`
          }
          value={
            accountsRes.find(a => a._id === selectedAccount) || null
          }
          onChange={(e, newValue) => {
            setSelectedAccount(newValue?._id || "");
          }}
          renderInput={(params) => (
            <TextField {...params} label="Filter by Account" />
          )}
        />

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

      {/* <Tabs
        value={activeServeName}
        onChange={(e, newValue) => {
          setActiveServeName(newValue);
          setPage(0);
        }}
        sx={{ mb: 2 }}
      >
        {serveNameList.map((name) => (
          <Tab
            key={name}
            label={name}
            value={name}
          />
        ))}
      </Tabs> */}

      {/* TABLE */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>No</TableCell>
              <TableCell>Service Name</TableCell>
              <TableCell>Group</TableCell>
              <TableCell>Account</TableCell>
              <TableCell>Due Date</TableCell>
              {userInfo.role === "admin" && (<TableCell>Actions</TableCell>)}
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedServices.map((item, index) => (
              <TableRow key={item._id}>
                <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                <TableCell>{item.serve_name}</TableCell>
                <TableCell>{item.serve_unit?.name}</TableCell>
                <TableCell>
                  {item.serve_account ? (
                    <>
                      <span style={{ fontSize: 12, color: "#666" }}>
                        {item.serve_account.account_content?.email}
                      </span>
                    </>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  {item.due_date
                    ? new Date(item.due_date).toLocaleDateString()
                    : "-"}
                </TableCell>
                {userInfo.role === "admin" && (<TableCell>
                  <IconButton
                    onClick={() => {
                      setMode("edit");
                      setEditId(item._id);
                      setFormData({
                        serve_name: item.serve_name,
                        serve_unit: item.serve_unit?._id || "",
                        serve_member: item.serve_member?._id || "",
                        serve_account: item.serve_account?._id || "",
                        due_date: item.due_date
                          ? new Date(item.due_date)
                            .toISOString()
                            .split("T")[0]
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
          count={services.length}
          page={page}
          onPageChange={(e, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
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
          {mode === "create" ? "Add Service" : "Edit Service"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Service Name"
              name="serve_name"
              value={formData.serve_name}
              onChange={handleChange}
            />

            <Autocomplete
              options={groupsRes}
              getOptionLabel={(option) => option.name || ""}
              value={groupsRes.find(g => g._id === formData.serve_unit) || null}
              onChange={(e, newValue) => {
                setFormData(prev => ({
                  ...prev,
                  serve_unit: newValue?._id || ""
                }));
              }}
              renderInput={(params) => (
                <TextField {...params} label="Group" />
              )}
            />

            <Autocomplete
              options={usersRes}
              getOptionLabel={(option) => option.name || ""}
              value={usersRes.find(u => u._id === formData.serve_member) || null}
              onChange={(e, newValue) => {
                setFormData(prev => ({
                  ...prev,
                  serve_member: newValue?._id || ""
                }));
              }}
              renderInput={(params) => (
                <TextField {...params} label="Member" />
              )}
            />

            <Autocomplete
              options={accountsRes}
              getOptionLabel={(option) =>
                `${option.account_content?.email || ""}`
              }
              value={
                accountsRes.find(a => a._id === formData.serve_account) || null
              }
              onChange={(e, newValue) => {
                setFormData(prev => ({
                  ...prev,
                  serve_account: newValue?._id || ""
                }));
              }}
              renderOption={(props, option) => (
                <li {...props} key={option._id}>
                  {option.account_content?.email}
                </li>
              )}
              renderInput={(params) => (
                <TextField {...params} label="Account" />
              )}
            />

            <TextField
              label="Due Date"
              name="due_date"
              type="date"
              value={formData.due_date}
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
        <DialogTitle>Delete Service</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              await deleteService(deleteId);
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

export default ServiceScreen;
