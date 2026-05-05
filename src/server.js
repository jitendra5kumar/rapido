import 'dotenv/config';

import http from 'http';
import app from './app.js';
import {start } from './bootstrap/index.js';
import setupSockets from './sockets/index.js';
import {PORT } from './config/env.js';

const server = http.createServer(app);

// Setup Socket.IO
setupSockets(server);

// Start the application
start(app).then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Graceful shutdown
import './bootstrap/shutdown.js';
