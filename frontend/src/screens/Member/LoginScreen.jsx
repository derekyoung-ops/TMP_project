import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useLoginMutation } from "../../slices/member/usersApiSlice";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { setCredentials } from "../../slices/member/authSlice";
import Loader from "../../components/Basic/Loader";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import "./LoginScreen.css";
import { Box, Button, Checkbox, FormControlLabel, FormGroup, Grid, IconButton, InputAdornment, TextField, Typography } from "@mui/material";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [login, { isLoading }] = useLoginMutation();

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      navigate("/dashboard");
    }
  }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate('/dashboard');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    };
  }

  return (
    <div className="d-flex min-vh-100 w-100 overflow-hidden">
      {/* Left Section - Login Form */}
      <div className="flex-fill bg-white d-flex align-items-center justify-content-center p-4 overflow-y-auto position-relative">
        <Link to="/">
          <img src="/logo.png" alt="Logo" className="login-logo" />
        </Link>
        <Grid 
          className="w-100" 
          style={{ maxWidth: '400px' }}
          component="form"
          onSubmit={submitHandler}
          noValidate
        >
          <h1 className="fs-1 fw-semibold text-dark text-center mb-4">Log in</h1>

          <FormGroup className="w-100">
            <Grid size={12} sx={{ my: 2 }}>
              <TextField
                fullWidth
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Grid>
            <Grid size={12} sx={{ my: 2 }}>
              <TextField
                fullWidth
                type={showPassword ? "text" : "password"}
                label="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mt={1}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                }
                label="Remember me"
              />
              <Link to="/forgot-password" style={{ textDecoration: "none" }}>
                <Typography variant="body2" color="primary">
                  Forgot password?
                </Typography>
              </Link>
            </Box>

            {isLoading && <Loader />}

            <Button
              type="submit"
              fullWidth
              size="large"
              variant="contained"
              sx={{ mt: 3, py: 1.2 }}
              disabled={isLoading}
            >
              Log in
            </Button>
          </FormGroup>
        </Grid>

      </div>

      {/* Right Section - Promotional */}
      <div className="login-right flex-fill d-flex align-items-center justify-content-center p-4 overflow-y-auto position-relative">
        <div className="w-100 position-relative" style={{ maxWidth: '500px', zIndex: 1 }}>
          <div className="d-flex justify-content-end align-items-center gap-2 mb-4 small text-white">
            <span>Don't have an account yet?</span>
            <Link to="/register" className="text-white text-decoration-none rounded px-3 py-2 fw-medium" style={{ backgroundColor: '#4A90E2' }}>Sign up</Link>
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
              Log in and click the My Calendar tab to check it out now!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
};

export default LoginScreen;
