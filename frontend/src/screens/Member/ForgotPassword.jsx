import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./LoginScreen.css";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { useResetPasswordMutation } from "../../slices/member/usersApiSlice";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [formatpassword, { isLoading }] = useResetPasswordMutation();

  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      await formatpassword({ email }).unwrap();
      const res = toast.success("Password reset instructions sent");
      console.log(res);
      navigate('/login')
    } catch (err) {
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="d-flex min-vh-100 w-100 overflow-hidden">
      {/* Left Section - Form */}
      <div className="flex-fill bg-white align-items-center justify-content-center">
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            background: "linear-gradient(135deg, #4A90E2, #6FB1FC, #4A90E2)",
            backgroundSize: "400% 400%",
            animation: "gradientFlow 10s ease infinite",
          }}
        >
          <Container
            maxWidth="sm"
            sx={{
              mt: { xs: 8, md: 10 }, // top aligned instead of center
            }}
          >
            <Box
              sx={{
                backgroundColor: "#fff",
                borderRadius: 3,
                p: 4,
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
              }}
            >
              <Box textAlign="center" mb={3}>
                <img
                  src="/logo.png"
                  alt="Logo"
                  style={{ height: 200, marginBottom: 16 }}
                />
                <Typography variant="h5" fontWeight={600}>
                  Recover password
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Enter your email and we’ll send you recovery instructions.
                </Typography>
              </Box>

              <Box component="form" onSubmit={submitHandler}>
                <TextField
                  fullWidth
                  label="Email address"
                  type="email"
                  margin="normal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <Button
                  type="submit"
                  fullWidth
                  size="large"
                  variant="contained"
                  sx={{
                    mt: 2,
                    py: 1.2,
                    borderRadius: 2,
                    textTransform: "none",
                    backgroundColor: "#4A90E2",
                  }}
                  disble={isLoading}
                >
                  {isLoading ? "Processing..." : "Reset password"}
                </Button>
              </Box>

              <Box textAlign="center" mt={3}>
                <Link
                  to="/login"
                  style={{
                    textDecoration: "none",
                    fontSize: 14,
                    color: "#4A90E2",
                  }}
                >
                  Return to login
                </Link>
              </Box>
            </Box>
          </Container>

          {/* Gradient animation */}
          <style>
            {`
          @keyframes gradientFlow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
          </style>
        </Box>
      </div>

      {/* Right Section - Promotional */}
      <div className="login-right flex-fill d-flex align-items-center justify-content-center p-4 overflow-y-auto position-relative">
        <div
          className="w-100 position-relative"
          style={{ maxWidth: "500px", zIndex: 1 }}
        >
          <div className="d-flex justify-content-end align-items-center gap-2 mb-4 small text-white">
            <span>Don't have an account yet?</span>
            <Link
              to="/register"
              className="text-white text-decoration-none rounded px-3 py-2 fw-medium"
              style={{ backgroundColor: "#4A90E2" }}
            >
              Sign up
            </Link>
          </div>

          <div className="mb-4">
            <div className="rounded-3 p-4 mb-4 calendar-preview-card">
              <div className="d-flex flex-column gap-3 mb-3">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="event-color-bar rounded"
                    style={{
                      backgroundColor: "#4A90E2",
                      width: "4px",
                      height: "40px",
                    }}
                  />
                  <div className="flex-fill">
                    <div className="fw-medium text-white mb-1">Daily stand up</div>
                    <div className="small text-white-50">9am - 10am</div>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="event-color-bar rounded"
                    style={{
                      backgroundColor: "#50C878",
                      width: "4px",
                      height: "40px",
                    }}
                  />
                  <div className="flex-fill">
                    <div className="fw-medium text-white mb-1">Review copy</div>
                    <div className="small text-white-50">1h</div>
                  </div>
                </div>
              </div>

              <div
                className="d-flex align-items-center justify-content-center mb-3 rounded calendar-image-placeholder"
                style={{ height: "120px" }}
              >
                <div className="placeholder-content">
                  <svg
                    width="120"
                    height="120"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M12 6V12L16 14"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              <button
                className="w-100 d-flex align-items-center justify-content-center gap-2 rounded text-white fw-medium"
                style={{
                  backgroundColor: "#4A90E2",
                  border: "none",
                  padding: "0.75rem",
                }}
                type="button"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 5V19M5 12H19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                Add time block
              </button>
            </div>

            <p className="fs-5 mb-3 text-white lh-base">
              Take the stress out of planning and prioritizing your day.
            </p>
            <ul className="list-unstyled mb-3 promo-features">
              <li className="py-2 ps-4 position-relative text-white">
                Get one clear view of your tasks and meetings
              </li>
              <li className="py-2 ps-4 position-relative text-white">
                Use time blocks to plan your day and log time
              </li>
              <li className="py-2 ps-4 position-relative text-white">
                Easily sync your Google Calendar for more visibility
              </li>
            </ul>
            <p className="small text-white-50 lh-base">
              Log in and click the My Calendar tab to check it out now!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
