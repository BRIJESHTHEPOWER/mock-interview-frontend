# Voice-Based AI Mock Interview Platform - Frontend

React + Vite frontend for the AI Mock Interview Platform with Retell AI voice integration.

## Features

- 🎤 **Voice-based interviews** using Retell AI
- 🔐 **Firebase Authentication** (Email/Password)
- 📊 **Interview history** stored in Firestore
- ⚡ **Real-time session tracking** with Firebase Realtime Database
- 🎨 **Modern, responsive UI**
- 🚀 **Fast development** with Vite

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` and add your Firebase credentials:

```env
VITE_BACKEND_URL=http://localhost:5000

VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. **Enable Authentication:**
   - Go to Authentication > Sign-in method
   - Enable "Email/Password"
4. **Create Firestore Database:**
   - Go to Firestore Database
   - Click "Create database"
   - Start in test mode (or production mode with rules)
5. **Create Realtime Database:**
   - Go to Realtime Database
   - Click "Create database"
   - Start in test mode
6. **Get Config:**
   - Go to Project Settings > General
   - Scroll to "Your apps" > Web app
   - Copy the config values to `.env`

### 4. Run the Application

**Development mode:**
```bash
npm run dev
```

The app will start on `http://localhost:5173`

**Production build:**
```bash
npm run build
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── config/
│   │   └── firebase.js          # Firebase initialization
│   ├── contexts/
│   │   └── AuthContext.jsx      # Authentication context
│   ├── hooks/
│   │   └── useRetell.js         # Retell AI custom hook
│   ├── pages/
│   │   ├── Login.jsx            # Login/Signup page
│   │   ├── Login.css
│   │   ├── Dashboard.jsx        # Main dashboard
│   │   ├── Dashboard.css
│   │   ├── InterviewSetup.jsx   # Job role selection
│   │   ├── InterviewSetup.css
│   │   ├── Interview.jsx        # Live interview session
│   │   └── Interview.css
│   ├── App.jsx                  # Main app with routing
│   ├── App.css
│   ├── main.jsx                 # Entry point
│   └── index.css
├── .env.example                 # Environment template
├── .env                         # Your credentials (gitignored)
├── package.json
└── vite.config.js
```

## How It Works

### Authentication Flow
1. User signs up or logs in with email/password
2. Firebase Authentication manages user sessions
3. Protected routes ensure only authenticated users can access interviews

### Interview Flow
1. User selects job role on setup page
2. Frontend calls backend API to create Retell session
3. Backend returns `callId` and `accessToken`
4. Frontend starts Retell voice call
5. Interview data is saved to:
   - **Firestore**: Permanent interview history
   - **Realtime Database**: Live session status
6. On interview end, data is updated and user returns to dashboard

## Firebase Data Structure

### Firestore Collection: `interviews`
```javascript
{
  userId: "user_uid",
  jobRole: "Software Engineer",
  callId: "call_abc123",
  startedAt: Timestamp,
  endedAt: Timestamp,
  duration: 300, // seconds
  status: "completed"
}
```

### Realtime Database: `liveSessions/{userId}`
```javascript
{
  active: true,
  callId: "call_abc123",
  jobRole: "Software Engineer",
  startedAt: "2026-01-07T13:37:34.000Z"
}
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_BACKEND_URL` | Backend API URL (default: http://localhost:5000) |
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_FIREBASE_DATABASE_URL` | Firebase Realtime Database URL |

## Troubleshooting

**Error: Firebase not initialized**
- Make sure `.env` file exists with all Firebase credentials
- Restart the dev server after changing `.env`

**Error: Cannot connect to backend**
- Ensure backend server is running on port 5000
- Check `VITE_BACKEND_URL` in `.env`

**Error: Retell call fails**
- Check browser console for specific errors
- Ensure microphone permissions are granted
- Verify backend has valid Retell credentials

**Error: Authentication fails**
- Ensure Email/Password is enabled in Firebase Console
- Check Firebase API key is correct

## Browser Compatibility

- Chrome/Edge: ✅ Fully supported
- Firefox: ✅ Fully supported
- Safari: ✅ Fully supported
- Opera: ✅ Fully supported

**Note:** Microphone access required for voice interviews.

## Security Notes

- ✅ API keys are stored in `.env` (gitignored)
- ✅ Backend handles all Retell API calls
- ✅ Firebase security rules should be configured
- ✅ Protected routes prevent unauthorized access

## Next Steps

1. Configure Firebase security rules for production
2. Add interview feedback/analytics
3. Implement interview recording playback
4. Add more interview types
5. Deploy to production (Vercel, Netlify, etc.)
