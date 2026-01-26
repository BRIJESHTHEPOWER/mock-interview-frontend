
import React from 'react';
import './AIAvatar.css';

export default function AIAvatar({ isSpeaking, size = 'normal' }) {
    return (
        <div className={`avatar-container ${size} ${isSpeaking ? 'is-speaking' : ''}`}>
            {/* Pulsing waves */}
            <div className="speaking-wave"></div>
            <div className="speaking-wave"></div>
            <div className="speaking-wave"></div>

            <div className="avatar-circle">
                <span className="avatar-icon">🤖</span>
            </div>
        </div>
    );
}
