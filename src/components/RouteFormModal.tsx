import { toast } from 'sonner';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DeliveryRoute, VehicleProfile, LaborConfig } from '../types/logistics';
import { GeoCoord, CEDI_CALDAS, COLOMBIA_LOCATIONS } from '../data/colombiaCoordinates';
import { fetchRoadRoute, RouteLegInfo } from '../utils/roadRoutingService';
import { detectTollsOnRoad, TollStation } from '../data/colombiaTolls';
import { searchAddressOrCoords, GeocodedLocation } from '../utils/geocodingService';
import { formatCOP, formatNumber } from '../utils/costCalculator';
import {
  getCustomStores,
  getStoresByIds,
  HogarYModaStore
} from '../data/hogarYModaStores';
import {
  X,
  Save,
  Plus,
  MapPin,
  Search,
  Trash2,
  ArrowUp,
  ArrowDown,
  Navigation,
  Route,
  Clock,
  DollarSign,
  CheckCircle2,
  Loader2,
  Sparkles,
  Building2,
  Store,
  RotateCcw,
  AlertCircle,
  Repeat,
  Timer,
  Boxes,
  Coins,
  TrendingUp,
  Percent,
  Wallet,
  ShieldCheck,
  Check,
  Truck,
  Flag,
  Map as MapIcon
} from 'lucide-react';
import { ErrorBoundary } from './ErrorBoundary';
import { RouteModalInteractiveMap } from './RouteModalInteractiveMap';
import { LocationPicker } from './LocationPicker';

interface RouteStopDetail {
  id: string;
  name: string;
  lat: number;
  lng: number;
  isWarehouse?: boolean;
  unloadMinutes: number; // Tiempo estimado de descargue en minutos
}

interface RouteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRoute: (route: DeliveryRoute) => void;
  initialRoute?: DeliveryRoute | null;
  nextId?: string;
}

export const RouteFormModal: React.FC<RouteFormModalProps> = ({
  isOpen,
  onClose,
  onSaveRoute,
  initialRoute,
  nextId = "SCJ-038"
}) => {
  const isEditing = !!initialRoute;

  // Estados principales de la ruta
  const [id, setId] = useState<string>(initialRoute?.id || nextId);
  const [name, setName] = useState<string>(initialRoute?.name || '');
  const [zone, setZone] = useState<string>(initialRoute?.zone || 'Valle de Aburrá');
  const [notes, setNotes] = useState<string>(initialRoute?.notes || '');

  // Puntos de entrega con tiempos de descargue individuales
  const [stops, setStops] = useState<RouteStopDetail[]>([
    {
      id: "STOP-0",
      name: CEDI_CALDAS.name,
      lat: CEDI_CALDAS.lat,
      lng: CEDI_CALDAS.lng,
      isWarehouse: true,
      unloadMinutes: 0
    },
    {
      id: "STOP-1",
      name: "Itagüí, Antioquia",
      lat: 6.1722,
      lng: -75.6097,
      isWarehouse: false,
      unloadMinutes: 30
    }
  ]);

  // Control de Retorno al CEDI (Circuito Completo)
  const [includeReturnToCedi, setIncludeReturnToCedi] = useState<boolean>(true);

  // Tiempo de cargue en CEDI (minutos)
  const [cediLoadingMinutes, setCediLoadingMinutes] = useState<number>(45);

  // Buscador de direcciones o coordenadas
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<GeocodedLocation[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);

  // Mapa interactivo para selección visual y edición de paradas
  const [isMapOpen, setIsMapOpen] = useState<boolean>(false);
  const [roadPoints, setRoadPoints] = useState<{ lat: number; lng: number }[]>([]);
  const [panTarget, setPanTarget] = useState<{ lat: number; lng: number; zoom?: number; timestamp: number } | null>(null);

  // Selector de ubicación visual
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState<boolean>(false);
  const [editingStopIndex, setEditingStopIndex] = useState<number | null>(null);

  // Métricas calculadas automáticamente por el trazado vial
  const [calculatedKm, setCalculatedKm] = useState<number>(initialRoute?.km || 0);
  const [calculatedTransitHours, setCalculatedTransitHours] = useState<number>(initialRoute?.transitHours || 0);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState<boolean>(false);
  const [roadLegs, setRoadLegs] = useState<RouteLegInfo[]>([]);

  // Peajes: Detección automática y control manual
  const [detectedTolls, setDetectedTolls] = useState<TollStation[]>([]);
  const [tollCount, setTollCount] = useState<number>(initialRoute?.tollCount || 0);
  const [tollCost, setTollCost] = useState<number>(initialRoute?.tollEstimatedCost || 0);
  const [tollCostNlr, setTollCostNlr] = useState<number | string>(
    initialRoute?.tollEstimatedCostNlr !== undefined ? initialRoute.tollEstimatedCostNlr : initialRoute?.tollEstimatedCost || 0
  );
  const [isManualTollOverride, setIsManualTollOverride] = useState<boolean>(false);

  // Estados Económicos & Tarifas a Cobrar (Lo que SCJ cobra al cliente y viáticos)
  const [freightTariffNpr, setFreightTariffNpr] = useState<number | string>(initialRoute?.freightTariffNpr ?? '');
  const [freightTariffNlr, setFreightTariffNlr] = useState<number | string>(initialRoute?.freightTariffNlr ?? '');
  const [viaticosCOP, setViaticosCOP] = useState<number | string>(initialRoute?.viaticosCOP ?? 0);
  const [additionalExpensesCOP, setAdditionalExpensesCOP] = useState<number | string>(initialRoute?.additionalExpensesCOP ?? 0);

  // Sumatoria total de tiempos de cargue y descargues
  const totalHandlingMinutes = useMemo(() => {
    const storeUnloadTotal = stops.slice(1).reduce((acc, s) => acc + (s.unloadMinutes || 30), 0);
    return cediLoadingMinutes + storeUnloadTotal;
  }, [stops, cediLoadingMinutes]);

  // Horas totales de jornada laboral de la ruta
  const totalOperationHours = useMemo(() => {
    return Math.round((calculatedTransitHours + (totalHandlingMinutes / 60)) * 10) / 10;
  }, [calculatedTransitHours, totalHandlingMinutes]);

  // Simulador financiero en vivo para NPR y NLR
  const estCosts = useMemo(() => {
    const km = Math.max(1, calculatedKm);

    // Combustible ACPM (NPR 22.5 km/gal vs NLR 31.0 km/gal, precio $10.800)
    const fuelCostNpr = Math.round((km / 22.5) * 10800);
    const fuelCostNlr = Math.round((km / 31.0) * 10800);

    // Mantenimiento SICE-TAC (NPR $326/km vs NLR $247/km)
    const mttoCostNpr = Math.round(km * 326.0);
    const mttoCostNlr = Math.round(km * 247.0);

    // Peajes
    const peajesNpr = Math.max(0, Number(tollCost) || 0);
    const peajesNlr = Math.max(0, Number(tollCostNlr) >= 0 ? Number(tollCostNlr) : peajesNpr);

    // Viáticos e Imprevistos
    const viaticos = Math.max(0, Number(viaticosCOP) || 0);
    const imprevistos = Math.max(0, Number(additionalExpensesCOP) || 0);

    // Mano de obra estimada (Conductor + Auxiliar con factor prestacional CST según horas)
    const tripDays = Math.max(1, Math.ceil(totalOperationHours / 10));
    const laborEst = Math.round(tripDays * 118000);

    // Costo Fijo Prorrateado
    const fixedNpr = Math.round(tripDays * 52000);
    const fixedNlr = Math.round(tripDays * 38000);

    // Costo Total Operativo Proyectado
    const totalCostNpr = fuelCostNpr + mttoCostNpr + peajesNpr + viaticos + imprevistos + laborEst + fixedNpr;
    const totalCostNlr = fuelCostNlr + mttoCostNlr + peajesNlr + viaticos + imprevistos + laborEst + fixedNlr;

    // Utilidades y Márgenes NPR
    const valNpr = Number(freightTariffNpr) || 0;
    const netProfitNpr = valNpr > 0 ? valNpr - totalCostNpr : 0;
    const marginPctNpr = valNpr > 0 ? (netProfitNpr / valNpr) * 100 : 0;

    // Utilidades y Márgenes NLR
    const valNlr = Number(freightTariffNlr) || 0;
    const netProfitNlr = valNlr > 0 ? valNlr - totalCostNlr : 0;
    const marginPctNlr = valNlr > 0 ? (netProfitNlr / valNlr) * 100 : 0;

    return {
      totalCostNpr,
      totalCostNlr,
      fuelCostNpr,
      fuelCostNlr,
      mttoCostNpr,
      mttoCostNlr,
      peajesNpr,
      peajesNlr,
      viaticos,
      imprevistos,
      laborEst,
      netProfitNpr,
      marginPctNpr,
      netProfitNlr,
      marginPctNlr
    };
  }, [calculatedKm, tollCost, tollCostNlr, viaticosCOP, additionalExpensesCOP, totalOperationHours, freightTariffNpr, freightTariffNlr]);

  // Inicializar o restablecer al abrir modal
  useEffect(() => {
    if (initialRoute) {
      setId(initialRoute.id);
      setName(initialRoute.name);
      setZone(initialRoute.zone);
      setCalculatedKm(initialRoute.km);
      setCalculatedTransitHours(initialRoute.transitHours);
      setTollCost(initialRoute.tollEstimatedCost);
      setTollCount(initialRoute.tollCount);
      setTollCostNlr(initialRoute.tollEstimatedCostNlr !== undefined ? initialRoute.tollEstimatedCostNlr : initialRoute.tollEstimatedCost);
      setFreightTariffNpr(initialRoute.freightTariffNpr !== undefined ? initialRoute.freightTariffNpr : '');
      setFreightTariffNlr(initialRoute.freightTariffNlr !== undefined ? initialRoute.freightTariffNlr : '');
      setViaticosCOP(initialRoute.viaticosCOP ?? 0);
      setAdditionalExpensesCOP(initialRoute.additionalExpensesCOP ?? 0);
      setNotes(initialRoute.notes || '');

      // Recuperar paradas usando los IDs de tiendas si existen
      if (initialRoute.storeIds && initialRoute.storeIds.length > 0) {
        const matchedStores = getStoresByIds(initialRoute.storeIds);
        if (matchedStores.length > 0) {
          const loadedStops: RouteStopDetail[] = matchedStores.map((s, idx) => ({
            id: s.id,
            name: s.isOriginWarehouse ? s.name : `${s.id} - ${s.name} (${s.municipality})`,
            lat: s.lat,
            lng: s.lng,
            isWarehouse: s.isOriginWarehouse,
            unloadMinutes: s.dischargeMinutes || (s.isOriginWarehouse ? 0 : 30)
          }));
          setStops(loadedStops);
        } else {
          // Reconstruir paradas aproximadas a partir del nombre
          rebuildStopsFromName(initialRoute.name);
        }
      } else {
        rebuildStopsFromName(initialRoute.name);
      }
    } else {
      setId(nextId);
      setName('');
      setZone('Valle de Aburrá');
      setNotes('');
      setIncludeReturnToCedi(true);
      setCediLoadingMinutes(45);
      setStops([
        {
          id: "STOP-0",
          name: CEDI_CALDAS.name,
          lat: CEDI_CALDAS.lat,
          lng: CEDI_CALDAS.lng,
          isWarehouse: true,
          unloadMinutes: 0
        },
        {
          id: "STOP-1",
          name: "Itagüí, Antioquia",
          lat: 6.1722,
          lng: -75.6097,
          isWarehouse: false,
          unloadMinutes: 30
        }
      ]);
      setTollCount(0);
      setTollCost(0);
      setTollCostNlr(0);
      setFreightTariffNpr('');
      setFreightTariffNlr('');
      setViaticosCOP(0);
      setAdditionalExpensesCOP(0);
      setIsManualTollOverride(false);
    }
  }, [initialRoute, nextId, isOpen]);

  const rebuildStopsFromName = (routeName: string) => {
    const recoveredStops: RouteStopDetail[] = [
      {
        id: "STOP-0",
        name: CEDI_CALDAS.name,
        lat: CEDI_CALDAS.lat,
        lng: CEDI_CALDAS.lng,
        isWarehouse: true,
        unloadMinutes: 0
      }
    ];

    const parts = routeName.split('-').map(p => p.trim());
    let idx = 1;
    for (const p of parts) {
      const upper = p.toUpperCase();
      if (upper !== 'CEDI' && upper !== 'CEDI CALDAS' && upper !== 'CALDAS') {
        const match = Object.entries(COLOMBIA_LOCATIONS).find(([k]) => k.includes(upper));
        if (match) {
          recoveredStops.push({
            id: `STOP-${idx++}`,
            name: match[1].name,
            lat: match[1].lat,
            lng: match[1].lng,
            unloadMinutes: 30
          });
        } else {
          recoveredStops.push({
            id: `STOP-${idx++}`,
            name: p,
            lat: 6.2442,
            lng: -75.5812,
            unloadMinutes: 30
          });
        }
      }
    }

    if (recoveredStops.length > 1) {
      setStops(recoveredStops);
    }
  };

  // Recalcular ruta por carretera cuando cambian las paradas o el retorno al CEDI
  useEffect(() => {
    if (!isOpen || stops.length < 2) return;

    let isMounted = true;
    setIsCalculatingRoute(true);

    // Si está activo el retorno, se añade la bodega de origen (stops[0]) al final de la ruta
    const effectiveCoords: GeoCoord[] = stops.map(s => ({
      lat: s.lat,
      lng: s.lng,
      name: s.name,
      isWarehouse: s.isWarehouse
    }));

    if (includeReturnToCedi && stops.length >= 2) {
      const origin = stops[0];
      effectiveCoords.push({
        lat: origin.lat,
        lng: origin.lng,
        name: `Retorno a ${origin.name}`,
        isWarehouse: true
      });
    }

    fetchRoadRoute(effectiveCoords)
      .then(res => {
        if (!isMounted) return;
        setIsCalculatingRoute(false);

        if (res.success && res.totalKm > 0) {
          setCalculatedKm(res.totalKm);
          setCalculatedTransitHours(Math.max(0.5, Math.round((res.totalMinutes / 60) * 10) / 10));
          setRoadLegs(res.legs);
          setRoadPoints(res.roadPoints || []);

          // Detección automática de peajes en el trazado vial (Ida + Retorno)
          const tollResult = detectTollsOnRoad(res.roadPoints);
          setDetectedTolls(tollResult.detectedTolls);

          if (!isManualTollOverride) {
            setTollCount(tollResult.tollCount);
            setTollCost(tollResult.totalTollCost);
          }
        }
      })
      .catch(err => {
        console.warn('Error calculando ruta vial en formulario:', err);
        if (isMounted) setIsCalculatingRoute(false);
      });

    return () => {
      isMounted = false;
    };
  }, [stops, includeReturnToCedi, isOpen, isManualTollOverride]);

  // Búsqueda de direcciones, municipios o tiendas Hogar y Moda
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchFeedback(null);

    try {
      const q = searchQuery.toLowerCase().trim();
      const customStores = getCustomStores();

      // 1. Buscar primero en las 52 tiendas de Hogar y Moda
      const matchedStores: GeocodedLocation[] = customStores
        .filter(s =>
          s.id.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.municipality.toLowerCase().includes(q) ||
          (s.address && s.address.toLowerCase().includes(q))
        )
        .map(s => ({
          name: s.isOriginWarehouse ? s.name : `${s.id} - ${s.name} (${s.municipality})`,
          displayAddress: s.address ? `${s.address}, ${s.municipality}` : s.municipality,
          lat: s.lat,
          lng: s.lng,
          source: 'catalog' as const
        }));

      // 2. Buscar georreferenciación en línea
      let onlineResults: GeocodedLocation[] = [];
      try {
        onlineResults = await searchAddressOrCoords(searchQuery);
      } catch (err) {
        console.warn('Búsqueda online no disponible o lenta:', err);
      }

      // Combinar tiendas locales coincidentes primero, luego resultados geocodificados
      const combined = [
        ...matchedStores,
        ...onlineResults.filter(o =>
          !matchedStores.some(m => Math.abs(m.lat - o.lat) < 0.001 && Math.abs(m.lng - o.lng) < 0.001)
        )
      ];

      setSearchResults(combined);
      if (combined.length > 0) {
        setPanTarget({
          lat: combined[0].lat,
          lng: combined[0].lng,
          zoom: 14,
          timestamp: Date.now()
        });
        setIsMapOpen(true);
      } else {
        setSearchFeedback('No se encontraron ubicaciones ni tiendas. Intenta con un municipio (Andes, Rionegro), nombre de tienda (L-001) o coordenadas "lat, lng".');
      }
    } catch {
      setSearchFeedback('Error de conexión al buscar. Puedes ingresar las coordenadas directamente (ej: 6.1759, -75.5917) o el código de tienda (ej: L-001).');
    } finally {
      setIsSearching(false);
    }
  };

  // Agregar un resultado a la secuencia de paradas de destino
  const handleAddStop = (loc: GeocodedLocation) => {
    // Si la ubicación corresponde a una tienda de Hogar y Moda, obtener sus minutos de descargue
    const customStores = getCustomStores();
    const matchedStore = customStores.find(cs =>
      loc.name.includes(cs.id) || (Math.abs(cs.lat - loc.lat) < 0.001 && Math.abs(cs.lng - loc.lng) < 0.001)
    );

    const newStop: RouteStopDetail = {
      id: matchedStore ? matchedStore.id : `STOP-${Date.now()}`,
      name: loc.name,
      lat: loc.lat,
      lng: loc.lng,
      isWarehouse: matchedStore ? matchedStore.isOriginWarehouse : false,
      unloadMinutes: matchedStore ? (matchedStore.dischargeMinutes || 30) : 30
    };

    setStops(prev => [...prev, newStop]);
    setSearchQuery('');
    setSearchResults([]);
    setSearchFeedback(null);

    // Sugerir nombre automáticamente si el campo está vacío o inicia con CEDI / RUTA
    if (!name.trim() || name.startsWith('CEDI CALDAS') || name.startsWith('RUTA')) {
      const allNames = [...stops, newStop]
        .map((s, idx) => {
          const cleanName = s.name.replace(/^L-\d+\s*-\s*/, '').replace(/\s*\([^)]*\)/g, '').split(',')[0].trim().toUpperCase();
          return cleanName || (idx === 0 ? 'SALIDA' : `DESTINO ${idx}`);
        })
        .filter((val, idx, arr) => arr.indexOf(val) === idx && val.length > 0);
      setName(allNames.join(' - '));
    }
  };

  // Generar nombre automático a partir de las paradas (sin forzar CEDI CALDAS si es otra bodega o lugar)
  const handleAutoGenerateName = () => {
    const stopNames = stops
      .map((s, idx) => {
        const cleanName = s.name.replace(/^L-\d+\s*-\s*/, '').replace(/\s*\([^)]*\)/g, '').split(',')[0].trim().toUpperCase();
        return cleanName || (idx === 0 ? 'SALIDA' : `DESTINO ${idx}`);
      })
      .filter((val, idx, arr) => arr.indexOf(val) === idx && val.length > 0);
    setName(stopNames.join(' - '));
  };

  // Modificar tiempo de descargue de una parada
  const handleUpdateUnloadMinutes = (index: number, minutes: number) => {
    setStops(prev => prev.map((s, idx) => idx === index ? { ...s, unloadMinutes: Math.max(5, minutes) } : s));
  };

  // Modificar libremente el nombre de cualquier parada o bodega (personalizado o conocido)
  const handleUpdateStopName = (index: number, newName: string) => {
    setStops(prev => prev.map((s, idx) => {
      if (idx !== index) return s;
      const isCatalog = s.id && s.id.startsWith('L-') && s.name === newName;
      return {
        ...s,
        name: newName,
        id: isCatalog ? s.id : (idx === 0 ? 'ORIGIN' : `STOP-${idx}`)
      };
    }));
  };

  // Cargar una tienda o bodega del catálogo a una parada intermedia
  const handleSetIntermediateStore = (index: number, storeId: string) => {
    const customStores = getCustomStores();
    const found = customStores.find(s => s.id === storeId);
    if (!found) return;

    setStops(prev => prev.map((s, idx) => idx === index ? {
      ...s,
      id: found.id,
      name: `${found.id} - ${found.name} (${found.municipality})`,
      lat: found.lat,
      lng: found.lng,
      isWarehouse: Boolean(found.isOriginWarehouse),
      unloadMinutes: found.dischargeMinutes || 30
    } : s));
  };

  // Establecer una tienda o bodega del catálogo como punto de salida (origen)
  const handleSetOriginStore = (storeId: string) => {
    const customStores = getCustomStores();
    const found = customStores.find(s => s.id === storeId);
    if (!found) return;

    const newOrigin: RouteStopDetail = {
      id: found.id,
      name: found.isOriginWarehouse ? found.name : `${found.id} - ${found.name} (${found.municipality})`,
      lat: found.lat,
      lng: found.lng,
      isWarehouse: Boolean(found.isOriginWarehouse || found.id === 'L-000'),
      unloadMinutes: 0
    };

    setStops(prev => {
      const rest = prev.slice(1).filter(s => s.id !== found.id);
      return [newOrigin, ...rest];
    });
  };

  // Establecer un resultado de búsqueda geocodificado como punto de salida (origen)
  const handleSetOriginFromSearch = (loc: GeocodedLocation) => {
    const customStores = getCustomStores();
    const matchedStore = customStores.find(cs =>
      loc.name.includes(cs.id) || (Math.abs(cs.lat - loc.lat) < 0.001 && Math.abs(cs.lng - loc.lng) < 0.001)
    );

    const newOrigin: RouteStopDetail = {
      id: matchedStore ? matchedStore.id : `ORIGIN-${Date.now()}`,
      name: loc.name,
      lat: loc.lat,
      lng: loc.lng,
      isWarehouse: matchedStore ? Boolean(matchedStore.isOriginWarehouse) : true,
      unloadMinutes: 0
    };

    setStops(prev => {
      const rest = prev.slice(1);
      return [newOrigin, ...rest];
    });
    setSearchQuery('');
    setSearchResults([]);
    setSearchFeedback(null);
  };

  // Establecer cualquier parada existente en la lista como el punto de salida (origen)
  const handleSetStopAsOrigin = (index: number) => {
    if (index === 0 || index >= stops.length) return;
    setStops(prev => {
      const selected = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [
        { ...selected, unloadMinutes: 0, isWarehouse: true },
        ...rest.map(s => ({ ...s, unloadMinutes: s.unloadMinutes || 30 }))
      ];
    });
  };

  // Eliminar una parada (si se elimina la salida y quedan suficientes, la siguiente se convierte en salida)
  const handleRemoveStop = (index: number) => {
    if (stops.length <= 2) {
      toast.error('Una ruta debe contener al menos un punto de salida y un destino.');
      return;
    }
    setStops(prev => {
      const next = prev.filter((_, idx) => idx !== index);
      if (index === 0 && next.length > 0) {
        next[0] = { ...next[0], unloadMinutes: 0, isWarehouse: true };
      }
      return next;
    });
  };

  // Mover orden de paradas (permite intercambiar la salida con la parada 1)
  const handleMoveStop = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= stops.length) return;

    setStops(prev => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next.map((s, idx) => ({
        ...s,
        unloadMinutes: idx === 0 ? 0 : (s.unloadMinutes || 30),
        isWarehouse: idx === 0 ? true : s.isWarehouse
      }));
    });
  };

  // Manejadores específicos para el mapa interactivo (agregar, quitar o fijar salida directamente desde el mapa)
  const handleAddStopFromMap = (stopName: string, lat: number, lng: number, isWarehouse?: boolean, unloadMinutes?: number) => {
    const customStores = getCustomStores();
    const matchedStore = customStores.find(cs =>
      stopName.includes(cs.id) || (Math.abs(cs.lat - lat) < 0.001 && Math.abs(cs.lng - lng) < 0.001)
    );

    const newStop: RouteStopDetail = {
      id: matchedStore ? matchedStore.id : `STOP-${Date.now()}`,
      name: stopName,
      lat,
      lng,
      isWarehouse: isWarehouse || Boolean(matchedStore?.isOriginWarehouse),
      unloadMinutes: unloadMinutes || (matchedStore ? (matchedStore.dischargeMinutes || 30) : 30)
    };

    setStops(prev => [...prev, newStop]);

    // Actualizar nombre sugerido si está vacío o por defecto
    if (!name.trim() || name.startsWith('CEDI CALDAS') || name.startsWith('RUTA')) {
      const allNames = [...stops, newStop]
        .map((s, idx) => {
          const cleanName = s.name.replace(/^L-\d+\s*-\s*/, '').replace(/\s*\([^)]*\)/g, '').split(',')[0].trim().toUpperCase();
          return cleanName || (idx === 0 ? 'SALIDA' : `DESTINO ${idx}`);
        })
        .filter((val, idx, arr) => arr.indexOf(val) === idx && val.length > 0);
      setName(allNames.join(' - '));
    }
  };

  const handleRemoveStopFromMap = (index: number) => {
    handleRemoveStop(index);
  };

  const handleSetOriginFromMap = (index: number) => {
    handleSetStopAsOrigin(index);
  };

  const handleSetOriginFromCoords = (originName: string, lat: number, lng: number) => {
    const customStores = getCustomStores();
    const matchedStore = customStores.find(cs =>
      originName.includes(cs.id) || (Math.abs(cs.lat - lat) < 0.001 && Math.abs(cs.lng - lng) < 0.001)
    );

    const newOrigin: RouteStopDetail = {
      id: matchedStore ? matchedStore.id : `ORIGIN-${Date.now()}`,
      name: originName,
      lat,
      lng,
      isWarehouse: true,
      unloadMinutes: 0
    };

    setStops(prev => {
      const rest = prev.slice(1);
      return [newOrigin, ...rest];
    });
  };

  const handleUpdateStop = (index: number, updatedStop: RouteStopDetail) => {
    setStops(prev => prev.map((s, idx) => idx === index ? updatedStop : s));
  };

  const handleSwapStops = (index1: number, index2: number) => {
    if (index1 < 0 || index2 < 0 || index1 >= stops.length || index2 >= stops.length) return;
    setStops(prev => {
      const copy = [...prev];
      const temp = copy[index1];
      copy[index1] = copy[index2];
      copy[index2] = temp;
      return copy.map((s, idx) => ({
        ...s,
        unloadMinutes: idx === 0 ? 0 : (s.unloadMinutes || 30),
        isWarehouse: idx === 0 ? true : s.isWarehouse
      }));
    });
  };

  // Guardar ruta con todos los parámetros económicos, fletes y viáticos
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (stops.length < 2) {
      toast.error('Debes agregar al menos un punto de destino para crear la ruta.');
      return;
    }

    // IDs de tiendas generados o asociados (sin forzar L-000 si es una bodega personalizada)
    const customStores = getCustomStores();
    const storeIds = stops.map((s, idx) => {
      if (s.id && s.id.startsWith('L-')) return s.id;
      const found = customStores.find(cs =>
        s.name.includes(cs.id) ||
        (Math.abs(cs.lat - s.lat) < 0.005 && Math.abs(cs.lng - s.lng) < 0.005)
      );
      if (found) return found.id;
      return idx === 0 ? (s.id && s.id !== 'L-000' ? s.id : 'ORIGIN') : (s.id || `STOP-${idx}`);
    });

    const routeNotes = [
      notes.trim(),
      includeReturnToCedi
        ? `Circuito con retorno a ${stops[0].name} incluido.`
        : 'Ruta solo ida (traslado directo entre bodegas/locales sin retorno a base).',
      `Cargue en origen (${stops[0].name}): ${cediLoadingMinutes} min. Descargues: ${stops.slice(1).map(s => `${s.name} (${s.unloadMinutes}m)`).join(', ')}.`
    ].filter(Boolean).join(' ');

    const valNpr = Number(freightTariffNpr);
    const valNlr = Number(freightTariffNlr);

    const originNameClean = stops[0]?.name?.trim() || 'Punto de Salida';
    const originIdClean = stops[0]?.id && stops[0].id.startsWith('L-')
      ? stops[0].id
      : (stops[0]?.id && stops[0].id !== 'L-000' ? stops[0].id : 'ORIGIN');

    const savedRoute: DeliveryRoute = {
      id: id.trim() || nextId,
      name: name.trim().toUpperCase(),
      zone: zone.trim() || 'Antioquia',
      km: Math.max(1, calculatedKm),
      transitHours: Math.max(0.5, calculatedTransitHours),
      loadingMinutes: Math.max(30, totalHandlingMinutes),
      storeIds,
      originStoreId: originIdClean,
      originName: originNameClean,
      tollEstimatedCost: Math.max(0, tollCost),
      tollEstimatedCostNlr: Math.max(0, Number(tollCostNlr) >= 0 ? Number(tollCostNlr) : tollCost),
      tollCount: Math.max(0, tollCount),
      freightTariffNpr: !isNaN(valNpr) && valNpr > 0 ? valNpr : undefined,
      freightTariffNlr: !isNaN(valNlr) && valNlr > 0 ? valNlr : (!isNaN(valNpr) && valNpr > 0 ? valNpr : undefined),
      viaticosCOP: Math.max(0, Number(viaticosCOP) || 0),
      additionalExpensesCOP: Math.max(0, Number(additionalExpensesCOP) || 0),
      notes: routeNotes,
      assignedVehiclePlate: initialRoute?.assignedVehiclePlate,
      assignedDriverName: initialRoute?.assignedDriverName,
      assignedHelperName: initialRoute?.assignedHelperName,
      customFuelRateKmPerGal: initialRoute?.customFuelRateKmPerGal
    };

    onSaveRoute(savedRoute);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className={`bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] transition-all duration-200 ${
        isMapOpen ? 'max-w-6xl w-full' : 'max-w-4xl w-full'
      }`}>

        {/* Cabecera del Modal */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-600 text-white rounded-lg">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-blue-400 font-bold text-xs bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {id}
                </span>
                <h2 className="text-sm font-bold text-white tracking-tight">
                  {isEditing ? 'Editar Parámetros de Ruta' : 'Crear Nueva Ruta con Trazado y Tiempos Reales'}
                </h2>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Buscador de direcciones/coordenadas, tiempos estimados de descargue, cálculo de peajes y circuito con retorno al CEDI.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido del Formulario */}
        <div className="flex-1 overflow-y-auto">
        {/* Cuerpo del Formulario */}
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-6 text-xs overflow-y-auto max-h-[calc(94vh-130px)]">

          {/* PASO 1: BUSCADOR DE DIRECCIÓN O COORDENADAS (LAT, LNG) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <Search className="w-4 h-4 text-blue-600" />
                <span>Buscador de Puntos de Destino (Dirección, Municipio o Coordenadas)</span>
              </label>
              <span className="text-[10px] text-slate-500">
                Ej: <span className="font-mono text-slate-700">Cra 43A # 1-50 Medellín</span> ó <span className="font-mono text-slate-700">6.1759, -75.5917</span>
              </span>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                  placeholder="Escribe una dirección (Calle 10 Envigado), municipio (Andes, Rionegro) o coordenadas Lat, Lng..."
                  className="w-full pl-3 pr-8 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Buscando...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Buscar Punto</span>
                  </>
                )}
              </button>
            </div>

            {searchFeedback && (
              <div className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{searchFeedback}</span>
              </div>
            )}

            {/* Resultados de búsqueda */}
            {searchResults.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm space-y-1 p-2">
                <div className="text-[10px] text-slate-500 font-semibold px-2 py-1">
                  Ubicaciones encontradas en Colombia ({searchResults.length}):
                </div>
                {searchResults.map((res, idx) => (
                  <div
                    key={`${res.name}-${idx}`}
                    className="p-2.5 rounded-lg hover:bg-blue-50/80 border border-transparent hover:border-blue-200 flex items-center justify-between transition-colors cursor-pointer"
                    onClick={() => handleAddStop(res)}
                  >
                    <div className="pr-2 space-y-0.5">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        <span>{res.name}</span>
                        {res.source === 'catalog' && (
                          <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-bold">
                            Catálogo
                          </span>
                        )}
                        {res.source === 'coords' && (
                          <span className="text-[9px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-bold">
                            GPS Directo
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-lg">
                        {res.displayAddress}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => {
                          setPanTarget({ lat: res.lat, lng: res.lng, zoom: 15, timestamp: Date.now() });
                          setIsMapOpen(true);
                        }}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold text-[10px] flex items-center gap-1 transition-colors border border-slate-300 cursor-pointer shadow-2xs"
                        title="Ver y enfocar ubicación en el mapa"
                      >
                        <MapIcon className="w-3 h-3 text-blue-600" />
                        <span>Ver en Mapa</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetOriginFromSearch(res)}
                        className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold text-[10px] flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                        title="Establecer como Bodega/Punto de Salida de la ruta"
                      >
                        <Flag className="w-3 h-3 text-amber-200" />
                        <span>Salida</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddStop(res)}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-[10px] flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                        title="Agregar como parada de destino"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Destino</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECCIÓN CLAVE: MAPA INTERACTIVO PARA PONER Y QUITAR PARADAS DIRECTAMENTE */}
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-blue-50/80 hover:bg-blue-100/70 p-3 rounded-xl border border-blue-200 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-600 text-white rounded-lg shadow-xs">
                  <MapIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">
                      Mapa Interactivo de Ruta (Poner y Quitar Ubicaciones Directamente)
                    </span>
                    <span className="bg-blue-200 text-blue-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-300">
                      {stops.length} paradas marcadas
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Haz clic directamente en el mapa para marcar nuevos puntos o fijar salida. Haz clic en un marcador para quitarlo de inmediato.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMapOpen(!isMapOpen)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0 ${
                  isMapOpen
                    ? 'bg-slate-800 text-white hover:bg-slate-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>{isMapOpen ? 'Ocultar Mapa' : '🗺️ Abrir Mapa'}</span>
              </button>
            </div>

            {isMapOpen && (
              <ErrorBoundary
                fallbackTitle="El mapa interactivo tuvo una pausa técnica"
                onReset={() => setIsMapOpen(false)}
              >
                <RouteModalInteractiveMap
                  stops={stops}
                  onAddStopFromMap={handleAddStopFromMap}
                  onRemoveStopFromMap={handleRemoveStopFromMap}
                  onSetOriginFromMap={handleSetOriginFromMap}
                  onSetOriginFromCoords={handleSetOriginFromCoords}
                  onUpdateStop={handleUpdateStop}
                  onSwapStops={handleSwapStops}
                  roadPoints={roadPoints}
                  panTarget={panTarget}
                  includeReturn={includeReturnToCedi}
                  detectedTolls={detectedTolls}
                  onCloseMap={() => setIsMapOpen(false)}
                  isCalculatingRoute={isCalculatingRoute}
                />
              </ErrorBoundary>
            )}
          </div>

          {/* CONTROL CLAVE: RETORNO AL ORIGEN (CIRCUITO COMPLETO O TRASLADO ENTRE BODEGAS) */}
          <div className={`p-4 rounded-xl border transition-all ${
            includeReturnToCedi
              ? 'bg-blue-50/70 border-blue-300 shadow-2xs'
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className={`p-2 rounded-lg ${includeReturnToCedi ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  <Repeat className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">
                      Circuito de Retorno a la Bodega de Salida ({stops[0]?.name || 'Origen'})
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      includeReturnToCedi
                        ? 'bg-blue-200 text-blue-900'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {includeReturnToCedi ? 'ACTIVADO (Ida y Vuelta)' : 'SOLO IDA (Traslado Bodega a Bodega)'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {includeReturnToCedi
                      ? `El vehículo sale de "${stops[0]?.name}", realiza el recorrido y regresa al mismo punto de salida. Kilometraje, peajes y horas contemplan el viaje completo.`
                      : `Ruta de un solo sentido (Ideal para transferencias entre bodegas o despachos punto a punto). El cálculo finaliza en el último destino.`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIncludeReturnToCedi(!includeReturnToCedi)}
                className={`px-4 py-2 rounded-lg font-bold text-xs transition-colors shrink-0 shadow-xs flex items-center gap-1.5 cursor-pointer ${
                  includeReturnToCedi
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                }`}
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>{includeReturnToCedi ? 'Desactivar Retorno (Solo Ida)' : 'Incluir Retorno a Salida'}</span>
              </button>
            </div>
          </div>

          {/* PASO 2: SECUENCIA DE PARADAS Y TIEMPOS ESTIMADOS DE DESCARGUE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <Route className="w-4 h-4 text-blue-600" />
                <span>Paradas y Tiempos Estimados de Descargue ({stops.length} ubicaciones)</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsLocationPickerOpen(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-colors shadow-xs"
                  title="Seleccionar ubicación en el mapa"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Seleccionar en Mapa</span>
                </button>
                <button
                  type="button"
                  onClick={handleAutoGenerateName}
                  className="text-blue-600 hover:text-blue-800 font-bold text-[11px] flex items-center gap-1"
                  title="Genera el nombre de la ruta a partir de los puntos seleccionados"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Auto-generar Nombre</span>
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">

              {/* Punto 0: Bodega de Salida / Origen (Editable libremente: Escribir nombre propio o cargar local registrado) */}
              <div className="p-3.5 rounded-xl border bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-start gap-3 flex-1">
                  <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs font-mono shrink-0 shadow-xs mt-0.5">
                    0
                  </span>
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-black tracking-wide flex items-center gap-1 shadow-2xs">
                        <Flag className="w-3 h-3 text-amber-300" />
                        SALIDA / ORIGEN
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        (Escribe el nombre o selecciona un local registrado)
                      </span>
                    </div>

                    {/* Input editable de nombre para el Punto 0 */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="text"
                        value={stops[0].name}
                        onChange={(e) => handleUpdateStopName(0, e.target.value)}
                        placeholder="Escribe el nombre de la bodega o lugar de salida (o déjalo en blanco / conocido)..."
                        className="flex-1 font-bold text-slate-900 text-xs bg-white border border-blue-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                      />

                      {/* Selector de locales registrados del catálogo */}
                      <select
                        value={stops[0].id && stops[0].id.startsWith('L-') ? stops[0].id : ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            handleSetOriginStore(e.target.value);
                          }
                        }}
                        className="text-[11px] font-semibold bg-white border border-slate-300 text-slate-700 rounded-lg px-2 py-1.5 shadow-2xs cursor-pointer focus:ring-2 focus:ring-blue-500 max-w-xs truncate shrink-0"
                      >
                        <option value="">🏪 Cargar de Locales Registrados...</option>
                        <option value="L-000">🏢 L-000 - CEDI Caldas / Portal del Sur (Principal)</option>
                        {getCustomStores()
                          .filter(s => s.id !== 'L-000')
                          .map(s => (
                            <option key={s.id} value={s.id}>
                              {s.isOriginWarehouse ? '🏬 [Bodega] ' : '📍 '} {s.id} - {s.name} ({s.municipality})
                            </option>
                          ))}
                      </select>

                      {stops[0].id && stops[0].id.startsWith('L-') && (
                        <button
                          type="button"
                          onClick={() => {
                            setStops(prev => prev.map((s, idx) => idx === 0 ? {
                              ...s,
                              id: 'ORIGIN',
                              name: s.name.replace(/^L-\d+\s*-\s*/, '')
                            } : s));
                          }}
                          className="text-[10px] text-blue-700 bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded-md font-bold shrink-0 transition-colors"
                          title="Desvincular del local registrado para escribir un nombre libre"
                        >
                          Escribir nuevo
                        </button>
                      )}
                    </div>

                    <div className="text-[10px] text-slate-500 font-mono">
                      GPS: Lat {stops[0].lat.toFixed(5)}, Lng {stops[0].lng.toFixed(5)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center bg-white/90 p-1.5 rounded-lg border border-blue-200">
                  <span className="text-[11px] text-slate-700 font-semibold flex items-center gap-1">
                    <Boxes className="w-3.5 h-3.5 text-blue-600" />
                    <span>Cargue Salida:</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={10}
                      step="any"
                      value={cediLoadingMinutes}
                      onChange={(e) => setCediLoadingMinutes(Math.max(10, parseInt(e.target.value) || 0))}
                      className="w-14 px-2 py-1 border border-slate-300 rounded font-mono font-bold text-center text-xs bg-white text-slate-900"
                    />
                    <span className="text-[10px] text-slate-500">min</span>
                  </div>
                </div>
              </div>

              {/* Destinos Intermedios (Tiendas, Bodegas y Puntos de Descargue con Nombre Editable) */}
              {stops.slice(1).map((stop, rawIdx) => {
                const idx = rawIdx + 1;
                return (
                  <div
                    key={stop.id}
                    className="p-3 rounded-xl border bg-white border-slate-200 hover:border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 flex-1">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-mono shrink-0">
                        {idx}
                      </span>
                      <div className="flex-1 space-y-1">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <input
                            type="text"
                            value={stop.name}
                            onChange={(e) => handleUpdateStopName(idx, e.target.value)}
                            placeholder="Escribe el nombre del local, cliente o bodega..."
                            className="flex-1 font-bold text-slate-900 text-xs bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-400 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-blue-400 transition-colors"
                          />
                          <select
                            value={stop.id && stop.id.startsWith('L-') ? stop.id : ''}
                            onChange={(e) => {
                              if (e.target.value) {
                                handleSetIntermediateStore(idx, e.target.value);
                              }
                            }}
                            className="text-[11px] font-semibold bg-white border border-slate-300 text-slate-700 rounded-lg px-2 py-1 shadow-2xs cursor-pointer focus:ring-1 focus:ring-blue-400 max-w-xs truncate shrink-0"
                          >
                            <option value="">🏪 Cargar de Locales Registrados...</option>
                            {getCustomStores().map(s => (
                              <option key={s.id} value={s.id}>
                                {s.isOriginWarehouse ? '🏬 [Bodega] ' : '📍 '} {s.id} - {s.name} ({s.municipality})
                              </option>
                            ))}
                          </select>
                          {stop.isWarehouse && (
                            <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold shrink-0 self-start sm:self-center">
                              Bodega
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Lat: {stop.lat.toFixed(5)}, Lng: {stop.lng.toFixed(5)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {/* Input de Tiempo de Descargue Estimado */}
                      <div className="flex items-center gap-1.5 bg-amber-50/70 border border-amber-200 px-2 py-1 rounded-lg">
                        <Timer className="w-3.5 h-3.5 text-amber-700" />
                        <span className="text-[10px] font-bold text-amber-900">Descargue:</span>
                        <input
                          type="number"
                          min={5}
                          step="any"
                          value={stop.unloadMinutes}
                          onChange={(e) => handleUpdateUnloadMinutes(idx, parseInt(e.target.value) || 0)}
                          className="w-12 px-1.5 py-0.5 border border-amber-300 rounded font-mono font-bold text-center text-xs bg-white text-slate-900"
                        />
                        <span className="text-[10px] text-amber-800">min</span>
                      </div>

                      {/* Botón para establecer esta parada como origen / salida */}
                      <button
                        type="button"
                        onClick={() => handleSetStopAsOrigin(idx)}
                        className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-amber-200 flex items-center gap-1 text-[10px] font-semibold"
                        title="Hacer que la ruta inicie desde esta bodega o tienda"
                      >
                        <Flag className="w-3.5 h-3.5 text-amber-600" />
                        <span className="hidden md:inline">Hacer Salida</span>
                      </button>

                      {/* Orden y Eliminar */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveStop(idx, 'up')}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                          title="Subir orden"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveStop(idx, 'down')}
                          disabled={idx >= stops.length - 1}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded cursor-pointer"
                          title="Bajar orden"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveStop(idx)}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                          title="Eliminar parada"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Parada Final de Retorno al CEDI si está activado */}
              {includeReturnToCedi && stops.length >= 2 && (
                <div className="p-2.5 rounded-xl border bg-purple-50/80 border-purple-300 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-700 text-white flex items-center justify-center font-bold text-xs font-mono shrink-0">
                      🏁
                    </span>
                    <div>
                      <div className="font-bold text-purple-950 flex items-center gap-1.5">
                        <Repeat className="w-3.5 h-3.5 text-purple-700" />
                        <span>Retorno al CEDI Hogar y Moda (Llegada a Base)</span>
                        <span className="text-[9px] bg-purple-200 text-purple-900 px-1.5 py-0.2 rounded font-bold">
                          FIN DEL CIRCUITO
                        </span>
                      </div>
                      <div className="text-[10px] text-purple-700">
                        Viaje de regreso desde {stops[stops.length - 1]?.name} hasta el CEDI en Caldas.
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-purple-900 font-mono">
                    Retorno Incluido
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* PASO 3: CÁLCULOS AUTOMÁTICOS DEL MAPA (KILOMETRAJE, TIEMPOS Y PEAJES) */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-4 font-mono shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-400" />
                <span className="font-sans font-bold text-sm text-white">
                  Cálculo del Circuito {includeReturnToCedi ? '(Ida y Retorno al CEDI)' : '(Solo Ida)'}
                </span>
              </div>
              {isCalculatingRoute && (
                <div className="flex items-center gap-1.5 text-xs text-blue-400 animate-pulse font-sans">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Calculando carreteras y peajes...</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[11px] text-slate-400 font-sans block">Distancia Total</span>
                <span className="text-xl font-bold text-white block mt-0.5">
                  {formatNumber(calculatedKm, 0)} km
                </span>
                <span className="text-[10px] text-blue-400 font-sans">
                  {includeReturnToCedi ? '🛣️ Ida y Vuelta CEDI' : '🛣️ Solo Ida'}
                </span>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[11px] text-slate-400 font-sans block">Horas de Conducción</span>
                <span className="text-xl font-bold text-amber-400 block mt-0.5">
                  {calculatedTransitHours.toFixed(1)} h
                </span>
                <span className="text-[10px] text-slate-400 font-sans">Rodamiento camión</span>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[11px] text-slate-400 font-sans block">Cargue y Descargues</span>
                <span className="text-xl font-bold text-sky-400 block mt-0.5">
                  {totalHandlingMinutes} min
                </span>
                <span className="text-[10px] text-slate-400 font-sans">
                  {cediLoadingMinutes}m cargue + {totalHandlingMinutes - cediLoadingMinutes}m descargue
                </span>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[11px] text-slate-400 font-sans block">Jornada Total</span>
                <span className="text-xl font-bold text-blue-400 block mt-0.5">
                  {totalOperationHours.toFixed(1)} h
                </span>
                <span className="text-[10px] text-slate-400 font-sans">
                  {totalOperationHours > 8 ? `+${(totalOperationHours - 8).toFixed(1)}h extras` : 'Jornada ordinaria'}
                </span>
              </div>
            </div>

            {/* Tramos Detallados del Recorrido (Incluyendo el Retorno) */}
            {roadLegs.length > 0 && (
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[11px] text-slate-400 font-sans block mb-2 font-semibold">
                  Tramos Viales del Recorrido ({roadLegs.length} tramos):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1 text-[11px]">
                  {roadLegs.map((leg) => {
                    const isReturnLeg = leg.toName.includes('CEDI') || leg.index === roadLegs.length && includeReturnToCedi;
                    return (
                      <div
                        key={leg.index}
                        className={`p-2 rounded-lg border flex items-center justify-between ${
                          isReturnLeg
                            ? 'bg-purple-950/60 border-purple-800 text-purple-200'
                            : 'bg-slate-800/60 border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="truncate pr-2 font-sans">
                          <span className="font-bold text-white font-mono mr-1.5">{leg.index}.</span>
                          <span className="truncate">{leg.fromName.split(',')[0]} → {leg.toName.split(',')[0]}</span>
                          {isReturnLeg && (
                            <span className="ml-1 text-[9px] bg-purple-900 text-purple-200 px-1 py-0.2 rounded font-bold">
                              RETORNO
                            </span>
                          )}
                        </div>
                        <div className="text-right font-mono shrink-0">
                          <span className="font-bold text-white">{leg.distanceKm} km</span>
                          <span className="text-[10px] text-slate-400 ml-1">({leg.durationMinutes} min)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Peajes: Detección automática en el recorrido completo */}
            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs font-sans mb-1.5">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  <span>Detección de Peajes {includeReturnToCedi ? '(Ida y Retorno)' : ''}:</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  {detectedTolls.length > 0 ? (
                    <span className="text-blue-400 font-semibold font-mono">
                      {detectedTolls.length} peaje(s) detectado(s)
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">Sin peajes detectados en esta ruta</span>
                  )}
                </span>
              </div>

              {detectedTolls.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-1">
                  {detectedTolls.map(t => (
                    <span key={t.id} className="px-2 py-0.5 bg-slate-800 text-amber-300 rounded text-[10px] border border-slate-700 flex items-center gap-1">
                      <span>🏷️ {t.name}</span>
                      <span className="text-white font-mono font-bold">({formatCOP(t.tariffCOP)})</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* PASO 4: DATOS DE LA RUTA Y PEAJES MANUALES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Nombre y Zona */}
            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Nombre Oficial de la Ruta:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: CEDI CALDAS - LA ESTRELLA - ENVIGADO"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900 uppercase"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Zona / Región:</label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-medium"
                >
                  <option value="Valle de Aburrá">Valle de Aburrá (Área Metropolitana)</option>
                  <option value="Oriente Antioqueño">Oriente Antioqueño</option>
                  <option value="Suroeste Antioqueño">Suroeste Antioqueño</option>
                  <option value="Norte Antioqueño">Norte Antioqueño</option>
                  <option value="Occidente Antioqueño">Occidente Antioqueño</option>
                  <option value="Eje Cafetero / Caldas">Eje Cafetero / Caldas</option>
                  <option value="Urabá Antioqueño">Urabá Antioqueño</option>
                  <option value="Nacional / Otra Región">Nacional / Otra Región</option>
                </select>
              </div>
            </div>

            {/* Ajuste Manual de Peajes */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-amber-600" />
                  <span>Peajes (Cálculo Automático / Ajuste Manual)</span>
                </label>
                <span className="text-[10px] text-slate-500">Editables libremente</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1">Cantidad de Peajes:</label>
                  <input
                    type="number"
                    min={0}
                    value={tollCount}
                    onChange={(e) => {
                      setIsManualTollOverride(true);
                      setTollCount(Math.max(0, parseInt(e.target.value) || 0));
                    }}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-600 block mb-1">Total Peajes (COP):</label>
                  <input
                    type="number"
                    step="any"
                    min={0}
                    value={tollCost}
                    onChange={(e) => {
                      setIsManualTollOverride(true);
                      setTollCost(Math.max(0, parseInt(e.target.value) || 0));
                    }}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-amber-800 bg-white"
                  />
                </div>
              </div>

              <p className="text-[10px] text-slate-500">
                💡 Si el circuito pasa por peajes en la ida o el retorno, se detectan automáticamente. Si deseas modificarlos o poner 0, puedes cambiarlos arriba.
              </p>
            </div>
          </div>

          {/* PASO 5: CONFIGURACIÓN ECONÓMICA & TARIFAS A COBRAR (FLETES, VIÁTICOS E IMPREVISTOS) */}
          <div className="bg-gradient-to-br from-blue-50/80 via-indigo-50/50 to-slate-50 border-2 border-blue-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>5. Tarifas a Cobrar al Cliente & Viáticos</span>
                    <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Configuración Comercial SCJ
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Establece el valor del flete que vas a cobrar por esta ruta (NPR y NLR), los viáticos para la tripulación y analiza el margen neto en tiempo real.
                  </p>
                </div>
              </div>

              {/* Botones de sugerencia rápida según margen objetivo */}
              <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                <span className="text-[10px] text-slate-500 font-semibold">Fijar Margen NPR:</span>
                <button
                  type="button"
                  onClick={() => {
                    const sug15 = Math.round((estCosts.totalCostNpr / 0.85) / 10000) * 10000;
                    setFreightTariffNpr(sug15);
                    if (!freightTariffNlr) setFreightTariffNlr(sug15);
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg font-bold text-[10px] transition-colors shadow-2xs cursor-pointer"
                  title={`Fijar flete sugerido con 15% de margen ($${formatCOP(Math.round((estCosts.totalCostNpr / 0.85) / 10000) * 10000)})`}
                >
                  +15% Margen
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const sug20 = Math.round((estCosts.totalCostNpr / 0.80) / 10000) * 10000;
                    setFreightTariffNpr(sug20);
                    if (!freightTariffNlr) setFreightTariffNlr(sug20);
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-800 border border-blue-300 rounded-lg font-bold text-[10px] transition-colors shadow-2xs cursor-pointer"
                  title={`Fijar flete sugerido con 20% de margen ($${formatCOP(Math.round((estCosts.totalCostNpr / 0.80) / 10000) * 10000)})`}
                >
                  +20% Margen
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const sug25 = Math.round((estCosts.totalCostNpr / 0.75) / 10000) * 10000;
                    setFreightTariffNpr(sug25);
                    if (!freightTariffNlr) setFreightTariffNlr(sug25);
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-indigo-800 border border-indigo-300 rounded-lg font-bold text-[10px] transition-colors shadow-2xs cursor-pointer"
                  title={`Fijar flete sugerido con 25% de margen ($${formatCOP(Math.round((estCosts.totalCostNpr / 0.75) / 10000) * 10000)})`}
                >
                  +25% Margen
                </button>
              </div>
            </div>

            {/* Grid de Inputs de Flete (NPR vs NLR) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Tarifa Flete Camión NPR */}
              <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <label className="font-bold text-slate-900 text-xs">
                      Valor Flete a Cobrar en NPR Turbo (2 Ejes):
                    </label>
                  </div>
                  <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-bold">
                    Camión Principal
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">$</span>
                  <input
                    type="number"
                    step="any"
                    min={0}
                    placeholder="Ej: 1220000"
                    value={freightTariffNpr}
                    onChange={(e) => setFreightTariffNpr(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-sm text-blue-950 focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                </div>

                {/* Simulador P&L NPR */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Costo operativo est. NPR:</span>
                    <span className="font-mono font-bold text-slate-800">{formatCOP(estCosts.totalCostNpr)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Utilidad neta estimada:</span>
                    <span className={`font-mono font-bold ${estCosts.netProfitNpr >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {estCosts.netProfitNpr >= 0 ? `+${formatCOP(estCosts.netProfitNpr)}` : formatCOP(estCosts.netProfitNpr)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200 font-bold">
                    <span className="text-slate-700">Margen neto proyectado:</span>
                    <span className={`px-2 py-0.2 rounded text-[10px] ${
                      estCosts.marginPctNpr >= 15
                        ? 'bg-emerald-100 text-emerald-800'
                        : estCosts.marginPctNpr > 0
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-rose-100 text-rose-800'
                    }`}>
                      {estCosts.marginPctNpr.toFixed(1)}% {estCosts.marginPctNpr >= 15 ? '✓ Rentable' : estCosts.marginPctNpr > 0 ? '⚠ Margen Bajo' : '✗ Pérdida'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tarifa Flete Camioneta NLR */}
              <div className="bg-white p-4 rounded-xl border border-sky-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                    <label className="font-bold text-slate-900 text-xs">
                      Valor Flete a Cobrar en Camioneta NLR:
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFreightTariffNlr(freightTariffNpr)}
                    className="text-[10px] text-sky-700 hover:underline font-bold cursor-pointer"
                  >
                    Igualar a NPR
                  </button>
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">$</span>
                  <input
                    type="number"
                    step="any"
                    min={0}
                    placeholder="Ej: 820000 (o igual a NPR)"
                    value={freightTariffNlr}
                    onChange={(e) => setFreightTariffNlr(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-sm text-sky-950 focus:ring-2 focus:ring-sky-600 bg-white"
                  />
                </div>

                {/* Simulador P&L NLR */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Costo operativo est. NLR:</span>
                    <span className="font-mono font-bold text-slate-800">{formatCOP(estCosts.totalCostNlr)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Utilidad neta estimada:</span>
                    <span className={`font-mono font-bold ${estCosts.netProfitNlr >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {estCosts.netProfitNlr >= 0 ? `+${formatCOP(estCosts.netProfitNlr)}` : formatCOP(estCosts.netProfitNlr)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200 font-bold">
                    <span className="text-slate-700">Margen neto proyectado:</span>
                    <span className={`px-2 py-0.2 rounded text-[10px] ${
                      estCosts.marginPctNlr >= 15
                        ? 'bg-emerald-100 text-emerald-800'
                        : estCosts.marginPctNlr > 0
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-rose-100 text-rose-800'
                    }`}>
                      {estCosts.marginPctNlr.toFixed(1)}% {estCosts.marginPctNpr >= 15 ? '✓ Rentable' : estCosts.marginPctNlr > 0 ? '⚠ Margen Bajo' : '✗ Pérdida'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Fila 2: Viáticos, Gastos Imprevistos y Peajes NLR */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <label className="font-bold text-slate-800 block mb-1 text-[11px] flex items-center justify-between">
                  <span>Viáticos del Viaje ($ COP):</span>
                  <Wallet className="w-3.5 h-3.5 text-amber-600" />
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-400 font-bold text-xs">$</span>
                  <input
                    type="number"
                    step="any"
                    min={0}
                    value={viaticosCOP}
                    onChange={(e) => setViaticosCOP(e.target.value)}
                    placeholder="0"
                    className="w-full pl-6 pr-2 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-xs text-slate-900 bg-white"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Alimentación / pernoctada de la tripulación.</p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <label className="font-bold text-slate-800 block mb-1 text-[11px] flex items-center justify-between">
                  <span>Gastos Imprevistos ($ COP):</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-400 font-bold text-xs">$</span>
                  <input
                    type="number"
                    step="any"
                    min={0}
                    value={additionalExpensesCOP}
                    onChange={(e) => setAdditionalExpensesCOP(e.target.value)}
                    placeholder="0"
                    className="w-full pl-6 pr-2 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-xs text-slate-900 bg-white"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Contingencias, engrase, montallanta menor.</p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <label className="font-bold text-slate-800 block mb-1 text-[11px] flex items-center justify-between">
                  <span>Peajes NLR Camioneta ($ COP):</span>
                  <DollarSign className="w-3.5 h-3.5 text-sky-600" />
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-400 font-bold text-xs">$</span>
                  <input
                    type="number"
                    step="any"
                    min={0}
                    value={tollCostNlr}
                    onChange={(e) => setTollCostNlr(e.target.value)}
                    placeholder="0"
                    className="w-full pl-6 pr-2 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-xs text-sky-900 bg-white"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Tarifa Cat I (si difiere de NPR {formatCOP(tollCost)}).</p>
              </div>

            </div>
          </div>

          {/* Notas u observaciones */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">Observaciones Operativas / Restricciones de Vía:</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Restricción vehicular por obras en variante, muelle estrecho en tienda 2..."
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700"
            />
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 bg-white sticky bottom-0">
            <div className="text-slate-600 text-[11px] font-mono space-y-0.5">
              <div>
                Circuito: <span className="font-bold text-slate-900">{calculatedKm} km</span> • <span className="font-bold text-slate-900">{calculatedTransitHours}h rodando</span> • <span className="font-bold text-slate-900">{totalHandlingMinutes}m cargue</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Flete NPR: <strong className="text-blue-900">{freightTariffNpr ? formatCOP(Number(freightTariffNpr)) : 'Sin fijar'}</strong></span>
                <span>• Utilidad: <strong className={estCosts.netProfitNpr >= 0 ? 'text-emerald-700' : 'text-rose-700'}>{formatCOP(estCosts.netProfitNpr)}</strong></span>
                <span className="font-bold text-slate-800">({estCosts.marginPctNpr.toFixed(1)}% margen)</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-semibold cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Ruta y Flete</span>
              </button>
            </div>
          </div>

          </form>
        </div>

        {/* Selector de ubicación visual con mapa */}
        <LocationPicker
          isOpen={isLocationPickerOpen}
          onClose={() => setIsLocationPickerOpen(false)}
          onLocationSelect={(location) => {
            handleAddStopFromMap(location.name, location.lat, location.lng, false, 30);
          }}
        />
      </div>
    </div>
  );
};
