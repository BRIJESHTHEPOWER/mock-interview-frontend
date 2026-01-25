# NPM Installation Troubleshooting Guide

## Issue
npm install is failing with `ETARGET` error, which typically indicates:
- npm registry access issues
- Network connectivity problems
- Version resolution conflicts
- npm authentication/token issues

## Solutions to Try

### Solution 1: Check npm Registry
```bash
# Check current registry
npm config get registry

# If not set to default, reset it
npm config set registry https://registry.npmjs.org/

# Try install again
npm install
```

### Solution 2: Use Different Registry (if behind firewall/proxy)
```bash
# Try using HTTP instead of HTTPS
npm config set registry http://registry.npmjs.org/

# Or try a mirror
npm config set registry https://registry.npmmirror.com/

# Try install again
npm install
```

### Solution 3: Install Packages One by One
If bulk install fails, try installing packages individually:

```bash
# Core React packages
npm install react@18.2.0 react-dom@18.2.0

# Firebase
npm install firebase@10.7.1

# Retell AI SDK
npm install retell-client-js-sdk@1.4.5

# HTTP client
npm install axios@1.6.0

# Routing
npm install react-router-dom@6.20.0

# Dev dependencies
npm install --save-dev vite@5.1.0 @vitejs/plugin-react@4.2.1
```

### Solution 4: Use Yarn Instead
If npm continues to fail, try using yarn:

```bash
# Install yarn globally (if not installed)
npm install -g yarn

# Install dependencies with yarn
yarn install
```

### Solution 5: Check npm Authentication
```bash
# If you see "Access token expired or revoked"
npm logout
npm login

# Or clear npm authentication
npm config delete //registry.npmjs.org/:_authToken
```

### Solution 6: Network/Proxy Issues
If behind a corporate firewall or proxy:

```bash
# Set proxy (replace with your proxy URL)
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080

# Or bypass proxy
npm config delete proxy
npm config delete https-proxy
```

### Solution 7: Complete Clean Install
```bash
# Remove everything and start fresh
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm cache clean --force

# Reset npm config to defaults
npm config delete registry
npm config delete proxy
npm config delete https-proxy

# Try install
npm install
```

## Current Package Versions

The `package.json` is configured with these stable versions:

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "firebase": "^10.7.1",
    "retell-client-js-sdk": "^1.4.5",
    "axios": "^1.6.0",
    "react-router-dom": "^6.20.0"
  }
}
```

## Manual Workaround

If npm continues to fail, you can:

1. **Use the backend only** for now and test Retell AI integration
2. **Install dependencies later** when network/npm issues are resolved
3. **Use a different machine** with better npm registry access
4. **Use CodeSandbox or StackBlitz** for online development

## Next Steps

Once dependencies are installed successfully:

```bash
# Start the development server
npm run dev
```

The app will run on `http://localhost:5173`

## Important Files Already Created

All source code files are ready:
- ✅ `src/config/firebase.js` - Firebase configuration
- ✅ `src/contexts/AuthContext.jsx` - Authentication
- ✅ `src/hooks/useRetell.js` - Retell AI integration
- ✅ `src/pages/Login.jsx` - Login page
- ✅ `src/pages/Dashboard.jsx` - Dashboard
- ✅ `src/pages/InterviewSetup.jsx` - Setup page
- ✅ `src/pages/Interview.jsx` - Interview session
- ✅ `src/App.jsx` - Main app with routing

The only issue is installing the npm packages.
