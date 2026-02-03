import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import './Admin.css';

const AdminNewsletter = () => {
    const { currentUser } = useAuth();
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState(null); // 'success' | 'error'

    const handleSend = async (e) => {
        e.preventDefault();
        setSending(true);
        setStatus(null);

        try {
            const token = await currentUser.getIdToken();
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/admin/newsletter`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    subject,
                    message,
                    recipients: 'all' // Default to all for now
                })
            });

            const data = await response.json();
            if (response.ok) {
                setStatus('success');
                setSubject('');
                setMessage('');
            } else {
                throw new Error(data.error || 'Failed to send');
            }
        } catch (error) {
            console.error(error);
            setStatus('error');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="admin-page">
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">Newsletter</h1>
                    <p style={{ color: 'var(--admin-text-muted)' }}>Broadcast updates to all candidates</p>
                </div>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="newsletter-editor"
            >
                {status === 'success' && (
                    <div className="admin-error-message" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
                        <CheckCircle size={18} />
                        <span>Newsletter sent successfully!</span>
                    </div>
                )}

                {status === 'error' && (
                    <div className="admin-error-message">
                        <AlertCircle size={18} />
                        <span>Failed to send newsletter. Please try again.</span>
                    </div>
                )}

                <form onSubmit={handleSend}>
                    <div className="form-group">
                        <label>Subject Line</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g., New Features: Interview AI 2.0 Released!"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Message Content</label>
                        <textarea
                            className="form-textarea"
                            placeholder="Write your update here..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            type="submit"
                            className="admin-login-btn"
                            style={{ width: 'auto', padding: '12px 24px' }}
                            disabled={sending}
                        >
                            {sending ? 'Sending...' : 'Send Broadcast'}
                            <Send size={18} />
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default AdminNewsletter;
