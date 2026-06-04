# Rapido Backend

A production-grade Node.js backend for ride-sharing app.

## Setup

1. Install dependencies: `npm install`
2. Set up environment variables in `.env`
   - For Firebase Admin, provide either `FIREBASE_SERVICE_ACCOUNT` as valid JSON, or set `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`.
3. Start MongoDB and Redis servers
4. Run: `npm start` or `npm run dev` for development

## API Documentation

See `src/docs/api.md` for detailed API endpoints.

node src/workers/dispatch.worker.js