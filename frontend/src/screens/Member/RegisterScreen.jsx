import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useRegisterMutation } from '../../slices/member/usersApiSlice';
import { toast } from 'react-toastify';
import { setCredentials } from '../../slices/member/authSlice';
import { Avatar, Button, Grid, IconButton, InputAdornment, MenuItem, Stack, TextField } from '@mui/material';
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import AvatarPicker from '../../components/Basic/AvatarPicker.jsx';
import { useGetGroupsQuery } from '../../slices/group/groupApiSlice.js';
import SaveIcon from '@mui/icons-material/Save';
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import Notification from '../../components/Basic/Notification';
import { MEMBER_META } from '../../utils/memberMeta.jsx';


const RegisterScreen = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const { data: groups = [], isLoading: getGroups, error } = useGetGroupsQuery();

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

    const [form, setForm] = useState({
        name: "",
        email: "",
        birthday: "",
        gender: "",
        group: "",
        role: "member",
        hubstaff_id: "",
        password: "",
        confirmPassword: "",
        avatar: null
    });

    const [memberRegister, { isLoading: isRegistering }] = useRegisterMutation();

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const go = (path) => navigate(path);

    const { userInfo } = useSelector((state) => state.auth);

    const [register, { isLoading }] = useRegisterMutation();

    useEffect(() => {
        if (userInfo) {
            navigate('/');
        }
    }, [navigate, userInfo]);

    const handleChange = (field) => (e) => {
        setForm({ ...form, [field]: e.target.value });
    }

    const memberOptions = Object.entries(MEMBER_META).map(
        ([memberId, { name }]) => ({
            value: memberId, // ✅ required format
            label: name, // what user sees
        })
    );

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
    };

    const handleSubmit = async () => {
        if (!form.name || (!form.password)) {
            showNotification("Please fill required fields", "warning");
            return;
        }

        if (form.password !== form.confirmPassword) {
            showNotification("Passwords do not match", "error");
            return;
        }

        try {
            const formData = new FormData();

            Object.entries(form).forEach(([key, value]) => {
                if (value !== null && value !== '') {
                    formData.append(key, value);
                }
            });

            const res = await memberRegister(formData).unwrap();
            showNotification("Member registered successfully!", "success");
            dispatch(setCredentials({ ...res }));
            navigate('/dashboard');
        } catch (err) {
            showNotification(err?.data?.message || err.error, "error")
        }
    }

    return (
        <div className="d-flex min-vh-100 w-100 overflow-hidden">
            {/* Left Section - Register Form */}
            <div className="flex-fill bg-white d-flex align-items-center justify-content-center p-4 overflow-y-auto position-relative">
                <Link to="/">
                    <img src="/logo.png" alt="Logo" className="login-logo" />
                </Link>
                <div className="w-100" style={{ maxWidth: '600px' }}>
                    <h1 className="fs-1 fw-semibold text-dark text-center mb-4">Sign up</h1>
                    <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                        <Grid size={12}>
                            <AvatarPicker
                                value={form.avatar}
                                onChange={(file) => setForm((prev) => ({ ...prev, avatar: file }))}
                            />
                        </Grid>
                        <Grid size={6}>
                            <TextField fullWidth label="Name" value={form.name} onChange={handleChange("name")} />
                        </Grid>
                        <Grid size={6}>
                            <TextField fullWidth label="Email" value={form.email} onChange={handleChange("email")} />
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Birthday"
                                value={form.birthday}
                                onChange={handleChange("birthday")}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid size={6}>
                            <TextField select fullWidth label="Gender" value={form.gender} onChange={handleChange("gender")}>
                                <MenuItem value="male">Male</MenuItem>
                                <MenuItem value="female">Female</MenuItem>
                                <MenuItem value="other">Other</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                select
                                fullWidth
                                value={form.group}
                                label="Group"
                                onChange={handleChange("group")}
                            >
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
                        <Grid size={6}>
                            <TextField
                                fullWidth
                                type={showPassword ? "text" : "password"}
                                label="password"
                                value={form.password}
                                onChange={handleChange("password")}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position='end'>
                                            <IconButton onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                fullWidth
                                type={showConfirm ? "text" : "password"}
                                label="Confirm Password"
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
                        <Grid size={6}>
                            <Button fullWidth variant='outlined' startIcon={<SaveIcon />} onClick={handleSubmit}>Register Member</Button>
                        </Grid>
                        <Grid size={6}>
                            <Button fullWidth variant='outlined' onClick={() => go("/login")}>Back To Login</Button>
                        </Grid>
                    </Grid>
                </div>
            </div>

            {/* Right Section - Promotional */}
            <div className="login-right flex-fill d-flex align-items-center justify-content-center p-4 overflow-y-auto position-relative">
                <div className="w-100 position-relative" style={{ maxWidth: '500px', zIndex: 1 }}>
                    <div className="d-flex justify-content-end align-items-center gap-2 mb-4 small text-white">
                        <span>Already have an account?</span>
                        <Link to="/login" className="text-white text-decoration-none rounded px-3 py-2 fw-medium" style={{ backgroundColor: '#4A90E2' }}>Log in</Link>
                    </div>

                    <div className="mb-4">
                        <div className="rounded-3 p-4 mb-4 calendar-preview-card">
                            <div className="d-flex flex-column gap-3 mb-3">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="event-color-bar rounded" style={{ backgroundColor: '#4A90E2', width: '4px', height: '40px' }}></div>
                                    <div className="flex-fill">
                                        <div className="fw-medium text-white mb-1">Daily stand up</div>
                                        <div className="small text-white-50">9am - 10am</div>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="event-color-bar rounded" style={{ backgroundColor: '#50C878', width: '4px', height: '40px' }}></div>
                                    <div className="flex-fill">
                                        <div className="fw-medium text-white mb-1">Review copy</div>
                                        <div className="small text-white-50">1h</div>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="event-color-bar rounded" style={{ backgroundColor: '#FF6B6B', width: '4px', height: '40px' }}></div>
                                    <div className="flex-fill">
                                        <div className="fw-medium text-white mb-1">Training</div>
                                        <div className="small text-white-50">2h</div>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="event-color-bar rounded" style={{ backgroundColor: '#9B59B6', width: '4px', height: '40px' }}></div>
                                    <div className="flex-fill">
                                        <div className="fw-medium text-white mb-1">Q2 Review</div>
                                        <div className="small text-white-50">2:15pm - 5:15pm</div>
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex align-items-center justify-content-center mb-3 rounded calendar-image-placeholder" style={{ height: '120px' }}>
                                <div className="placeholder-content">
                                    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                        <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </div>
                            </div>
                            <button className="w-100 d-flex align-items-center justify-content-center gap-2 rounded text-white fw-medium" style={{ backgroundColor: '#4A90E2', border: 'none', padding: '0.75rem' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                                Add time block
                            </button>
                        </div>

                        <p className="fs-5 mb-3 text-white lh-base">
                            Take the stress out of planning and prioritizing your day.
                        </p>

                        <ul className="list-unstyled mb-3">
                            <li className="py-2 ps-4 position-relative text-white">Get one clear view of your tasks and meetings</li>
                            <li className="py-2 ps-4 position-relative text-white">Use time blocks to plan your day and log time</li>
                            <li className="py-2 ps-4 position-relative text-white">Easily sync your Google Calendar for more visibility</li>
                        </ul>

                        <p className="small text-white-50 lh-base">
                            Sign up and click the My Calendar tab to check it out now!
                        </p>
                    </div>
                </div>
            </div>

            <Notification {...notification} onClose={closeNotification} />
        </div>
    );
}

export default RegisterScreen;
