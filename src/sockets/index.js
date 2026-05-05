import ioLoader from '../config/socket.js';

const setupSockets = (server) => {
  const io = ioLoader(server);
  
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    // Handle real-time events
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
    
    // Example: Handle ride tracking (to be extended)
    socket.on('join-ride', (rideId) => {
      socket.join(`ride-${rideId}`);
    });
    
    socket.on('leave-ride', (rideId) => {
      socket.leave(`ride-${rideId}`);
    });
    
    // Add more socket events as needed for real-time features
  });
  
  return io;
};

export default setupSockets;
