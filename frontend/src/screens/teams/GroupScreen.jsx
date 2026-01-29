import React, { useMemo, useState } from "react";
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
  Stack,
  MenuItem,
  CircularProgress,
  Chip,
  Tooltip,
  Avatar,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SettingsIcon from "@mui/icons-material/Settings";
import DeleteIcon from "@mui/icons-material/Delete";
import { useCreateGroupMutation, useDeleteGroupMutation, useGetGroupsQuery, useUpdateGroupMutation } from "../../slices/group/groupApiSlice";
import { useGetUsersQuery } from "../../slices/member/usersApiSlice";
import Notification from "../../components/Basic/Notification";
import { useSelector } from "react-redux";

const GroupScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const [search, setSearch] = useState("");
  const [managerFilter, setManagerFilter] = useState("");
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    manager: "",
    members: [],
  });

  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [editData, setEditData] = useState({
    name: "",
    manager: "",
    members: [],
  })

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);

  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success", // success | error | warning | info
  });

  // 🔥 DATA FROM REDUCER (RTK QUERY)
  const {
    data: groups = [],
    isLoading,
    error
  } = useGetGroupsQuery();

  const [createGroup, { isLoading: isCreating }] =
    useCreateGroupMutation();

  const [updateGroup, { isLoading: isUpdating }] =
    useUpdateGroupMutation();

  const [deleteGroup, { isLoading: isDeleting }] =
    useDeleteGroupMutation();

  const {
    data: users = [],
    isLoading: usersLoading,
    error: usersError,
  } = useGetUsersQuery();

  const idle_users = users.filter((user) => user.group === null);

  const managers = useMemo(
    () => [...new Set(groups.map((g) => g.manager?.name))],
    [groups]
  );

  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const filteredGroups = useMemo(() => {
    const searchLower = search.toLowerCase().trim();

    return groups.filter((group) => {
      // SEARCH
      const searchMatch =
        !searchLower ||
        group.name.toLowerCase().includes(searchLower) ||
        group.members?.some((m) =>
          m.name.toLowerCase().includes(searchLower)
        );

      // MANAGER FILTER
      const managerMatch =
        !managerFilter || group.manager?.name === managerFilter;

      // MUST MATCH ALL ACTIVE FILTERS
      return searchMatch && managerMatch;
    });
  }, [groups, search, managerFilter]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "members"
        ? (Array.isArray(value) ? value : [])
        : value,
    }));
  };

  const handleSaveGroup = async () => {
    try {
      if (!selectedGroup?._id) return;

      const payload = {
        name: editData.name,
        manager: editData.manager || null,
        members: editData.members || [],
      };

      await updateGroup({
        id: selectedGroup._id,
        body: payload,
      }).unwrap();

      showNotification("Group updated successfully");

      setEditMode(false);
      setOpenViewModal(false);
    } catch (err) {
      showNotification(err?.data?.message || "Failed to update group", "error");
    }
  }

  const handleCreateGroup = async () => {
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        manager: formData.manager || null,
        members: formData.members || [],
      };


      // TODO: call RTK createGroup mutation here
      await createGroup(payload).unwrap();

      showNotification("Group created successfully");

      setFormData({
        name: "",
        description: "",
        manager: "",
        members: [],
      });

      setOpenCreateModal(false);
    } catch (err) {
      showNotification(err?.data?.message || "Failed to create group", "error");
    }
  }

  const membersValue = Array.isArray(formData.members) ? formData.members : [];

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error">
        Failed to load groups
      </Typography>
    );
  }

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

  const handleViewGroup = (groupId) => {
    const group = groups.find((g) => g._id === groupId);
    if (!group) return;

    setSelectedGroup(group);
    setEditData({
      name: group.name,
      manager: group.manager?._id || "",
      members: group.members?.map((m) => m._id) || [],
    });
    setEditMode(false);
    setOpenViewModal(true);
    // navigate(`/groups/${groupId}`) OR open modal
  };

  const confirmDeleteGroup = async () => {
    if (!groupToDelete[0]?._id) return;

    try {
      await deleteGroup(groupToDelete[0]._id).unwrap();
      showNotification("Group deleted successfully");
      setOpenDeleteDialog(false);
      setGroupToDelete(null);
    } catch (err) {
      showNotification(err?.data?.message || "Failed to delete group", "error");
    }
  };

  const handleDeleteGroup = (groupId) => {
    const del_group = groups.filter((g) => g._id === groupId);
    setGroupToDelete(del_group);
    setOpenDeleteDialog(true);
  };

  return (
    <Box className="mx-3 my-5" style={{ width: "calc(100vw-240px)" }}>
      <Box>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" mb={3}>
          <Typography variant="h4" fontWeight="bold">
            Group
          </Typography>

          {userInfo.role === "admin" &&
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreateModal(true)}>
              Create Group
            </Button>
          }
        </Stack>

        {/* Search & Filter */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}>
          <TextField
            id="group-search"
            fullWidth
            label="Search by Group or Member"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <TextField
            id="manager-filter"
            select
            label="Filter by Manager"
            value={managerFilter}
            onChange={(e) => setManagerFilter(e.target.value)}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="">All Managers</MenuItem>
            {managers.map((m) => (
              <MenuItem key={m} value={m}>
                {m}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {/* Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Group Name</TableCell>
                <TableCell>Manager</TableCell>
                <TableCell>Member Count</TableCell>
                <TableCell>Members</TableCell>
                <TableCell>Active Projects</TableCell>
                {userInfo.role === "admin" &&
                  <TableCell align="center">Actions</TableCell>
                }
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredGroups.map((group) => (
                <TableRow key={group._id} hover>
                  <TableCell>{group.name}</TableCell>
                  <TableCell>
                    {group.manager ? (
                      <Tooltip title={group.manager.email || ""}>
                        <Chip
                          avatar={
                            <Avatar sx={{ bgcolor: "primary.main" }}>
                              {getInitials(group.manager.name)}
                            </Avatar>
                          }
                          label={group.manager.name}
                          variant="outlined"
                        />
                      </Tooltip>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>{group.members?.length || 0}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {group.members?.length ? (
                        group.members.map((member) => (
                          <Chip
                            key={member._id}
                            label={member.name}
                            size="small"
                          />
                        ))
                      ) : (
                        "—"
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>{group.activeProjects?.join(",")}</TableCell>
                  {userInfo.role === "admin" &&
                    <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      {/* Detail */}
                      <Tooltip title="Group Details">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleViewGroup(group._id)}
                        >
                          <SettingsIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {/* Delete */}
                      <Tooltip title="Delete Group">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteGroup(group._id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                  }
                </TableRow>
              ))}

              {filteredGroups.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No groups found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Dialog
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create New Group</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            {/* Group Name */}
            <TextField
              label="Group Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
            />

            {/* Description */}
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              required
            />

            {/* Manager */}
            <TextField
              select
              label="Manager"
              name="manager"
              value={formData.manager}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="">No Manager</MenuItem>
              {users.map((user) => (
                <MenuItem key={user._id} value={user._id}>
                  {user.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Members"
              name="members"
              value={membersValue}
              onChange={handleChange}
              fullWidth
              SelectProps={{
                multiple: true,
                renderValue: (selected) =>
                  selected
                    .map(
                      (id) => idle_users.find((u) => u._id === id)?.name
                    )
                    .join(","),
              }}
            >
              {idle_users.map((user) => (
                <MenuItem key={user._id} value={user._id}>
                  {user.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenCreateModal(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateGroup}
            disabled={!formData.name || !formData.description}
          >
            Create Group
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openViewModal}
        onClose={() => setOpenViewModal(false)}
        fullWidth
        maxWidth="sm"
      >
        {/* ---------- HEADER ---------- */}
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            {editMode ? (
              <TextField
                value={editData.name}
                onChange={(e) =>
                  setEditData((p) => ({ ...p, name: e.target.value }))
                }
                size="small"
                fullWidth
              />
            ) : (
              <Typography variant="h6" fontWeight="bold">
                {selectedGroup?.name} Group
              </Typography>
            )}

            {selectedGroup?.manager && (
              <Avatar sx={{ bgcolor: "primary.main" }}>
                {getInitials(selectedGroup.manager.name)}
              </Avatar>
            )}
          </Stack>
        </DialogTitle>

        {/* ---------- BODY ---------- */}
        <DialogContent dividers>
          <Typography variant="subtitle2" gutterBottom>
            Members
          </Typography>

          <Box
            display="grid"
            gridTemplateColumns="repeat(3, 1fr)"
            gap={2}
            mt={1}
          >
            {(editMode ? editData.members : selectedGroup?.members || []).map(
              (member, index) => {
                const user =
                  editMode
                    ? users.find((u) => u._id === member)
                    : member;

                return (
                  <Tooltip key={index} title={user?.name || ""}>
                    <Avatar sx={{ bgcolor: "secondary.main", mx: "auto" }}>
                      {getInitials(user?.name)}
                    </Avatar>
                  </Tooltip>
                );
              }
            )}
          </Box>

          {/* ---------- EDIT MODE FIELDS ---------- */}
          {editMode && (
            <Stack spacing={2} mt={3}>
              <TextField
                select
                label="Manager"
                value={editData.manager}
                onChange={(e) =>
                  setEditData((p) => ({ ...p, manager: e.target.value }))
                }
                fullWidth
              >
                <MenuItem value="">No Manager</MenuItem>
                {users.map((u) => (
                  <MenuItem key={u._id} value={u._id}>
                    {u.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Members"
                value={editData.members}
                fullWidth
                SelectProps={{ multiple: true }}
                onChange={(e) =>
                  setEditData((p) => ({ ...p, members: e.target.value }))
                }
              >
                {users.map((u) => (
                  <MenuItem key={u._id} value={u._id}>
                    {u.name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          )}
        </DialogContent>

        {/* ---------- FOOTER ---------- */}
        <DialogActions>
          <Button onClick={() => setOpenViewModal(false)}>Close</Button>

          {editMode ? (
            <Button
              variant="contained"
              onClick={handleSaveGroup}
              disabled={!editData.name || isUpdating}
            >
              {isUpdating ? "Saving" : "Save"}
            </Button>
          ) : (
            <Button
              variant="outlined"
              onClick={() => setEditMode(true)}
            >
              Edit
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Group</DialogTitle>

        <DialogContent dividers>
          <Typography>
            Are you sure you want to delete the group{" "}
            <strong>{groupToDelete?.name}</strong>?
          </Typography>

          <Typography
            variant="body2"
            color="error"
            mt={2}
          >
            This action cannot be undone.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={confirmDeleteGroup}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={closeNotification}
      />

    </Box>
  );
};

export default GroupScreen;