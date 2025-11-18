import { Redis } from '@upstash/redis';

// Initialize Redis client with Upstash
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Test connection
const testConnection = async () => {
  try {
    await redis.set('connection_test', 'connected');
    const result = await redis.get('connection_test');
    console.log('✅ Redis connected successfully:', result);
    return true;
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    return false;
  }
};

// Helper functions for common Redis operations
export const redisHelper = {
  // Set key-value with optional expiry (in seconds)
  set: async (key, value, expiry = null) => {
    try {
      if (expiry) {
        await redis.setex(key, expiry, JSON.stringify(value));
      } else {
        await redis.set(key, JSON.stringify(value));
      }
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  },

  // Get value by key
  get: async (key) => {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  },

  // Delete key
  del: async (key) => {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL error:', error);
      return false;
    }
  },

  // Check if key exists
  exists: async (key) => {
    try {
      const exists = await redis.exists(key);
      return exists === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  },

  // Set expiry on existing key
  expire: async (key, seconds) => {
    try {
      await redis.expire(key, seconds);
      return true;
    } catch (error) {
      console.error('Redis EXPIRE error:', error);
      return false;
    }
  },

  // Hash operations
  hset: async (key, field, value) => {
    try {
      await redis.hset(key, { [field]: JSON.stringify(value) });
      return true;
    } catch (error) {
      console.error('Redis HSET error:', error);
      return false;
    }
  },

  hget: async (key, field) => {
    try {
      const value = await redis.hget(key, field);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis HGET error:', error);
      return null;
    }
  },

  hgetall: async (key) => {
    try {
      const data = await redis.hgetall(key);
      if (!data) return null;
      
      const parsed = {};
      for (const [field, value] of Object.entries(data)) {
        parsed[field] = JSON.parse(value);
      }
      return parsed;
    } catch (error) {
      console.error('Redis HGETALL error:', error);
      return null;
    }
  },
};

export { redis, testConnection };
export default redis;