import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectRedis } from './src/db/redis.db.js';
import app from './src/app.js';
import { setupSocketHandlers } from './src/socket/socketHandler.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// IMPORTANT: Load env vars BEFORE importing app (which imports Redis)
dotenv.config({path: join(__dirname, '../.env')});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  // Connect to Redis before starting server
  await connectRedis();
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Setup Socket.io
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });
  
  // Setup socket event handlers
  setupSocketHandlers(io);
  
  // Start server
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`🔌 Socket.io is ready for connections`);
  });
};

startServer();