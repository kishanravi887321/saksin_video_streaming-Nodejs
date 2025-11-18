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



export default app;

