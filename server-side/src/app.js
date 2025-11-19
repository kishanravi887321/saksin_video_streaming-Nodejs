import express from 'express';
import cors from 'cors';
import { redisHelper } from './db/redis.db.js';
import roomRoutes from './routes/room.routes.js';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/hello', (req, res) => {
  consoloe.log('Hello endpoint was hit');
  res.json({
    message: 'Hello from the API!',
    timestamp: new Date().toISOString()
  });
});

// Room routes
app.use('/api/rooms', roomRoutes);

// Redis test route
app.get('/api/redis/test', async (req, res) => {
  try {
    await redisHelper.set('test_key', { data: 'Hello Redis!' }, 60);
    const value = await redisHelper.get('test_key');
    
    res.json({
      success: true,
      message: 'Redis is working!',
      data: value
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default app;

