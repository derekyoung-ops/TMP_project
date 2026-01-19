import { useState } from "react";
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

export default function ProjectsPage() {
  const { data: projects = [], isLoading, error } = useGetProjectsQuery();
  const [createProject] = useCreateProjectMutation();
  const [updateProject] = useUpdateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();

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
  });

  const [filters, setFilters] = useState({
    keyword: "",
    handler: "",
    startFrom: "",
    startTo: "",
  });

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
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    try {
      if (mode === "create") {
        await createProject(form).unwrap();
        showNotification("Project created successfully");
      } else {
        await updateProject({ id: editingId, data: form }).unwrap();
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
    <div className="mx-3 my-5" style={{width: "100vw"}}>
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
            {users.map((u) => (
              <MenuItem key={u._id} value={u._id}>
                {u.name}
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
                <TableCell>Title</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow key={project._id} hover>
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
                  <TableCell align="right">
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
                  </TableCell>
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
            <TextField 
              label="Title"
              name="title"
              disabled={mode === "edit"}
              value={form.title}
              onChange={handleChange}
            />
            <TextField
              select
              label="Bidder"
              name="bidder"
              value={form.bidder}
              onChange={handleChange}
              fullWidth
            >
              {users.map((user) => (
                <MenuItem key={user._id} value={user._id}>
                  {user.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Handler"
              name="handler"
              value={form.handler}
              onChange={handleChange}
              required
              fullWidth
            >
              {/* Team members */}
              <ListSubheader>Team Members</ListSubheader>
              {users.map((user) => (
                <MenuItem key={user._id} value={user._id}>
                  {user.name}
                </MenuItem>
              ))}

              <Divider />

              {/* Outsourcing option */}
              <ListSubheader>External</ListSubheader>
              <MenuItem value="outsourcing">
                Outsourcing
              </MenuItem>
            </TextField>
            <TextField label="Client Name" name="client_info.name" value={form.client_info.name} onChange={handleChange} />
            <TextField
              select
              label="Nationality"
              name="client_info.nationality"
              value={form.client_info.nationality}
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

            <Stack direction="row" spacing={2}>
              <TextField type="date" label="Start Date" name="startDate" value={form.startDate} onChange={handleChange} InputLabelProps={{ shrink: true }} required fullWidth />
              <TextField type="date" label="Due Date" name="DueDate" value={form.DueDate} onChange={handleChange} InputLabelProps={{ shrink: true }} required fullWidth />
            </Stack>
            <TextField label="Site" name="site" value={form.site} onChange={handleChange} />
            <TextField label="Note" name="note" value={form.note} onChange={handleChange} multiline rows={3} />
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
    </div>
  );
};
