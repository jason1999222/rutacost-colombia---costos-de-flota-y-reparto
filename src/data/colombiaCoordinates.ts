import { HOGAR_Y_MODA_STORES_MAP, CEDI_CALDAS_PORTAL_DEL_SUR, getCustomStoresMap, HogarYModaStore } from './hogarYModaStores';

export interface GeoCoord {
  lat: number;
  lng: number;
  name: string;
  isWarehouse?: boolean;
  storeId?: string;
  municipality?: string;
  dischargeMinutes?: number;
}

// Coordenada base de la Bodega Principal: CEDI Hogar y Moda - Portal Industrial del Sur
// Ubicación confirmada: Cra. 47 #100 Sur - 40, Complejo Industrial del Sur / Parcelación Monte Azul, Caldas - Antioquia
export const CEDI_CALDAS: GeoCoord = {
  lat: CEDI_CALDAS_PORTAL_DEL_SUR.lat,
  lng: CEDI_CALDAS_PORTAL_DEL_SUR.lng,
  name: CEDI_CALDAS_PORTAL_DEL_SUR.name,
  municipality: CEDI_CALDAS_PORTAL_DEL_SUR.municipality,
  isWarehouse: true,
  storeId: "L-000",
  dischargeMinutes: 120
};

// Coordenadas geográficas oficiales de cabeceras y municipios de las rutas
export const COLOMBIA_LOCATIONS: Record<string, GeoCoord> = {
  // Bodega Principal (CEDI Hogar y Moda - Portal Industrial del Sur es exactamente el mismo punto de origen)
  "PORTAL INDUSTRIAL DEL SUR": CEDI_CALDAS,
  "HOGAR Y MODA": CEDI_CALDAS,
  "CEDI HOGAR Y MODA": CEDI_CALDAS,
  "CEDI CALDAS": CEDI_CALDAS,
  "CEDI": CEDI_CALDAS,
  "COMPLEJO INDUSTRIAL DEL SUR": CEDI_CALDAS,
  "BODEGA": CEDI_CALDAS,
  "BODEGA PRINCIPAL": CEDI_CALDAS,
  "L-000": CEDI_CALDAS,
  "LA TABLAZA": { lat: 6.1161, lng: -75.6325, name: "La Tablaza, La Estrella", municipality: "La Estrella, Antioquia", dischargeMinutes: 30 },

  // Valle de Aburrá / Sur
  "CALDAS": { lat: 6.0911, lng: -75.6356, name: "Caldas, Antioquia", municipality: "Caldas, Antioquia", dischargeMinutes: 45 },
  "LA ESTRELLA": { lat: 6.1578, lng: -75.6431, name: "La Estrella, Antioquia", municipality: "La Estrella, Antioquia", dischargeMinutes: 45 },
  "SABANETA": { lat: 6.1517, lng: -75.6167, name: "Sabaneta, Antioquia", municipality: "Sabaneta, Antioquia", dischargeMinutes: 45 },
  "ITAGUI": { lat: 6.1722, lng: -75.6097, name: "Itagüí, Antioquia", municipality: "Itagüí, Antioquia", dischargeMinutes: 60 },
  "ENVIGADO": { lat: 6.1759, lng: -75.5917, name: "Envigado, Antioquia", municipality: "Envigado, Antioquia", dischargeMinutes: 45 },
  "MEDELLIN": { lat: 6.2442, lng: -75.5812, name: "Medellín, Antioquia", municipality: "Medellín, Antioquia", dischargeMinutes: 90 },
  "BELLO": { lat: 6.3373, lng: -75.5579, name: "Bello, Antioquia", municipality: "Bello, Antioquia", dischargeMinutes: 90 },
  "COPACABANA": { lat: 6.3475, lng: -75.5089, name: "Copacabana, Antioquia", municipality: "Copacabana, Antioquia", dischargeMinutes: 45 },
  "GIRARDOTA": { lat: 6.3772, lng: -75.4464, name: "Girardota, Antioquia", municipality: "Girardota, Antioquia", dischargeMinutes: 45 },
  "BARBOSA": { lat: 6.4386, lng: -75.3314, name: "Barbosa, Antioquia", municipality: "Barbosa, Antioquia", dischargeMinutes: 60 },

  // Eje Cafetero / Caldas / Risaralda
  "SUPIA": { lat: 5.4528, lng: -75.6514, name: "Supía, Caldas", municipality: "Supía, Caldas", dischargeMinutes: 45 },
  "RIOSUCIO": { lat: 5.4217, lng: -75.7039, name: "Riosucio, Caldas", municipality: "Riosucio, Caldas", dischargeMinutes: 45 },
  "ANSERMA": { lat: 5.2344, lng: -75.7867, name: "Anserma, Caldas", municipality: "Anserma, Caldas", dischargeMinutes: 45 },
  "VITERBO": { lat: 5.0617, lng: -75.8756, name: "Viterbo, Caldas", municipality: "Viterbo, Caldas", dischargeMinutes: 45 },
  "VIRGINIA": { lat: 4.8997, lng: -75.8828, name: "La Virginia, Risaralda", municipality: "La Virginia, Risaralda", dischargeMinutes: 45 },
  "CARTAGO": { lat: 4.7464, lng: -75.9117, name: "Cartago, Valle del Cauca", municipality: "Cartago, Valle del Cauca", dischargeMinutes: 60 },
  "CHINCHINA": { lat: 4.9831, lng: -75.6042, name: "Chinchiná, Caldas", municipality: "Chinchiná, Caldas", dischargeMinutes: 45 },
  "PALESTINA": { lat: 5.0167, lng: -75.6167, name: "Palestina, Caldas", municipality: "Palestina, Caldas", dischargeMinutes: 30 },

  // Suroeste Antioqueño
  "AMAGA": { lat: 6.0403, lng: -75.7042, name: "Amagá, Antioquia", municipality: "Amagá, Antioquia", dischargeMinutes: 45 },
  "FREDONIA": { lat: 5.9264, lng: -75.6733, name: "Fredonia, Antioquia", municipality: "Fredonia, Antioquia", dischargeMinutes: 45 },
  "CIUDAD BOLIVAR": { lat: 5.8572, lng: -75.9214, name: "Ciudad Bolívar, Antioquia", municipality: "Ciudad Bolívar, Antioquia", dischargeMinutes: 45 },
  "ANDES": { lat: 5.6567, lng: -75.8797, name: "Andes, Antioquia", municipality: "Andes, Antioquia", dischargeMinutes: 60 },
  "JARDIN": { lat: 5.5992, lng: -75.8197, name: "Jardín, Antioquia", municipality: "Jardín, Antioquia", dischargeMinutes: 45 },
  "BETANIA": { lat: 5.7486, lng: -75.9758, name: "Betania, Antioquia", municipality: "Betania, Antioquia", dischargeMinutes: 30 },
  "TAMESIS": { lat: 5.6644, lng: -75.7144, name: "Támesis, Antioquia", municipality: "Támesis, Antioquia", dischargeMinutes: 45 },
  "SANTA BARBARA": { lat: 5.8744, lng: -75.5683, name: "Santa Bárbara, Antioquia", municipality: "Santa Bárbara, Antioquia", dischargeMinutes: 45 },
  "URRAO": { lat: 6.3164, lng: -76.1339, name: "Urrao, Antioquia", municipality: "Urrao, Antioquia", dischargeMinutes: 60 },

  // Norte Antioqueño
  "YARUMAL": { lat: 6.9631, lng: -75.4172, name: "Yarumal, Antioquia", municipality: "Yarumal, Antioquia", dischargeMinutes: 60 },
  "DON MATIAS": { lat: 6.5331, lng: -75.4139, name: "Donmatías, Antioquia", municipality: "Donmatías, Antioquia", dischargeMinutes: 45 },
  "SANTA ROSA": { lat: 6.6472, lng: -75.4608, name: "Santa Rosa de Osos, Antioquia", municipality: "Santa Rosa de Osos, Antioquia", dischargeMinutes: 45 },
  "SAN PEDRO": { lat: 6.4608, lng: -75.5622, name: "San Pedro de los Milagros, Antioquia", municipality: "San Pedro de los Milagros, Antioquia", dischargeMinutes: 45 },
  "SAN CRISTOBAL": { lat: 6.2783, lng: -75.6322, name: "San Cristóbal, Medellín", municipality: "San Cristóbal, Medellín", dischargeMinutes: 45 },

  // Nordeste Antioqueño
  "CISNEROS": { lat: 6.5381, lng: -75.0886, name: "Cisneros, Antioquia", municipality: "Cisneros, Antioquia", dischargeMinutes: 45 },

  // Oriente Antioqueño
  "SONSON": { lat: 5.7119, lng: -75.3106, name: "Sonsón, Antioquia", municipality: "Sonsón, Antioquia", dischargeMinutes: 45 },
  "LA UNION": { lat: 5.9739, lng: -75.3622, name: "La Unión, Antioquia", municipality: "La Unión, Antioquia", dischargeMinutes: 45 },
  "LA CEJA": { lat: 6.0306, lng: -75.4286, name: "La Ceja, Antioquia", municipality: "La Ceja, Antioquia", dischargeMinutes: 60 },
  "GUARNE": { lat: 6.2797, lng: -75.4439, name: "Guarne, Antioquia", municipality: "Guarne, Antioquia", dischargeMinutes: 60 },
  "SAN VICENTE": { lat: 6.2828, lng: -75.3331, name: "San Vicente Ferrer, Antioquia", municipality: "San Vicente Ferrer, Antioquia", dischargeMinutes: 45 },
  "CARMEN": { lat: 6.0847, lng: -75.4344, name: "El Carmen de Viboral, Antioquia", municipality: "El Carmen de Viboral, Antioquia", dischargeMinutes: 45 },
  "RIONEGRO": { lat: 6.1553, lng: -75.3742, name: "Rionegro, Antioquia", municipality: "Rionegro, Antioquia", dischargeMinutes: 90 },
  "PEÑOL": { lat: 6.2208, lng: -75.2417, name: "El Peñol, Antioquia", municipality: "El Peñol, Antioquia", dischargeMinutes: 45 },
  "MARINILLA": { lat: 6.1764, lng: -75.3364, name: "Marinilla, Antioquia", municipality: "Marinilla, Antioquia", dischargeMinutes: 60 },
  "SANTURIO": { lat: 6.1361, lng: -75.2639, name: "El Santuario, Antioquia", municipality: "El Santuario, Antioquia", dischargeMinutes: 45 },

  // Urabá y Córdoba
  "APARTADO": { lat: 7.8828, lng: -76.6258, name: "Apartadó, Antioquia", municipality: "Apartadó, Antioquia", dischargeMinutes: 90 },
  "CAREPA": { lat: 7.7558, lng: -76.6578, name: "Carepa, Antioquia", municipality: "Carepa, Antioquia", dischargeMinutes: 60 },
  "CHIGORODO": { lat: 7.6697, lng: -76.6789, name: "Chigorodó, Antioquia", municipality: "Chigorodó, Antioquia", dischargeMinutes: 45 },
  "TURBO": { lat: 8.0931, lng: -76.7289, name: "Turbo, Antioquia", municipality: "Turbo, Antioquia", dischargeMinutes: 60 },
  "CURRULAO": { lat: 8.0017, lng: -76.6908, name: "Currulao, Turbo", municipality: "Currulao, Turbo", dischargeMinutes: 45 },
  "NECOCLI": { lat: 8.4239, lng: -76.7869, name: "Necoclí, Antioquia", municipality: "Necoclí, Antioquia", dischargeMinutes: 45 },
  "MONTERIA": { lat: 8.7578, lng: -75.8814, name: "Montería, Córdoba", municipality: "Montería, Córdoba", dischargeMinutes: 90 },

  // Magdalena Medio y Santander
  "PUERTO BERRIO": { lat: 6.4914, lng: -74.4047, name: "Puerto Berrío, Antioquia", municipality: "Puerto Berrío, Antioquia", dischargeMinutes: 60 },
  "PUERTO BOYACA": { lat: 5.9758, lng: -74.5878, name: "Puerto Boyacá, Boyacá", municipality: "Puerto Boyacá, Boyacá", dischargeMinutes: 60 },
  "BARRANCABERMEJA": { lat: 7.0653, lng: -73.8547, name: "Barrancabermeja, Santander", municipality: "Barrancabermeja, Santander", dischargeMinutes: 90 },
  "CIMITARRA": { lat: 6.3156, lng: -74.0531, name: "Cimitarra, Santander", municipality: "Cimitarra, Santander", dischargeMinutes: 45 },
  "PIEDECUESTA": { lat: 6.9886, lng: -73.0497, name: "Piedecuesta, Santander", municipality: "Piedecuesta, Santander", dischargeMinutes: 60 },
  "SAN ALBERTO": { lat: 7.7589, lng: -73.3917, name: "San Alberto, Cesar", municipality: "San Alberto, Cesar", dischargeMinutes: 45 }
};

/**
 * Resuelve las coordenadas geográficas oficiales de una ruta.
 * Soporta salidas desde el CEDI Caldas o traslados directos entre bodegas/tiendas (Bodega A -> Bodega B).
 */
export function resolveRouteCoordinates(routeName: string, storeIds?: string[], originStoreId?: string): GeoCoord[] {
  const customStoresMap = getCustomStoresMap();
  const cediCustom = customStoresMap["L-000"] || CEDI_CALDAS_PORTAL_DEL_SUR;

  let originStore: HogarYModaStore = cediCustom;
  let remainingStoreIds: string[] = storeIds ? [...storeIds] : [];

  // 1. Determinar el punto de origen (CEDI Caldas u otra bodega/tienda)
  if (originStoreId && (customStoresMap[originStoreId] || HOGAR_Y_MODA_STORES_MAP[originStoreId])) {
    originStore = customStoresMap[originStoreId] || HOGAR_Y_MODA_STORES_MAP[originStoreId];
    remainingStoreIds = remainingStoreIds.filter(id => id !== originStoreId);
  } else if (remainingStoreIds.length > 0 && remainingStoreIds[0] !== 'L-000') {
    // Si la lista de paradas inicia con una bodega o tienda diferente al CEDI, se toma como origen
    const candidateOrigin = customStoresMap[remainingStoreIds[0]] || HOGAR_Y_MODA_STORES_MAP[remainingStoreIds[0]];
    if (candidateOrigin) {
      originStore = candidateOrigin;
      remainingStoreIds = remainingStoreIds.slice(1);
    }
  } else if (remainingStoreIds.length > 0 && remainingStoreIds[0] === 'L-000') {
    remainingStoreIds = remainingStoreIds.slice(1);
  }

  const result: GeoCoord[] = [{
    lat: originStore.lat,
    lng: originStore.lng,
    name: originStore.name,
    municipality: originStore.municipality,
    isWarehouse: Boolean(originStore.isOriginWarehouse || originStore.id === 'L-000'),
    storeId: originStore.id,
    dischargeMinutes: originStore.dischargeMinutes || 120
  }];

  // 2. Resolver las paradas intermedias o bodegas de destino
  if (remainingStoreIds.length > 0) {
    remainingStoreIds.forEach(id => {
      const cleanId = id.trim();
      if (cleanId === originStore.id) return; // Evitar duplicar el origen
      const store = customStoresMap[cleanId] || HOGAR_Y_MODA_STORES_MAP[cleanId];
      if (store) {
        if (!result.some(p => p.storeId === store.id)) {
          result.push({
            lat: store.lat,
            lng: store.lng,
            name: store.name,
            municipality: store.municipality,
            storeId: store.id,
            dischargeMinutes: store.dischargeMinutes,
            isWarehouse: Boolean(store.isOriginWarehouse)
          });
        }
      }
    });
  }

  // 2. Si solo tenemos el CEDI y no hubo storeIds válidos, buscar municipios por nombre de ruta
  if (result.length === 1 && routeName) {
    const upper = routeName.toUpperCase();
    Object.keys(COLOMBIA_LOCATIONS).forEach(key => {
      // Excluir referencias al CEDI o municipio de Caldas que confundirían el origen con una parada
      if (
        key !== "PORTAL INDUSTRIAL DEL SUR" &&
        key !== "HOGAR Y MODA" &&
        key !== "CEDI HOGAR Y MODA" &&
        key !== "CEDI CALDAS" &&
        key !== "CEDI" &&
        key !== "COMPLEJO INDUSTRIAL DEL SUR" &&
        key !== "BODEGA" &&
        key !== "BODEGA PRINCIPAL" &&
        key !== "L-000" &&
        key !== "CALDAS"
      ) {
        if (upper.includes(key)) {
          const loc = COLOMBIA_LOCATIONS[key];
          if (!result.some(p => p.name === loc.name)) {
            result.push({ ...loc, dischargeMinutes: loc.dischargeMinutes || 45 });
          }
        }
      }
    });
  }

  return result;
}

// Cálculo de distancia en línea recta (Haversine) ajustada a factor vial de montaña (1.35x)
export function calculatePathTotalKm(points: GeoCoord[]): number {
  if (points.length < 2) return 0;
  let totalKm = 0;

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];

    const R = 6371; // Radio de la Tierra en km
    const dLat = (p2.lat - p1.lat) * (Math.PI / 180);
    const dLon = (p2.lng - p1.lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(p1.lat * (Math.PI / 180)) * Math.cos(p2.lat * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightDist = R * c;

    // Factor vial en topografía colombiana: 1.35x
    totalKm += straightDist * 1.35;
  }

  // Ida y regreso a base central si la ruta no cierra en el origen
  const first = points[0];
  const last = points[points.length - 1];
  const isClosed = Math.abs(last.lat - first.lat) < 0.001 && Math.abs(last.lng - first.lng) < 0.001;
  if (!isClosed) {
    const returnDist = Math.hypot(last.lat - first.lat, last.lng - first.lng) * 111 * 1.35;
    totalKm += returnDist;
  }

  return Math.round(totalKm * 10) / 10;
}
