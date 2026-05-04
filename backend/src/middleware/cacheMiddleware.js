/**
 * cacheMiddleware.js — Reusable Redis caching middleware.
 *
 * Checks Redis for a cached response matching `req.originalUrl`.
 * On cache HIT  → returns the cached JSON immediately.
 * On cache MISS → intercepts `res.json()`, stores the response in Redis
 *                 with the specified TTL, then sends it to the client.
 *
 * Safety: If Redis is unreachable or throws an error, the middleware
 * silently calls next() so the request is served from the database.
 *
 * Usage in routes:
 *   const cacheMiddleware = require('../middleware/cacheMiddleware');
 *   router.get('/stats', cacheMiddleware(60), getStats);
 */
'use strict';

const { pubClient } = require('../config/redis');
const logger = require('../utils/logger');

/**
 * @param {number} [ttlSeconds=60] — Time-To-Live in seconds.
 * @returns {Function} Express middleware.
 */
function cacheMiddleware(ttlSeconds = 60) {
  return async (req, res, next) => {
    const cacheKey = `cache:${req.originalUrl}`;

    try {
      const cached = await pubClient.get(cacheKey);

      if (cached) {
        logger.debug(`[Cache] HIT — ${cacheKey}`);
        return res.json(JSON.parse(cached));
      }

      logger.debug(`[Cache] MISS — ${cacheKey}`);

      // Intercept res.json to store the response before sending
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        // Store asynchronously — don't block the response
        pubClient
          .set(cacheKey, JSON.stringify(body), 'EX', ttlSeconds)
          .catch((err) => {
            logger.error(`[Cache] Failed to SET ${cacheKey}: ${err.message}`);
          });

        return originalJson(body);
      };

      next();
    } catch (err) {
      // Redis is down — gracefully skip caching
      logger.warn(`[Cache] Redis error, skipping cache: ${err.message}`);
      next();
    }
  };
}

module.exports = cacheMiddleware;
