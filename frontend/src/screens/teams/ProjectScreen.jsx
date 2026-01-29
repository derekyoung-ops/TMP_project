import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Stack,
  MenuItem,
  ListSubheader,
  Divider,
  TablePagination,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useUpdateProjectMutation,
} from "../../slices/project/projectApiSlice";
import Notification from "../../components/Basic/Notification";
import { useGetUsersQuery } from "../../slices/member/usersApiSlice";
import { CountryNames } from "../../constant/country";
import { useSelector } from "react-redux";

export default function ProjectsPage() {
  const { userInfo } = useSelector((state) => state.auth);
  const { data: projects = [], isLoading, error } = useGetProjectsQuery();
  const [createProject] = useCreateProjectMutation();
  const [updateProject] = useUpdateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data: usersRes } = useGetUsersQuery();
  const users = usersRes || [];

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    handler: "",
    startDate: "",
    DueDate: "",
    site: "",
    note: "",
    client_info: { name: "", nationality: "" },
    budget: {
      method: "fixed",
      amount: ""
    },
  });

  /* -------------------- PAGINATION -------------------- */
  const paginatedProjects = projects.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const [filters, setFilters] = useState({
    keyword: "",
    handler: "",
    startFrom: "",
    startTo: "",
  });

  useEffect(() => {
    setPage(0);
  }, [filters.keyword, filters.handler, filters.startFrom, filters.startTo]);

  const [mode, setMode] = useState("create"); // "create" | "edit"
  const [editingId, setEditingId] = useState(null);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const filteredProjects = projects.filter((p) => {
    const matchKeyword =
      p.title.toLowerCase().includes(filters.keyword.toLowerCase()) ||
      p.client_info?.name?.toLowerCase().includes(filters.keyword.toLowerCase());

    const matchHandler =
      !filters.handler || p.handler?._id === filters.handler;

    const projectDate = new Date(p.startDate);
    const matchFrom =
      !filters.startFrom || projectDate >= new Date(filters.startFrom);
    const matchTo =
      !filters.startTo || projectDate <= new Date(filters.startTo);

    return matchKeyword && matchHandler && matchFrom && matchTo;
  });

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

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("client_info.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        client_info: { ...prev.client_info, [key]: value },
      }));
    } else if (name.startsWith("budget")) {
      const key = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        budget: { ...prev.budget, [key]: value },
      }));
    }
    else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        budget: {
          method: form.budget.method,
          amount: Number(form.budget.amount)
        },
      }

      if (mode === "create") {
        await createProject(payload).unwrap();
        showNotification("Project created successfully");
      } else {
        await updateProject({ id: editingId, data: payload }).unwrap();
        showNotification("Project updated successfully");
      }

      setOpen(false);
      setEditingId(null);
    } catch (err) {
      showNotification("Operation failed", "error");
    }
  };

  const handleDelete = async (id) => {
    await deleteProject(id);
  }

  return (
    <Box className="mx-3 my-5" style={{ width: "calc(100vw-240px)" }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Projects
      </Typography>

      {/* {isLoading && <Noticement type="loading" message="Loading projects..." />}
      {error && <Noticement type="error" message="Failed to load projects" />} */}

      <Stack direction="row" justifyContent="flex-start" mb={2}>
        <Button
          variant="contained"
          onClick={() => {
            setMode("create");
            setEditingId(null);
            setForm({
              title: "",
              handler: "",
              bidder: "",
              startDate: "",
              DueDate: "",
              site: "",
              note: "",
              client_info: { name: "", nationality: "" },
              budget: { method: "fixed", amount: "" },
            });
            setOpen(true);
          }}
        >
          Register Project
        </Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>

          {/* Search */}
          <TextField
            label="Search Project"
            name="keyword"
            value={filters.keyword}
            onChange={handleFilterChange}
            placeholder="Title / Client"
            fullWidth
          />

          {/* Handler filter */}
          <TextField
            select
            label="Handler"
            name="handler"
            value={filters.handler}
            onChange={handleFilterChange}
            fullWidth
          >
            <MenuItem value="">All</MenuItem>
            {users.map((user, index) => (
              <MenuItem key={index} value={user._id}>
                {user.name}
              </MenuItem>
            ))}
          </TextField>

          {/* Date from */}
          <TextField
            type="date"
            label="Start From"
            name="startFrom"
            value={filters.startFrom}
            onChange={handleFilterChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          {/* Date to */}
          <TextField
            type="date"
            label="Start To"
            name="startTo"
            value={filters.startTo}
            onChange={handleFilterChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Stack>
      </Paper>

      {!isLoading && !error && (
        <Paper elevation={2}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>No</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>Due Date</TableCell>
                {userInfo.role === "admin" && (<TableCell align="right">Action</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedProjects.map((project, index) => (
                <TableRow key={project._id} hover>
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>{project.title}</TableCell>
                  <TableCell>{project.client_info?.name}</TableCell>
                  <TableCell>
                    {project.startDate
                      ? new Date(project.startDate).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {project.DueDate
                      ? new Date(project.DueDate).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  {userInfo.role === "admin" && (<TableCell align="center">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => {
                        setMode("edit");
                        setEditingId(project._id);
                        setForm({
                          title: project.title,
                          handler: project.handler?._id || project.handler || "",
                          bidder: project.bidder?._id || "",
                          startDate: project.startDate?.slice(0, 10),
                          DueDate: project.DueDate?.slice(0, 10),
                          site: project.site || "",
                          note: project.note || "",
                          client_info: {
                            name: project.client_info?.name || "",
                            nationality: project.client_info?.nationality || "",
                          },
                          budget: {
                            method: project.budget?.method || "fixed",
                            amount: project.budget?.amount || "",
                          }
                        });
                        setOpen(true);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>

                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(project._id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>)}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Register Project Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {mode === "create" ? "Register Project" : "Edit Project"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>

            {/* Title */}
            <TextField
              id="project-title"
              label="Title"
              name="title"
              disabled={mode === "edit"}
              value={form.title}
              onChange={handleChange}
              fullWidth
              required
            />

            {/* Bidder */}
            <TextField
              id="project-bidder"
              select
              label="Bidder"
              name="bidder"
              value={
                userInfo.role === "admin"
                  ? form.bidder
                  : userInfo._id
              }
              onChange={handleChange}
              disabled={userInfo.role !== "admin"}
              fullWidth
            >
              {users.map((user) => (
                <MenuItem key={user._id} value={user._id}>
                  {user.name}
                </MenuItem>
              ))}
            </TextField>

            {/* Handler */}
            <TextField
              select
              id="handler"
              name="handler"
              label="Handler"
              value={userInfo.role === "admin"
                ? form.handler
                : userInfo._id}
              onChange={handleChange}
              required
              disabled={userInfo.role !== "admin"}
              fullWidth
              InputLabelProps={{
                htmlFor: "handler",
              }}
              SelectProps={{
                inputProps: {
                  id: "handler",
                  name: "handler",
                },
              }}
            >
              <ListSubheader>Team Members</ListSubheader>
              {users.map((user) => (
                <MenuItem key={user._id} value={user._id}>
                  {user.name}
                </MenuItem>
              ))}


              <Divider />


              <ListSubheader>External</ListSubheader>
              <MenuItem value="outsourcing">Outsourcing</MenuItem>
            </TextField>

            {/* Client Name */}
            <TextField
              id="client-name"
              label="Client Name"
              name="client_info.name"
              value={form.client_info?.name || ""}
              onChange={handleChange}
              fullWidth
              required
            />

            {/* Client Nationality */}
            <TextField
              id="client-nationality"
              select
              label="Nationality"
              name="client_info.nationality"
              value={form.client_info?.nationality || ""}
              onChange={handleChange}
              fullWidth
              required
            >
              {CountryNames.map((country) => (
                <MenuItem key={country} value={country}>
                  {country}
                </MenuItem>
              ))}
            </TextField>

            {/* Dates */}
            <Stack direction="row" spacing={2}>
              <TextField
                id="project-start-date"
                type="date"
                label="Start Date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
                fullWidth
              />

              <TextField
                id="project-due-date"
                type="date"
                label="Due Date"
                name="DueDate"
                value={form.DueDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Stack>

            {/* Site */}
            <TextField
              id="project-site"
              label="Site"
              name="site"
              value={form.site}
              onChange={handleChange}
              fullWidth
            />

            {/* Budget */}
            <Stack direction="row" spacing={2}>
              <TextField
                id="budget-method"
                select
                label="Budget Type"
                name="budget.method"
                value={form.budget.method}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="fixed">Fixed</MenuItem>
                <MenuItem value="hourly">Hourly</MenuItem>
              </TextField>

              <TextField
                id="budget-amount"
                type="number"
                label={form.budget.method === "hourly" ? "Hourly Rate" : "Total Budget"}
                name="budget.amount"
                value={form.budget.amount}
                onChange={handleChange}
                fullWidth
                required
                inputProps={{ min: 0 }}
              />
            </Stack>

          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {mode === "create" ? "Save" : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={closeNotification}
      />

      <Box display="flex" justifyContent="flex-end" mt={2}>
        <TablePagination
          component="div"
          count={filteredProjects.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          showFirstButton
          showLastButton
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
