import React, { useEffect } from 'react';
import './Legal.css';

export default function ContactUs() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="legal-page-wrapper">
            <div className="legal-container">
                <div className="legal-content">
                    <h1 className="legal-title">Contact Us</h1>
                    <p className="legal-updated">We'd love to hear from you</p>

                    <section className="legal-section">
                        <h2>Get in Touch</h2>
                        <p>Whether you have a question about features, pricing, need a demo, or anything else, our team is ready to answer all your questions.</p>
                    </section>

                    <section className="legal-section">
                        <h2>Support</h2>
                        <p>For technical assistance and customer support inquiries, please reach out to our dedicated support team.</p>
                        <ul>
                            <li><strong>Email:</strong> support@infinityplatform.com</li>
                            <li><strong>Response Time:</strong> We aim to reply to all inquiries within 24 hours.</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>Business & Partnerships</h2>
                        <p>Interested in integrating Infinity Platform into your company's hiring process or a university career center?</p>
                        <ul>
                            <li><strong>Email:</strong> infinity8@gmail.com</li>
                            <li><strong>Phone:</strong> +918763846789</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>Headquarters</h2>
                        <p>Infinity Technologies Inc.<br />
                            123 street mangalore<br />
                            Karnataka, India<br /></p>
                    </section>
                </div>
            </div>
        </div>
    );
}
