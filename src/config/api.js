// ============================================
// CENTRALIZED API CONFIGURATION
// ============================================
// Single source of truth for the backend URL.
// Priority: 1) Render env var → 2) auto production fallback → 3) localhost dev

// ──────────────────────────────────────────────────────────────────
// ⚠️  ACTION REQUIRED (first-time setup):
//     In Render → your frontend service → Environment tab, add:
//       Key:   VITE_BACKEND_URL
//       Value: https://<your-backend-service-name>.onrender.com
//
//     That single env var is all that's needed. The fallback below
//     is a safety net in case the env var is accidentally missing.
// ──────────────────────────────────────────────────────────────────

// Fallback backend URL when VITE_BACKEND_URL is not set.
// Replace this with your actual Render backend URL:
const PRODUCTION_BACKEND_URL = 'https://mock-interview-backend-x2xt.onrender.com';

const getBackendURL = () => {
  // 1. Render environment variable (the correct, recommended approach)
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }

  // 2. Auto-detect production from domain name
  const hostname = window.location.hostname;
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return PRODUCTION_BACKEND_URL;
  }

  // 3. Local development fallback
  return 'http://localhost:5000';
};

export const BACKEND_URL = getBackendURL();
