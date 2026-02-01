// ============================================
// LANDING PAGE
// ============================================
// Cinematic frontpage with Hero, Testimonials, and Footer

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import logo from '../assets/logo.png';
import './LandingPage.css';

const TileGrid = () => {
    const [tiles, setTiles] = useState([]);

    useEffect(() => {
        // Calculate grid size based on window
        const calculateGrid = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            const tileSize = 40; // match CSS
            const cols = Math.ceil(width / tileSize);
            const rows = Math.ceil(height / tileSize);
            const numTiles = cols * rows;

            // Generate tiles with random animation delays
            const newTiles = Array.from({ length: numTiles }, (_, i) => ({
                id: i,
                isAnimated: Math.random() > 0.9, // 10% animated
                delay: Math.random() * 5 // random delay
            }));
            setTiles(newTiles);
        };

        calculateGrid();
        window.addEventListener('resize', calculateGrid);
        return () => window.removeEventListener('resize', calculateGrid);
    }, []);

    return (
        <div className="tile-grid">
            {tiles.map((tile) => (
                <div
                    key={tile.id}
                    className={`tile ${tile.isAnimated ? 'animated' : ''}`}
                    style={{ animationDelay: `${tile.delay}s` }}
                />
            ))}
        </div>
    );
};

const VideoBackground = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const totalFrames = 30;

    // Generate frame paths once
    const frames = Array.from({ length: totalFrames }, (_, i) =>
        `/ezgif-frame-${String(i + 1).padStart(3, '0')}.jpg`
    );

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % totalFrames);
        }, 150); // 150ms = Slightly slower, perfectly synced with 0.2s transition

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="video-background">
            <div className="video-overlay"></div>
            <TileGrid />
            {frames.map((src, index) => (
                <img
                    key={src}
                    src={src}
                    alt=""
                    className={`frame-image ${index === activeIndex ? 'active' : ''}`}
                />
            ))}
        </div>
    );
};

const TestimonialAvatar = ({ avatar, name }) => {
    const [imgError, setImgError] = useState(false);

    // If it's an emoji (short string), render as text
    if (!avatar || (typeof avatar === 'string' && avatar.length < 5)) {
        return <span style={{ fontSize: '2.5rem' }}>{avatar || "👤"}</span>;
    }

    // Attempt to render image, fallback to initials on error
    if (!imgError) {
        return (
            <img
                src={avatar}
                alt={name}
                onError={() => setImgError(true)}
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
            />
        );
    }

    // Fallback to initials
    return (
        <div style={{
            width: '100%', height: '100%', borderRadius: '50%',
            backgroundColor: '#333', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 'bold', fontSize: '1.2rem'
        }}>
            {(name || 'U')[0].toUpperCase()}
        </div>
    );
};

export default function LandingPage() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [activeSection, setActiveSection] = useState('hero');
    const [isAtBottom, setIsAtBottom] = useState(false);

    const handleStartInterview = () => {
        if (currentUser) {
            navigate('/interview/setup');
        } else {
            navigate('/login');
        }
    };

    // Handle scroll indicator visibility
    useEffect(() => {
        const handleScroll = () => {
            // Side Navigation Logic
            const sections = [
                { id: 'hero', ref: document.querySelector('.hero-section') },
                { id: 'quote', ref: document.querySelector('.quote-section') },
                { id: 'future', ref: document.querySelector('.future-plans-section') },
                { id: 'testimonials', ref: document.querySelector('.testimonials-section') },
                { id: 'faq', ref: document.querySelector('.faq-section') },
                { id: 'footer', ref: document.querySelector('.footer') }
            ];

            const scrollPosition = window.scrollY + window.innerHeight / 2;

            for (const section of sections) {
                if (section.ref) {
                    const top = section.ref.offsetTop;
                    const bottom = top + section.ref.offsetHeight;
                    if (scrollPosition >= top && scrollPosition < bottom) {
                        setActiveSection(section.id);
                        break;
                    }
                }
            }

            // Check if at bottom
            const bottomThreshold = 50;
            const atBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - bottomThreshold;
            setIsAtBottom(atBottom);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleScrollClick = () => {
        if (isAtBottom) {
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // Scroll to next section
            scrollToNextSection();
        }
    };

    const scrollToNextSection = () => {
        const sections = [
            '.quote-section',
            '.future-plans-section',
            '.testimonials-section',
            '.faq-section',
            '.footer'
        ];

        const currentScrollY = window.scrollY;

        // Find the next section to scroll to
        for (let selector of sections) {
            const section = document.querySelector(selector);
            if (section) {
                const sectionTop = section.offsetTop;
                // If section is below current position (with some buffer), scroll to it
                if (sectionTop > currentScrollY + 50) {
                    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    return;
                }
            }
        }

        // Fallback if nothing found
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const scrollToSection = (id) => {
        const sectionMap = {
            'hero': '.hero-section',
            'quote': '.quote-section',
            'future': '.future-plans-section',
            'testimonials': '.testimonials-section',
            'faq': '.faq-section',
            'footer': '.footer'
        };
        const selector = sectionMap[id];
        const section = document.querySelector(selector);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const [testimonials, setTestimonials] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Newsletter State
    const [email, setEmail] = useState('');
    const [subStatus, setSubStatus] = useState('idle'); // idle, loading, success, error

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!email) return;

        setSubStatus('loading');

        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

        // Basic validation for env vars
        if (!serviceId || !templateId || !publicKey) {
            console.error("Missing EmailJS environment variables.");
            setSubStatus('error');
            return;
        }

        try {
            // Send email using EmailJS
            await emailjs.send(
                serviceId,
                templateId,
                {
                    user_email: email, // Make sure your EmailJS template uses {{user_email}}
                    to_name: "Subscriber",
                    message: "Welcome to Infinity Platform!",
                },
                publicKey
            );

            setSubStatus('success');
            setEmail('');
            setTimeout(() => setSubStatus('idle'), 3000);

        } catch (err) {
            console.error("EmailJS Error:", err);
            setSubStatus('error');
        }
    };

    // Auto-scroll testimonials
    useEffect(() => {
        if (testimonials.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) =>
                prevIndex === testimonials.length - 3 ? 0 : prevIndex + 1
            );
        }, 5000); // Change every 5 seconds

        return () => clearInterval(interval);
    }, [testimonials.length]);

    useEffect(() => {
        // Static dummy data for testimonials
        const staticData = [
            {
                id: 1,
                name: "Sarah Jenkins",
                role: "Software Engineer @ Google",
                text: "The AI interviewer was indistinguishable from a real hiring manager. It helped me crack the L4 interview!",
                avatar: "👩‍💻"
            },
            {
                id: 2,
                name: "Michael Chen",
                role: "Product Manager @ Uber",
                text: "Infinity Platform gave me the confidence I needed. The cinematic visuals make it feel so high-stakes.",
                avatar: "🚀"
            },
            {
                id: 3,
                name: "David Smith",
                role: "Frontend Developer",
                text: "This platform is amazing! The real-time feedback helped me improve my communication skills significantly.",
                avatar: "👨‍💻"
            },
            {
                id: 4,
                name: "Emily Davis",
                role: "Data Scientist",
                text: "I loved the immersive experience. It felt like I was in a real interview room. Highly recommended!",
                avatar: "🧠"
            },
            {
                id: 5,
                name: "James Wilson",
                role: "Full Stack Developer",
                text: "Great tool for practice. The AI questions were very relevant to my tech stack. Helped me land my dream job.",
                avatar: "💻"
            },
            {
                id: 6,
                name: "Jessica Taylor",
                role: "UX Designer",
                text: "The voice quality is incredible. It really feels like talking to a human. The feedback report was super detailed.",
                avatar: "✨"
            },
            {
                id: 7,
                name: "Robert Brown",
                role: "Backend Engineer",
                text: "Nice platform! It helped me identify my weak points in system design interviews. A must-try for everyone.",
                avatar: "🛠️"
            }
        ];

        setTestimonials(staticData);
    }, []);

    return (
        <div className="landing-container">
            <VideoBackground />

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Forge Your Future <br />
                        <span className="gradient-text">Beyond Limits</span>
                    </h1>
                    <p className="hero-subtitle">
                        Where ambition meets artificial intelligence. Simulate reality,
                        conquer the pressure, and unlock the career you deserve.
                    </p>
                    <button onClick={handleStartInterview} className="cta-btn pulse-animation">
                        Start Mock Interview
                    </button>
                </div>

            </section>



            {/* Side Navigation Dots */}
            <div className="side-navigation">
                {[
                    { id: 'hero', label: 'Home' },
                    { id: 'quote', label: 'Motivation' },
                    { id: 'future', label: 'Roadmap' },
                    { id: 'testimonials', label: 'Stories' },
                    { id: 'faq', label: 'FAQ' },
                    { id: 'footer', label: 'Contact' }
                ].map((item, index) => (
                    <div
                        key={item.id}
                        className={`nav-dot ${activeSection === item.id ? 'active' : ''}`}
                        onClick={() => scrollToSection(item.id)}
                        role="button"
                        aria-label={`Scroll to ${item.label}`}
                        title={item.label}
                    />
                ))}
            </div>

            {/* Scroll Indicator (Reversible) */}
            <button
                className={`scroll-indicator ${isAtBottom ? 'up-arrow' : ''}`}
                onClick={handleScrollClick}
                aria-label={isAtBottom ? "Scroll to top" : "Scroll to next section"}
                style={{
                    transform: isAtBottom ? 'translateX(-50%) rotate(180deg)' : 'translateX(-50%)'
                }}
            >
                <svg
                    width="40"
                    height="40"
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <circle
                        cx="20"
                        cy="20"
                        r="19"
                        stroke="currentColor"
                        strokeWidth="2"
                    />
                    <path
                        d="M20 14V26M20 26L15 21M20 26L25 21"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>

            {/* Quote Section */}
            <section className="quote-section">
                <div className="quote-container">
                    <p className="powerful-quote">
                        "Success happens when opportunity meets preparation."
                    </p>
                    <span className="quote-author">— Lucius Annaeus Seneca</span>
                </div>
            </section>

            {/* Future Plans Section */}
            <section className="future-plans-section">
                <h2 className="section-title">Future Roadmap</h2>
                <div className="future-grid">
                    {[
                        {
                            title: "AI Avatar Interview",
                            desc: "Face-to-face simulations with hyper-realistic 3D avatars that react to your confidence and tone.",
                            icon: "👤"
                        },
                        {
                            title: "Resume Driven Interview",
                            desc: "Upload your CV and get grilled on specific bullet points, projects, and employment gaps.",
                            icon: "📄"
                        },
                        {
                            title: "System Design Architect",
                            desc: "Interactive whiteboard sessions where AI challenges your scalability and architecture decisions.",
                            icon: "🏗️"
                        },
                        {
                            title: "Behavioral Profiler",
                            desc: "Deep analysis of your soft skills using micro-expression tracking and sentiment analysis.",
                            icon: "🧠"
                        },
                        {
                            title: "Salary Negotiation Master",
                            desc: "Roleplay high-stakes offer negotiations with an AI that doesn't settle easily.",
                            icon: "💰"
                        },
                        {
                            title: "Company Simulators",
                            desc: "Tailored interview loops mimicking specific hiring bars like Google, Amazon, and Netflix.",
                            icon: "🏢"
                        }
                    ].map((plan, index) => (
                        <div key={index} className="future-card">
                            <div className="future-icon">{plan.icon}</div>
                            <h3>{plan.title}</h3>
                            <p>{plan.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials-section">
                <h2 className="section-title">Success Stories</h2>

                {testimonials.length > 0 ? (
                    <div className="testimonials-carousel-container">
                        <div
                            className="testimonials-track"
                            style={{
                                '--current-index': currentIndex
                            }}
                        >
                            {testimonials.map((t) => (
                                <div key={t.id} className="testimonial-slide"> {/* Wrapper for spacing */}
                                    <div className="testimonial-card">
                                        <div className="t-header">
                                            <span className="t-avatar">
                                                <TestimonialAvatar avatar={t.avatar} name={t.name} />
                                            </span>
                                            <div>
                                                <h4 className="t-name">{t.name}</h4>
                                                <p className="t-role">{t.role}</p>
                                            </div>
                                        </div>
                                        <p className="t-text">"{t.text}"</p>
                                        <div className="t-stars">⭐⭐⭐⭐⭐</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="loading-testimonials">Loading stories...</div>
                )}
            </section>

            {/* FAQ Section */}
            <section className="faq-section">
                <h2 className="section-title">Frequently Asked Questions</h2>
                <div className="faq-container">
                    {[
                        {
                            q: "How does the AI Interviewer work?",
                            a: "Our AI uses advanced large language models to simulate a real human interviewer. It analyzes your spoken responses in real-time, understands context, and provides follow-up questions just like a hiring manager would."
                        },
                        {
                            q: "Is it suitable for all job roles?",
                            a: "Yes! You can customize the interview for any job role, from Software Engineering and Product Management to Marketing and Sales. The AI adapts its technical depth and behavioral questions accordingly."
                        },
                        {
                            q: "Do I get feedback on my performance?",
                            a: "Absolutely. After every session, you receive a comprehensive report card detailing your strengths, areas for improvement, and actionable tips to help you ace the real interview."
                        },
                        {
                            q: "Is my data private?",
                            a: "Your privacy is our top priority. All interview sessions and personal data are encrypted and stored securely. We do not share your personal interview recordings with third parties."
                        }
                    ].map((item, index) => (
                        <details key={index} className="faq-item">
                            <summary className="faq-question">
                                {item.q}
                                <span className="faq-icon">▼</span>
                            </summary>
                            <div className="faq-answer">
                                <p>{item.a}</p>
                            </div>
                        </details>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <Link to="/" className="brand-logo-container" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <img src={logo} alt="Infinity Logo" className="footer-logo-img" />
                            <h3>INFINITY</h3>
                        </Link>
                        <p>Elevating careers through AI.</p>
                    </div>
                    <div className="footer-links">
                        <div className="link-col">
                            <h4>Platform</h4>
                            <Link to="/features">Features</Link>
                            <Link to="/pricing">Pricing</Link>
                            <Link to="/enterprise">Enterprise</Link>
                            <Link to="/login">Login</Link>
                        </div>
                        <div className="link-col">
                            <h4>Resources</h4>
                            <Link to="/blog">Blog</Link>
                            <Link to="/guide">Guide</Link>
                            <Link to="/help-center">Help Center</Link>
                        </div>
                        <div className="link-col">
                            <h4>Legal</h4>
                            <Link to="/privacy">Privacy</Link>
                            <Link to="/terms">Terms</Link>
                        </div>
                    </div>

                    <div className="footer-newsletter">
                        <h4>Stay Updated</h4>
                        <p>Join our newsletter for the latest AI interview tips.</p>
                        <form className="newsletter-form" onSubmit={handleSubscribe}>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={subStatus === 'loading' || subStatus === 'success'}
                            />
                            <button
                                type="submit"
                                disabled={subStatus === 'loading' || subStatus === 'success'}
                                style={{
                                    backgroundColor: subStatus === 'success' ? '#00ff88' :
                                        subStatus === 'error' ? '#ff0055' : 'var(--neon-blue)'
                                }}
                            >
                                {subStatus === 'loading' ? '...' :
                                    subStatus === 'success' ? 'Joined!' :
                                        subStatus === 'error' ? 'Retry' : 'Subscribe'}
                            </button>
                        </form>

                        <div className="social-connect">
                            <h4>Connect</h4>
                            <div className="social-links">
                                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                </a>
                                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                                </a>
                                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 Infinity Platform. All rights reserved.</p>
                </div>
            </footer>

        </div >
    );
}
