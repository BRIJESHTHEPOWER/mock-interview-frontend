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
import './pages/mediaquery.css';

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

import AdminLayout from './admin/AdminLayout';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import AdminCandidates from './admin/AdminCandidates';
import AdminLiveInterviews from './admin/AdminLiveInterviews';
import AdminNewsletter from './admin/AdminNewsletter';
import AdminFeedback from './admin/AdminFeedback';

// Admin Protected Route
function AdminProtected({ children }) {
  const { currentUser } = useAuth();
  // In real app, check for custom claim or admin role here
  return currentUser ? children : <Navigate to="/admin/login" />;
}

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Admin Routes - Defined FIRST to match more specifically */}
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/admin" element={
          <AdminProtected>
            <AdminLayout />
          </AdminProtected>
        }>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="candidates" element={<AdminCandidates />} />
          <Route path="live-interviews" element={<AdminLiveInterviews />} />
          <Route path="newsletter" element={<AdminNewsletter />} />
          <Route path="feedback" element={<AdminFeedback />} />
        </Route>

        {/* Normal User Routes */}
        <Route path="/" element={<><Navbar /><LandingPage /><FloatingChatbot /></>} />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Navbar /><Login /><FloatingChatbot />
            </PublicRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Navbar /><Dashboard /><FloatingChatbot />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview/setup"
          element={
            <ProtectedRoute>
              <Navbar /><InterviewSetup /><FloatingChatbot />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview"
          element={
            <ProtectedRoute>
              <Navbar /><Interview /><FloatingChatbot />
            </ProtectedRoute>
          }
        />

        <Route
          path="/feedback"
          element={
            <ProtectedRoute>
              <Navbar /><Feedback /><FloatingChatbot />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview/history/:id"
          element={
            <ProtectedRoute>
              <Navbar /><FeedbackDetails /><FloatingChatbot />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chatbot"
          element={
            <ProtectedRoute>
              <Navbar /><ChatbotPage /><FloatingChatbot />
            </ProtectedRoute>
          }
        />

        {/* Footer Placeholder Routes */}
        <Route path="/features" element={<><Navbar /><Placeholder title="Platform Features" /><FloatingChatbot /></>} />
        <Route path="/pricing" element={<><Navbar /><Placeholder title="Pricing Plans" /><FloatingChatbot /></>} />
        <Route path="/enterprise" element={<><Navbar /><Placeholder title="Enterprise Solutions" /><FloatingChatbot /></>} />
        <Route path="/blog" element={<><Navbar /><Placeholder title="Our Blog" /><FloatingChatbot /></>} />
        <Route path="/guide" element={<><Navbar /><Placeholder title="User Guide" /><FloatingChatbot /></>} />
        <Route path="/help-center" element={<><Navbar /><Placeholder title="Help Center" /><FloatingChatbot /></>} />
        <Route path="/privacy" element={<><Navbar /><Placeholder title="Privacy Policy" /><FloatingChatbot /></>} />
        <Route path="/terms" element={<><Navbar /><Placeholder title="Terms of Service" /><FloatingChatbot /></>} />

        {/* 404 catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
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
