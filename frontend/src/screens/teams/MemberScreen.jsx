import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Avatar,
  Stack,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import { useGetGroupsQuery } from "../../slices/group/groupApiSlice";
import {
  useDeleteUserMutation,
  useGetUsersQuery,
  useUpdateUserMutation,
} from "../../slices/member/usersApiSlice";
import { useEffect } from "react";
import AddMemberDialog from "../../components/Basic/member/AddMemberDialog";
import DeleteMemberDialog from "../../components/Basic/member/DeleteMemberDialog";

const MemberScreen = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [dialogMode, setDialogMode] = useState("add");
  const [editingMember, setEditingMember] = useState(null);
  const [selectedUser, setSelectedUser] = useState("");
  const [viewUser, setViewUser] = useState(null);

  /** 🔥 Load data */
  const {
    data: groups = [],
    isLoading: groupsLoading,
    error: groupsError,
  } = useGetGroupsQuery();

  const { data: users = [], isLoading: usersLoading, error: usersError, } = useGetUsersQuery();
  const [ updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [ deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  /** ----- Tabs structure ----- */
  const tabs = useMemo(
    () => [...groups, { _id: "idle", name: "Idle Members" }],
    [groups]
  );

  const selectedTabData = tabs[selectedTab] ?? tabs[0];

  const groupManager = useMemo(() => {
    if (!selectedTabData || selectedTabData._id === "idle") return null;

    return users.find(
      (u) =>
        u.group === selectedTabData._id &&
        u.role === "manager"
    );
  }, [users, selectedTabData]);

  useEffect(() => {
    if (groups.length === 0) {
      setSelectedTab(tabs.length - 1); // Idle tab
    }
  }, [groups.length, tabs.length]);

  const isIdle = (u) =>
    !u.group ||
    u.group === "idle" ||
    u.group === "" ||
    u.group === null;

  /** ----- Members per tab ----- */
  const members = useMemo(() => {
    if (!selectedTabData) return [];

    // Idle tab → ONLY members
    if (selectedTabData._id === "idle") {
      return users.filter(
        (u) => isIdle(u) && u.role === "member"
      );
    }

    // Group tab → ONLY members of that group
    return users.filter(
      (u) =>
        u.group === selectedTabData._id &&
        u.role === "member"
    );
  }, [users, selectedTabData]);

  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  /** ----- Actions ----- */
  const handleRemoveMember = async (userId) => {
    const del_member = members.find((mem) => mem._id === userId );
    setMemberToDelete(del_member);
    setOpenDeleteDialog(true);
  };

  const handleEditMember = (member) => {
    setDialogMode("edit");
    setEditingMember(member);
    setOpenAddModal(true);
  };

  /** ----- Loading & Errors ----- */
  if (groupsLoading || usersLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (groupsError || usersError) {
    return (
      <Typography color="error">
        Failed to load member data
      </Typography>
    );
  }

  return (
    <div style={{width: "100vw", margin: 20}}>
      {/* ---------- HEADER ---------- */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" fontWeight="bold">
          Members
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setDialogMode("add");
            setEditingMember(null);
            setOpenAddModal(true);
          }}
        >
          Add Member
        </Button>
      </Stack>

      {/* ---------- TABS ---------- */}
      <Tabs
        value={selectedTab}
        onChange={(e, v) => setSelectedTab(v)}
        sx={{ mb: 3 }}
      >
        {tabs.map((tab) => (
          <Tab key={tab._id} label={tab.name} />
        ))}
      </Tabs>

      {/* ---------- TABLE ---------- */}
      <TableContainer component={Paper}>
        {selectedTabData?._id !== "idle" && groupManager && (
              <Paper sx={{ p: 2, mb: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: "secondary.main" }}>
                    {getInitials(groupManager.name)}
                  </Avatar>
                  <Box>
                    <Typography fontWeight="bold">
                      {groupManager.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Group Manager
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            )}
                    <Table>
          <TableHead>
            <TableRow>
              <TableCell>Member</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {members.map((member) => (
              <TableRow key={member._id} hover>
                <TableCell>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      src={
                        member.avatar
                          ? `http://localhost:5000${member.avatar}`
                          : undefined
                      }
                      sx={{ bgcolor: "primary.main" }}
                    >
                      {!member.avatar && getInitials(member.name)}
                    </Avatar>

                    <Typography>{member.name}</Typography>
                  </Stack>
                </TableCell>

                <TableCell>{member.email}</TableCell>
                <TableCell>{member.role || "—"}</TableCell>

                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    {/* View */}
                    <Tooltip title="View Member">
                      <IconButton onClick={() => handleEditMember(member)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>

                    {/* Remove */}
                    {member.group && (
                      <Tooltip title="Remove from group">
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveMember(member._id)}
                          disabled={isUpdating}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}

            {members.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No members found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ---------- ADD MEMBER DIALOG ---------- */}
      <AddMemberDialog 
        open={openAddModal}
        mode={dialogMode}
        member={editingMember}
        groups={groups}
        onClose={() => {
          setOpenAddModal(false);
          setEditingMember(null);
        }}
      />

      <DeleteMemberDialog 
        open={openDeleteDialog}
        memberToDelete={memberToDelete}
        onClose={() => setOpenDeleteDialog(false)}
      />
    </div>
  );
};

export default MemberScreen;
