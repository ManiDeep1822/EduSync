require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

// Prevent cold starts on Render
const keepAlive = require('./utils/keepAlive');
keepAlive(process.env.APP_URL);

const app = express();
const server = http.createServer(app);

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL, 'http://localhost:5173', 'https://edu-sync-psi.vercel.app'].filter(Boolean),
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Pass io to request object if needed
app.set('io', io);

// Middleware
app.use(cors({
  origin: [process.env.CLIENT_URL, 'http://localhost:5173', 'https://edu-sync-psi.vercel.app'].filter(Boolean),
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'EduSync API is running...' });
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/teachers', require('./routes/teacher.routes'));
app.use('/api/rooms', require('./routes/room.routes'));
app.use('/api/courses', require('./routes/course.routes'));
app.use('/api/batches', require('./routes/batch.routes'));
app.use('/api/timetable', require('./routes/timetable.routes'));

// Socket.io Handlers
require('./socket/socket')(io);

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    errors: err.errors || []
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
