/**
 * Geo Service — geospatial utilities for volunteer matching.
 *
 * The Haversine formula calculates the great-circle distance between two
 * points on a sphere given their latitude and longitude coordinates.
 * Used to find volunteers within a radius of a request's location.
 *
 * SECURITY: haversineSQLExpression now returns a parameterised literal
 * (using Sequelize replacements) so lat/lng values are NEVER interpolated
 * directly into SQL strings, preventing SQL injection.
 */

const { literal } = require('sequelize');

const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees) => (degrees * Math.PI) / 180;

/**
 * Calculates the JS-side Haversine distance between two geo-coordinates.
 */
const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
};

/**
 * Returns the SQL Haversine expression as a plain string with NAMED placeholders.
 * The caller must pass `{ replacements: { lat, lng } }` to sequelize.query().
 *
 * Example usage:
 *   const expr = haversineSQLString();
 *   const [rows] = await sequelize.query(
 *     `SELECT *, (${expr}) AS distance_km FROM Requests WHERE status = 'pending' HAVING distance_km <= :radius ORDER BY distance_km ASC`,
 *     { replacements: { lat: 30.04, lng: 31.23, radius: 5 }, type: QueryTypes.SELECT }
 *   );
 */
const haversineSQLString = () =>
  `(${EARTH_RADIUS_KM} * ACOS(
        COS(RADIANS(:lat)) * COS(RADIANS(location_lat)) *
        COS(RADIANS(location_lng) - RADIANS(:lng)) +
        SIN(RADIANS(:lat)) * SIN(RADIANS(location_lat))
    ))`;

module.exports = { haversineDistance, haversineSQLString };
