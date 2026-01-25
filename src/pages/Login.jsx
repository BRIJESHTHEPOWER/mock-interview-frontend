// ============================================
// LOGIN PAGE
// ============================================
// User authentication page with email/password login

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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

    const { login, signup, googleSignIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
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
            setError('Failed to ' + (isSignup ? 'create an account' : 'log in'));
        }

        setLoading(false);
    };

    const handleGoogleSignIn = async () => {
        setError('');
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
            <div className="login-content">
                <div className="auth-card">
                    <div className="brand-section">
                        <img src={logo} alt="Infinity Logo" className="login-logo" />
                        <h1>INFINITY</h1>
                        <p>AI-Powered Interview Mastery</p>
                    </div>

                    <div className="auth-header">
                        <h2>{isSignup ? 'Create Account' : 'Welcome Back'}</h2>
                        <p>{isSignup ? 'Start your journey to success' : 'Enter your details to access your account'}</p>
                    </div>

                    {error && <div className="error-message">{error}</div>}

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
                            <label>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
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
                        {/* Using a simple G text or you can import an icon if available */}
                        <span style={{ fontWeight: 'bold', fontSize: '1.2em', marginRight: '8px' }}>G</span>
                        Sign in with Google
                    </button>

                    <div className="auth-footer">
                        <p className="toggle-mode">
                            {isSignup ? 'Already have an account?' : "Don't have an account?"}
                            <button
                                onClick={() => setIsSignup(!isSignup)}
                                className="toggle-btn"
                            >
                                {isSignup ? ' Log In' : ' Sign Up'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
