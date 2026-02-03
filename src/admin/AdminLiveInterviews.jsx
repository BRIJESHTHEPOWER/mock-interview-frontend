import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Video, Eye, X, MessageSquare, FileText, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Admin.css';

const AdminLiveInterviews = () => {
    const { currentUser } = useAuth();
    const [interviews, setInterviews] = useState([]);
    const [users, setUsers] = useState({}); // Map uid -> user data
    const [loading, setLoading] = useState(true);
    const [selectedInterview, setSelectedInterview] = useState(null);

    // Fetch Users to map IDs to Names
    const fetchUsers = async () => {
        try {
            if (!currentUser) return;
            const token = await currentUser.getIdToken();
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                const userMap = {};
                if (data.users) {
                    data.users.forEach(u => userMap[u.uid] = u);
                }
                setUsers(userMap);
            }
        } catch (error) {
            console.error("Error fetching users for mapping", error);
        }
    };

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
        fetchUsers();
        fetchInterviews();
        // Poll for updates
        const interval = setInterval(fetchInterviews, 10000);
        return () => clearInterval(interval);
    }, [currentUser]);

    const handleCancel = async (e, id) => {
        e.stopPropagation(); // Prevent opening modal
        if (!window.confirm("Are you sure you want to cancel this interview?")) return;

        try {
            const token = await currentUser.getIdToken();
            await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/admin/interviews/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchInterviews(); // Refresh
        } catch (error) {
            console.error("Error canceling interview", error);
        }
    };

    // Filter for Live vs Others
    const liveInterviews = interviews.filter(i => i.status === 'started');
    const pastInterviews = interviews.filter(i => i.status !== 'started');

    const getUserName = (uid) => {
        if (!uid) return 'Unknown Candidate';
        const user = users[uid];
        return user ? (user.displayName || user.email) : 'Unknown Candidate';
    };

    const getUserEmail = (uid) => {
        if (!uid) return '';
        const user = users[uid];
        return user ? user.email : '';
    };

    const InterviewRow = ({ interview, isLive }) => (
        <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ borderBottom: '1px solid var(--admin-border)', cursor: 'pointer' }}
            onClick={() => setSelectedInterview(interview)}
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
        >
            <td style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: isLive ? '#ef4444' : '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 'bold' }}>
                        {getUserName(interview.userId).charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style={{ fontWeight: '500', color: '#fff' }}>{getUserName(interview.userId)}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{getUserEmail(interview.userId)}</div>
                    </div>
                </div>
            </td>
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
                        onClick={(e) => handleCancel(e, interview.id)}
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
                {!isLive && (
                    <button
                        style={{
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: 'none',
                            color: '#3b82f6',
                            padding: '8px',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                        onClick={() => setSelectedInterview(interview)}
                    >
                        <Eye size={16} />
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
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 10px #ef4444' }}></span>
                        Happening Now ({liveInterviews.length})
                    </h2>
                    <div className="stat-card" style={{ padding: 0 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#e2e8f0' }}>
                            <thead style={{ background: 'rgba(0,0,0,0.2)' }}>
                                <tr>
                                    <th style={{ padding: '16px', textAlign: 'left' }}>Candidate</th>
                                    <th style={{ padding: '16px', textAlign: 'left' }}>Role</th>
                                    <th style={{ padding: '16px', textAlign: 'left' }}>Status</th>
                                    <th style={{ padding: '16px', textAlign: 'left' }}>Started At</th>
                                    <th style={{ padding: '16px', textAlign: 'left' }}>Actions</th>
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
                                <th style={{ padding: '16px', textAlign: 'left' }}>Candidate</th>
                                <th style={{ padding: '16px', textAlign: 'left' }}>Role</th>
                                <th style={{ padding: '16px', textAlign: 'left' }}>Status</th>
                                <th style={{ padding: '16px', textAlign: 'left' }}>Date</th>
                                <th style={{ padding: '16px', textAlign: 'left' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pastInterviews.map(i => <InterviewRow key={i.id} interview={i} isLive={false} />)}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Details Modal */}
            <AnimatePresence>
                {selectedInterview && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="admin-modal-overlay"
                        onClick={() => setSelectedInterview(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="admin-modal-content"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="admin-modal-header">
                                <h2>Interview Details</h2>
                                <button onClick={() => setSelectedInterview(null)} className="close-btn"><X size={20} /></button>
                            </div>

                            <div className="admin-modal-body">
                                <div className="detail-section">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
                                            {getUserName(selectedInterview.userId).charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{getUserName(selectedInterview.userId)}</h3>
                                            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>{selectedInterview.jobRole} • {new Date(selectedInterview.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="detail-section">
                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e2e8f0', marginBottom: '10px' }}><MessageSquare size={16} /> Transcript</h4>
                                    <div className="detail-box transcript-box">
                                        {selectedInterview.transcript ? (
                                            selectedInterview.transcript.split('\n').map((line, i) => (
                                                <p key={i} style={{ marginBottom: '8px' }}>{line}</p>
                                            ))
                                        ) : (
                                            <p style={{ color: '#64748b', fontStyle: 'italic' }}>No transcript available for this session.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="detail-section">
                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e2e8f0', marginBottom: '10px' }}><FileText size={16} /> Feedback</h4>
                                    <div className="detail-box feedback-box">
                                        {selectedInterview.feedback ? (
                                            typeof selectedInterview.feedback === 'object' ? (
                                                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{JSON.stringify(selectedInterview.feedback, null, 2)}</pre>
                                            ) : (
                                                <div dangerouslySetInnerHTML={{ __html: selectedInterview.feedback.replace(/\n/g, '<br/>') }} />
                                            )
                                        ) : (
                                            <p style={{ color: '#64748b', fontStyle: 'italic' }}>No feedback available yet.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminLiveInterviews;
