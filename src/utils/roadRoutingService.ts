import { GeoCoord } from '../data/colombiaCoordinates';

export interface RouteLegInfo {
  index: number;
  fromName: string;
  toName: string;
  distanceKm: number;
  durationMinutes: number;
  stepsCount: number;
}

export interface RoadRouteResult {
  success: boolean;
  totalKm: number;
  totalMinutes: number;
  roadPoints: { lat: number; lng: number }[];
  legs: RouteLegInfo[];
  source: 'osrm' | 'straight-line';
}

/**
 * Consulta el trazado real por carretera (calzadas vehiculares de Colombia)
 * siguiendo todas las curvas, salidas, avenidas y autopistas.
 */
export async function fetchRoadRoute(coords: GeoCoord[]): Promise<RoadRouteResult> {
  if (coords.length < 2) {
    return {
      success: true,
      totalKm: 0,
      totalMinutes: 0,
      roadPoints: coords.map(c => ({ lat: c.lat, lng: c.lng })),
      legs: [],
      source: 'straight-line'
    };
  }

  try {
    // Formato OSRM: lng,lat;lng,lat...
    const coordsStr = coords.map(c => `${c.lng.toFixed(6)},${c.lat.toFixed(6)}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson&steps=true`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Routing status: ${res.status}`);
    }

    const data = await res.json();
    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const roadPoints = (route.geometry.coordinates as [number, number][]).map(([lng, lat]) => ({
        lat,
        lng
      }));

      const legs: RouteLegInfo[] = (route.legs || []).map((leg: any, idx: number) => ({
        index: idx + 1,
        fromName: coords[idx]?.name || `Parada #${idx}`,
        toName: coords[idx + 1]?.name || `Parada #${idx + 1}`,
        distanceKm: Math.round((leg.distance / 1000) * 10) / 10,
        durationMinutes: Math.round(leg.duration / 60),
        stepsCount: leg.steps?.length || 0
      }));

      return {
        success: true,
        totalKm: Math.round((route.distance / 1000) * 10) / 10,
        totalMinutes: Math.round(route.duration / 60),
        roadPoints,
        legs,
        source: 'osrm'
      };
    }
  } catch (err) {
    console.warn('Road routing fetch warning, fallback:', err);
  }

  // Fallback si la red no responde
  return {
    success: false,
    totalKm: 0,
    totalMinutes: 0,
    roadPoints: coords.map(c => ({ lat: c.lat, lng: c.lng })),
    legs: [],
    source: 'straight-line'
  };
}
