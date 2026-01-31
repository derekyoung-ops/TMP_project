import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import Avatar from '@mui/material/Avatar';

import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    IconButton,
    InputAdornment,
    CircularProgress,
    Grid,
} from '@mui/material';

import {
    Visibility,
    VisibilityOff,
    Person,
    Email,
    Lock,
    Cake,
    Image,
} from '@mui/icons-material';

import { useUpdateUserMutation } from '../../slices/member/usersApiSlice';
import { setCredentials } from '../../slices/member/authSlice';
import { useNavigate } from 'react-router-dom';

const ProfileScreen = () => {
    const dispatch = useDispatch();
    const { userInfo } = useSelector((state) => state.auth);

    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [avatar, setAvatar] = useState('');
    const [birthday, setBirthday] = useState('');
    const [gender, setGender] = useState('');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [updateProfile, { isLoading }] = useUpdateUserMutation();

    const navigate = useNavigate();

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.10.116:5000';

    const getAvatarUrl = (avatar) => {
        if (!avatar) return '';
        if (avatar.startsWith('http')) return avatar;
        return `${API_BASE_URL}${avatar}`;
    };

    useEffect(() => {
        if (userInfo) {
            setName(userInfo.name || '');
            setEmail(userInfo.email || '');
            setAvatar(userInfo.avatar || '');
            setAvatarPreview(getAvatarUrl(userInfo.avatar));
            setBirthday(
                userInfo.birthday ? userInfo.birthday.split('T')[0] : ''
            );
            setGender(userInfo.gender || '');
        }
    }, [userInfo]);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setAvatarFile(file);

        // preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        if (password && password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('_id', userInfo._id);
            formData.append('name', name);
            formData.append('email', email);
            formData.append('birthday', birthday);
            formData.append('gender', gender);

            if (password) {
                formData.append('password', password);
            }

            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            const res = await updateProfile(formData).unwrap();

            dispatch(setCredentials(res));
            toast.success('Profile updated successfully');
            setPassword('');
            setConfirmPassword('');
            navigate('/login');
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(180deg, #eef2ff 0%, #f8fafc 60%, #ffffff 100%)',
                p: 2,
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <Card elevation={12} sx={{ width: 440, borderRadius: 4 }}>

                    <CardContent sx={{ p: 4 }}>
                        <Box component="form" onSubmit={submitHandler}>
                            <Box
                                display="flex"
                                flexDirection="column"
                                alignItems="center"
                                mb={3}
                            >
                                <Box position="relative">
                                    <Avatar
                                        src={avatarPreview}
                                        sx={{
                                            width: 120,
                                            height: 120,
                                            bgcolor: '#e0e0e0',
                                            fontSize: 48,
                                        }}
                                    />

                                    <IconButton
                                        component="label"
                                        sx={{
                                            bottom: -6,
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            bgcolor: '#1976d2',
                                            color: '#fff',
                                            width: 40,
                                            height: 40,
                                            boxShadow: 2,
                                            '&:hover': {
                                                bgcolor: '#1565c0',
                                            },
                                        }}
                                    >
                                        <CameraAltIcon fontSize="small" />
                                        <input
                                            hidden
                                            accept="image/*"
                                            type="file"
                                            onChange={handleAvatarChange}
                                        />
                                    </IconButton>
                                </Box>
                            </Box>
                            {/* Avatar stays as-is here */}

                            <Grid container spacing={2}>
                                {/* Name */}
                                <Grid size={12}>
                                    <TextField
                                        fullWidth
                                        label="Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Person />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>

                                {/* Email */}
                                <Grid size={12}>
                                    <TextField
                                        fullWidth
                                        label="Email Address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Email />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>

                                {/* Birthday */}
                                <Grid size={6}>
                                    <TextField
                                        fullWidth
                                        label="Birthday"
                                        type="date"
                                        value={birthday}
                                        onChange={(e) => setBirthday(e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>

                                {/* Gender */}
                                <Grid size={6}>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Gender"
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        SelectProps={{ native: true }}
                                    >
                                        <option value=""></option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </TextField>
                                </Grid>

                                {/* New Password */}
                                <Grid size={12}>
                                    <TextField
                                        fullWidth
                                        label="New Password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Lock />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowPassword((prev) => !prev)}
                                                        edge="end"
                                                    >
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>

                                {/* Confirm Password */}
                                <Grid size={12}>
                                    <TextField
                                        fullWidth
                                        label="Confirm Password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </Grid>
                            </Grid>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                fullWidth
                                size="large"
                                variant="contained"
                                disabled={isLoading}
                                sx={{
                                    mt: 3,
                                    borderRadius: 2,
                                    py: 1.2,
                                    fontWeight: 600,
                                }}
                            >
                                {isLoading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    'Update Profile'
                                )}
                            </Button>
                        </Box>

                    </CardContent>
                </Card>
            </motion.div>
        </Box>
    );
};

export default ProfileScreen;
