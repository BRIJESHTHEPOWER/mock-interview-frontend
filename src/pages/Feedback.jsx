// ============================================
// FEEDBACK PAGE
// ============================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { addDoc, collection } from 'firebase/firestore';
import './Feedback.css';

export default function Feedback() {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return;

        setSubmitting(true);
        try {
            await addDoc(collection(db, 'feedback'), {
                userId: currentUser?.uid || 'anonymous',
                userName: currentUser?.displayName || 'Anonymous User',
                userAvatar: currentUser?.photoURL || '',
                rating,
                comment,
                createdAt: new Date()
            });

            alert('Thank you for your feedback!');
            navigate('/');
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert(`Failed to submit feedback: ${error.message} \nCode: ${error.code}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="feedback-container">
            <div className="feedback-card">
                <h1 className="gradient-text">We Value Your Input</h1>
                <p className="subtitle">How was your interview experience?</p>

                <form onSubmit={handleSubmit}>
                    <div className="star-rating">
                        {[...Array(5)].map((_, index) => {
                            const ratingValue = index + 1;
                            return (
                                <button
                                    type="button"
                                    key={ratingValue}
                                    className={`star ${ratingValue <= (hover || rating) ? 'on' : 'off'}`}
                                    onClick={() => setRating(ratingValue)}
                                    onMouseEnter={() => setHover(ratingValue)}
                                    onMouseLeave={() => setHover(rating)}
                                >
                                    <span className="star-icon">★</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="form-group">
                        <textarea
                            placeholder="Share your thoughts on the AI visualization, voice quality, or overall experience..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows="5"
                            className="feedback-input"
                        />
                    </div>

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={submitting || rating === 0}
                    >
                        {submitting ? 'Sending...' : 'Submit Feedback'}
                    </button>
                </form>
            </div>
        </div>
    );
}
