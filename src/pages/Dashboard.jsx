// ============================================
// DASHBOARD PAGE (FIXED)
// ============================================

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    collection,
    query,
    where,
    onSnapshot,
    deleteDoc,
    doc,
    orderBy,
    limit
} from 'firebase/firestore';
import { db } from '../config/firebase';
import './Dashboard.css';

export default function Dashboard() {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    // ===============================
    // FETCH INTERVIEWS (REAL-TIME) - OPTIMIZED
    // ===============================
    useEffect(() => {
        if (!currentUser?.uid) return;

        setLoading(true);

        // Optimized query: limit to 20 most recent interviews, ordered by server
        const q = query(
            collection(db, 'interviews'),
            where('userId', '==', currentUser.uid),
            orderBy('startedAt', 'desc'),
            limit(20)
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const interviewData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Data already sorted by Firestore
                setInterviews(interviewData);
                setLoading(false);
                setError(null);
            },
            (err) => {
                console.error('Firestore error:', err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [currentUser]);

    // ===============================
    // LOGOUT
    // ===============================
    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    // Memoize formatters to avoid recreating on every render
    const formatDate = useMemo(() => (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    }, []);

    const formatDuration = useMemo(() => (seconds) => {
        if (seconds === undefined || seconds === null) return 'N/A';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    }, []);

    // ===============================
    // UI
    // ===============================
    return (
        <div className="dashboard-container">


            <main className="dashboard-main">

                <div className="welcome-section">
                    <h2>Welcome back! 👋</h2>
                    <p>Ready to practice your interview skills?</p>
                    <button
                        onClick={() => navigate('/interview/setup')}
                        className="new-interview-btn"
                    >
                        + Start New Interview
                    </button>
                </div>

                <div className="history-section">
                    <h3>📚 Interview History</h3>

                    {error && (
                        <div className="error-banner">
                            <strong>Error:</strong> {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="loading-skeleton">
                            <div className="skeleton-card"></div>
                            <div className="skeleton-card"></div>
                            <div className="skeleton-card"></div>
                        </div>
                    ) : interviews.length === 0 ? (
                        <div className="empty-state">
                            <p>No interviews yet. Start your first one!</p>
                        </div>
                    ) : (
                        <div className="interview-list">
                            {interviews.map((interview) => (
                                <div key={interview.id} className="interview-card">

                                    <div className="interview-header">
                                        <h4>{interview.jobRole || 'Interview'}</h4>
                                        <span className={`status-badge ${interview.status || 'completed'}`}>
                                            {interview.status || 'completed'}
                                        </span>
                                    </div>

                                    <div className="interview-details">
                                        <p>📅 {formatDate(interview.startedAt)}</p>

                                        {interview.duration !== undefined && (
                                            <p>⏱️ Duration: {formatDuration(interview.duration)}</p>
                                        )}

                                        {/* ===============================
                                            AI FEEDBACK
                                        =============================== */}
                                        {interview.status === 'processing' && (
                                            <p className="processing-text">
                                                ⏳ Generating AI Feedback...
                                            </p>
                                        )}

                                        {interview.feedback && (
                                            <div className="feedback-summary">
                                                <strong>AI Score:</strong> {interview.feedback.score}
                                                <p style={{ marginTop: '8px', fontStyle: 'italic' }}>
                                                    "{interview.feedback.summary}"
                                                </p>
                                            </div>
                                        )}

                                        {!interview.feedback && interview.status === 'completed' && (
                                            <p className="no-feedback">
                                                ❌ Feedback generation failed
                                            </p>
                                        )}
                                        {/* ACTION BUTTONS */}
                                        <div className="card-actions">
                                            <button
                                                className="view-btn"
                                                onClick={() => navigate(`/interview/history/${interview.id}`)}
                                            >
                                                👁 View
                                            </button>
                                            <button
                                                className="delete-btn"
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    if (window.confirm('Are you sure you want to delete this interview history?')) {
                                                        try {
                                                            await deleteDoc(doc(db, 'interviews', interview.id));
                                                        } catch (err) {
                                                            console.error('Error deleting interview:', err);
                                                            alert('Failed to delete.');
                                                        }
                                                    }
                                                }}
                                            >
                                                🗑 Delete
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
