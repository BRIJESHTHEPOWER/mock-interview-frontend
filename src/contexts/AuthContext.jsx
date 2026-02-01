// ============================================
// AUTHENTICATION CONTEXT
// ============================================
// Provides authentication state throughout the app

import { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';

// Create authentication context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

// Authentication provider component
export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Sign up with email and password
    const signup = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    };

    // Sign in with email and password
    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    // Sign out
    const logout = () => {
        return signOut(auth);
    };

    // Listen for auth state changes
    useEffect(() => {
        let mounted = true;

        // Timeout to prevent infinite loading state
        const timer = setTimeout(() => {
            if (mounted && loading) {
                console.warn("Auth state change timed out, forcing render");
                setLoading(false);
            }
        }, 5000);

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (mounted) {
                setCurrentUser(user);
                setLoading(false);
                clearTimeout(timer);
            }
        });

        // Cleanup subscription
        return () => {
            mounted = false;
            clearTimeout(timer);
            unsubscribe();
        };
    }, []);

    function googleSignIn() {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    }

    // Reset password
    const resetPassword = (email, actionCodeSettings) => {
        return sendPasswordResetEmail(auth, email, actionCodeSettings);
    };

    const value = {
        currentUser,
        signup,
        login,
        googleSignIn,
        logout,
        resetPassword,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
