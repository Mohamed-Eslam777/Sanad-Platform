/**
 * geoService.js — Database-level geospatial query service.
 *
 * Uses MySQL's native ST_Distance_Sphere function for blazing fast
 * proximity queries against the SPATIALLY INDEXED `location` column
 * on Volunteer_Profiles.
 *
 * ALL distance filtering happens at the DB level — no in-memory loops.
 */
'use strict';

const { QueryTypes } = require('sequelize');
const sequelize = require('../config/db');
const logger = require('../utils/logger');

/**
 * Find available volunteers within a given radius of a coordinate.
 *
 * @param {number} lat  — Latitude of the SOS origin.
 * @param {number} lng  — Longitude of the SOS origin.
 * @param {number} [radiusMeters=10000] — Search radius in metres (default: 10 km).
 * @returns {Promise<Array>} — List of nearby volunteer objects with distance_m.
 */
async function findNearbyVolunteers(lat, lng, radiusMeters = 10000) {
  const query = `
    SELECT
      vp.id               AS profile_id,
      vp.user_id,
      u.full_name,
      u.profile_picture,
      vp.latitude,
      vp.longitude,
      vp.average_rating,
      vp.total_reviews,
      ROUND(
        6371000 * ACOS(
          COS(RADIANS(:lat)) * COS(RADIANS(vp.latitude)) *
          COS(RADIANS(vp.longitude) - RADIANS(:lng)) +
          SIN(RADIANS(:lat)) * SIN(RADIANS(vp.latitude))
        )
      ) AS distance_m
    FROM Volunteer_Profiles vp
    INNER JOIN Users u ON u.id = vp.user_id
    WHERE
      vp.latitude IS NOT NULL
      AND vp.longitude IS NOT NULL
      AND vp.is_available = 1
      AND u.status = 'active'
      AND u.role   = 'volunteer'
    HAVING distance_m <= :radiusMeters
    ORDER BY distance_m ASC
    LIMIT 50;
  `;

  try {
    const volunteers = await sequelize.query(query, {
      replacements: {
        lat,
        lng,
        radiusMeters,
      },
      type: QueryTypes.SELECT,
    });

    logger.info(`[Geo] Found ${volunteers.length} volunteers within ${radiusMeters}m of (${lat}, ${lng}).`);
    return volunteers;
  } catch (err) {
    logger.error(`[Geo] ST_Distance_Sphere query failed: ${err.message}`);
    throw err;
  }
}

module.exports = { findNearbyVolunteers };
