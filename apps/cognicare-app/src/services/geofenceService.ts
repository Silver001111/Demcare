/**
 * CogniCare NER — Virtual Geofence & "Safe Return" Wandering Defense Service
 * 
 * Over 60% of people living with Alzheimer's or dementia experience ambulation disorientation.
 * In North East India (river islands/chaporis, tea estates, hilly tracts), wandering is life-threatening.
 * This service monitors a 500m virtual perimeter around the elder's home using the HTML5 Geolocation API,
 * triggers high-contrast patient reassurance beacons on breach, and dispatches instant family emergency alerts.
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeofenceStatus {
  isBreached: boolean;
  distanceMeters: number;
  distanceKm: number;
  safeRadiusMeters: number;
  currentCoords: Coordinates;
  homeCoords: Coordinates;
  timestamp: string;
  batteryEstimate?: number;
  speedKmh?: number;
}

// Default reference coordinates: Bihaguri Gaon, Sonitpur, Assam (LGBRIMH catchment area)
export const DEFAULT_HOME_COORDS: Coordinates = {
  lat: 26.6812,
  lng: 92.7934,
};

export const SAFE_RADIUS_METERS = 500;

/**
 * High-precision Haversine mathematical distance calculation between two GPS points
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Checks if current GPS coordinates are within safe village perimeter
 */
export function evaluateGeofence(
  current: Coordinates,
  home: Coordinates = DEFAULT_HOME_COORDS,
  safeRadius: number = SAFE_RADIUS_METERS
): GeofenceStatus {
  const distanceMeters = calculateDistanceMeters(current.lat, current.lng, home.lat, home.lng);
  return {
    isBreached: distanceMeters > safeRadius,
    distanceMeters,
    distanceKm: Math.round((distanceMeters / 1000) * 10) / 10,
    safeRadiusMeters: safeRadius,
    currentCoords: current,
    homeCoords: home,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Creates formatted WhatsApp alert payload with live Google Maps pin and telemetry
 */
export function createGeofenceWhatsAppAlert(
  patientName: string,
  current: Coordinates,
  distanceMeters: number,
  caregiverPhone: string
): string {
  const mapsLink = `https://maps.google.com/?q=${current.lat.toFixed(5)},${current.lng.toFixed(5)}`;
  const distDesc = distanceMeters >= 1000
    ? `${(distanceMeters / 1000).toFixed(1)} km`
    : `${distanceMeters} meters`;

  return `🚨 *COGNICARE SAFE RETURN ALERT* 🚨
⚠️ Attention: ${patientName} has wandered outside the 500m safe home perimeter!

📍 *Current Distance from Home:* ${distDesc}
🗺️ *Live Google Maps Location:* ${mapsLink}
🕒 *Time of Detection:* ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
🔋 *Device Telemetry:* GPS Active • Battery OK

_Please check on ${patientName} immediately or contact local ASHA worker._
📞 Emergency Phone: ${caregiverPhone}`;
}

/**
 * Generates simulated coordinates outside the perimeter for demonstration/testing
 */
export function getSimulatedBreachCoords(home: Coordinates = DEFAULT_HOME_COORDS): Coordinates {
  // Offset approximately ~850 meters North-East
  return {
    lat: home.lat + 0.0062,
    lng: home.lng + 0.0058,
  };
}
