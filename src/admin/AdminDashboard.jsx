import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Users, Video, Clock, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Admin.css';

const AdminDashboard = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        liveInterviews: 0,
        totalInterviews: 0,
        totalUsers: 0
    });
    const [loading, setLoading] = useState(true);

    // Mock data for charts (until we fetch real history)
    const chartData = [
        { name: 'Mon', interviews: 4 },
        { name: 'Tue', interviews: 7 },
        { name: 'Wed', interviews: 12 },
        { name: 'Thu', interviews: 8 },
        { name: 'Fri', interviews: 15 },
        { name: 'Sat', interviews: 10 },
        { name: 'Sun', interviews: 6 },
    ];

    useEffect(() => {
        // Fetch stats from backend
        // For now, using mock or fetching from our new API
        const fetchStats = async () => {
            try {
                if (!currentUser) return;
                const token = await currentUser.getIdToken();
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/admin/stats`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Error fetching admin stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();

        // Poll for live stats every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, [currentUser]);

    return (
        <div className="admin-page">
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">Dashboard Overview</h1>
                    <p style={{ color: 'var(--admin-text-muted)' }}>Welcome back, Admin</p>
                </div>
            </header>

            <div className="stats-grid">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="stat-card"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate('/admin/live-interviews')}
                    whileHover={{ translateY: -5, boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.3)' }}
                >
                    <div className="stat-card-header">
                        <div>
                            <div className="stat-value">{stats.liveInterviews}</div>
                            <div className="stat-label">Live Interviews</div>
                        </div>
                        <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                            <Video size={24} />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="stat-card"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate('/admin/candidates')}
                    whileHover={{ translateY: -5, boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.3)' }}
                >
                    <div className="stat-card-header">
                        <div>
                            <div className="stat-value">{stats.totalUsers}</div>
                            <div className="stat-label">Total Candidates</div>
                        </div>
                        <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                            <Users size={24} />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="stat-card"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate('/admin/live-interviews')}
                    whileHover={{ translateY: -5, boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.3)' }}
                >
                    <div className="stat-card-header">
                        <div>
                            <div className="stat-value">{stats.totalInterviews}</div>
                            <div className="stat-label">Total Completed</div>
                        </div>
                        <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                            <Clock size={24} />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="stat-card"
                    style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}
                >
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Interview Activity</h3>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorInterviews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="interviews" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorInterviews)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminDashboard;
