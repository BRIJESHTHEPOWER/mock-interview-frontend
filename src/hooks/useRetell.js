// ============================================
// RETELL AI HOOK
// ============================================
// Custom hook for managing Retell AI voice interview sessions

import { useState, useEffect, useRef } from 'react';
import { RetellWebClient } from 'retell-client-js-sdk';

export const useRetell = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [isCallActive, setIsCallActive] = useState(false);
    const [error, setError] = useState(null);
    const [callStatus, setCallStatus] = useState('idle'); // idle, connecting, active, ended
    const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);

    const retellClient = useRef(null);

    // Initialize Retell client on mount
    useEffect(() => {
        try {
            retellClient.current = new RetellWebClient();

            // Set up event listeners
            retellClient.current.on('call_started', () => {
                console.log('✅ Call started');
                setIsCallActive(true);
                setCallStatus('active');
                setError(null);
            });

            retellClient.current.on('call_ended', () => {
                console.log('📞 Call ended');
                setIsCallActive(false);
                setCallStatus('ended');
                setIsAgentSpeaking(false);
            });

            retellClient.current.on('error', (err) => {
                console.error('❌ Retell error:', err);
                setError(err.message || 'An error occurred during the call');
                setCallStatus('error');
            });

            retellClient.current.on('agent_start_talking', () => {
                console.log('🤖 AI is speaking...');
                setIsAgentSpeaking(true);
            });

            retellClient.current.on('agent_stop_talking', () => {
                console.log('🤖 AI stopped speaking');
                setIsAgentSpeaking(false);
            });

            retellClient.current.on('update', (update) => {
                // Handle real-time updates if needed
                console.log('Update:', update);
            });

        } catch (err) {
            console.error('Failed to initialize Retell client:', err);
            setError('Failed to initialize voice client');
        }

        // Cleanup on unmount
        return () => {
            if (retellClient.current) {
                retellClient.current.stopCall();
            }
        };
    }, []);

    /**
     * Start a voice interview call
     * @param {string} callId - Call ID from backend
     * @param {string} accessToken - Access token from backend
     */
    const startCall = async (callId, accessToken) => {
        try {
            setCallStatus('connecting');
            setError(null);

            if (!retellClient.current) {
                throw new Error('Retell client not initialized');
            }

            // Start the call with credentials from backend
            await retellClient.current.startCall({
                callId,
                accessToken,
                // Enable audio
                enableUpdate: true,
            });

            setIsConnected(true);
            console.log('🎤 Call started successfully');

        } catch (err) {
            console.error('Failed to start call:', err);
            setError(err.message || 'Failed to start interview');
            setCallStatus('error');
            throw err;
        }
    };

    /**
     * Stop the current call
     */
    const stopCall = () => {
        try {
            if (retellClient.current) {
                retellClient.current.stopCall();
                setIsConnected(false);
                setIsCallActive(false);
                setCallStatus('ended');
                console.log('📴 Call stopped');
            }
        } catch (err) {
            console.error('Error stopping call:', err);
            setError('Failed to stop call');
        }
    };

    /**
     * Toggle microphone mute
     */
    const toggleMute = () => {
        if (retellClient.current) {
            const isMuted = retellClient.current.isMuted();
            if (isMuted) {
                retellClient.current.unmute();
            } else {
                retellClient.current.mute();
            }
            return !isMuted;
        }
        return false;
    };

    return {
        startCall,
        stopCall,
        toggleMute,
        isConnected,
        isCallActive,
        callStatus,
        isAgentSpeaking, // Export new state
        error
    };
};
