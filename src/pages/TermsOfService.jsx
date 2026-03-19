import React, { useEffect } from 'react';
import './Legal.css';

export default function TermsOfService() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="legal-page-wrapper">
            <div className="legal-container">
                <div className="legal-content">
                    <h1 className="legal-title">Terms & Conditions</h1>
                    <p className="legal-updated">Last updated: {new Date().toLocaleDateString()}</p>
                    
                    <section className="legal-section">
                        <h2>1. Introduction</h2>
                        <p>Welcome to Infinity Platform. These Terms & Conditions govern your use of our AI mock interview services and website.</p>
                    </section>

                    <section className="legal-section">
                        <h2>2. Acceptance of Terms</h2>
                        <p>By accessing or using the Infinity Platform, you agree to comply with and be bound by these terms. If you disagree with any part of these terms, you may not access the service.</p>
                    </section>

                    <section className="legal-section">
                        <h2>3. User Accounts</h2>
                        <ul>
                            <li><strong>Account Registration:</strong> You must provide accurate, complete, and updated information when creating an account.</li>
                            <li><strong>Account Security:</strong> You are responsible for safeguarding your password and for any activities or actions under your password. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>4. Acceptable Use</h2>
                        <p>You agree not to modify, adapt, hack, or reverse engineer the service. You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the service, use of the service, or access to the service without our express written permission.</p>
                    </section>

                    <section className="legal-section">
                        <h2>5. Service Limitations</h2>
                        <p>The AI interview feedback provided is intended for practice and self-improvement purposes only. We make no guarantees about the accuracy of the feedback, nor does using our platform guarantee job placement, interview success, or serve as a substitute for professional career coaching.</p>
                    </section>

                    <section className="legal-section">
                        <h2>6. Intellectual Property</h2>
                        <p>All content, design features, source code, and software associated with the platform are the exclusive property of Infinity Platform and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.</p>
                    </section>

                    <section className="legal-section">
                        <h2>7. Limitation of Liability</h2>
                        <p>In no event shall Infinity Platform, nor its creators, partners, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:</p>
                        <ul>
                            <li>Your access to or use of or inability to access or use the services.</li>
                            <li>Any conduct or content of any third party on the services.</li>
                            <li>Unauthorized access, use or alteration of your transmissions or content.</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>8. Contact Us</h2>
                        <p>If you have any questions about these Terms, please contact us at support@infinityplatform.com.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
