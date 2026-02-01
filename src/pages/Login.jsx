// ============================================
// LOGIN PAGE
// ============================================
// User authentication page with email/password login

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import './Login.css';
import logo from '../assets/logo.png';
import InfinityLoader from '../components/InfinityLoader';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignup, setIsSignup] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loginState, setLoginState] = useState('idle'); // 'idle', 'authenticating', 'success'
    const { login, signup, googleSignIn, resetPassword } = useAuth();
    const navigate = useNavigate();

    const handleResetPassword = async (e) => {
        if (e) e.preventDefault();

        if (!email) {
            return setError('Please enter your email to reset password');
        }

        try {
            setMessage('');
            setError('');
            setLoading(true);

            // Configure ActionCodeSettings for the reset email
            const actionCodeSettings = {
                // The URL to redirect to after password reset
                url: `${window.location.origin}/login`,
                // This must be true for a password reset email
                handleCodeInApp: false,
            };

            await resetPassword(email, actionCodeSettings);
            setMessage('A password reset link has been sent to your email. Please check your inbox (and Spam folder).');
        } catch (err) {
            console.error('Reset Error:', err);
            let errorMessage = 'Failed to reset password';
            if (err.code === 'auth/user-not-found') errorMessage = 'No user found with this email address.';
            else if (err.code === 'auth/invalid-email') errorMessage = 'Invalid email address.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (isForgotPassword) {
            return handleResetPassword();
        }

        setLoading(true);
        setLoginState('authenticating'); // Show spinning logo

        try {
            if (isSignup) {
                await signup(email, password);
            } else {
                await login(email, password);
            }

            // Show success animation
            setLoginState('success');

            // Wait 1.5 seconds to show success message, then navigate
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);
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
            setLoginState('idle'); // Reset to idle on error
        }

        setLoading(false);
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setMessage('');
        setLoading(true);
        setLoginState('authenticating');

        try {
            await googleSignIn();
            setLoginState('success');

            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);
        } catch (err) {
            console.error('Google Sign In Error:', err);
            setError('Failed to log in with Google');
            setLoginState('idle');
        }
        setLoading(false);
    };

    return (
        <>
            {/* Authenticating Overlay - Spinning Logo */}
            {loginState === 'authenticating' && (
                <InfinityLoader fullScreen={true} />
            )}

            {/* Success Overlay */}
            {loginState === 'success' && (
                <div className="login-overlay success">
                    <div className="overlay-content">
                        <div className="success-checkmark">
                            <svg viewBox="0 0 52 52">
                                <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                                <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                            </svg>
                        </div>
                        <h2>Login Successful!</h2>
                        <p>Redirecting to dashboard...</p>
                    </div>
                </div>
            )}

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
                            <h2>{isForgotPassword ? 'Reset Password' : (isSignup ? 'Create Account' : 'Welcome')}</h2>
                            <p>
                                {isForgotPassword
                                    ? 'Enter your email to receive a password reset link'
                                    : (isSignup ? 'Start your journey to success' : 'Enter your details to access your account')}
                            </p>
                        </div>

                        {error && <div className="error-message">{error}</div>}
                        {message && <div className="success-message">
                            {message}
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

                            {!isForgotPassword && (
                                <div className="form-group">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <label>Password</label>
                                        {!isSignup && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsForgotPassword(true);
                                                    setError('');
                                                    setMessage('');
                                                }}
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
                                        required
                                        minLength={6}
                                    />
                                </div>
                            )}

                            <button
                                type="submit"
                                className="auth-submit"
                                disabled={loading}
                            >
                                {loading ? 'Please wait...' : (isForgotPassword ? 'Send Reset Link' : (isSignup ? 'Sign Up' : 'Log In'))}
                            </button>
                        </form>

                        {!isForgotPassword && (
                            <>
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
                            </>
                        )}

                        <div className="auth-footer" style={{ marginTop: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
                            <p>
                                {isForgotPassword ? (
                                    <button
                                        onClick={() => {
                                            setIsForgotPassword(false);
                                            setError('');
                                            setMessage('');
                                        }}
                                        type="button"
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#00d2ff',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            textDecoration: 'underline'
                                        }}
                                    >
                                        Back to Login
                                    </button>
                                ) : (
                                    <>
                                        {isSignup ? "Already have an account?" : "Don't have an account?"}
                                        <button
                                            onClick={() => {
                                                setIsSignup(!isSignup);
                                                setError('');
                                                setMessage('');
                                            }}
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
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
