import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Users, Mail, Video, LogOut, Shield } from 'lucide-react';
import './Admin.css';
import { motion } from 'framer-motion';

const AdminLayout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/admin/login');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="admin-layout">
            <motion.div
                className="admin-sidebar"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="admin-logo">
                    <Shield className="text-blue-500" size={32} />
                    <span>AdminPanel</span>
                </div>

                <nav className="admin-nav">
                    <NavLink to="/admin/dashboard" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </NavLink>
                    <NavLink to="/admin/candidates" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
                        <Users size={20} />
                        <span>Candidates</span>
                    </NavLink>
                    <NavLink to="/admin/live-interviews" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
                        <Video size={20} />
                        <span>Live Monitor</span>
                    </NavLink>
                    <NavLink to="/admin/newsletter" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
                        <Mail size={20} />
                        <span>Newsletter</span>
                    </NavLink>
                </nav>

                <button onClick={handleLogout} className="admin-nav-item" style={{ marginTop: 'auto', background: 'none', border: 'none', cursor: 'pointer', width: '100%' }}>
                    <LogOut size={20} />
                    <span>Sign Out</span>
                </button>
            </motion.div>

            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
