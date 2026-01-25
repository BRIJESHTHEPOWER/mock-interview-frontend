// ============================================
// FEEDBACK DETAILS PAGE
// ============================================
// View detailed AI feedback for a specific past interview

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import './Dashboard.css'; // Reuse dashboard styles for consistency

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
        if (!seconds) return 'N/A';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    return (
        <div className="dashboard-container" style={{ minHeight: '100vh', padding: '100px 20px' }}>
            <div className="interview-card" style={{ maxWidth: '900px', margin: '0 auto', cursor: 'default', transform: 'none' }}>
                <button onClick={() => navigate('/dashboard')} className="back-btn" style={{ marginBottom: '20px', background: 'transparent', border: '1px solid #555', color: '#fff', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' }}>
                    ← Back to Dashboard
                </button>

                <h1 style={{ fontSize: '2rem', marginBottom: '10px', color: 'white' }}>{jobRole} Interview Result</h1>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px', background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px' }}>
                    <div>
                        <strong style={{ color: '#aaa', display: 'block', marginBottom: '5px' }}>Date</strong>
                        <span style={{ color: '#fff' }}>{formatDate(startedAt)}</span>
                    </div>
                    <div>
                        <strong style={{ color: '#aaa', display: 'block', marginBottom: '5px' }}>Duration</strong>
                        <span style={{ color: '#fff' }}>{formatDuration(duration)}</span>
                    </div>
                </div>

                {feedback ? (
                    <div className="feedback-content">
                        <h2 style={{ borderBottom: '2px solid #00c8ff', paddingBottom: '10px', marginBottom: '20px', color: '#00c8ff' }}>🧠 AI Interview Feedback</h2>

                        {/* Display raw feedback text */}
                        {typeof feedback === 'string' ? (
                            <div style={{ background: 'rgba(0,200,255,0.05)', padding: '25px', borderRadius: '12px', border: '1px solid rgba(0,200,255,0.2)' }}>
                                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', color: '#ddd', lineHeight: '1.8', fontSize: '15px', margin: 0 }}>
                                    {feedback}
                                </pre>
                            </div>
                        ) : (
                            /* Display structured feedback if available */
                            <>
                                {feedback.score && (
                                    <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                                        <span style={{ fontSize: '3rem', fontWeight: 'bold', color: '#00c8ff' }}>{feedback.score}/10</span>
                                        <p style={{ color: '#ccc' }}>AI Performance Score</p>
                                    </div>
                                )}

                                {feedback.summary && (
                                    <>
                                        <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '15px', color: '#fff' }}>Executive Summary</h3>
                                        <p style={{ lineHeight: '1.6', color: '#ddd', marginBottom: '30px' }}>{feedback.summary}</p>
                                    </>
                                )}

                                {feedback.strengths && (
                                    <>
                                        <h3 style={{ color: '#00ff80', marginBottom: '10px' }}>✅ Strengths</h3>
                                        <ul style={{ paddingLeft: '20px', marginBottom: '20px', color: '#ddd' }}>
                                            {feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                        </ul>
                                    </>
                                )}

                                {feedback.weaknesses && (
                                    <>
                                        <h3 style={{ color: '#ff6b6b', marginBottom: '10px' }}>⚠️ Areas for Improvement</h3>
                                        <ul style={{ paddingLeft: '20px', marginBottom: '20px', color: '#ddd' }}>
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
                    <div style={{ marginTop: '40px' }}>
                        <h2 style={{ borderBottom: '2px solid #888', paddingBottom: '10px', marginBottom: '20px', color: '#fff' }}>📝 Interview Transcript</h2>
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '8px', maxHeight: '400px', overflowY: 'auto' }}>
                            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', color: '#ccc', lineHeight: '1.6', fontSize: '14px', margin: 0 }}>
                                {transcript}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
