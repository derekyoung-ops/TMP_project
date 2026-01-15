import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, FormCheck } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useRegisterMutation } from '../slices/usersApiSlice';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import { setCredentials } from '../slices/authSlice';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./LoginScreen.css";

const RegisterScreen = () => { 
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { userInfo } = useSelector((state) => state.auth);

    const [register, { isLoading }] = useRegisterMutation();

    useEffect(() => {
        if (userInfo) {
            navigate('/');
        }
    }, [navigate, userInfo]);

    const submitHandler = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Passwords do not match'); 
        } else {
            try {
                const res = await register({ name, email, password }).unwrap();
                dispatch(setCredentials({ ...res }));
                navigate('/');
            } catch (err) {
                toast.error(err?.data?.message || err.error);
            }
        }
    };

    return (
        <div className="d-flex min-vh-100 w-100 overflow-hidden">
            {/* Left Section - Register Form */}
            <div className="flex-fill bg-white d-flex align-items-center justify-content-center p-4 overflow-y-auto position-relative">
                <Link to="/">
                    <img src="/logo.png" alt="Logo" className="login-logo" />
                </Link>
                <div className="w-100" style={{maxWidth: '400px'}}>
                    <h1 className="fs-1 fw-semibold text-dark text-center mb-4">Sign up</h1>
                    
                    <Form onSubmit={submitHandler} className="w-100">
                        <Form.Group controlId="name" className="mb-3">
                            <Form.Label className="fw-medium text-dark mb-2">Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="login-input rounded"
                            />
                        </Form.Group>

                        <Form.Group controlId="email" className="mb-3">
                            <Form.Label className="fw-medium text-dark mb-2">Email address</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Enter email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="login-input rounded"
                            />
                        </Form.Group>

                        <Form.Group controlId="password" className="mb-3">
                            <Form.Label className="fw-medium text-dark mb-2">Password</Form.Label>
                            <div className="position-relative">
                                <Form.Control
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="login-input rounded"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </Form.Group>

                        <Form.Group controlId="confirmPassword" className="mb-3">
                            <Form.Label className="fw-medium text-dark mb-2">Confirm Password</Form.Label>
                            <div className="position-relative">
                                <Form.Control
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="login-input rounded"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </Form.Group>

                        {isLoading && <Loader />}

                        <Button type="submit" className="w-100 mb-3 rounded" style={{backgroundColor: '#4A90E2', border: 'none', padding: '0.75rem'}} disabled={isLoading}>
                            Sign up
                        </Button>
                    </Form>
                </div>
            </div>

            {/* Right Section - Promotional */}
            <div className="login-right flex-fill d-flex align-items-center justify-content-center p-4 overflow-y-auto position-relative">
                <div className="w-100 position-relative" style={{maxWidth: '500px', zIndex: 1}}>
                    <div className="d-flex justify-content-end align-items-center gap-2 mb-4 small text-white">
                        <span>Already have an account?</span>
                        <Link to="/login" className="text-white text-decoration-none rounded px-3 py-2 fw-medium" style={{backgroundColor: '#4A90E2'}}>Log in</Link>
                    </div>

                    <div className="mb-4">
                        <div className="rounded-3 p-4 mb-4 calendar-preview-card">
                            <div className="d-flex flex-column gap-3 mb-3">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="event-color-bar rounded" style={{backgroundColor: '#4A90E2', width: '4px', height: '40px'}}></div>
                                    <div className="flex-fill">
                                        <div className="fw-medium text-white mb-1">Daily stand up</div>
                                        <div className="small text-white-50">9am - 10am</div>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="event-color-bar rounded" style={{backgroundColor: '#50C878', width: '4px', height: '40px'}}></div>
                                    <div className="flex-fill">
                                        <div className="fw-medium text-white mb-1">Review copy</div>
                                        <div className="small text-white-50">1h</div>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="event-color-bar rounded" style={{backgroundColor: '#FF6B6B', width: '4px', height: '40px'}}></div>
                                    <div className="flex-fill">
                                        <div className="fw-medium text-white mb-1">Training</div>
                                        <div className="small text-white-50">2h</div>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="event-color-bar rounded" style={{backgroundColor: '#9B59B6', width: '4px', height: '40px'}}></div>
                                    <div className="flex-fill">
                                        <div className="fw-medium text-white mb-1">Q2 Review</div>
                                        <div className="small text-white-50">2:15pm - 5:15pm</div>
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex align-items-center justify-content-center mb-3 rounded calendar-image-placeholder" style={{height: '120px'}}>
                                <div className="placeholder-content">
                                    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                        <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                </div>
                            </div>
                            <button className="w-100 d-flex align-items-center justify-content-center gap-2 rounded text-white fw-medium" style={{backgroundColor: '#4A90E2', border: 'none', padding: '0.75rem'}}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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
        </div>
    );
}   

export default RegisterScreen;
