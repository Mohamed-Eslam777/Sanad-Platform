/**
 * redis.js — Redis client configuration.
 *
 * Provides a connected Redis client (ioredis) for use by
 * the Socket.io Redis adapter and general-purpose caching.
 *
 * Reads REDIS_URL from the environment (fallback: redis://localhost:6379).
 * Exports both a pubClient and a subClient required by @socket.io/redis-adapter.
 */
'use strict';

const Redis = require('ioredis');
const logger = require('../utils/logger');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

/**
 * Creates a Redis client with standardized error handling.
 * @param {string} name - A human-readable label for logging.
 * @returns {Redis} ioredis client instance.
 */
function createRedisClient(name) {
  const client = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    retryStrategy(times) {
      if (times > 3) {
        logger.error(`[Redis:${name}] Max reconnection attempts (3) reached. Giving up.`);
        return null; // Stop retrying — returning null kills the reconnection loop
      }
      const delay = Math.min(times * 200, 2000);
      logger.warn(`[Redis:${name}] Reconnecting in ${delay}ms (attempt ${times}/3)...`);
      return delay;
    },
    lazyConnect: true, // Don't auto-connect; we connect explicitly in server.js
  });

  client.on('connect', () => {
    logger.info(`[Redis:${name}] Connected successfully to ${REDIS_URL}`);
  });

  client.on('error', (err) => {
    logger.error(`[Redis:${name}] Connection error: ${err.message}`);
  });

  client.on('close', () => {
    logger.warn(`[Redis:${name}] Connection closed.`);
  });

  return client;
}

// Pub and Sub clients for the Socket.io Redis adapter
const pubClient = createRedisClient('pub');
const subClient = createRedisClient('sub');

module.exports = { pubClient, subClient, createRedisClient };
