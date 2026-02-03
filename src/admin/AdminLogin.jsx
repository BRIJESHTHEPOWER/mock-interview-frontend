import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Lock, Mail, ChevronRight, AlertCircle } from 'lucide-react';
import './Admin.css'; // We'll create this for shared admin styles

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignup, setIsSignup] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, signup } = useAuth(); // signup might need to be exported from AuthContext if not already
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isSignup) {
                // Warning: In a real app, you shouldn't allow public admin signup. 
                // This is strictly for the requested demo/MVP requirements.
                if (!email.toLowerCase().includes('admin')) {
                    throw new Error("Admin email must contain 'admin' (e.g. admin@yourco.com)");
                }
                await signup(email, password);
            } else {
                await login(email, password);
            }

            // Navigation handled after successful auth
            navigate('/admin/dashboard');
        } catch (err) {
            console.error(err);
            setError(isSignup ? 'Failed to create admin account. ' + err.message : 'Failed to log in. Check credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-bg-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="admin-login-card"
            >
                <div className="admin-login-header">
                    <h2>{isSignup ? 'Create Admin Account' : 'Admin Portal'}</h2>
                    <p>{isSignup ? 'Register New Transport' : 'Secure Access Only'}</p>
                </div>

                {error && (
                    <div className="admin-error-message">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="admin-login-form">
                    <div className="input-group">
                        <Mail className="input-icon" size={18} />
                        <input
                            type="email"
                            placeholder="Admin Email (must contain 'admin')"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <Lock className="input-icon" size={18} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="admin-login-btn"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : (isSignup ? 'Register Access' : 'Enter Dashboard')}
                        {!loading && <ChevronRight size={18} />}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <button
                            type="button"
                            onClick={() => setIsSignup(!isSignup)}
                            style={{ background: 'none', border: 'none', color: 'var(--admin-primary)', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            {isSignup ? 'Already have an account? Login' : 'Need an account? Sign Up'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
