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

    const [isUserMainView, setIsUserMainView] = useState(false);

    const videoRef = useRef(null);

    const timerRef = useRef(null);
    const durationRef = useRef(0); // Ref to track duration without stale closures
    const startTimeRef = useRef(null); // Ref to track actual start time for perfection
    const initializationRef = useRef(false);
    const { startCall, stopCall, toggleMute, callStatus, isAgentSpeaking, error: retellError } = useRetell();

    // Create interview session on mount
    useEffect(() => {
        if (initializationRef.current) return;
        initializationRef.current = true;

        // Check if HTTPS is required (for mobile browsers)
        const isSecureContext = window.isSecureContext;
        if (!isSecureContext && window.location.hostname !== 'localhost') {
            console.warn('⚠️ Not a secure context. Camera/microphone may not work.');
            setError('Please use HTTPS for camera and microphone access');
        }

        createInterviewSession();

        // Initialize camera with mobile-specific handling
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
    }, [isCameraOn, localStream, isUserMainView]); // Re-run when view toggles

    // Start timer when call becomes active
    useEffect(() => {
        if (callStatus === 'active') {
            if (!startTimeRef.current) startTimeRef.current = Date.now();
            timerRef.current = setInterval(() => {
                setTimer(prev => prev + 1);
                // Update durationRef in case of crash, but we'll use startTime for final calc
                durationRef.current = Math.round((Date.now() - startTimeRef.current) / 1000);
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
            console.log('🌐 Backend URL:', BACKEND_URL);
            console.log('📱 User Agent:', navigator.userAgent);
            console.log('🔒 Secure Context:', window.isSecureContext);

            const response = await axios.post(`${BACKEND_URL}/create-interview`, {
                jobRole,
                userId: currentUser?.uid
            }, {
                timeout: 30000, // 30 second timeout for mobile networks
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.data.success) {
                throw new Error(response.data.error || 'Failed to create session');
            }

            const { callId, accessToken, agentId } = response.data;
            console.log('✅ Session created:', { callId, agentId });
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

            console.log('🎤 Starting Retell call...');
            await startCall(callId, accessToken);

        } catch (err) {
            console.error('❌ Error creating session:', err);
            console.error('Target Backend URL:', BACKEND_URL);
            console.error('Error details:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });

            let errorMessage = 'Failed to start interview';
            if (err.code === 'ECONNABORTED') {
                errorMessage = 'Connection timeout. Please check your internet connection.';
            } else if (err.response?.status === 0) {
                errorMessage = 'Cannot connect to server. Please check your internet connection.';
            } else if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
        }
    };



    const handleInterviewEnd = async () => {
        try {
            stopCall(); // Stop the call immediately

            // Turn off camera light immediately
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
                setLocalStream(null);
                setIsCameraOn(false);
            }

            const finalDuration = startTimeRef.current
                ? Math.round((Date.now() - startTimeRef.current) / 1000)
                : durationRef.current;

            console.log('📞 Interview ended, saving basic data...');
            console.log('Interview ID:', interviewId);
            console.log('Call ID:', sessionData?.callId);
            console.log('Job Role:', jobRole);
            console.log('Duration:', finalDuration);

            // 1. Update Firestore status to processing (REQUIRED to happen before we leave)
            if (interviewId) {
                await updateDoc(doc(db, 'interviews', interviewId), {
                    endedAt: new Date(),
                    duration: finalDuration,
                    status: 'processing',
                });
                console.log('✅ Interview marked as processing');
            }

            // 2. BACKGROUND TASKS (Don't await these)
            // Trigger backend processing
            if (sessionData?.callId) {
                console.log('🔄 Triggering feedback processing for callId:', sessionData.callId);
                axios.post(`${BACKEND_URL}/process-interview`, {
                    callId: sessionData.callId,
                    userId: currentUser.uid,
                    jobRole: jobRole
                })
                    .then(response => {
                        console.log('✅ Feedback processing started successfully:', response.data);
                    })
                    .catch(err => {
                        console.error('❌ Feedback processing ERROR:', err.response?.data || err.message);
                    });
            } else {
                console.warn('⚠️ No callId available, skipping feedback processing');
            }

            // Remove live session
            remove(ref(rtdb, `liveSessions/${currentUser.uid}`))
                .catch(err => console.error('⚠️ RTDB removal error:', err));

            // 3. IMMEDIATE NAVIGATION
            console.log('🚀 Navigating to feedback page immediately');
            navigate(`/interview/history/${interviewId}`); // Go to feedback page to wait for results

        } catch (err) {
            console.error('❌ Error in handleInterviewEnd:', err);
            navigate('/dashboard');
        }
    };

    const handleEndInterview = async () => {
        console.log("🛑 End Interview Clicked");
        // Also cleanup here just in case
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
            setIsCameraOn(false);
        }

        // Call the async save function
        await handleInterviewEnd();
    };

    const handleToggleMute = () => {
        const newMuteState = toggleMute();
        setIsMuted(newMuteState);
        console.log("Mute toggled to:", newMuteState);
    };

    const enableCamera = async () => {
        try {
            console.log('📷 Requesting camera/microphone access...');

            // Mobile-friendly constraints
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            const constraints = {
                video: {
                    width: { ideal: isMobile ? 640 : 1280 },
                    height: { ideal: isMobile ? 480 : 720 },
                    facingMode: 'user'
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    // Mobile-specific audio settings
                    sampleRate: isMobile ? 16000 : 24000,
                    channelCount: 1
                }
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log('✅ Camera/microphone access granted');
            setLocalStream(stream);
            setIsCameraOn(true);
        } catch (err) {
            console.error("❌ Error accessing camera:", err);
            console.error('Error name:', err.name);
            console.error('Error message:', err.message);

            // Provide helpful error messages
            let errorMsg = 'Camera access denied';
            if (err.name === 'NotAllowedError') {
                errorMsg = 'Please allow camera and microphone access in your browser settings';
            } else if (err.name === 'NotFoundError') {
                errorMsg = 'No camera or microphone found on your device';
            } else if (err.name === 'NotReadableError') {
                errorMsg = 'Camera is being used by another application';
            }

            setError(errorMsg);
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
            case 'ended': return 'Call Ended. Redirecting to Dashboard...';
            default: return 'Initializing...';
        }
    };

    // RESPONSIVE STYLES FOR MOBILE AND WEB
    const styles = {
        container: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#f0f2f5',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: window.innerWidth <= 768 ? '0' : '10px',
        },
        window: {
            width: window.innerWidth <= 768 ? '100%' : '90%',
            maxWidth: window.innerWidth <= 768 ? '100%' : '1200px',
            height: window.innerWidth <= 768 ? '100%' : '90%',
            minHeight: window.innerWidth <= 768 ? '100vh' : '600px',
            backgroundColor: '#ffffff',
            borderRadius: window.innerWidth <= 768 ? '0' : '12px',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            border: window.innerWidth <= 768 ? 'none' : '1px solid #e0e0e0',
            boxShadow: window.innerWidth <= 768 ? 'none' : '0 4px 20px rgba(0,0,0,0.1)'
        },
        header: {
            padding: window.innerWidth <= 768 ? '12px 15px' : '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 10,
            color: '#202124',
            borderBottom: '1px solid #f0f0f0',
            flexWrap: 'wrap',
            gap: '10px'
        },
        stage: {
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            background: '#ffffff',
            overflow: 'hidden',
            minHeight: 0 // Important for flex children
        },
        controls: {
            height: window.innerWidth <= 768 ? '70px' : '80px',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: window.innerWidth <= 768 ? '15px' : '20px',
            borderTop: '1px solid #e0e0e0',
            flexShrink: 0,
            zIndex: 20,
            padding: window.innerWidth <= 768 ? '0 10px' : '0'
        },
        button: {
            width: window.innerWidth <= 768 ? '50px' : '60px',
            height: window.innerWidth <= 768 ? '50px' : '60px',
            borderRadius: '50%',
            border: '1px solid #e0e0e0',
            fontSize: window.innerWidth <= 768 ? '20px' : '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            flexShrink: 0
        },
        pip: {
            position: 'absolute',
            bottom: window.innerWidth <= 768 ? '80px' : '20px',
            right: window.innerWidth <= 768 ? '10px' : '20px',
            width: window.innerWidth <= 768 ? '120px' : '240px',
            height: window.innerWidth <= 768 ? '80px' : '160px',
            backgroundColor: '#f1f3f4',
            borderRadius: window.innerWidth <= 768 ? '8px' : '12px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#5f6368',
            fontSize: window.innerWidth <= 768 ? '12px' : '14px',
            border: '1px solid #e0e0e0',
            overflow: 'hidden',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            zIndex: 20,
            cursor: 'pointer',
            transition: 'transform 0.2s'
        }
    };

    const toggleView = () => {
        setIsUserMainView(prev => !prev);
    };

    // RENDER HELPERS
    const renderUserVideo = (isMain) => (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: isMain ? '#202124' : '#202124' }}>
            {isCameraOn ? (
                <video
                    ref={isUserMainView === isMain ? videoRef : null} // Only attach ref if this is the active view for camera
                    autoPlay
                    muted
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: isMain ? 'contain' : 'cover', transform: 'scaleX(-1)' }}
                />
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isMain ? '20px' : '8px', color: 'white' }}>
                    <span style={{ fontSize: isMain ? '60px' : '24px' }}>👤</span>
                    <span style={{ fontSize: isMain ? '24px' : '14px' }}>{isMain ? 'Camera Off' : 'You'}</span>
                </div>
            )}
        </div>
    );

    const renderAIAvatar = (isMain) => (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#ffffff' }}>
            <AIAvatar isSpeaking={isAgentSpeaking} size={isMain ? 'normal' : 'small'} />
            {isMain && <p style={{ color: '#5f6368', marginTop: '20px', fontSize: '18px' }}>{getStatusText()}</p>}
        </div>
    );

    return (
        <div style={styles.container}>
            <div style={styles.window}>
                {/* ... (Keep Debug Overlay) */}
                {/* ... (Keep Header) */}
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

                    {/* MAIN VIEW */}
                    {isUserMainView ? renderUserVideo(true) : renderAIAvatar(true)}

                    {/* PiP VIEW (Clickable to maximize) */}
                    <div
                        onClick={toggleView}
                        style={styles.pip}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        title="Click to swap view"
                    >
                        {isUserMainView ? renderAIAvatar(false) : renderUserVideo(false)}

                        {/* Status text only for AI in PiP */}
                        {isUserMainView && <p style={{ color: '#5f6368', marginTop: '5px', fontSize: '12px', fontWeight: 'bold' }}>{getStatusText()}</p>}
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
