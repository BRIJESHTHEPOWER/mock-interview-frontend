// ============================================
// LANDING PAGE
// ============================================
// Cinematic frontpage with Hero, Testimonials, and Footer

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
    const [showScrollIndicator, setShowScrollIndicator] = useState(true);

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
            const heroSection = document.querySelector('.hero-section');
            if (heroSection) {
                const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
                const scrollPosition = window.scrollY + window.innerHeight;

                // Show indicator only when user is in hero section
                setShowScrollIndicator(window.scrollY < heroBottom - 200);
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Check initial position

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToNextSection = () => {
        const sections = [
            '.quote-section',
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
                // If section is below current position, scroll to it
                if (sectionTop > currentScrollY + 100) {
                    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    return;
                }
            }
        }

        // If at the bottom, scroll back to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const [testimonials, setTestimonials] = useState([]);

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                // Initial static data
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
                    }
                ];

                // Fetch dynamic data
                const q = query(collection(db, 'feedback'), orderBy('createdAt', 'desc'), limit(3));
                const querySnapshot = await getDocs(q);

                const dynamicData = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        name: data.userName || 'Anonymous',
                        role: data.userRole || 'User',
                        text: data.comment,
                        avatar: data.userAvatar // Pass raw URL or null
                    };
                });

                setTestimonials([...dynamicData, ...staticData].slice(0, 3));
            } catch (err) {
                console.error("Error fetching testimonials:", err);
            }
        };

        fetchTestimonials();
    }, []);

    return (
        <div className="landing-container">
            <VideoBackground />

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Master Your Interview <br />
                    </h1>
                    <p className="hero-subtitle">
                        Experience the future of interview preparation. Real-time voice AI,
                        cinematic immersion, and professional feedback.
                    </p>
                    <button onClick={handleStartInterview} className="cta-btn pulse-animation">
                        Start Mock Interview
                    </button>
                </div>

                {/* Scroll Down Indicator - Shows only in hero section */}
                {showScrollIndicator && (
                    <button
                        className="scroll-indicator"
                        onClick={scrollToNextSection}
                        aria-label="Scroll to next section"
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
                )}
            </section>

            {/* Quote Section */}
            <section className="quote-section">
                <div className="quote-container">
                    <p className="powerful-quote">
                        "Success happens when opportunity meets preparation."
                    </p>
                    <span className="quote-author">— Lucius Annaeus Seneca</span>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials-section">
                <h2 className="section-title">Success Stories</h2>
                <div className="testimonials-grid">
                    {testimonials.map((t) => (
                        <div key={t.id} className="testimonial-card">
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
                    ))}
                </div>
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
                            <a href="#">Features</a>
                            <a href="#">Pricing</a>
                            <a href="#">Enterprise</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Login</a>
                        </div>
                        <div className="link-col">
                            <h4>Resources</h4>
                            <a href="#">Blog</a>
                            <a href="#">Guide</a>
                            <a href="#">Help Center</a>
                        </div>
                        <div className="link-col">
                            <h4>Legal</h4>
                            <a href="#">Privacy</a>
                            <a href="#">Terms</a>
                        </div>
                    </div>

                    <div className="footer-newsletter">
                        <h4>Stay Updated</h4>
                        <p>Join our newsletter for the latest AI interview tips.</p>
                        <form className="newsletter-form" onClick={(e) => e.preventDefault()}>
                            <input type="email" placeholder="Enter your email" />
                            <button type="submit">Subscribe</button>
                        </form>

                        <div className="social-connect">
                            <h4>Connect</h4>
                            <div className="social-links">
                                <a href="#" aria-label="Facebook">
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                </a>
                                <a href="#" aria-label="Instagram">
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                                </a>
                                <a href="#" aria-label="X (Twitter)">
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

        </div>
    );
}
