// ============================================
// INTERVIEW SETUP PAGE
// ============================================
// Page where user selects job role before starting interview

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './InterviewSetup.css';

export default function InterviewSetup() {
    const [jobRole, setJobRole] = useState('');
    const [customRole, setCustomRole] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // Predefined job roles
    const popularRoles = [
        'Software Engineer',
        'Frontend Developer',
        'Backend Developer',
        'Full Stack Developer',
        'Data Scientist',
        'Product Manager',
        'UI/UX Designer',
        'DevOps Engineer',
        'Business Analyst',
        'Marketing Manager'
    ];

    // Handle starting interview
    const handleStartInterview = () => {
        const selectedRole = jobRole === 'custom' ? customRole : jobRole;

        if (!selectedRole || selectedRole.trim() === '') {
            setError('Please select or enter a job role');
            return;
        }

        // Navigate to interview page with job role
        navigate('/interview', {
            state: { jobRole: selectedRole.trim() }
        });
    };

    return (
        <div className="setup-container">
            <div className="setup-card">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="back-btn"
                >
                    ← Back to Dashboard
                </button>

                <h1>🎯 Interview Setup</h1>
                <p className="subtitle">Select the role you want to practice for</p>

                {error && <div className="error-message">{error}</div>}

                <div className="role-selection">
                    <h3>Popular Roles</h3>
                    <div className="role-grid">
                        {popularRoles.map((role) => (
                            <button
                                key={role}
                                className={`role-btn ${jobRole === role ? 'selected' : ''}`}
                                onClick={() => {
                                    setJobRole(role);
                                    setError('');
                                }}
                            >
                                {role}
                            </button>
                        ))}
                    </div>

                    <div className="custom-role-section">
                        <h3>Or Enter Custom Role</h3>
                        <input
                            type="text"
                            placeholder="e.g., Machine Learning Engineer"
                            value={customRole}
                            onChange={(e) => {
                                setCustomRole(e.target.value);
                                setJobRole('custom');
                                setError('');
                            }}
                            className="custom-role-input"
                        />
                    </div>
                </div>

                <div className="setup-info">
                    <h3>📋 What to Expect:</h3>
                    <ul>
                        <li>✅ AI-powered voice interviewer</li>
                        <li>✅ Role-specific questions</li>
                        <li>✅ Real-time conversation</li>
                        <li>✅ Interview history saved automatically</li>
                    </ul>
                </div>

                <button
                    onClick={handleStartInterview}
                    className="start-btn"
                    disabled={loading || (!jobRole && !customRole)}
                >
                    {loading ? 'Preparing...' : '🎤 Start Interview'}
                </button>
            </div>
        </div>
    );
}
