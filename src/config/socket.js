import { Server } from "socket.io";

const ioLoader = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  return io;
};

export default ioLoader;