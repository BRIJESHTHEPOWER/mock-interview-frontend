import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Calendar, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Admin.css';

const AdminCandidates = () => {
    const { currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                if (!currentUser) return;
                const token = await currentUser.getIdToken();
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/admin/users`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUsers(data.users);
                }
            } catch (error) {
                console.error("Error fetching users", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [currentUser]);

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.displayName && user.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="admin-page">
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">Candidate Directory</h1>
                    <p style={{ color: 'var(--admin-text-muted)' }}>Manage and view user information</p>
                </div>

                <div style={{ position: 'relative' }}>
                    <Search className="input-icon" size={18} style={{ top: '50%', transform: 'translateY(-50%)', left: '12px' }} />
                    <input
                        type="text"
                        placeholder="Search candidates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '10px 10px 10px 40px',
                            background: 'rgba(30, 41, 59, 0.7)',
                            border: '1px solid var(--admin-border)',
                            borderRadius: '8px',
                            color: 'white',
                            width: '300px'
                        }}
                    />
                </div>
            </header>

            <div className="stat-card" style={{ padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#e2e8f0' }}>
                    <thead style={{ background: 'rgba(0,0,0,0.2)' }}>
                        <tr>
                            <th style={{ padding: '16px' }}>User</th>
                            <th style={{ padding: '16px' }}>Email</th>
                            <th style={{ padding: '16px' }}>Joined</th>
                            <th style={{ padding: '16px' }}>Last Active</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <motion.tr
                                key={user.uid}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{ borderBottom: '1px solid var(--admin-border)' }}
                            >
                                <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                        {user.photoURL ? (
                                            <img src={user.photoURL} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{(user.displayName || user.email || 'U').charAt(0).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <span>{user.displayName || 'No Name'}</span>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Mail size={14} className="text-slate-400" />
                                        {user.email}
                                    </div>
                                </td>
                                <td style={{ padding: '16px', color: '#94a3b8' }}>
                                    {new Date(user.creationTime).toLocaleDateString()}
                                </td>
                                <td style={{ padding: '16px', color: '#94a3b8' }}>
                                    {new Date(user.lastSignInTime).toLocaleDateString()}
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminCandidates;
