import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, User, Tag, Search, Eye, Trash2, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Admin.css';

const AdminFeedback = () => {
    const { currentUser } = useAuth();
    const [feedbackList, setFeedbackList] = useState([]);
    const [users, setUsers] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFeedback, setSelectedFeedback] = useState(null);

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

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this feedback?")) return;
        try {
            const token = await currentUser.getIdToken();
            await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/admin/feedback/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchFeedback(); // Refresh
        } catch (error) {
            console.error("Error deleting feedback", error);
        }
    };

    let filteredFeedback = feedbackList;
    if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        filteredFeedback = feedbackList.filter(item => {
            const name = getUserName(item.userId).toLowerCase();
            const category = (item.category || '').toLowerCase();
            const message = (item.message || '').toLowerCase();
            return name.includes(lowerSearch) || category.includes(lowerSearch) || message.includes(lowerSearch);
        });
    }

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

            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '10px 16px', borderRadius: '12px', width: '100%', maxWidth: '400px', border: '1px solid var(--admin-border)' }}>
                <Search size={20} color="#94a3b8" style={{ marginRight: '10px' }} />
                <input 
                    type="text" 
                    placeholder="Search user, category, or message..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ background: 'transparent', border: 'none', color: '#fff', width: '100%', outline: 'none', fontSize: '1rem' }}
                />
            </div>

            <div className="stat-card" style={{ padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#e2e8f0' }}>
                    <thead style={{ background: 'rgba(0,0,0,0.2)' }}>
                        <tr>
                            <th style={{ padding: '16px' }}>User</th>
                            <th style={{ padding: '16px' }}>Rating</th>
                            <th style={{ padding: '16px' }}>Category</th>
                            <th style={{ padding: '16px' }}>Message</th>
                            <th style={{ padding: '16px' }}>Date</th>
                            <th style={{ padding: '16px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredFeedback.map(item => (
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
                                <td style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            style={{ background: 'rgba(59, 130, 246, 0.1)', border: 'none', color: '#3b82f6', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                                            onClick={() => setSelectedFeedback(item)}
                                            title="View Details"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                                            onClick={() => handleDelete(item.id)}
                                            title="Delete Feedback"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                        {filteredFeedback.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                                    No feedback found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Details Modal */}
            <AnimatePresence>
                {selectedFeedback && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="admin-modal-overlay"
                        onClick={() => setSelectedFeedback(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="admin-modal-content"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="admin-modal-header">
                                <h2>Feedback Details</h2>
                                <button onClick={() => setSelectedFeedback(null)} className="close-btn"><X size={20} /></button>
                            </div>

                            <div className="admin-modal-body">
                                <div className="detail-section">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
                                            {getUserName(selectedFeedback.userId).charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{getUserName(selectedFeedback.userId)}</h3>
                                            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>{selectedFeedback.category} • {new Date(selectedFeedback.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="detail-section">
                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e2e8f0', marginBottom: '10px' }}><Star size={16} /> Rating</h4>
                                    <div style={{ display: 'flex', gap: '4px' }}>{renderStars(selectedFeedback.rating)}</div>
                                </div>

                                <div className="detail-section">
                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e2e8f0', marginBottom: '10px' }}><MessageSquare size={16} /> Message</h4>
                                    <div className="detail-box" style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', lineHeight: '1.6' }}>
                                        {selectedFeedback.message.split('\n').map((line, i) => <p key={i} style={{ margin: 0, marginBottom: '8px' }}>{line}</p>)}
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

export default AdminFeedback;
