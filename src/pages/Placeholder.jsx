import { useNavigate } from 'react-router-dom';
import './Placeholder.css';

export default function Placeholder({ title }) {
    const navigate = useNavigate();

    return (
        <div className="placeholder-container">
            <div className="placeholder-content">
                <div className="placeholder-icon">🚀</div>
                <h1>{title}</h1>
                <p>This is a placeholder page. Content will be added in future development.</p>
                <div className="placeholder-divider"></div>
                <button onClick={() => navigate('/')} className="placeholder-back-btn">
                    ← Back to Experience
                </button>
            </div>
        </div>
    );
}
