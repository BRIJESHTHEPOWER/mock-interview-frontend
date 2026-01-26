// ============================================
// FLOATING CHATBOT COMPONENT
// ============================================
// A floating button that navigates to chatbot page

import { useNavigate, useLocation } from 'react-router-dom';
import './FloatingChatbot.css';

export default function FloatingChatbot() {
    const navigate = useNavigate();
    const location = useLocation();

    // Only show on Landing Page
    if (location.pathname !== '/') {
        return null;
    }

    const handleClick = () => {
        navigate('/chatbot');
    };

    return (
        <button
            className="chatbot-button"
            onClick={handleClick}
            aria-label="Open Interview Assistant"
        >
            <span className="chatbot-icon">💬</span>
            <span className="chatbot-badge">AI</span>
        </button>
    );
}
