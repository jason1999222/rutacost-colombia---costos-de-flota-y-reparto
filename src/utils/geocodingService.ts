import { COLOMBIA_LOCATIONS } from '../data/colombiaCoordinates';

export interface GeocodedLocation {
  name: string;
  displayAddress: string;
  lat: number;
  lng: number;
  source: 'coords' | 'catalog' | 'geocoder';
}

/**
 * Busca una dirección, nombre de municipio, punto de interés o analiza coordenadas Latitud/Longitud.
 */
export async function searchAddressOrCoords(query: string): Promise<GeocodedLocation[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  // 1. Verificar si el usuario ingresó coordenadas numéricas directas: ej. "6.1759, -75.5917" o "6.1759 -75.5917"
  const coordsRegex = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)[,\s]+[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
  if (coordsRegex.test(trimmed)) {
    const parts = trimmed.split(/[,\s]+/).map(p => parseFloat(p.trim())).filter(n => !isNaN(n));
    if (parts.length >= 2) {
      const lat = parts[0];
      const lng = parts[1];
      return [{
        name: `Punto GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        displayAddress: `Coordenadas directas: Lat ${lat.toFixed(5)}, Lng ${lng.toFixed(5)}`,
        lat,
        lng,
        source: 'coords'
      }];
    }
  }

  const results: GeocodedLocation[] = [];
  const normalizedQuery = trimmed.toUpperCase();

  // 2. Búsqueda en el catálogo local de Hogar y Moda y Municipios de Colombia
  for (const [key, loc] of Object.entries(COLOMBIA_LOCATIONS)) {
    if (key.includes(normalizedQuery) || loc.name.toUpperCase().includes(normalizedQuery)) {
      results.push({
        name: loc.name,
        displayAddress: `${loc.name} (Catálogo Hogar y Moda)`,
        lat: loc.lat,
        lng: loc.lng,
        source: 'catalog'
      });
      if (results.length >= 4) break;
    }
  }

  // 3. Geocodificación en línea con Nominatim (Restringido a Colombia)
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed)}&countrycodes=co&addressdetails=1&limit=5`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'es-CO,es;q=0.9',
        'User-Agent': 'RutaCostColombia/1.0'
      }
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        for (const item of data) {
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);
          if (!isNaN(lat) && !isNaN(lng)) {
            // Evitar duplicados con los ya encontrados
            const alreadyExists = results.some(r => Math.abs(r.lat - lat) < 0.001 && Math.abs(r.lng - lng) < 0.001);
            if (!alreadyExists) {
              const nameParts = (item.display_name || '').split(',');
              const shortName = nameParts.slice(0, 2).join(',').trim();
              results.push({
                name: shortName || item.name || trimmed,
                displayAddress: item.display_name,
                lat,
                lng,
                source: 'geocoder'
              });
            }
          }
        }
      }
    }
  } catch (e) {
    // Si falla la red o timeout, retornamos lo que tengamos del catálogo
  }

  return results;
}
