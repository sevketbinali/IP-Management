# Frontend Setup Guide

## Prerequisites
1. **Node.js** (v18 or higher) - Download from https://nodejs.org/
2. **npm** (comes with Node.js)

## Installation Steps

### 1. Verify Node.js Installation
```bash
node --version
npm --version
```

### 2. Install Dependencies
```bash
cd frontend
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

The application will be available at: http://localhost:5173

## Troubleshooting

### If you see "npm not recognized" error:
1. Restart your terminal/command prompt
2. Make sure Node.js is properly installed
3. Check if Node.js is in your system PATH

### If you see TypeScript errors:
1. Make sure all dependencies are installed: `npm install`
2. Check if TypeScript is working: `npm run type-check`

### If the page shows blank/white screen:
1. Check browser console for JavaScript errors (F12)
2. Make sure the development server is running
3. Try refreshing the page (Ctrl+F5)

## Current Status
- ✅ Simplified Dashboard component created
- ✅ Basic routing configured
- ✅ Fallback CSS styles added
- ✅ Mock data services implemented

## Next Steps After Setup
1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Open http://localhost:5173 in browser
4. You should see a working dashboard with basic statistics

## Project Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── SimpleDashboard.tsx  # Current working dashboard
│   │   ├── Dashboard.tsx        # Full dashboard (has issues)
│   │   └── Layout.tsx           # Navigation layout
│   ├── services/                # API services with mock data
│   ├── stores/                  # State management
│   ├── types/                   # TypeScript definitions
│   ├── utils/                   # Utility functions
│   ├── App.tsx                  # Main app component
│   └── main.tsx                 # Entry point
├── package.json
├── vite.config.ts
└── tsconfig.json
```