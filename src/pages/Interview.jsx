// ============================================
// INTERVIEW SESSION PAGE
// ============================================
// Google Meet style interface

import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRetell } from '../hooks/useRetell';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, set, remove } from 'firebase/database';
import { db, rtdb } from '../config/firebase';
import axios from 'axios';
import AIAvatar from '../components/AIAvatar';
import './Interview.css';

// LIGHT THEME STYLES
// Main background: #f8f9fa
// Footer/Bar: #ffffff
// Text: #202124

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function Interview() {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const jobRole = location.state?.jobRole || 'Frontend Developer';

    const [sessionData, setSessionData] = useState(null);
    const [error, setError] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [timer, setTimer] = useState(0);
    const [interviewId, setInterviewId] = useState(null);
    const [isCameraOn, setIsCameraOn] = useState(true); // Default to camera ON
    const [localStream, setLocalStream] = useState(null);

    const videoRef = useRef(null);

    const timerRef = useRef(null);
    const initializationRef = useRef(false);
    const { startCall, stopCall, toggleMute, callStatus, isAgentSpeaking, error: retellError } = useRetell();

    // Create interview session on mount
    useEffect(() => {
        if (initializationRef.current) return;
        initializationRef.current = true;

        createInterviewSession();

        // Initialize camera
        enableCamera();

        // Cleanup on unmount
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            stopCall(); // Ensure call is stopped when leaving page

            // Allow a small delay before stopping tracks to prevent UI flicker/issues
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Effect to attach stream to video element
    useEffect(() => {
        if (isCameraOn && localStream && videoRef.current) {
            videoRef.current.srcObject = localStream;
        }
    }, [isCameraOn, localStream]);

    // Start timer when call becomes active
    useEffect(() => {
        if (callStatus === 'active') {
            timerRef.current = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [callStatus]);

    // Handle call end
    useEffect(() => {
        if (callStatus === 'ended' && interviewId) {
            handleInterviewEnd();
        }
    }, [callStatus]);

    const createInterviewSession = async () => {
        try {
            console.log('📞 Creating interview session for:', jobRole);
            const response = await axios.post(`${BACKEND_URL}/create-interview`, { jobRole });

            if (!response.data.success) {
                throw new Error(response.data.error || 'Failed to create session');
            }

            const { callId, accessToken, agentId } = response.data;
            setSessionData({ callId, accessToken, agentId });

            const newInterviewId = `interview_${Date.now()}`;
            setInterviewId(newInterviewId);

            await setDoc(doc(db, 'interviews', newInterviewId), {
                userId: currentUser.uid,
                jobRole,
                callId,
                startedAt: new Date(),
                status: 'active'
            });

            await set(ref(rtdb, `liveSessions/${currentUser.uid}`), {
                active: true,
                callId,
                jobRole,
                startedAt: new Date().toISOString()
            });

            await startCall(callId, accessToken);

        } catch (err) {
            console.error('❌ Error creating session:', err);
            setError(err.response?.data?.error || err.message || 'Failed to start interview');
        }
    };



    const handleInterviewEnd = async () => {
        try {
            stopCall(); // Stop the call immediately

            console.log('📞 Interview ended, saving basic data...');
            console.log('Interview ID:', interviewId);
            console.log('Call ID:', sessionData?.callId);
            console.log('Job Role:', jobRole);
            console.log('Duration:', timer);

            // Simply update Firestore with end time and duration
            if (interviewId) {
                await updateDoc(doc(db, 'interviews', interviewId), {
                    endedAt: new Date(),
                    duration: timer,
                    status: 'processing',
                });
                console.log('✅ Interview data saved to Firestore');
            } else {
                console.error('❌ No interview ID found!');
            }

            // Trigger backend to fetch transcript and generate feedback
            if (sessionData?.callId) {
                try {
                    console.log('🔄 Triggering feedback generation...');
                    const response = await axios.post(`${BACKEND_URL}/process-interview`, {
                        callId: sessionData.callId,
                        userId: currentUser.uid,
                        jobRole: jobRole
                    });
                    console.log('✅ Feedback generation response:', response.data);
                } catch (err) {
                    console.error('⚠️ Failed to trigger feedback:', err);
                    console.error('Error details:', err.response?.data || err.message);
                    // Don't block navigation on this error
                }
            } else {
                console.error('❌ No call ID found in session data!');
            }

            // Remove live session
            await remove(ref(rtdb, `liveSessions/${currentUser.uid}`));
            console.log('✅ Live session removed from RTDB');

            // Navigate to dashboard - feedback will appear when webhook completes
            console.log('🔄 Navigating to dashboard...');
            navigate('/dashboard');

        } catch (err) {
            console.error('❌ Error saving interview data:', err);
            navigate('/dashboard');
        }
    };

    const handleEndInterview = () => {
        stopCall();
    };

    const handleToggleMute = () => {
        const newMuteState = toggleMute();
        setIsMuted(newMuteState);
    };

    const enableCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setLocalStream(stream);
            setIsCameraOn(true);
        } catch (err) {
            console.error("Error accessing camera:", err);
            // Don't alert on mount, just fail silently or show UI state
            setIsCameraOn(false);
        }
    };

    const toggleCamera = async () => {
        if (isCameraOn) {
            // Turn off
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
                setLocalStream(null);
            }
            setIsCameraOn(false);
        } else {
            // Turn on
            await enableCamera();
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // FIREBASE DEBUG STATE
    const [firebaseStatus, setFirebaseStatus] = useState({
        firestore: 'pending',
        rtdb: 'pending',
        config: 'checking'
    });

    // Check Firebase Connection & Permissions on Mount
    useEffect(() => {
        const checkFirebase = async () => {
            // 1. Check Config
            if (!import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY.includes('your_')) {
                setFirebaseStatus(prev => ({ ...prev, config: 'MISSING_OR_PLACEHOLDER' }));
                return;
            } else {
                setFirebaseStatus(prev => ({ ...prev, config: 'ok' }));
            }

            // 2. Test Firestore Write
            try {
                await setDoc(doc(db, 'test_connection', currentUser.uid), {
                    timestamp: new Date(),
                    status: 'connected'
                });
                setFirebaseStatus(prev => ({ ...prev, firestore: 'ok' }));
            } catch (err) {
                console.error("Firestore Check Failed:", err);
                setFirebaseStatus(prev => ({ ...prev, firestore: err.code || err.message }));
            }

            // 3. Test RTDB Write
            try {
                await set(ref(rtdb, `test_connection/${currentUser.uid}`), {
                    timestamp: new Date().toISOString(),
                    status: 'connected'
                });
                setFirebaseStatus(prev => ({ ...prev, rtdb: 'ok' }));
            } catch (err) {
                console.error("RTDB Check Failed:", err);
                setFirebaseStatus(prev => ({ ...prev, rtdb: err.code || err.message }));
            }
        };

        if (currentUser) {
            checkFirebase();
        }
    }, [currentUser]);

    // Helper text for status
    const getStatusText = () => {
        if (error || retellError) return 'Error';
        switch (callStatus) {
            case 'connecting': return 'Connecting...';
            case 'active': return 'AI Interviewer';
            case 'ended': return 'Call Ended';
            default: return 'Initializing...';
        }
    };

    // INLINE STYLES TO ENSURE VISIBILITY
    const styles = {
        container: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#f0f2f5', // LIGHT GREY BACKGROUND
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        },
        window: {
            width: '90%',
            maxWidth: '1200px',
            height: '80%',
            minHeight: '600px',
            backgroundColor: '#ffffff', // WHITE WINDOW
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid #e0e0e0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        },
        header: {
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 10,
            color: '#202124', // DARK TEXT
            borderBottom: '1px solid #f0f0f0'
        },
        stage: {
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            background: '#ffffff'
        },
        controls: {
            height: '80px',
            backgroundColor: '#ffffff', // WHITE BAR
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            borderTop: '1px solid #e0e0e0'
        },
        button: {
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: '1px solid #e0e0e0',
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.window}>
                {/* DEBUG OVERLAY FOR DATABASE */}
                {(firebaseStatus.firestore !== 'ok' || firebaseStatus.rtdb !== 'ok' || firebaseStatus.config !== 'ok') && (
                    <div style={{
                        position: 'absolute', top: 50, left: 10, zIndex: 100,
                        backgroundColor: 'rgba(255,255,255,0.9)', padding: '10px', borderRadius: '8px',
                        border: '1px solid #ea4335', color: '#000', maxWidth: '300px', fontSize: '12px'
                    }}>
                        <strong>Firebase Diagnostics:</strong><br />
                        Config: {firebaseStatus.config === 'ok' ? '✅' : '❌ ' + firebaseStatus.config}<br />
                        Firestore: {firebaseStatus.firestore === 'ok' ? '✅' : '❌ ' + firebaseStatus.firestore}<br />
                        RTDB: {firebaseStatus.rtdb === 'ok' ? '✅' : '❌ ' + firebaseStatus.rtdb}<br />
                        {(firebaseStatus.firestore.includes('permission') || firebaseStatus.rtdb.includes('permission')) && (
                            <p style={{ marginTop: '5px', color: '#d97706' }}>
                                ⚠️ Permission Denied: Check Firebase Console Rules.
                            </p>
                        )}
                    </div>
                )}

                {/* Header */}
                <div style={styles.header}>
                    <div className="meet-badges" style={{ display: 'flex', gap: '10px' }}>
                        <span style={{ backgroundColor: '#ea4335', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>REC</span>
                        <span style={{ backgroundColor: '#e8eaed', color: '#3c4043', padding: '4px 8px', borderRadius: '4px', fontSize: '14px' }}>{jobRole}</span>
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: '16px' }}>{formatTime(timer)}</div>
                </div>

                {/* Main Stage */}
                <div style={styles.stage}>
                    {/* Error Overlay */}
                    {(error || retellError) && (
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: 'rgba(255,255,255,0.9)', color: '#000',
                            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 50
                        }}>
                            <p style={{ marginBottom: '20px', color: '#ff6b6b' }}>{error || retellError}</p>
                            <button onClick={() => navigate('/dashboard')} style={{ padding: '10px 20px', cursor: 'pointer' }}>Exit</button>
                        </div>
                    )}



                    {/* Content */}
                    <div className="avatar-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <AIAvatar isSpeaking={isAgentSpeaking} />
                        <p style={{ color: '#5f6368', marginTop: '20px', fontSize: '18px' }}>{getStatusText()}</p>
                    </div>



                    {/* Self View */}
                    <div style={{
                        position: 'absolute', bottom: '20px', right: '20px',
                        width: '240px', height: '160px', backgroundColor: '#f1f3f4',
                        borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center',
                        color: '#5f6368', fontSize: '14px', border: '1px solid #e0e0e0',
                        overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                    }}>
                        {isCameraOn ? (
                            <video
                                ref={videoRef}
                                autoPlay
                                muted
                                playsInline
                                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                            />
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '24px' }}>👤</span>
                                <span>You</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div style={styles.controls}>
                    <button
                        onClick={handleToggleMute}
                        style={{ ...styles.button, backgroundColor: isMuted ? '#ea4335' : '#ffffff', color: isMuted ? 'white' : '#5f6368', borderColor: isMuted ? 'transparent' : '#dadce0' }}
                    >
                        {isMuted ? '🔇' : '🎤'}
                    </button>

                    <button
                        onClick={toggleCamera}
                        style={{ ...styles.button, backgroundColor: !isCameraOn ? '#ea4335' : '#ffffff', color: !isCameraOn ? 'white' : '#5f6368', borderColor: !isCameraOn ? 'transparent' : '#dadce0' }}
                    >
                        {isCameraOn ? '📹' : '🚫'}
                    </button>

                    <button
                        onClick={handleEndInterview}
                        style={{ ...styles.button, backgroundColor: '#ea4335', color: 'white', width: '80px', borderRadius: '30px', border: 'none' }}
                    >
                        📞
                    </button>
                </div>
            </div>
        </div>
    );
}
