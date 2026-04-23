module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    socket.on('join', (room) => {
      socket.join(room);
      console.log(`User joined room: ${room}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
};
