// ============================================
// AI AVATAR COMPONENT
// ============================================
// Displays a professional pulsing avatar that reacts to speech

import React from 'react';
import './AIAvatar.css';

export default function AIAvatar({ isSpeaking }) {
    return (
        <div className={`avatar-container ${isSpeaking ? 'is-speaking' : ''}`}>
            <div className="speaking-wave"></div>
            <div className="speaking-wave"></div>
            <div className="speaking-wave"></div>

            <div className="avatar-circle">
                <span className="avatar-icon">🤖</span>
            </div>
        </div>
    );
}
