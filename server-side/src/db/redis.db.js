import { Redis } from '@upstash/redis';

// Lazy initialization - Redis client will be created when first accessed
let redis = null;

const getRedisClient = () => {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
};

// Connect to Redis
const connectRedis = async () => {
  try {
    const client = getRedisClient();
    await client.set('connection_test', 'connected');
    const result = await client.get('connection_test');
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
      const client = getRedisClient();
      if (expiry) {
        await client.setex(key, expiry, JSON.stringify(value));
      } else {
        await client.set(key, JSON.stringify(value));
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
      const client = getRedisClient();
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  },

  // Delete key
  del: async (key) => {
    try {
      const client = getRedisClient();
      await client.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL error:', error);
      return false;
    }
  },

  // Check if key exists
  exists: async (key) => {
    try {
      const client = getRedisClient();
      const exists = await client.exists(key);
      return exists === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  },

  // Set expiry on existing key
  expire: async (key, seconds) => {
    try {
      const client = getRedisClient();
      await client.expire(key, seconds);
      return true;
    } catch (error) {
      console.error('Redis EXPIRE error:', error);
      return false;
    }
  },

  // Hash operations
  hset: async (key, field, value) => {
    try {
      const client = getRedisClient();
      await client.hset(key, { [field]: JSON.stringify(value) });
      return true;
    } catch (error) {
      console.error('Redis HSET error:', error);
      return false;
    }
  },

  hget: async (key, field) => {
    try {
      const client = getRedisClient();
      const value = await client.hget(key, field);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis HGET error:', error);
      return null;
    }
  },

  hgetall: async (key) => {
    try {
      const client = getRedisClient();
      const data = await client.hgetall(key);
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

export { getRedisClient as redis, connectRedis };
export default getRedisClient;