// ============================================
// FEEDBACK DETAILS PAGE
// ============================================
// View detailed AI feedback for a specific past interview

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import './FeedbackDetails.css'; // Use dedicated styles with light mode support

export default function FeedbackDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInterview = async () => {
            try {
                const docRef = doc(db, 'interviews', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setInterview({ id: docSnap.id, ...docSnap.data() });
                } else {
                    alert('Interview not found');
                    navigate('/dashboard');
                }
            } catch (err) {
                console.error('Error fetching interview:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchInterview();
    }, [id, navigate]);

    if (loading) return <div className="dashboard-container"><p style={{ textAlign: 'center', marginTop: '100px' }}>Loading details...</p></div>;
    if (!interview) return null;

    const { jobRole, startedAt, duration, feedback, transcript } = interview;

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString();
    };

    const formatDuration = (seconds) => {
        if (seconds === undefined || seconds === null) return 'N/A';
        const s = parseInt(seconds) || 0;
        if (s <= 0) return '0s';
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    return (
        <div className="feedback-details-container">
            <div className="feedback-details-card">
                <button onClick={() => navigate('/dashboard')} className="feedback-back-btn">
                    ← Back to Dashboard
                </button>

                <h1 className="feedback-title">{jobRole} Interview Result</h1>

                <div className="feedback-meta-grid">
                    <div className="feedback-meta-item">
                        <strong>Date</strong>
                        <span>{formatDate(startedAt)}</span>
                    </div>
                    <div className="feedback-meta-item">
                        <strong>Duration</strong>
                        <span>{formatDuration(duration)}</span>
                    </div>
                </div>

                {feedback ? (
                    <div className="feedback-content">
                        <h2 className="feedback-section-title">🧠 AI Interview Feedback</h2>

                        {/* Display raw feedback text */}
                        {typeof feedback === 'string' ? (
                            <div className="feedback-text-box">
                                <pre>
                                    {feedback}
                                </pre>
                            </div>
                        ) : (
                            /* Display structured feedback if available */
                            <>
                                {feedback.score && (
                                    <div className="feedback-score">
                                        <span className="feedback-score-value">{feedback.score}/10</span>
                                        <p className="feedback-score-label">AI Performance Score</p>
                                    </div>
                                )}

                                {feedback.summary && (
                                    <>
                                        <h3 className="feedback-subsection-title">Executive Summary</h3>
                                        <p className="feedback-subsection-text">{feedback.summary}</p>
                                    </>
                                )}

                                {feedback.strengths && (
                                    <>
                                        <h3 style={{ color: '#00ff80', marginBottom: '10px' }}>✅ Strengths</h3>
                                        <ul className="feedback-list">
                                            {feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                        </ul>
                                    </>
                                )}

                                {feedback.weaknesses && (
                                    <>
                                        <h3 style={{ color: '#ff6b6b', marginBottom: '10px' }}>⚠️ Areas for Improvement</h3>
                                        <ul className="feedback-list">
                                            {feedback.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                                        </ul>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '50px', background: 'rgba(255,107,107,0.1)', borderRadius: '8px', border: '1px solid rgba(255,107,107,0.3)' }}>
                        <p style={{ color: '#ff6b6b', fontSize: '18px' }}>❌ No AI feedback was generated for this interview.</p>
                        <p style={{ color: '#aaa', fontSize: '14px', marginTop: '10px' }}>This may happen if the interview was too short or there was an error during processing.</p>
                    </div>
                )}

                {/* Transcript Section */}
                {transcript && transcript !== 'No transcript available' && (
                    <div className="transcript-section">
                        <h2 className="feedback-section-title">📝 Interview Transcript</h2>
                        <div className="transcript-box">
                            <pre>
                                {transcript}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
