const NodeCache = require('node-cache');
const winston = require('winston');

class RedisService {
  constructor() {
    this.fallbackCache = new NodeCache({ stdTTL: 300 }); // 5 minutes fallback cache
    this.isConnected = false;
    
    // Try to initialize Redis if REDIS_URL is provided
    if (process.env.REDIS_URL) {
      this.initRedis();
    }
  }

  async initRedis() {
    try {
      const redis = await import('redis');
      this.redisClient = redis.createClient({
        url: process.env.REDIS_URL,
        socket: {
          connectTimeout: 5000,
          tls: true
        }
      });

      this.redisClient.on('error', (err) => {
        winston.warn('Redis connection error:', err);
        this.isConnected = false;
      });

      this.redisClient.on('connect', () => {
        winston.info('Redis connected successfully');
        this.isConnected = true;
      });

      await this.redisClient.connect();
    } catch (error) {
      winston.warn('Failed to initialize Redis, using fallback cache:', error.message);
      this.isConnected = false;
    }
  }

  async get(key) {
    if (this.isConnected && this.redisClient) {
      try {
        const value = await this.redisClient.get(key);
        if (value) {
          return JSON.parse(value);
        }
      } catch (error) {
        winston.warn('Redis GET error, falling back to NodeCache:', error.message);
      }
    }
    
    // Fallback to NodeCache
    return this.fallbackCache.get(key);
  }

  async set(key, value, ttlSeconds = 300) {
    if (this.isConnected && this.redisClient) {
      try {
        await this.redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
        return true;
      } catch (error) {
        winston.warn('Redis SET error, falling back to NodeCache:', error.message);
      }
    }
    
    // Fallback to NodeCache
    return this.fallbackCache.set(key, value, ttlSeconds);
  }

  async del(key) {
    if (this.isConnected && this.redisClient) {
      try {
        await this.redisClient.del(key);
        return true;
      } catch (error) {
        winston.warn('Redis DEL error:', error.message);
      }
    }
    
    // Fallback to NodeCache
    return this.fallbackCache.del(key);
  }

  async flushAll() {
    if (this.isConnected && this.redisClient) {
      try {
        await this.redisClient.flushAll();
        return true;
      } catch (error) {
        winston.warn('Redis FLUSH error:', error.message);
      }
    }
    
    // Fallback to NodeCache
    this.fallbackCache.flushAll();
    return true;
  }

  getStatus() {
    return {
      redis: this.isConnected ? 'connected' : 'disconnected',
      fallback: 'available'
    };
  }
}

module.exports = RedisService;