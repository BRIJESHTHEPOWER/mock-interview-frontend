// ============================================
// LOGIN PAGE
// ============================================
// User authentication page with email/password login

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

import './Login.css';
import logo from '../assets/logo.png';
// You'll need to install react-icons later or use an image for Google G
// npm install react-icons
// import { FcGoogle } from 'react-icons/fc'; 

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignup, setIsSignup] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resetLink, setResetLink] = useState('');
    const [message, setMessage] = useState('');
    const { login, signup, googleSignIn, resetPassword } = useAuth();
    const navigate = useNavigate();

    const handleResetPassword = async () => {
        if (!email) {
            return setError('Please enter your email to reset password');
        }
        try {
            setMessage('');
            setError('');
            setLoading(true);

            // Call our new backend API instead of Firebase client SDK
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, { email });

            if (response.data.success && response.data.link) {
                // Show the link directly to the user
                setMessage('A reset link has been generated. Since automated emails are failing, please click the link below to reset your password:');
                // We'll store the link in state to display it as a clickable button
                setResetLink(response.data.link);
            } else {
                setMessage('Check your inbox for instructions (and check Spam folder).');
            }
        } catch (err) {
            console.error('Reset Error:', err.response?.data || err.message);
            const errorMsg = err.response?.data?.error || err.message;
            if (errorMsg.includes('user-not-found') || err.response?.status === 404) {
                setError('No user found with this email address. Please sign up first.');
            } else {
                setError('Failed to reset password: ' + errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            if (isSignup) {
                await signup(email, password);
            } else {
                await login(email, password);
            }
            navigate('/dashboard');
        } catch (err) {
            console.error('Auth Error:', err);

            // Map Firebase error codes to user-friendly messages
            let errorMessage = 'Failed to ' + (isSignup ? 'create an account' : 'log in');
            if (err.code === 'auth/user-not-found') errorMessage = 'User not found. Please sign up.';
            else if (err.code === 'auth/wrong-password') errorMessage = 'Invalid password.';
            else if (err.code === 'auth/invalid-email') errorMessage = 'Invalid email address.';
            else if (err.code === 'auth/email-already-in-use') errorMessage = 'Email already in use.';
            else if (err.code === 'auth/weak-password') errorMessage = 'Password is too weak.';
            else if (err.message) errorMessage = err.message;

            setError(errorMessage);
        }

        setLoading(false);
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setMessage('');
        setLoading(true);
        try {
            await googleSignIn();
            navigate('/dashboard');
        } catch (err) {
            console.error('Google Sign In Error:', err);
            setError('Failed to log in with Google');
        }
        setLoading(false);
    };

    return (
        <div className="login-container">
            {/* Floating particles */}
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>

            <div className="login-content">
                <div className="auth-card">
                    <div className="brand-section">
                        <img src={logo} alt="Infinity Logo" className="login-logo" />
                        <h1>INFINITY</h1>
                        <p>AI-Powered Interview Mastery</p>
                    </div>

                    <div className="auth-header">
                        <h2>{isSignup ? 'Create Account' : 'Welcome'}</h2>
                        <p>{isSignup ? 'Start your journey to success' : 'Enter your details to access your account'}</p>
                    </div>

                    {error && <div className="error-message">{error}</div>}
                    {message && <div className="success-message" style={{
                        background: 'rgba(34, 197, 94, 0.15)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        color: '#86efac',
                        padding: '12px',
                        borderRadius: '10px',
                        marginBottom: '20px',
                        fontSize: '0.85rem',
                        textAlign: 'center'
                    }}>
                        {message}
                        {resetLink && (
                            <div style={{ marginTop: '10px' }}>
                                <a
                                    href={resetLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'inline-block',
                                        padding: '8px 15px',
                                        background: '#00d2ff',
                                        color: '#000',
                                        borderRadius: '8px',
                                        textDecoration: 'none',
                                        fontWeight: 'bold',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    CLICK HERE TO RESET PASSWORD
                                </a>
                            </div>
                        )}
                    </div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label>Password</label>
                                {!isSignup && (
                                    <button
                                        type="button"
                                        onClick={handleResetPassword}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#00d2ff',
                                            fontSize: '0.75rem',
                                            cursor: 'pointer',
                                            padding: 0
                                        }}
                                    >
                                        Forgot Password?
                                    </button>
                                )}
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required={!message} // Don't require for reset
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={loading}
                        >
                            {loading ? 'Please wait...' : (isSignup ? 'Sign Up' : 'Log In')}
                        </button>
                    </form>

                    <div className="divider">
                        <span>OR</span>
                    </div>

                    <button
                        onClick={handleGoogleSignIn}
                        className="google-btn"
                        disabled={loading}
                    >
                        <span style={{ fontWeight: 'bold', fontSize: '1.2em', marginRight: '8px' }}>G</span>
                        Sign in with Google
                    </button>

                    <div className="auth-footer" style={{ marginTop: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
                        <p>
                            {isSignup ? "Already have an account?" : "Don't have an account?"}
                            <button
                                onClick={() => setIsSignup(!isSignup)}
                                type="button"
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#00d2ff',
                                    cursor: 'pointer',
                                    marginLeft: '5px',
                                    fontWeight: 'bold',
                                    textDecoration: 'underline'
                                }}
                            >
                                {isSignup ? 'Log In' : 'Sign Up'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
