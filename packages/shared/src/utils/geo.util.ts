/**
 * Geospatial Utility Functions
 *
 * These utilities implement the Haversine formula for calculating
 * distances between two points on Earth using latitude and longitude.
 * This approach is simple, accurate for small distances, and doesn't
 * require external geo libraries.
 */

/**
 * Represents a geographic coordinate point
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Result of a distance calculation including the target entity
 */
export interface DistanceResult<T> {
  entity: T;
  distance: number; // Distance in kilometers
}

// Earth's mean radius in kilometers
const EARTH_RADIUS_KM = 6371;

/**
 * Converts degrees to radians
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 */
function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculates the distance between two geographic points using the Haversine formula
 *
 * The Haversine formula determines the great-circle distance between two points
 * on a sphere given their longitudes and latitudes. It's accurate for small distances.
 *
 * Formula: a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
 *          c = 2 ⋅ atan2(√a, √(1−a))
 *          d = R ⋅ c
 *
 * @param point1 - First coordinate point
 * @param point2 - Second coordinate point
 * @returns Distance in kilometers
 */
export function calculateDistance(point1: Coordinates, point2: Coordinates): number {
  // Convert latitude and longitude from degrees to radians
  const lat1Rad = degreesToRadians(point1.latitude);
  const lat2Rad = degreesToRadians(point2.latitude);

  // Calculate differences
  const deltaLat = degreesToRadians(point2.latitude - point1.latitude);
  const deltaLon = degreesToRadians(point2.longitude - point1.longitude);

  // Apply Haversine formula
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Calculate distance
  const distance = EARTH_RADIUS_KM * c;

  return distance;
}

/**
 * Finds the N nearest entities to a given point based on their coordinates
 *
 * This function is generic and can work with any entity that has latitude/longitude
 * properties. It calculates distances, sorts by proximity, and returns the top N results.
 *
 * Time Complexity: O(n log n) where n is the number of entities
 * Space Complexity: O(n) for storing distance results
 *
 * @param userLocation - The reference point (user's location)
 * @param entities - Array of entities with latitude and longitude properties
 * @param limit - Maximum number of nearest entities to return
 * @returns Array of entities with their distances, sorted by proximity
 */
export function findNearestEntities<T extends Coordinates>(
  userLocation: Coordinates,
  entities: T[],
  limit: number,
): DistanceResult<T>[] {
  // Calculate distance for each entity
  const entitiesWithDistance: DistanceResult<T>[] = entities.map((entity) => ({
    entity,
    distance: calculateDistance(userLocation, entity),
  }));

  // Sort by distance (ascending) and limit to N nearest
  return entitiesWithDistance.sort((a, b) => a.distance - b.distance).slice(0, limit);
}

/**
 * Validates if coordinates are within valid ranges
 * Latitude: -90 to 90, Longitude: -180 to 180
 *
 * @param coordinates - Coordinates to validate
 * @returns true if valid, false otherwise
 */
export function areValidCoordinates(coordinates: Coordinates): boolean {
  const { latitude, longitude } = coordinates;

  return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}
