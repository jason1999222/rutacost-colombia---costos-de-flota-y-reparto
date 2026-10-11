/**
 * Directorio Oficial Maestro de Locales Hogar y Moda & CEDI Caldas
 * Fuente: Hoja "POS LOCALES" de RUTAS_CON_RELACION_BASE_DE_DATOS.xlsx
 * y DIRECTORIO_EXTENDIDO_LOCALES_HOGAR_Y_MODA.xlsx
 *
 * El Portal Industrial del Sur es exactamente el mismo CEDI Caldas (Cra 47 #100 Sur - 40,
 * Complejo Industrial del Sur / Parcelación Monte Azul, Caldas - Antioquia).
 */

export interface HogarYModaStore {
  id: string; // Código oficial (ej: L-001)
  name: string; // Nombre del local (ej: Hogar y Moda Supía)
  municipality: string; // Municipio y departamento
  lat: number; // Latitud GPS exacta
  lng: number; // Longitud GPS exacta
  dischargeMinutes: number; // Tiempo de descargue o cargue en minutos
  isOriginWarehouse?: boolean;
  address?: string; // Dirección física o referencia exacta
  phone?: string; // Teléfono de contacto del local
  contactPerson?: string; // Administrador o contacto
  notes?: string; // Observaciones de acceso vehicular
  updatedAt?: string;
}

export const CEDI_CALDAS_PORTAL_DEL_SUR: HogarYModaStore = {
  id: "L-000",
  name: "CEDI Caldas - Portal Industrial del Sur (Hogar y Moda Bodega Principal)",
  municipality: "Caldas, Antioquia (Cra 47 #100 Sur - 40, Portal Industrial del Sur)",
  lat: 6.11888,
  lng: -75.62755,
  dischargeMinutes: 120,
  isOriginWarehouse: true
};

export const HOGAR_Y_MODA_STORES: HogarYModaStore[] = [
  {
    id: "L-000",
    name: "CEDI Caldas - Portal Industrial del Sur (Hogar y Moda Bodega Principal)",
    municipality: "Caldas, Antioquia (Cra 47 #100 Sur - 40, Portal Industrial del Sur)",
    lat: 6.11888,
    lng: -75.62755,
    dischargeMinutes: 120,
    isOriginWarehouse: true
  },
  {
    id: "L-001",
    name: "Hogar y Moda Supía",
    municipality: "Supía, Caldas",
    lat: 5.4528,
    lng: -75.6514,
    dischargeMinutes: 45,
    isOriginWarehouse: false
  },
  {
    id: "L-002",
    name: "Hogar y Moda Riosucio",
    municipality: "Riosucio, Caldas",
    lat: 5.4217,
    lng: -75.7039,
    dischargeMinutes: 45,
    isOriginWarehouse: false
  },
  {
    id: "L-003",
    name: "Hogar y Moda Anserma",
    municipality: "Anserma, Caldas",
    lat: 5.2344,
    lng: -75.7867,
    dischargeMinutes: 45,
    isOriginWarehouse: false
  },
  {
    id: "L-004",
    name: "Hogar y Moda Viterbo",
    municipality: "Viterbo, Caldas",
    lat: 5.0617,
    lng: -75.8756,
    dischargeMinutes: 45,
    isOriginWarehouse: false
  },
  {
    id: "L-005",
    name: "Hogar y Moda La Virginia",
    municipality: "La Virginia, Risaralda",
    lat: 4.8997,
    lng: -75.8828,
    dischargeMinutes: 45,
    isOriginWarehouse: false
  },
  {
    id: "L-006",
    name: "Hogar y Moda Cartago",
    municipality: "Cartago, Valle del Cauca",
    lat: 4.7464,
    lng: -75.9117,
    dischargeMinutes: 60,
    isOriginWarehouse: false
  },
  {
    id: "L-007",
    name: "Hogar y Moda Chinchiná",
    municipality: "Chinchiná, Caldas",
    lat: 4.9831,
    lng: -75.6042,
    dischargeMinutes: 45,
    isOriginWarehouse: false
  },
  {
    id: "L-008",
    name: "Hogar y Moda Palestina",
    municipality: "Palestina, Caldas",
    lat: 5.0167,
    lng: -75.6167,
    dischargeMinutes: 30,
    isOriginWarehouse: false
  },
  {
    id: "L-009",
    name: "Hogar y Moda Amagá",
    municipality: "Amagá, Antioquia",
    lat: 6.0403,
    lng: -75.7042,
    dischargeMinutes: 45,
    isOriginWarehouse: false
  },
  {
    id: "L-010",
    name: "Hogar y Moda Fredonia",
    municipality: "Fredonia, Antioquia",
    lat: 5.9264,
    lng: -75.6733,
    dischargeMinutes: 45,
    isOriginWarehouse: false
  },
  {
    id: "L-011",
    name: "Hogar y Moda Ciudad Bolívar",
    municipality: "Ciudad Bolívar, Antioquia",
    lat: 5.8572,
    lng: -75.9214,
    dischargeMinutes: 45,
    isOriginWarehouse: false
  },
  {
    id: "L-012",
    name: "Hogar y Moda Andes",
    municipality: "Andes, Antioquia",
    lat: 5.6567,
    lng: -75.8797,
    dischargeMinutes: 60,
    isOriginWarehouse: false
  },
  {
    id: "L-013",
    name: "Hogar y Moda Jardín",
    municipality: "Jardín, Antioquia",
    lat: 5.5992,
    lng: -75.8197,
    dischargeMinutes: 45,
    isOriginWarehouse: false
  },
  {
    id: "L-014",
    name: "Hogar y Moda Betania",
    municipality: "Betania, Antioquia",
    lat: 5.7486,
    lng: -75.9758,
    dischargeMinutes: 30,
    isOriginWarehouse: false
  },
  {
    id: "L-015",
    name: "Hogar y Moda Támesis",
    municipality: "Támesis, Antioquia",
    lat: 5.6644,
    lng: -75.7144,
    dischargeMinutes: 45,
    isOriginWarehouse: false
  },
  {
    id: "L-016",
    name: "Hogar y Moda Santa Bárbara",
    municipality: "Santa Bárbara, Antioquia",
    lat: 5.8744,
    lng: -75.5683,
    dischargeMinutes: 45,
    isOriginWarehouse: false
  },
  {
    id: "L-017",
    name: "Hogar y Moda Urrao",
    municipality: "Urrao, Antioquia",
    lat: 6.3164,
    lng: -76.1339,
    dischargeMinutes: 60,
    isOriginWarehouse: false
  },
  {
    id: "L-018",
    name: "Hogar y Moda Montería",
    municipality: "Montería, Córdoba",
    lat: 8.7578,
    lng: -75.8814,
    dischargeMinutes: 90,
    isOriginWarehouse: false
  },
  {
    id: "L-019",
    name: "Hogar y Moda Yarumal",
    municipality: "Yarumal, Antioquia",
    lat: 6.9631,
    lng: -75.4172,
    dischargeMinutes: 60,
    isOriginWarehouse: false
  },
  {
    id: "L-020",
    name: "Hogar y Moda Donmatías",
    municipality: "Donmatías, Antioquia",
    lat: 6.5331,
    lng: -75.4139,
    dischargeMinutes: 45,
    isOriginWarehouse: false
  },
  {
    id: "L-021",
    name: "Hogar y Moda Santa Rosa de Osos",
    municipality: "Santa Rosa de Osos, Antioquia",
    lat: 6.6472,
    lng: -75.4608,
    dischargeMinutes: 45,
    isOriginWarehouse: false
  },
  {
    id: "L-022",
    name: "Hogar y Moda San Pedro",
    municipality: "San Pedro de los Milagros, Antioquia",
    lat: 6.4608,
    lng: -75.5622,
    dischargeMinutes: 45,
    isOriginWarehouse: false
  },
  {
    id: "L-023",
    name: "Hogar y Moda Barbosa",
    municipality: "Barbosa, Antioquia",
    lat: 6.4386,
    lng: -75.3314,
    dischargeMinutes: 60,
    isOriginWarehouse: false
  },
  {
    id: "L-024",
    name: "Hogar y Moda Copacabana",
    municipality: "Copacabana, Antioquia",
    lat: 6.3475,
    lng: -75.5089,
    dischargeMinutes: 45,
    isOriginWarehouse: false
  },
  {
    id: "L-025",
    name: "Hogar y Moda Girardota",
    municipality: "Girardota, Antioquia",
    lat: 6.3772,
    lng: -75.4464,
    dischargeMinutes: 45,
    isOriginWarehouse: false
  },
  {
    id: "L-026",
    name: "Hogar y Moda Cisneros",
    municipality: "Cisneros, Antioquia",
    lat: 6.5381,
    lng: -75.0886,
    dischargeMinutes: 45,
    isOriginWarehouse: false
  },
  {
    id: "L-027",
    name: "Hogar y Moda Bello",
    municipality: "Bello, Antioquia",
    lat: 6.3373,
    lng: -75.5579,
    dischargeMinutes: 90,
    isOriginWarehouse: false
  },
  {
    id: "L-028",
    name: "Hogar y Moda Itagüí",
    municipality: "Itagüí, Antioquia",
    lat: 6.1722,
    lng: -75.6097,
    dischargeMinutes: 60,
    isOriginWarehouse: false
  },
  {
    id: "L-029",
    name: "Hogar y Moda Sonsón",
    municipality: "Sonsón, Antioquia",
    lat: 5.7119,
    lng: -75.3106,
    dischargeMinutes: 45,
    isOriginWarehouse: false
  },
  {
    id: "L-030",
    name: "Hogar y Moda La Unión",
    municipality: "La Unión, Antioquia",
    lat: 5.9739,
    lng: -75.3622,
    dischargeMinutes: 45,
    isOriginWarehouse: false
  },
  {
    id: "L-031",
    name: "Hogar y Moda La Ceja",
    municipality: "La Ceja, Antioquia",
    lat: 6.0306,
    lng: -75.4286,
    dischargeMinutes: 60,
    isOriginWarehouse: false
  },
  {
    id: "L-032",
    name: "Hogar y Moda Guarne",
    municipality: "Guarne, Antioquia",
    lat: 6.2797,
    lng: -75.4439,
    dischargeMinutes: 60,
    isOriginWarehouse: false
  },
  {
    id: "L-033",
    name: "Hogar y Moda San Vicente",
    municipality: "San Vicente Ferrer, Antioquia",
    lat: 6.2828,
    lng: -75.3331,
    dischargeMinutes: 45,
    isOriginWarehouse: false
  },
  {
    id: "L-034",
    name: "Hogar y Moda El Carmen",
    municipality: "El Carmen de Viboral, Antioquia",
    lat: 6.0847,
    lng: -75.4344,
    dischargeMinutes: 45,
    isOriginWarehouse: false
  },
  {
    id: "L-035",
    name: "Hogar y Moda Rionegro",
    municipality: "Rionegro, Antioquia",
    lat: 6.1553,
    lng: -75.3742,
    dischargeMinutes: 90,
    isOriginWarehouse: false
  },
  {
    id: "L-036",
    name: "Hogar y Moda El Peñol",
    municipality: "El Peñol, Antioquia",
    lat: 6.2208,
    lng: -75.2417,
    dischargeMinutes: 45,
    isOriginWarehouse: false
  },
  {
    id: "L-037",
    name: "Hogar y Moda Marinilla",
    municipality: "Marinilla, Antioquia",
    lat: 6.1764,
    lng: -75.3364,
    dischargeMinutes: 60,
    isOriginWarehouse: false
  },
  {
    id: "L-038",
    name: "Hogar y Moda El Santuario",
    municipality: "El Santuario, Antioquia",
    lat: 6.1361,
    lng: -75.2639,
    dischargeMinutes: 45,
    isOriginWarehouse: false
  },
  {
    id: "L-039",
    name: "Hogar y Moda Apartadó",
    municipality: "Apartadó, Antioquia",
    lat: 7.8828,
    lng: -76.6258,
    dischargeMinutes: 90,
    isOriginWarehouse: false
  },
  {
    id: "L-040",
    name: "Hogar y Moda Carepa",
    municipality: "Carepa, Antioquia",
    lat: 7.7558,
    lng: -76.6578,
    dischargeMinutes: 60,
    isOriginWarehouse: false
  },
  {
    id: "L-041",
    name: "Hogar y Moda Chigorodó",
    municipality: "Chigorodó, Antioquia",
    lat: 7.6697,
    lng: -76.6789,
    dischargeMinutes: 45,
    isOriginWarehouse: false
  },
  {
    id: "L-042",
    name: "Hogar y Moda Turbo",
    municipality: "Turbo, Antioquia",
    lat: 8.0931,
    lng: -76.7289,
    dischargeMinutes: 60,
    isOriginWarehouse: false
  },
  {
    id: "L-043",
    name: "Hogar y Moda Currulao",
    municipality: "Currulao, Turbo",
    lat: 8.0017,
    lng: -76.6908,
    dischargeMinutes: 45,
    isOriginWarehouse: false
  },
  {
    id: "L-044",
    name: "Hogar y Moda Necoclí",
    municipality: "Necoclí, Antioquia",
    lat: 8.4239,
    lng: -76.7869,
    dischargeMinutes: 45,
    isOriginWarehouse: false
  },
  {
    id: "L-045",
    name: "Hogar y Moda Barrancabermeja",
    municipality: "Barrancabermeja, Santander",
    lat: 7.0653,
    lng: -73.8547,
    dischargeMinutes: 90,
    isOriginWarehouse: false
  },
  {
    id: "L-046",
    name: "Hogar y Moda Cimitarra",
    municipality: "Cimitarra, Santander",
    lat: 6.3156,
    lng: -74.0531,
    dischargeMinutes: 45,
    isOriginWarehouse: false
  },
  {
    id: "L-047",
    name: "Hogar y Moda Puerto Berrío",
    municipality: "Puerto Berrío, Antioquia",
    lat: 6.4914,
    lng: -74.4047,
    dischargeMinutes: 60,
    isOriginWarehouse: false
  },
  {
    id: "L-048",
    name: "Hogar y Moda Piedecuesta",
    municipality: "Piedecuesta, Santander",
    lat: 6.9886,
    lng: -73.0497,
    dischargeMinutes: 60,
    isOriginWarehouse: false
  },
  {
    id: "L-049",
    name: "Hogar y Moda San Alberto",
    municipality: "San Alberto, Cesar",
    lat: 7.7589,
    lng: -73.3917,
    dischargeMinutes: 45,
    isOriginWarehouse: false
  },
  {
    id: "L-050",
    name: "Hogar y Moda Puerto Boyacá",
    municipality: "Puerto Boyacá, Boyacá",
    lat: 5.9758,
    lng: -74.5878,
    dischargeMinutes: 60,
    isOriginWarehouse: false
  },
  {
    id: "L-051",
    name: "Hogar y Moda Medellín (Varios)",
    municipality: "Medellín, Antioquia (Varios Locales)",
    lat: 6.2442,
    lng: -75.5812,
    dischargeMinutes: 90,
    isOriginWarehouse: false
  },
];

export const STORES_STORAGE_KEY = 'rutacost_custom_stores';

let _memoryStoresCache: HogarYModaStore[] | null = null;

/**
 * Retorna las tiendas personalizadas guardadas o las 52 tiendas por defecto
 */
export function getCustomStores(): HogarYModaStore[] {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return _memoryStoresCache || HOGAR_Y_MODA_STORES;
  }
  try {
    const raw = localStorage.getItem(STORES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {}
  return _memoryStoresCache || HOGAR_Y_MODA_STORES;
}

export function saveCustomStores(stores: HogarYModaStore[]) {
  _memoryStoresCache = stores;
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(stores));
    } catch (e) {}
  }
}

export function resetCustomStores(): HogarYModaStore[] {
  _memoryStoresCache = null;
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(STORES_STORAGE_KEY);
    } catch (e) {}
  }
  return HOGAR_Y_MODA_STORES;
}

export function getCustomStoresMap(): Record<string, HogarYModaStore> {
  const stores = getCustomStores();
  return stores.reduce((acc, store) => {
    acc[store.id] = store;
    return acc;
  }, {} as Record<string, HogarYModaStore>);
}

/**
 * Actualiza las coordenadas GPS (latitud y longitud) y datos de una tienda
 */
export function updateStoreCoordinates(
  storeId: string,
  lat: number,
  lng: number,
  additional?: Partial<HogarYModaStore>
): HogarYModaStore[] {
  const current = getCustomStores();
  const updated = current.map(s => {
    if (s.id === storeId) {
      return {
        ...s,
        lat: Number(lat),
        lng: Number(lng),
        updatedAt: new Date().toISOString(),
        ...(additional || {})
      };
    }
    return s;
  });
  saveCustomStores(updated);
  return updated;
}

/**
 * Agrega o registra una nueva tienda en el directorio
 */
export function addCustomStore(store: HogarYModaStore): HogarYModaStore[] {
  const current = getCustomStores();
  const exists = current.some(s => s.id === store.id);
  const updated = exists
    ? current.map(s => s.id === store.id ? { ...store, updatedAt: new Date().toISOString() } : s)
    : [...current, { ...store, updatedAt: new Date().toISOString() }];
  saveCustomStores(updated);
  return updated;
}

/**
 * Elimina una tienda del directorio
 */
export function removeCustomStore(storeId: string): HogarYModaStore[] {
  const current = getCustomStores();
  const updated = current.filter(s => s.id !== storeId);
  saveCustomStores(updated);
  return updated;
}

export const HOGAR_Y_MODA_STORES_MAP: Record<string, HogarYModaStore> = HOGAR_Y_MODA_STORES.reduce(
  (acc, store) => {
    acc[store.id] = store;
    return acc;
  },
  {} as Record<string, HogarYModaStore>
);

/**
 * Retorna los locales correspondientes a una lista de IDs utilizando el directorio dinámico vigente
 */
export function getStoresByIds(storeIds: string[]): HogarYModaStore[] {
  const currentMap = getCustomStoresMap();
  return storeIds
    .map(id => currentMap[id.trim()] || HOGAR_Y_MODA_STORES_MAP[id.trim()])
    .filter((store): store is HogarYModaStore => Boolean(store));
}

/**
 * Calcula el tiempo total de cargue inicial en CEDI + descargue en cada local visitado
 */
export function calculateTotalLoadingMinutes(storeIds: string[]): number {
  const stores = getStoresByIds(storeIds);
  if (stores.length === 0) return 120;

  // 120 min de cargue inicial en CEDI Caldas / Portal Industrial del Sur
  // + suma del tiempo de descargue de cada local entregado
  let total = 0;
  let hasOrigin = false;

  stores.forEach(s => {
    if (s.isOriginWarehouse) {
      hasOrigin = true;
      total += s.dischargeMinutes; // 120 min
    } else {
      total += s.dischargeMinutes; // 30, 45, 60 o 90 min
    }
  });

  if (!hasOrigin) {
    total += 120; // Cargue inicial en CEDI Caldas
  }

  return total;
}
