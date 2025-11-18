import express from 'express';
import { testConnection, redisHelper } from './db/redis.db.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test Redis connection on startup
testConnection();

// Routes
app.get('/api/hello', (req, res) => {
  res.json({
    message: 'Hello from the API!',
    timestamp: new Date().toISOString()
  });
});

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

