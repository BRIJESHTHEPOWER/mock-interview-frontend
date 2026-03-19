import React, { useEffect } from 'react';
import './Legal.css';

export default function PrivacyPolicy() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="legal-page-wrapper">
            <div className="legal-container">
                <div className="legal-content">
                    <h1 className="legal-title">Privacy Policy</h1>
                    <p className="legal-updated">Last updated: {new Date().toLocaleDateString()}</p>
                    
                    <section className="legal-section">
                        <h2>1. Introduction</h2>
                        <p>Welcome to Infinity Platform. We are committed to protecting your personal information and your right to privacy. This Privacy Policy outlines what information we collect, how we use it, and what rights you have in relation to it.</p>
                    </section>

                    <section className="legal-section">
                        <h2>2. Information We Collect</h2>
                        <p>When you use the Infinity Platform, we collect personal information that you voluntarily provide to us when you register on the platform, express an interest in obtaining information about us, or otherwise when you contact us. This includes:</p>
                        <ul>
                            <li><strong>Personal Details:</strong> Name, email address, and profile details.</li>
                            <li><strong>Interview Data:</strong> Resume details, audio/video data, and interactions generated during your AI mock interviews.</li>
                            <li><strong>Usage Data:</strong> Information about how you navigate and interact with our platform.</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>3. How We Use Your Information</h2>
                        <p>We use the information we collect or receive to:</p>
                        <ul>
                            <li>Facilitate your mock interview sessions securely using our advanced AI technologies.</li>
                            <li>Analyze your interview performance to generate detailed, actionable feedback reports tailored strictly to you.</li>
                            <li>Improve our AI models, system prompts, and the overall user experience of our service.</li>
                            <li>Send administrative information, such as updates to our terms, conditions, and policies.</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>4. Data Sharing and Security</h2>
                        <p>Your privacy is our top priority. All interview sessions, feedback, and personal data are encrypted and stored securely.</p>
                        <ul>
                            <li>We do not sell or share your personal interview recordings or generated feedback with third-party advertisers.</li>
                            <li>We may share your data with trusted third-party service providers (like Retell AI for AI voice processing) strictly for the purpose of operating the core features of our platform. These providers adhere to strict data security standards.</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>5. Your Privacy Rights</h2>
                        <p>Depending on your location, you may have the right to request access to the personal information we collect from you, change that information, or delete it under certain circumstances. To request to review, update, or delete your personal information, please submit a request to our support team.</p>
                    </section>

                    <section className="legal-section">
                        <h2>6. Contact Us</h2>
                        <p>If you have questions or comments about this Privacy Policy, please contact our privacy team at privacy@infinityplatform.com.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
