# PHASE 02: Realtime Scaling & Query Optimization

## Objective
To ensure the Sanad Platform can handle high concurrent traffic and scale horizontally by integrating Redis for WebSockets scaling, caching frequently accessed data, and optimizing database queries, particularly for geospatial SOS operations.

## Target Files to Create/Modify
- **Create:** `backend/src/config/redis.js` (Redis Connection)
- **Modify:** `backend/src/socketHandler.js` (Integrate `@socket.io/redis-adapter`)
- **Modify:** `backend/src/controllers/sosController.js` (Geospatial Query Optimization)
- **Modify:** `backend/src/controllers/requestController.js` (Caching mechanisms)
- **Modify:** `docker-compose.yml` (Add Redis service)
- **Modify:** `backend/package.json` (Add redis, ioredis, @socket.io/redis-adapter)

## Step-by-Step Implementation Guide

1. **Redis Integration for Socket.io:**
   - Add a Redis service to the `docker-compose.yml` stack.
   - Install `@socket.io/redis-adapter` and `ioredis` in the backend.
   - Modify `socketHandler.js` to use the Redis adapter. This ensures that if the Node.js backend is horizontally scaled across multiple instances, Socket.io rooms and broadcasts remain synchronized.

2. **Data Caching Layer:**
   - Configure a general Redis client in `src/config/redis.js`.
   - Implement caching in high-traffic read endpoints, such as frontend live statistics (`adminController.js` or `requestController.js` summary stats), to reduce direct database load.

3. **SOS Geolocation Query Optimization:**
   - Review current SOS implementation in `sosController.js`.
   - Ensure spatial indexing (or equivalent Haversine formula optimizations) in Sequelize are highly performant.
   - Add proper database indexes on frequently queried columns in Sequelize models (e.g., `status`, `beneficiary_id`, `volunteer_id`).

4. **Advanced Error Monitoring (Sentry Integration Optional):**
   - If requested, add Sentry to automatically track exceptions that happen in production to get immediate alerts for critical failures.

## Testing & Security Checklist
- [ ] Socket.io adapter correctly delegates pub/sub events through Redis (verify by logging adapter events).
- [ ] Caching mechanism correctly returns DB values and clears cache upon data mutation (POST/PUT/DELETE requests).
- [ ] High-volume load testing (using tools like Artillery or K6) against Socket.io endpoints remains stable.
- [ ] Geospatial SOS queries perform under 50ms execution time even with simulated large datasets.
