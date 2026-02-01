// ============================================
// MAIN APP COMPONENT
// ============================================
// Root component with routing and authentication

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import InterviewSetup from './pages/InterviewSetup';
import Interview from './pages/Interview';
import LandingPage from './pages/LandingPage';
import Feedback from './pages/Feedback';
import FeedbackDetails from './pages/FeedbackDetails';
import ChatbotPage from './pages/ChatbotPage';
import Placeholder from './pages/Placeholder';


import Navbar from './components/Navbar';
import FloatingChatbot from './components/FloatingChatbot';
import './App.css';

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

// Public route wrapper (redirect to dashboard if already logged in)
function PublicRoute({ children }) {
  const { currentUser } = useAuth();
  return !currentUser ? children : <Navigate to="/dashboard" />;
}

function AppRoutes() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview/setup"
          element={
            <ProtectedRoute>
              <InterviewSetup />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview"
          element={
            <ProtectedRoute>
              <Interview />
            </ProtectedRoute>
          }
        />

        <Route
          path="/feedback"
          element={
            <ProtectedRoute>
              <Feedback />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview/history/:id"
          element={
            <ProtectedRoute>
              <FeedbackDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chatbot"
          element={
            <ProtectedRoute>
              <ChatbotPage />
            </ProtectedRoute>
          }
        />

        {/* Footer Placeholder Routes */}
        <Route path="/features" element={<Placeholder title="Platform Features" />} />
        <Route path="/pricing" element={<Placeholder title="Pricing Plans" />} />
        <Route path="/enterprise" element={<Placeholder title="Enterprise Solutions" />} />
        <Route path="/blog" element={<Placeholder title="Our Blog" />} />
        <Route path="/guide" element={<Placeholder title="User Guide" />} />
        <Route path="/help-center" element={<Placeholder title="Help Center" />} />
        <Route path="/privacy" element={<Placeholder title="Privacy Policy" />} />
        <Route path="/terms" element={<Placeholder title="Terms of Service" />} />




        {/* 404 catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <FloatingChatbot />
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppRoutes />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
