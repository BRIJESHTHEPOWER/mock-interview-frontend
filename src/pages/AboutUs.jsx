import React, { useEffect } from 'react';
import './Legal.css';

export default function AboutUs() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="legal-page-wrapper">
            <div className="legal-container">
                <div className="legal-content">
                    <h1 className="legal-title">About Us</h1>
                    <p className="legal-updated">Empowering Careers with Artificial Intelligence</p>
                    
                    <section className="legal-section">
                        <h2>Our Mission</h2>
                        <p>At Infinity Platform, we are dedicated to bridging the gap between talent and opportunity. Our mission is to democratize interview preparation by providing everybody with access to hyper-realistic, AI-driven mock interviews.</p>
                    </section>

                    <section className="legal-section">
                        <h2>Who We Are</h2>
                        <p>We are a passionate team of engineers, designers, and career strategists who believe that practice makes perfect. With backgrounds spanning top tech companies, we recognized how nerve-wracking the real interview process can be. That's why we built Infinity.</p>
                    </section>

                    <section className="legal-section">
                        <h2>What We Do</h2>
                        <p>Infinity Platform uses state-of-the-art Large Language Models and vocal synthesis to create conversational AI interviewers. Our technology dynamically adapts to your job role, assesses your soft and technical skills, and provides instant, actionable feedback.</p>
                        <ul>
                            <li><strong>Voice-First AI:</strong> Practice speaking naturally without staring at a script.</li>
                            <li><strong>Real-time Feedback:</strong> Get comprehensive reports on your strengths and areas to improve.</li>
                            <li><strong>Custom Environments:</strong> Tailored interviews ranging from Junior Developer to Senior Product Manager.</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}
