export interface TollStation {
  id: string;
  name: string;
  corridor: string;
  lat: number;
  lng: number;
  tariffCOP: number; // Tarifa estándar Categoría I
  tariffNprCOP: number; // Tarifa NPR 2 Ejes 2026
  tariffNlrCOP: number; // Tarifa NLR Camioneta 2026
  tariffHeavyMaxCOP: number; // Carga pesada máx (Cat VII)
  department: string;
  municipality?: string;
}

/**
 * Catálogo Oficial de Estaciones de Peaje y Tarifas 2026
 * Fuente: Hoja "tarifa pejaes 2026" de SCJ PRESUPUESTO REALIZAR.xlsx
 * Tarifas oficiales publicadas vigentes en Colombia para Categoría I, NPR (2 ejes), NLR y Pesada.
 */
export const KNOWN_TOLLS: TollStation[] = [
  {
    id: "TOLL-AMAGA",
    name: "Peaje Amagá",
    corridor: "Pacífico 1 (Caldas - Amagá - Sinifaná)",
    lat: 6.046938, // Plus Code 67R628WR+Q2 - PR 89+396 Ruta Nacional 6003 Covipacífico
    lng: -75.659938,
    tariffCOP: 25900,
    tariffNprCOP: 31200,
    tariffNlrCOP: 25900,
    tariffHeavyMaxCOP: 105000,
    department: "Antioquia",
    municipality: "Amagá"
  },
  {
    id: "TOLL-LA-PINTADA",
    name: "Peaje La Pintada",
    corridor: "Pacífico 2 (La Pintada - Puente Iglesias)",
    lat: 5.812188, // Plus Code 67Q6R86C+V8 (R86C+V8 Jericó, Antioquia) - Ruta 25B Puente Iglesias a San Antonio
    lng: -75.679188,
    tariffCOP: 23900,
    tariffNprCOP: 28600,
    tariffNlrCOP: 23900,
    tariffHeavyMaxCOP: 96300,
    department: "Antioquia",
    municipality: "Jericó / La Pintada"
  },
  {
    id: "TOLL-SUPIA",
    name: "Peaje Supía",
    corridor: "Pacífico 3 (La Felisa - Supía)",
    lat: 5.391590, // PR 64+0200 Ruta 2508 - Sector La Felisa / Supía (Ubicación original oficial de Google Maps)
    lng: -75.599990,
    tariffCOP: 17500,
    tariffNprCOP: 21800,
    tariffNlrCOP: 17500,
    tariffHeavyMaxCOP: 74700,
    department: "Caldas",
    municipality: "Supía / La Felisa"
  },
  {
    id: "TOLL-GUAICO",
    name: "Peaje Guaico",
    corridor: "Pacífico 3 (Túnel Tesalia / Viterbo)",
    lat: 5.201679, // Portal occidental Túnel de Tesalia - Vereda El Cairo
    lng: -75.838093,
    tariffCOP: 25300,
    tariffNprCOP: 31500,
    tariffNlrCOP: 25300,
    tariffHeavyMaxCOP: 107600,
    department: "Caldas / Risaralda",
    municipality: "Risaralda / San José"
  },
  {
    id: "TOLL-IRRA",
    name: "Peaje Irra",
    corridor: "Pacífico 3 (La Felisa - Tres Puertas / Irra)",
    lat: 5.262738, // Sector Irra - Concesión Pacífico Tres
    lng: -75.658125,
    tariffCOP: 17600,
    tariffNprCOP: 21700,
    tariffNlrCOP: 17600,
    tariffHeavyMaxCOP: 74600,
    department: "Caldas / Risaralda",
    municipality: "Neira / Quinchía"
  },
  {
    id: "TOLL-PRIMAVERA",
    name: "Peaje Primavera",
    corridor: "Troncal del Café / Pacífico 1 (Caldas - Santa Bárbara)",
    lat: 5.968880, // Plus Code 67Q6XC94+H9 - km 38+830 Santa Bárbara
    lng: -75.594050,
    tariffCOP: 12600,
    tariffNprCOP: 29200,
    tariffNlrCOP: 12600,
    tariffHeavyMaxCOP: 41800,
    department: "Antioquia",
    municipality: "Santa Bárbara"
  },
  {
    id: "TOLL-ABURRA",
    name: "Peaje Aburrá",
    corridor: "Vía al Mar / Conexión Túnel de Occidente",
    lat: 6.310600, // Portal Medellín San Cristóbal Túnel de Occidente Devimar
    lng: -75.670300,
    tariffCOP: 27300,
    tariffNprCOP: 20400,
    tariffNlrCOP: 27300,
    tariffHeavyMaxCOP: 108200,
    department: "Antioquia",
    municipality: "Medellín (San Cristóbal)"
  },
  {
    id: "TOLL-TRAPICHE",
    name: "Peaje Trapiche",
    corridor: "Vías del Nus (Niquía - Girardota - Barbosa)",
    lat: 6.399540, // Plus Code 67R69HX8+RR - Autopista Norte km 23 Girardota
    lng: -75.432920,
    tariffCOP: 20300,
    tariffNprCOP: 24400,
    tariffNlrCOP: 20300,
    tariffHeavyMaxCOP: 86500,
    department: "Antioquia",
    municipality: "Girardota"
  },
  {
    id: "TOLL-PANDEQUESO",
    name: "Peaje Pandequeso",
    corridor: "Troncal del Norte (Donmatías - Santa Rosa de Osos)",
    lat: 6.527610, // Sector Ríogrande - Donmatías (Vías del Nus)
    lng: -75.395860,
    tariffCOP: 17700,
    tariffNprCOP: 21200,
    tariffNlrCOP: 17700,
    tariffHeavyMaxCOP: 60300,
    department: "Antioquia",
    municipality: "Donmatías"
  },
  {
    id: "TOLL-CISNEROS",
    name: "Peaje Cisneros",
    corridor: "Vías del Nus (Barbosa - Cisneros - Túnel La Quiebra)",
    lat: 6.536110, // 6°32'10"N 75°4'29"W - Vías del Nus Cisneros
    lng: -75.074720,
    tariffCOP: 29400,
    tariffNprCOP: 35500,
    tariffNlrCOP: 29400,
    tariffHeavyMaxCOP: 123700,
    department: "Antioquia",
    municipality: "Cisneros"
  },
  {
    id: "TOLL-PAJARITO",
    name: "Peaje Pajarito",
    corridor: "Vía San Cristóbal - San Pedro de los Milagros",
    lat: 6.331740, // km 6 vía San Cristóbal - San Pedro
    lng: -75.599410,
    tariffCOP: 12900,
    tariffNprCOP: 17700,
    tariffNlrCOP: 12900,
    tariffHeavyMaxCOP: 46700,
    department: "Antioquia",
    municipality: "San Pedro de los Milagros"
  },
  {
    id: "TOLL-COPACABANA",
    name: "Peaje Copacabana",
    corridor: "Autopista Medellín - Bogotá / Oriente",
    lat: 6.328170, // Plus Code 67R68FHM+7R - Autopista Medellín - Bogotá PR 15 Copacabana
    lng: -75.515450,
    tariffCOP: 18600,
    tariffNprCOP: 25700,
    tariffNlrCOP: 18600,
    tariffHeavyMaxCOP: 90500,
    department: "Antioquia",
    municipality: "Copacabana"
  },
  {
    id: "TOLL-PALMAS",
    name: "Peaje Las Palmas",
    corridor: "Variante Las Palmas (Medellín - El Retiro / La Ceja)",
    lat: 6.170750, // Plus Code 67R65GCC+8C - Variante Las Palmas Envigado
    lng: -75.478930,
    tariffCOP: 13600,
    tariffNprCOP: 16200,
    tariffNlrCOP: 13600,
    tariffHeavyMaxCOP: 53700,
    department: "Antioquia",
    municipality: "Envigado"
  },
  {
    id: "TOLL-TUNEL-ORIENTE",
    name: "Peaje Túnel de Oriente (Seminario)",
    corridor: "Conexión Aburrá - Oriente (Medellín - Aeropuerto JMC / Rionegro)",
    lat: 6.216200, // Sector Baltimore / Seminario - Túnel de Oriente
    lng: -75.518600,
    tariffCOP: 24800,
    tariffNprCOP: 29500,
    tariffNlrCOP: 24800,
    tariffHeavyMaxCOP: 98000,
    department: "Antioquia",
    municipality: "Medellín / Rionegro"
  },
  {
    id: "TOLL-FUEMIA",
    name: "Peaje Fuemia",
    corridor: "Autopistas al Mar 2 (Cañasgordas - Uramita - Dabeiba)",
    lat: 6.953470, // Plus Code 67R5XQ35+92 - PR 10+400 Ruta 6203 Dabeiba
    lng: -76.242500,
    tariffCOP: 25300,
    tariffNprCOP: 31400,
    tariffNlrCOP: 25300,
    tariffHeavyMaxCOP: 104500,
    department: "Antioquia (Urabá)",
    municipality: "Dabeiba"
  },
  {
    id: "TOLL-MUTATA",
    name: "Peaje Mutatá",
    corridor: "Autopistas de Urabá (Dabeiba - Mutatá - Chigorodó)",
    lat: 7.222950, // Plus Code 67V56HF8+5M - PR 60+800 Ruta 6202 Mutatá
    lng: -76.433350,
    tariffCOP: 17400,
    tariffNprCOP: 21500,
    tariffNlrCOP: 17400,
    tariffHeavyMaxCOP: 72000,
    department: "Antioquia (Urabá)",
    municipality: "Mutatá"
  },
  {
    id: "TOLL-CIRILO",
    name: "Peaje Cirilo",
    corridor: "Transversal de las Américas (Turbo - Currulao - Necoclí)",
    lat: 8.212870, // Plus Code 67W56774+45 - Vía Turbo hacia Necoclí
    lng: -76.744620,
    tariffCOP: 14800,
    tariffNprCOP: 18200,
    tariffNlrCOP: 14800,
    tariffHeavyMaxCOP: 62000,
    department: "Antioquia (Urabá)",
    municipality: "Turbo"
  },
  {
    id: "TOLL-PUERTO-BERRIO",
    name: "Peaje Puerto Berrío",
    corridor: "Autopista Río Magdalena 2 (Cisneros - Puerto Berrío)",
    lat: 6.496670, // Plus Code 67R7FFWX+MF - PR 84+470 Ruta Nacional 6206
    lng: -74.501340,
    tariffCOP: 16500,
    tariffNprCOP: 20800,
    tariffNlrCOP: 16500,
    tariffHeavyMaxCOP: 71000,
    department: "Antioquia / Santander",
    municipality: "Puerto Berrío"
  },
  {
    id: "TOLL-ZAMBITO",
    name: "Peaje Zambito",
    corridor: "Troncal del Magdalena Medio (Puerto Boyacá - Cimitarra)",
    lat: 6.294760, // PR 9+200 Ruta 4511 Cimitarra
    lng: -74.456000,
    tariffCOP: 15200,
    tariffNprCOP: 19400,
    tariffNlrCOP: 15200,
    tariffHeavyMaxCOP: 66000,
    department: "Santander",
    municipality: "Cimitarra"
  },
  {
    id: "TOLL-LA-GOMEZ",
    name: "Peaje La Gómez",
    corridor: "Troncal del Magdalena (Barrancabermeja - San Alberto)",
    lat: 7.397180, // Plus Code 67V89FW3+V9 - Sabana de Torres
    lng: -73.546540,
    tariffCOP: 16000,
    tariffNprCOP: 20500,
    tariffNlrCOP: 16000,
    tariffHeavyMaxCOP: 69000,
    department: "Santander",
    municipality: "Sabana de Torres"
  },
  {
    id: "TOLL-LOS-LLANOS",
    name: "Peaje Los Llanos de Cuivá",
    corridor: "Troncal de Occidente (Santa Rosa de Osos - Yarumal)",
    lat: 6.830420, // Plus Code 67R6RGJJ+5P - Llanos de Cuivá
    lng: -75.468220,
    tariffCOP: 14200,
    tariffNprCOP: 18100,
    tariffNlrCOP: 14200,
    tariffHeavyMaxCOP: 59000,
    department: "Antioquia (Norte)",
    municipality: "Yarumal / Angostura"
  },
  {
    id: "TOLL-TARAZA",
    name: "Peaje Tarazá",
    corridor: "Troncal hacia la Costa (Valdivia - Caucasia)",
    lat: 7.589250, // Plus Code 67V6HJQ4+MH - Tarazá Bajo Cauca
    lng: -75.393610,
    tariffCOP: 15500,
    tariffNprCOP: 19800,
    tariffNlrCOP: 15500,
    tariffHeavyMaxCOP: 64000,
    department: "Antioquia (Bajo Cauca)",
    municipality: "Tarazá"
  },
  {
    id: "TOLL-SAN-CARLOS",
    name: "Peaje San Carlos",
    corridor: "Ruta 25 (Caucasia - Planeta Rica - Montería)",
    lat: 8.710030, // Plus Code 67W6P76M+29 - km 10 San Carlos Córdoba
    lng: -75.716590,
    tariffCOP: 15000,
    tariffNprCOP: 19200,
    tariffNlrCOP: 15000,
    tariffHeavyMaxCOP: 61000,
    department: "Córdoba",
    municipality: "San Carlos"
  }
];

function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Radio de la Tierra en metros
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface DetectedTollsResult {
  detectedTolls: TollStation[];
  tollCount: number;
  totalTollCost: number;
  totalTollCostNpr: number;
  totalTollCostNlr: number;
  totalTollCostCat1: number;
}

export const TOLLS_STORAGE_KEY = 'scj_custom_tolls';

/**
 * Obtiene la lista activa de estaciones de peaje (desde localStorage o catálogo KNOWN_TOLLS)
 */
export function getCustomTollStations(): TollStation[] {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = localStorage.getItem(TOLLS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Error cargando peajes personalizados:', e);
      }
    }
  }
  return KNOWN_TOLLS;
}

/**
 * Guarda y propaga la lista de estaciones de peaje en localStorage
 */
export function saveCustomTollStations(tolls: TollStation[]): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(TOLLS_STORAGE_KEY, JSON.stringify(tolls));
    window.dispatchEvent(new CustomEvent('scj_tolls_updated', { detail: tolls }));
  }
}

/**
 * Restablece las tarifas oficiales de peajes 2026
 */
export function resetCustomTollStations(): TollStation[] {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(TOLLS_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('scj_tolls_updated', { detail: KNOWN_TOLLS }));
  }
  return KNOWN_TOLLS;
}

/**
 * Actualiza tarifas de un peaje específico por ID
 */
export function updateTollStationTariffs(
  tollId: string,
  tariffs: { tariffCOP?: number; tariffNprCOP?: number; tariffNlrCOP?: number; tariffHeavyMaxCOP?: number }
): TollStation[] {
  const current = getCustomTollStations();
  const updated = current.map(t => {
    if (t.id === tollId) {
      return { ...t, ...tariffs };
    }
    return t;
  });
  saveCustomTollStations(updated);
  return updated;
}

/**
 * Detecta automáticamente si la geometría de la ruta pasa a través de estaciones de peaje conocidas.
 * Umbral de proximidad vial: 1.800 metros de la estación.
 */
export function detectTollsOnRoad(roadPoints: { lat: number; lng: number }[]): DetectedTollsResult {
  if (!roadPoints || roadPoints.length === 0) {
    return {
      detectedTolls: [],
      tollCount: 0,
      totalTollCost: 0,
      totalTollCostNpr: 0,
      totalTollCostNlr: 0,
      totalTollCostCat1: 0
    };
  }

  const detected: TollStation[] = [];
  const PROXIMITY_THRESHOLD_METERS = 1800; // 1.8 km
  const activeTolls = getCustomTollStations();

  // Muestrear puntos para acelerar cálculo si la ruta tiene miles de puntos
  const step = Math.max(1, Math.floor(roadPoints.length / 300));
  const sampledPoints = roadPoints.filter((_, i) => i % step === 0);

  for (const toll of activeTolls) {
    let isNear = false;
    for (const pt of sampledPoints) {
      const dist = calculateHaversineDistanceMeters(pt.lat, pt.lng, toll.lat, toll.lng);
      if (dist <= PROXIMITY_THRESHOLD_METERS) {
        isNear = true;
        break;
      }
    }

    if (isNear) {
      detected.push(toll);
    }
  }

  const totalTollCostNpr = detected.reduce((acc, t) => acc + (t.tariffNprCOP * 2), 0); // ida y vuelta
  const totalTollCostNlr = detected.reduce((acc, t) => acc + (t.tariffNlrCOP * 2), 0); // ida y vuelta
  const totalTollCostCat1 = detected.reduce((acc, t) => acc + (t.tariffCOP * 2), 0);

  return {
    detectedTolls: detected,
    tollCount: detected.length,
    totalTollCost: totalTollCostNpr,
    totalTollCostNpr,
    totalTollCostNlr,
    totalTollCostCat1
  };
}

/**
 * Agrega una nueva estación de peaje personalizada
 */
export function addCustomTollStation(station: TollStation): TollStation[] {
  const current = getCustomTollStations();
  const exists = current.some(t => t.id === station.id);
  const updated = exists
    ? current.map(t => t.id === station.id ? station : t)
    : [...current, station];
  saveCustomTollStations(updated);
  return updated;
}

/**
 * Elimina una estación de peaje personalizada
 */
export function removeCustomTollStation(stationId: string): TollStation[] {
  const current = getCustomTollStations();
  const updated = current.filter(t => t.id !== stationId);
  saveCustomTollStations(updated);
  return updated;
}

/**
 * Empareja un nombre o fragmento de texto con una estación de peaje conocida
 */
export function matchTollName(token: string, stations: TollStation[]): TollStation | undefined {
  if (!token || !token.trim()) return undefined;
  const cleanToken = token.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (cleanToken === 'sin peaje' || cleanToken.includes('pendiente')) return undefined;

  return stations.find(s => {
    const stationName = s.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace('peaje ', '');
    return stationName.includes(cleanToken) || cleanToken.includes(stationName) ||
      (cleanToken.includes('palmas') && stationName.includes('palmas'));
  });
}

/**
 * Recalcula el costo estimado de peajes para una ruta individual según su lista textual de tollStations
 */
export function recalculateRouteTollCosts(
  route: { tollStations?: string; tollEstimatedCost?: number; tollEstimatedCostNlr?: number },
  stations: TollStation[] = getCustomTollStations()
): { tollEstimatedCost: number; tollEstimatedCostNlr: number; matchedCount: number } {
  if (!route.tollStations || route.tollStations.includes('Sin peaje') || route.tollStations.includes('Pendiente')) {
    return {
      tollEstimatedCost: 0,
      tollEstimatedCostNlr: 0,
      matchedCount: 0
    };
  }

  const parts = route.tollStations.split(/[+,]/);
  let sumNpr = 0;
  let sumNlr = 0;
  let count = 0;

  for (const part of parts) {
    const matched = matchTollName(part, stations);
    if (matched) {
      sumNpr += matched.tariffNprCOP * 2; // Ida y regreso NPR
      sumNlr += matched.tariffNlrCOP; // Tarifa NLR según matriz SCJ
      count++;
    }
  }

  return {
    tollEstimatedCost: sumNpr,
    tollEstimatedCostNlr: sumNlr,
    matchedCount: count
  };
}

/**
 * Recalcula en lote los costos de peaje de una lista de rutas basándose en las tarifas vigentes
 */
export function recalculateAllRoutesTollCosts<T extends { tollStations?: string; tollEstimatedCost: number; tollEstimatedCostNlr?: number }>(
  routes: T[],
  stations: TollStation[] = getCustomTollStations()
): T[] {
  return routes.map(route => {
    if (!route.tollStations || route.tollStations.includes('Sin peaje') || route.tollStations.includes('Pendiente')) {
      return route;
    }
    const recalc = recalculateRouteTollCosts(route, stations);
    if (recalc.matchedCount > 0) {
      return {
        ...route,
        tollEstimatedCost: recalc.tollEstimatedCost,
        tollEstimatedCostNlr: recalc.tollEstimatedCostNlr
      };
    }
    return route;
  });
}
