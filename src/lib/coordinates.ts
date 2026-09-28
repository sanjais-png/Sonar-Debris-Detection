/**
 * Helper utilities for latitude and longitude formatting
 * Supports Decimal Degrees (DD) and Degrees Minutes Seconds (DMS)
 */

export function formatCoordinate(lat: number, lon: number, format: 'DD' | 'DMS' = 'DD'): string {
  if (format === 'DMS') {
    return `${toDMS(lat, 'lat')}, ${toDMS(lon, 'lon')}`;
  }
  return `${lat.toFixed(5)}°, ${lon.toFixed(5)}°`;
}

export function formatLat(lat: number, format: 'DD' | 'DMS' = 'DD'): string {
  if (format === 'DMS') {
    return toDMS(lat, 'lat');
  }
  const dir = lat >= 0 ? 'N' : 'S';
  return `${Math.abs(lat).toFixed(5)}° ${dir}`;
}

export function formatLon(lon: number, format: 'DD' | 'DMS' = 'DD'): string {
  if (format === 'DMS') {
    return toDMS(lon, 'lon');
  }
  const dir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lon).toFixed(5)}° ${dir}`;
}

function toDMS(deg: number, type: 'lat' | 'lon'): string {
  const absolute = Math.abs(deg);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(1);

  let direction = '';
  if (type === 'lat') {
    direction = deg >= 0 ? 'N' : 'S';
  } else {
    direction = deg >= 0 ? 'E' : 'W';
  }

  return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
}

/**
 * Calculates distance in meters between two lat/lon points using Haversine formula
 */
export function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
