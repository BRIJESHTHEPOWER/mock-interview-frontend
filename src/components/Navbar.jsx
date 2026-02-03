// ============================================
// NAVBAR COMPONENT
// ============================================
// Global navigation bar with Infinity branding

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import './Navbar.css';
import logo from '../assets/logo.png';

export default function Navbar() {
    const { currentUser, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [imgError, setImgError] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Don't show navbar on interview session page for immersion
    if (location.pathname === '/interview') {
        return null;
    }

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <div className="logo-container">
                        <img src={logo} alt="Infinity Logo" className="logo-img" />
                    </div>
                    <span className="brand-name">INFINITY</span>
                </Link>

                <div className="nav-right">
                    <div className="nav-links">
                        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                            Home
                        </Link>



                        <Link to="/feedback" className={`nav-link ${location.pathname === '/feedback' ? 'active' : ''}`}>
                            Feedback
                        </Link>
                    </div>

                    {/* Premium Theme Switch */}
                    <div className="theme-switch-container" onClick={toggleTheme} title="Toggle Visual Mode">
                        <div className={`theme-switch-track ${theme === 'light' ? 'light' : ''}`}>
                            <div className="theme-switch-thumb">
                                {theme === 'dark' ? '🌙' : '☀️'}
                            </div>
                        </div>
                    </div>

                    {currentUser ? (
                        <>
                            <div className="user-profile-wrapper">
                                <div
                                    className="user-avatar"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    title={currentUser.displayName || currentUser.email}
                                >
                                    {currentUser.photoURL && !imgError ? (
                                        <img
                                            src={currentUser.photoURL}
                                            alt="Profile"
                                            onError={() => setImgError(true)}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div className="avatar-placeholder">
                                            {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                {isDropdownOpen && (
                                    <div className="user-dropdown">
                                        <div className="dropdown-header">
                                            <span className="user-name">{currentUser.displayName || 'User'}</span>
                                            <span className="user-email">{currentUser.email}</span>
                                        </div>
                                        <div className="dropdown-divider"></div>
                                        <button onClick={handleLogout} className="dropdown-item logout">
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => navigate('/dashboard')}
                                className="dashboard-btn"
                            >
                                Dashboard
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => navigate('/login')}
                                className="dashboard-btn"
                                style={{ marginRight: '10px' }}
                            >
                                Dashboard
                            </button>

                            {location.pathname !== '/login' && (
                                <Link to="/login" className="signup-btn">
                                    Login
                                </Link>
                            )}
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
