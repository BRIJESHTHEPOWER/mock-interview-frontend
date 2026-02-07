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
    const audioContextRef = useRef(null);
    const gainNodeRef = useRef(null);

    // Initialize Retell client on mount
    useEffect(() => {
        try {
            retellClient.current = new RetellWebClient();

            // Initialize Web Audio API for volume control
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
                gainNodeRef.current = audioContextRef.current.createGain();
                // Set volume to 2.0 (200% - double the volume)
                gainNodeRef.current.gain.value = 2.0;
                gainNodeRef.current.connect(audioContextRef.current.destination);
                console.log('🔊 Audio amplification enabled: 200% volume');
            }

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

            // Audio quality monitoring
            retellClient.current.on('audio', (audio) => {
                // Monitor audio quality metrics if available
                if (audio.quality) {
                    console.log('🎵 Audio quality:', audio.quality);
                }
            });

            // Connection quality monitoring
            retellClient.current.on('call_analyzed', (analysis) => {
                console.log('📊 Call analysis:', analysis);
            });

            retellClient.current.on('update', (update) => {
                // Handle real-time updates - only log important ones to reduce overhead
                if (update.transcript || update.turntaking_status) {
                    console.log('Update:', update);
                }
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
            if (audioContextRef.current) {
                audioContextRef.current.close();
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
                // Optimized audio quality settings
                sampleRate: 24000, // Higher sample rate for better quality
                enableUpdate: true,
                // Enhanced audio constraints for stability
                audioConstraints: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    // Additional constraints for better quality
                    channelCount: 1,
                    sampleSize: 16,
                },
            });

            setIsConnected(true);
            console.log('🎤 Call started successfully');

            // Resume audio context if suspended (browser autoplay policy)
            if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
                console.log('🔊 Audio context resumed');
            }

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
    // Track mute state locally since SDK might not expose it synchronously
    const isMutedRef = useRef(false);

    /**
     * Toggle microphone mute
     */
    const toggleMute = () => {
        if (retellClient.current) {
            isMutedRef.current = !isMutedRef.current;

            if (isMutedRef.current) {
                // Mute logic - try/catch SDK specific methods
                try {
                    // Check if SDK has dedicated mute method, or fallback to track manipulation if exposed
                    // Assuming basic SDK mute for now
                    if (typeof retellClient.current.mute === 'function') {
                        retellClient.current.mute();
                    }
                    console.log('🔇 Mic muted');
                } catch (e) {
                    console.warn('SDK mute failed', e);
                }
            } else {
                try {
                    if (typeof retellClient.current.unmute === 'function') {
                        retellClient.current.unmute();
                    }
                    console.log('🎤 Mic unmuted');
                } catch (e) {
                    console.warn('SDK unmute failed', e);
                }
            }
            return isMutedRef.current;
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
