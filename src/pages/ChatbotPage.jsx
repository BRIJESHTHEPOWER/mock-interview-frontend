// ============================================
// CHATBOT PAGE
// ============================================
// Dedicated page for AI Interview Assistant chatbot

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatbotPage.css';

export default function ChatbotPage() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        {
            type: 'bot',
            text: 'Hi! 👋 I\'m your Interview Preparation Assistant. Ask me anything about interview tips, common questions, or how to prepare!',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Call OpenRouter API for AI response
    const callOpenRouterAPI = async (userMessage, history) => {
        try {
            // Use environment variable for API URL (works for both local and production)
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

            const response = await fetch(`${API_URL}/api/chatbot/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    conversationHistory: history
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to get AI response');
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMessage = {
            type: 'user',
            text: inputValue,
            timestamp: new Date()
        };

        // Add user message immediately
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        try {
            // Build conversation history for context (last 10 messages)
            const history = messages.slice(-10).map(msg => ({
                role: msg.type === 'user' ? 'user' : 'assistant',
                content: msg.text
            }));

            // Get AI response
            const aiResponse = await callOpenRouterAPI(inputValue, history);

            const botMessage = {
                type: 'bot',
                text: aiResponse,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            // Show error message
            const errorMessage = {
                type: 'bot',
                text: '❌ Sorry, I encountered an error. Please try again.\n\n' +
                    'Possible issues:\n' +
                    '• Backend server not running\n' +
                    '• OpenRouter API key not configured\n' +
                    '• Network connection issue',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const quickQuestions = [
        'Common interview questions?',
        'How to use STAR method?',
        'Tips for technical interviews?',
        'How to handle nervousness?'
    ];

    const handleQuickQuestion = (question) => {
        setInputValue(question);
    };

    return (
        <div className="chatbot-page">
            <div className="chatbot-page-container">
                {/* Header */}
                <div className="chatbot-page-header">
                    <div className="chatbot-page-header-info">
                        <div className="chatbot-page-avatar">🤖</div>
                        <div>
                            <h1>Interview Assistant</h1>
                            <span className="chatbot-page-status">● Online</span>
                        </div>
                    </div>
                    <button
                        className="chatbot-page-back-btn"
                        onClick={() => navigate(-1)}
                    >
                        ← Back
                    </button>
                </div>

                {/* Messages */}
                <div className="chatbot-page-messages">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`chatbot-page-message ${message.type}`}
                        >
                            {message.type === 'bot' && (
                                <div className="chatbot-page-message-avatar">🤖</div>
                            )}
                            <div className="chatbot-page-message-content">
                                <div className="chatbot-page-message-text">
                                    {message.text.split('\n').map((line, i) => (
                                        <span key={i}>
                                            {line}
                                            {i < message.text.split('\n').length - 1 && <br />}
                                        </span>
                                    ))}
                                </div>
                                <div className="chatbot-page-message-time">
                                    {message.timestamp.toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="chatbot-page-message bot">
                            <div className="chatbot-page-message-avatar">🤖</div>
                            <div className="chatbot-page-message-content">
                                <div className="chatbot-page-typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Questions */}
                {messages.length <= 1 && (
                    <div className="chatbot-page-quick-questions">
                        <p>Quick questions:</p>
                        <div className="chatbot-page-quick-questions-grid">
                            {quickQuestions.map((question, index) => (
                                <button
                                    key={index}
                                    className="chatbot-page-quick-question-btn"
                                    onClick={() => handleQuickQuestion(question)}
                                >
                                    {question}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div className="chatbot-page-input-area">
                    <input
                        type="text"
                        className="chatbot-page-input"
                        placeholder="Ask me anything about interviews..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <button
                        className="chatbot-page-send-btn"
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim()}
                    >
                        <span className="chatbot-page-send-icon">➤</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
