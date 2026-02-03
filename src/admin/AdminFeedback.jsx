import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, User, Tag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Admin.css';

const AdminFeedback = () => {
    const { currentUser } = useAuth();
    const [feedbackList, setFeedbackList] = useState([]);
    const [users, setUsers] = useState({});
    const [loading, setLoading] = useState(true);

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
            console.error("Error fetching users", error);
        }
    };

    const fetchFeedback = async () => {
        try {
            if (!currentUser) return;
            const token = await currentUser.getIdToken();
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/admin/feedback`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setFeedbackList(data.feedback);
            }
        } catch (error) {
            console.error("Error fetching feedback", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchFeedback();
    }, [currentUser]);

    const getUserName = (uid) => {
        if (!uid || uid === 'anonymous') return 'Anonymous User';
        const user = users[uid];
        return user ? (user.displayName || user.email) : 'Unknown User';
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <Star
                key={i}
                size={14}
                fill={i < rating ? "#eab308" : "none"}
                color={i < rating ? "#eab308" : "#94a3b8"}
            />
        ));
    };

    return (
        <div className="admin-page">
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">User Feedback</h1>
                    <p style={{ color: 'var(--admin-text-muted)' }}>Reviews and suggestions from users</p>
                </div>
            </header>

            <div className="stat-card" style={{ padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#e2e8f0' }}>
                    <thead style={{ background: 'rgba(0,0,0,0.2)' }}>
                        <tr>
                            <th style={{ padding: '16px' }}>User</th>
                            <th style={{ padding: '16px' }}>Rating</th>
                            <th style={{ padding: '16px' }}>Category</th>
                            <th style={{ padding: '16px' }}>Message</th>
                            <th style={{ padding: '16px' }}>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {feedbackList.map(item => (
                            <motion.tr
                                key={item.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{ borderBottom: '1px solid var(--admin-border)' }}
                            >
                                <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ padding: '6px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '6px', color: '#3b82f6' }}>
                                        <User size={16} />
                                    </div>
                                    <span style={{ fontSize: '0.95rem' }}>{getUserName(item.userId)}</span>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', gap: '2px' }}>
                                        {renderStars(item.rating)}
                                    </div>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        color: '#cbd5e1'
                                    }}>
                                        {item.category}
                                    </span>
                                </td>
                                <td style={{ padding: '16px', maxWidth: '300px' }}>
                                    <div style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                                        {item.message}
                                    </div>
                                </td>
                                <td style={{ padding: '16px', color: '#94a3b8', fontSize: '0.9rem' }}>
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </td>
                            </motion.tr>
                        ))}
                        {feedbackList.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                                    No feedback received yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminFeedback;
