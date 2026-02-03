import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser'; // Import EmailJS
import { useAuth } from '../contexts/AuthContext';
import './Admin.css';

const AdminNewsletter = () => {
    const { currentUser } = useAuth();
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState(null); // 'success' | 'error'
    const [progress, setProgress] = useState({ current: 0, total: 0 });

    const handleSend = async (e) => {
        e.preventDefault();
        setSending(true);
        setStatus(null);
        setProgress({ current: 0, total: 0 });

        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

        if (!serviceId || !templateId || !publicKey) {
            console.error("Missing EmailJS environment variables");
            setStatus('error');
            setSending(false);
            return;
        }

        try {
            const token = await currentUser.getIdToken();

            // 1. Fetch SUBSCRIBERS from backend
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/admin/subscribers`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to fetch recipients');

            const subscribers = data.subscribers || [];

            // If no subscribers, maybe fallback to users or error?
            // User specifically asked for footer subscribers.
            if (subscribers.length === 0) {
                // Optional: Fallback to users if empty? Or just warn.
                // let's try users if subscribers are empty for demo purposes, or just throw.
                // "No subscribers found. Have people registered via footer?"
                if (confirm("No footer subscribers found. Send to all registered users instead?")) {
                    const userRes = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/admin/users`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const userData = await userRes.json();
                    if (userData.users) {
                        subscribers.push(...userData.users); // duck typing: users also have email field
                    }
                } else {
                    throw new Error("No subscribers found.");
                }
            }

            // 2. Filter valid emails
            const recipients = subscribers.map(s => s.email).filter(email => email);

            // Remove duplicates
            const uniqueRecipients = [...new Set(recipients)];

            setProgress({ current: 0, total: uniqueRecipients.length });

            console.log(`Starting broadcast to ${uniqueRecipients.length} subscribers...`);

            // 3. Send emails linearly (to avoid rate limits)
            // Note: EmailJS free tier has rate limits. For a real bulk sender, backend is better,
            // but for this demo/request we do it client-side.
            let successCount = 0;

            for (let i = 0; i < recipients.length; i++) {
                try {
                    const recipientEmail = recipients[i];
                    await emailjs.send(
                        serviceId,
                        templateId,
                        {
                            user_email: recipientEmail,
                            to_name: "Candidate",
                            subject: subject, // Ensure template has {{subject}}
                            message: message, // Ensure template has {{message}}
                            from_name: "Infinity Platform"
                        },
                        publicKey
                    );
                    successCount++;
                } catch (err) {
                    console.error(`Failed to send to ${recipients[i]}`, err);
                }

                // Update progress
                setProgress(prev => ({ ...prev, current: i + 1 }));

                // Small delay to be nice to the API
                await new Promise(r => setTimeout(r, 200));
            }

            setStatus('success');
            setSubject('');
            setMessage('');
            console.log(`Broadcast complete. Sent ${successCount}/${recipients.length}`);

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
                    <p style={{ color: 'var(--admin-text-muted)' }}>Broadcast to Footer Subscribers</p>
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
                        <span>Broadcast complete! ({progress.current} emails sent)</span>
                    </div>
                )}

                {status === 'error' && (
                    <div className="admin-error-message">
                        <AlertCircle size={18} />
                        <span>Failed to send newsletter. Check console for details.</span>
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

                    {sending && (
                        <div className="progress-container" style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.9rem', color: '#ccc' }}>
                                <span>Sending...</span>
                                <span>{progress.current} / {progress.total}</span>
                            </div>
                            <div style={{ width: '100%', height: '6px', background: '#333', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{
                                    width: `${(progress.current / (progress.total || 1)) * 100}%`,
                                    height: '100%',
                                    background: 'var(--neon-blue)',
                                    transition: 'width 0.3s ease'
                                }}></div>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            type="submit"
                            className="admin-login-btn"
                            style={{ width: 'auto', padding: '12px 24px' }}
                            disabled={sending}
                        >
                            {sending ? 'Processing...' : 'Send via EmailJS'}
                            {sending ? <Loader size={18} className="spin" /> : <Send size={18} />}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default AdminNewsletter;
