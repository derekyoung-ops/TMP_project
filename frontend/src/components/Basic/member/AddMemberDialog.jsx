import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import SaveIcon from '@mui/icons-material/Save';
import { Avatar } from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { useEffect, useState } from "react";
import Notification from "../Notification";

import { useRegisterMutation, useUpdateUserMutation } from "../../../slices/member/usersApiSlice";
import { MEMBER_META } from "../../../utils/memberMeta";

const AddMemberDialog = ({ open, onClose, groups = [], mode, member }) => {
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    name: "",
    email: "",
    birthday: "",
    gender: "",
    group: "",
    role: "member",
    password: "",
    confirmPassword: "",
    avatar: null
  });

  const memberOptions = Object.entries(MEMBER_META).map(
    ([memberId, { name }]) => ({
      value: memberId, // ✅ required format
      label: name, // what user sees
    })
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [memberRegister, { isLoading: isRegistering }] = useRegisterMutation();
  const [memberUpdate, { isLoading: isUpdating }] = useUpdateUserMutation();

  useEffect(() => {
    if (isEdit && member) {
      setForm({
        name: member.name || "",
        email: member.email || "",
        birthday: formatDateForInput(member.birthday) || "",
        gender: member.gender || "",
        group: member.group || "",
        role: member.role || "member",
        hubstaff_id: member.hubstaff_id || "",
        password: "",
        confirmPassword: "",
        avatar: null,
      });

      setAvatarPreview(
        member.avatar ? `http://192.168.10.116:5000${member.avatar}` : null
      );
    }

    if (!isEdit && open) {
      resetForm();
    }
  }, [isEdit, member, open]);

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

  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, avatar: file });
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      birthday: "",
      gender: "",
      group: "",
      role: "member",
      hubstaff_id: "",
      password: "",
      confirmPassword: "",
      avatar: null,
    });
    setAvatarPreview(null);
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {

    if (!form.name || (!isEdit && !form.password)) {
      showNotification("Please fill required fields", "warning");
      return;
    }

    if (!isEdit && form.password !== form.confirmPassword) {
      showNotification("Passwords do not match", "error");
      return;
    }

    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (value === null && value === "") {
          formData.append(key, "");
        } else {
          formData.append(key, value);
        }
      });

      // formData.append("name", form.name);
      // formData.append("email", form.email);
      // formData.append("birthday", form.birthday || "");
      // formData.append("gender", form.gender || "");
      // formData.append("group", form.group || ""); // important
      // formData.append("role", form.role);

      if (isEdit && member?._id) {
        formData.append("id", member._id);
      }


      if (isEdit) {
        await memberUpdate(formData).unwrap();
        showNotification("Member updated successfully");
      } else {
        await memberRegister(formData).unwrap();
        showNotification("Member added successfully");
      }

      resetForm();
      onClose();
    } catch (err) {
      showNotification(err?.data?.message || err.error, "error");
    }
  };

  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogContent>
          <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
            {/* Avatar */}
            <Grid size={12}>
              <Stack
                direction="column"
                alignItems="center"
                spacing={1}
              >
                <Avatar
                  src={
                    avatarPreview ||
                    (member?.avatar
                      ? `http://192.168.10.116:5000${member.avatar}`
                      : undefined)
                  }
                  sx={{
                    width: 96,
                    height: 96,
                    cursor: "pointer",
                  }}
                  component="label"
                >
                  {!avatarPreview && !member?.avatar && getInitials(form.name)}
                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </Avatar>

                <IconButton component="label">
                  <PhotoCameraIcon />
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={handleAvatarChange}
                  />
                </IconButton>
              </Stack>
            </Grid>
            <Grid size={6}>
              <TextField fullWidth label="Name" value={form.name} onChange={handleChange("name")} />
            </Grid>

            <Grid size={6}>
              <TextField
                fullWidth
                label="Email"
                value={form.email}
                onChange={handleChange("email")}
              />
            </Grid>

            <Grid size={6}>
              <TextField type="date" fullWidth label="Birthday" InputLabelProps={{ shrink: true }} value={form.birthday} onChange={handleChange("birthday")} />
            </Grid>

            <Grid size={6}>
              <TextField select fullWidth label="Gender" value={form.gender} onChange={handleChange("gender")}>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Grid>

            <Grid size={6}>
              <TextField select fullWidth label="Group" value={form.group} onChange={handleChange("group")}>
                <MenuItem value="">Idle</MenuItem>
                {groups.map((g) => (
                  <MenuItem key={g._id} value={g._id}>{g.name}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={6}>
              <TextField select fullWidth label="Role" value={form.role} onChange={handleChange("role")}>
                <MenuItem value="member">Member</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </TextField>
            </Grid>

            <Grid size={12}>
              <TextField
                select
                fullWidth
                label="Hubstaff Member"
                name="hubstaff_id"
                value={form.hubstaff_id}
                onChange={handleChange("hubstaff_id")}
              >
                {memberOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.value} - {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {!isEdit && (
              <>
                <Grid size={6}>
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange("password")}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={6}>
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    type={showConfirm ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={handleChange("confirmPassword")}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowConfirm(!showConfirm)}>
                            {showConfirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </>
            )}

            <Grid size={6}>
              <Button fullWidth variant="outlined" startIcon={<SaveIcon />} onClick={handleSubmit}>
                {isEdit ? "Update Member" : "Add Member"}
              </Button>
            </Grid>

            <Grid size={6}>
              <Button fullWidth variant="outlined" onClick={handleCancel}>
                Cancel
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

      <Notification {...notification} onClose={closeNotification} />
    </>
  );
};

export default AddMemberDialog;
