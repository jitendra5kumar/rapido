import {Server } from 'socket.io';

export default (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });
  return io;
};
