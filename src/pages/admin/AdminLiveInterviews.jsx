import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Video, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Admin.css';

const AdminLiveInterviews = () => {
    const { currentUser } = useAuth();
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchInterviews = async () => {
        try {
            if (!currentUser) return;
            const token = await currentUser.getIdToken();
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/admin/interviews`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setInterviews(data.interviews);
            }
        } catch (error) {
            console.error("Error fetching interviews", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInterviews();
        // Poll for updates
        const interval = setInterval(fetchInterviews, 10000);
        return () => clearInterval(interval);
    }, [currentUser]);

    const handleCancel = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this interview?")) return;

        try {
            const token = await currentUser.getIdToken();
            await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/admin/interviews/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            fetchInterviews(); // Refresh
        } catch (error) {
            console.error("Error canceling interview", error);
        }
    };

    // Filter for Live vs Others
    const liveInterviews = interviews.filter(i => i.status === 'started');
    const pastInterviews = interviews.filter(i => i.status !== 'started');

    const InterviewRow = ({ interview, isLive }) => (
        <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ borderBottom: '1px solid var(--admin-border)' }}
        >
            <td style={{ padding: '16px' }}>{interview.callId.substring(0, 8)}...</td>
            <td style={{ padding: '16px' }}>{interview.jobRole}</td>
            <td style={{ padding: '16px' }}>
                <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    background: isLive ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                    color: isLive ? '#ef4444' : '#10b981',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    {isLive && <span className="live-indicator animate-pulse"></span>}
                    {interview.status || 'Completed'}
                </span>
            </td>
            <td style={{ padding: '16px' }}>{new Date(interview.createdAt).toLocaleString()}</td>
            <td style={{ padding: '16px' }}>
                {isLive && (
                    <button
                        onClick={() => handleCancel(interview.id)}
                        style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: 'none',
                            color: '#ef4444',
                            padding: '8px',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                        title="Cancel/Terminate"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </td>
        </motion.tr>
    );

    return (
        <div className="admin-page">
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">Live Monitor</h1>
                    <p style={{ color: 'var(--admin-text-muted)' }}>Track active and past interviews</p>
                </div>
            </header>

            {/* Live Section */}
            {liveInterviews.length > 0 && (
                <div style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 10px #ef4444' }}></span>
                        Happening Now
                    </h2>
                    <div className="stat-card" style={{ padding: 0 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#e2e8f0' }}>
                            <thead style={{ background: 'rgba(0,0,0,0.2)' }}>
                                <tr>
                                    <th style={{ padding: '16px' }}>ID</th>
                                    <th style={{ padding: '16px' }}>Role</th>
                                    <th style={{ padding: '16px' }}>Status</th>
                                    <th style={{ padding: '16px' }}>Started At</th>
                                    <th style={{ padding: '16px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {liveInterviews.map(i => <InterviewRow key={i.id} interview={i} isLive={true} />)}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Past Section */}
            <div>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>History</h2>
                <div className="stat-card" style={{ padding: 0 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#94a3b8' }}>
                        <thead style={{ background: 'rgba(0,0,0,0.2)' }}>
                            <tr>
                                <th style={{ padding: '16px' }}>ID</th>
                                <th style={{ padding: '16px' }}>Role</th>
                                <th style={{ padding: '16px' }}>Status</th>
                                <th style={{ padding: '16px' }}>Date</th>
                                <th style={{ padding: '16px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {pastInterviews.map(i => <InterviewRow key={i.id} interview={i} isLive={false} />)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminLiveInterviews;
