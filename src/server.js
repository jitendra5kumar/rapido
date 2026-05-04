require('dotenv').config();

const http = require('http');
const app = require('./app');
const { start } = require('./bootstrap');
const setupSockets = require('./sockets');
const { PORT } = require('./config/env');

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
require('./bootstrap/shutdown');