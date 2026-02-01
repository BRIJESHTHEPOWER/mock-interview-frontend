import React from 'react';
import './InfinityLoader.css';

/**
 * InfinityLoader Component
 * Professional dual-stream infinity animation loader
 * 
 * @param {boolean} fullScreen - Whether to show as a fixed fullscreen overlay (default: false)
 * @param {string} message - Optional text to display below the loader
 */
const InfinityLoader = ({ fullScreen = false, message = '' }) => {
    return (
        <div className={`infinity-loader-container ${fullScreen ? 'fullscreen' : 'inline'}`}>
            <svg className="infinity-loader" viewBox="0 0 100 50">
                {/* Background path (dimmed) */}
                <path
                    className="infinity-bg"
                    d="M25,25 C25,40 5,40 5,25 C5,10 25,10 25,25 C25,40 45,40 50,25 C55,10 75,10 75,25 C75,40 95,40 95,25 C95,10 75,10 75,25 C75,40 55,40 50,25 C45,10 25,10 25,25"
                />
                {/* Animated rolling path (bright blue) */}
                <path
                    className="infinity-path"
                    d="M25,25 C25,40 5,40 5,25 C5,10 25,10 25,25 C25,40 45,40 50,25 C55,10 75,10 75,25 C75,40 95,40 95,25 C95,10 75,10 75,25 C75,40 55,40 50,25 C45,10 25,10 25,25"
                />
                {/* Secondary energy stream (purple/white) */}
                <path
                    className="infinity-path-2"
                    d="M25,25 C25,40 5,40 5,25 C5,10 25,10 25,25 C25,40 45,40 50,25 C55,10 75,10 75,25 C75,40 95,40 95,25 C95,10 75,10 75,25 C75,40 55,40 50,25 C45,10 25,10 25,25"
                />
            </svg>
            {message && <p className="loader-message">{message}</p>}
        </div>
    );
};

export default InfinityLoader;
