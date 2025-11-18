import dotenv from 'dotenv';
import { connectRedis } from './src/db/redis.db.js';
import app from './src/app.js';
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
  
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

startServer();