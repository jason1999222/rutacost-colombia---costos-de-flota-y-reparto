import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  useMap,
  useMapsLibrary,
  MapMouseEvent
} from '@vis.gl/react-google-maps';
import { OpenStreetMapCanvas } from './OpenStreetMapCanvas';
import { ErrorBoundary } from './ErrorBoundary';
import { DeliveryRoute, VehicleProfile, LaborConfig, RouteCostBreakdown } from '../types/logistics';
import { calculateRouteCost, formatCOP, formatNumber } from '../utils/costCalculator';
import {
  resolveRouteCoordinates,
  calculatePathTotalKm,
  COLOMBIA_LOCATIONS,
  CEDI_CALDAS,
  GeoCoord
} from '../data/colombiaCoordinates';
import {
  HOGAR_Y_MODA_STORES,
  HOGAR_Y_MODA_STORES_MAP,
  CEDI_CALDAS_PORTAL_DEL_SUR,
  HogarYModaStore,
  getCustomStores,
  getCustomStoresMap,
  saveCustomStores,
  addCustomStore,
  updateStoreCoordinates
} from '../data/hogarYModaStores';
import { saveStoreToFirestore } from '../services/firebase';
import { fetchRoadRoute, RouteLegInfo } from '../utils/roadRoutingService';
import { KNOWN_TOLLS, TollStation } from '../data/colombiaTolls';
import {
  Navigation,
  MapPin,
  AlertTriangle,
  Clock,
  Fuel,
  DollarSign,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Car,
  Save,
  FileText,
  MousePointerClick,
  Check,
  RotateCcw,
  Sparkles,
  Info,
  Building2,
  Route,
  Milestone,
  Edit2,
  Compass,
  Eye,
  EyeOff,
  Loader2,
  ListOrdered,
  Flag,
  Repeat,
  Receipt,
  Truck,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Wrench,
  Search,
  X,
  ShieldCheck,
  Scale,
  Layers,
  Maximize2,
  Minimize2,
  Share2,
  HelpCircle,
  CreditCard,
  Key
} from 'lucide-react';

interface GoogleMapsRouteViewerProps {
  routes: DeliveryRoute[];
  selectedVehicle: VehicleProfile;
  vehicles?: VehicleProfile[];
  laborConfig: LaborConfig;
  onUpdateRoute: (updatedRoute: DeliveryRoute) => void;
  onOpenImportModal: () => void;
  onNavigateToDispatch?: (routeId: string) => void;
  initialRouteId?: string | null;
}

// Capa de tráfico en tiempo real oficial de Google Maps con protección total
function TrafficLayerOverlay({ enabled }: { enabled: boolean }) {
  const map = useMap();
  const trafficLayerRef = useRef<any>(null);

  useEffect(() => {
    if (!map) return;
    const g = typeof window !== 'undefined' ? (window as any).google : undefined;
    if (!g?.maps?.TrafficLayer) return;

    try {
      if (!trafficLayerRef.current) {
        trafficLayerRef.current = new g.maps.TrafficLayer();
      }

      if (enabled) {
        trafficLayerRef.current.setMap(map);
      } else {
        trafficLayerRef.current.setMap(null);
      }
    } catch (err) {
      console.warn('TrafficLayerOverlay warning:', err);
    }

    return () => {
      try {
        if (trafficLayerRef.current) {
          trafficLayerRef.current.setMap(null);
        }
      } catch (e) {}
    };
  }, [map, enabled]);

  return null;
}

// Auto-ajuste de cámara a los puntos activos con protección total
function FitBounds({ coords, focusCediTrigger }: { coords: GeoCoord[]; focusCediTrigger?: number }) {
  const map = useMap();

  useEffect(() => {
    if (!map || coords.length === 0) return;

    if (focusCediTrigger && focusCediTrigger > 0) {
      try {
        map.panTo({ lat: 6.11888, lng: -75.62755 });
        map.setZoom(18);
      } catch (e) {}
      return;
    }

    if (coords.length === 1) {
      try {
        map.panTo({ lat: coords[0].lat, lng: coords[0].lng });
        map.setZoom(14);
      } catch (e) {}
      return;
    }

    const timeout = setTimeout(() => {
      if (!map) return;
      const g = typeof window !== 'undefined' ? (window as any).google : undefined;
      if (!g?.maps?.LatLngBounds) return;
      try {
        const bounds = new g.maps.LatLngBounds();
        coords.forEach(c => {
          if (typeof c.lat === 'number' && typeof c.lng === 'number' && !isNaN(c.lat) && !isNaN(c.lng)) {
            bounds.extend({ lat: c.lat, lng: c.lng });
          }
        });
        map.fitBounds(bounds, { top: 75, right: 75, bottom: 75, left: 75 });
      } catch (e) {
        console.warn('FitBounds warning:', e);
      }
    }, 150);

    return () => clearTimeout(timeout);
  }, [map, coords, focusCediTrigger]);

  return null;
}

// Controlador para centrar/acercar cámara a un punto específico de búsqueda o tienda
function MapController({ panTarget }: { panTarget: { lat: number; lng: number; zoom?: number; timestamp: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !panTarget) return;
    try {
      map.panTo({ lat: panTarget.lat, lng: panTarget.lng });
      if (panTarget.zoom) {
        map.setZoom(panTarget.zoom);
      }
    } catch (e) {}
  }, [map, panTarget]);
  return null;
}

// Trazado inteligente de la ruta: cálculo en tiempo real con Google Maps DirectionsService protegido
interface RouteDirectionsProps {
  coords: GeoCoord[];
  followRoads: boolean;
  onRouteCalculated?: (drivingKm: number, drivingMinutes: number, legs: RouteLegInfo[], roadPath?: { lat: number; lng: number }[]) => void;
  onCalculatingChange?: (calculating: boolean) => void;
}

function RouteDirections({ coords, followRoads, onRouteCalculated, onCalculatingChange }: RouteDirectionsProps) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const borderPolylineRef = useRef<any>(null);
  const roadPolylineRef = useRef<any>(null);

  useEffect(() => {
    if (!map) return;
    const g = typeof window !== 'undefined' ? (window as any).google : undefined;

    if (borderPolylineRef.current) {
      try { borderPolylineRef.current.setMap(null); } catch (e) {}
      borderPolylineRef.current = null;
    }
    if (roadPolylineRef.current) {
      try { roadPolylineRef.current.setMap(null); } catch (e) {}
      roadPolylineRef.current = null;
    }

    const validCoords = coords.filter(c => typeof c.lat === 'number' && typeof c.lng === 'number' && !isNaN(c.lat) && !isNaN(c.lng));
    if (validCoords.length < 2) {
      if (onCalculatingChange) onCalculatingChange(false);
      return;
    }

    let isMounted = true;

    if (followRoads) {
      if (onCalculatingChange) onCalculatingChange(true);

      const runFallback = () => {
        fetchRoadRoute(validCoords)
          .then(res => {
            if (!isMounted || !map) return;
            if (onCalculatingChange) onCalculatingChange(false);

            const path = res.roadPoints;

            if (g?.maps?.Polyline) {
              try {
                borderPolylineRef.current = new g.maps.Polyline({
                  path,
                  geodesic: false,
                  strokeColor: '#1e3a8a',
                  strokeOpacity: 0.95,
                  strokeWeight: 8,
                  map
                });

                roadPolylineRef.current = new g.maps.Polyline({
                  path,
                  geodesic: false,
                  strokeColor: '#2563eb',
                  strokeOpacity: 1.0,
                  strokeWeight: 4,
                  map
                });
              } catch (e) {
                console.warn('Polyline creation warning:', e);
              }
            }

            if (onRouteCalculated) {
              onRouteCalculated(res.totalKm, res.totalMinutes, res.legs, path);
            }
          })
          .catch(() => {
            if (!isMounted || !map) return;
            if (onCalculatingChange) onCalculatingChange(false);

            const path = validCoords.map(c => ({ lat: c.lat, lng: c.lng }));
            if (g?.maps?.Polyline) {
              try {
                roadPolylineRef.current = new g.maps.Polyline({
                  path,
                  geodesic: true,
                  strokeColor: '#2563eb',
                  strokeOpacity: 0.85,
                  strokeWeight: 4,
                  map
                });
              } catch (e) {}
            }
            if (onRouteCalculated) {
              onRouteCalculated(0, 0, [], path);
            }
          });
      };

      // Si Google Maps DirectionsService está disponible, calculamos la ruta con tráfico en tiempo real y cierres viales
      const ServiceConstructor = routesLib?.DirectionsService || g?.maps?.DirectionsService;
      if (ServiceConstructor && g?.maps?.TravelMode) {
        try {
          const directionsService = new ServiceConstructor();
          const origin = { lat: validCoords[0].lat, lng: validCoords[0].lng };
          const destination = { lat: validCoords[validCoords.length - 1].lat, lng: validCoords[validCoords.length - 1].lng };
          const waypoints = validCoords.slice(1, -1).map(c => ({
            location: { lat: c.lat, lng: c.lng },
            stopover: true
          }));

          directionsService.route(
            {
              origin,
              destination,
              waypoints,
              travelMode: g.maps.TravelMode.DRIVING || 'DRIVING',
              drivingOptions: {
                departureTime: new Date(),
                trafficModel: g.maps.TrafficModel?.BEST_GUESS || 'bestguess'
              },
              optimizeWaypoints: false,
              provideRouteAlternatives: false
            },
            (result: any, status: any) => {
              if (!isMounted || !map) return;
              if (onCalculatingChange) onCalculatingChange(false);

              if (status === (g.maps?.DirectionsStatus?.OK || 'OK') && result && result.routes && result.routes.length > 0) {
                const route = result.routes[0];
                const path: { lat: number; lng: number }[] = route.overview_path.map((pt: any) => ({
                  lat: pt.lat(),
                  lng: pt.lng()
                }));

                let totalMeters = 0;
                let totalSeconds = 0;
                const legs: RouteLegInfo[] = route.legs.map((leg: any, idx: number) => {
                  totalMeters += leg.distance?.value || 0;
                  const durSec = leg.duration_in_traffic?.value || leg.duration?.value || 0;
                  totalSeconds += durSec;
                  return {
                    index: idx + 1,
                    fromName: validCoords[idx]?.name || `Parada #${idx}`,
                    toName: validCoords[idx + 1]?.name || `Parada #${idx + 1}`,
                    distanceKm: Math.round(((leg.distance?.value || 0) / 1000) * 10) / 10,
                    durationMinutes: Math.round(durSec / 60),
                    stepsCount: leg.steps?.length || 0
                  };
                });

                const totalKm = Math.round((totalMeters / 1000) * 10) / 10;
                const totalMinutes = Math.round(totalSeconds / 60);

                if (g?.maps?.Polyline) {
                  try {
                    borderPolylineRef.current = new g.maps.Polyline({
                      path,
                      geodesic: false,
                      strokeColor: '#1e3a8a',
                      strokeOpacity: 0.95,
                      strokeWeight: 8,
                      map
                    });

                    roadPolylineRef.current = new g.maps.Polyline({
                      path,
                      geodesic: false,
                      strokeColor: '#2563eb',
                      strokeOpacity: 1.0,
                      strokeWeight: 4,
                      map
                    });
                  } catch (e) {}
                }

                if (route.bounds) {
                  try {
                    map.fitBounds(route.bounds, { top: 70, right: 70, bottom: 70, left: 70 });
                  } catch (e) {}
                }

                if (onRouteCalculated) {
                  onRouteCalculated(totalKm, totalMinutes, legs, path);
                }
              } else {
                console.warn('Google Maps Directions status not OK, trying fallback:', status);
                runFallback();
              }
            }
          );
        } catch (e) {
          console.warn('Google Maps Directions exception, running fallback:', e);
          runFallback();
        }
      } else {
        runFallback();
      }
    } else {
      if (onCalculatingChange) onCalculatingChange(false);
      const path = validCoords.map(c => ({ lat: c.lat, lng: c.lng }));
      if (g?.maps?.Polyline) {
        try {
          roadPolylineRef.current = new g.maps.Polyline({
            path,
            geodesic: true,
            strokeColor: '#2563eb',
            strokeOpacity: 0.85,
            strokeWeight: 4,
            map
          });
        } catch (e) {}
      }
      if (onRouteCalculated) {
        onRouteCalculated(0, 0, [], path);
      }
    }

    return () => {
      isMounted = false;
      if (borderPolylineRef.current) {
        try { borderPolylineRef.current.setMap(null); } catch (e) {}
      }
      if (roadPolylineRef.current) {
        try { roadPolylineRef.current.setMap(null); } catch (e) {}
      }
    };
  }, [coords, followRoads, map, routesLib, onRouteCalculated, onCalculatingChange]);

  return null;
}

export const GoogleMapsRouteViewer: React.FC<GoogleMapsRouteViewerProps> = ({
  routes = [],
  selectedVehicle,
  vehicles = [],
  laborConfig,
  onUpdateRoute,
  onOpenImportModal,
  onNavigateToDispatch,
  initialRouteId
}) => {
  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    return (typeof window !== 'undefined' ? localStorage.getItem('scj_google_maps_api_key') : '') || '';
  });
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [apiKeyInput, setApiKeyInput] = useState<string>(() => {
    return (typeof window !== 'undefined' ? localStorage.getItem('scj_google_maps_api_key') : '') || '';
  });

  const apiKey = (customApiKey && customApiKey.trim().length > 0 && !customApiKey.includes('AIzaSyCpf'))
    ? customApiKey.trim()
    : (import.meta.env.VITE_GOOGLE_MAPS_API_KEY );

  // Motor cartográfico: 'google' (Google Maps) o 'osm' (OpenStreetMap libre y seguro)
  const [mapEngine, setMapEngine] = useState<'google' | 'osm'>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('scj_map_engine') : null;
    return (saved === 'google' || saved === 'osm') ? saved : 'google';
  });
  const [googleMapsErrorNotice, setGoogleMapsErrorNotice] = useState<string | null>(null);

  // Escuchar fallos globales de autenticación de Google Maps (BillingNotEnabledMapError, cuota, etc.)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prevAuthFailure = (window as any).gm_authFailure;
    (window as any).gm_authFailure = () => {
      console.warn('⚠️ Google Maps gm_authFailure detectado');
      setGoogleMapsErrorNotice('La API de Google Maps reportó restricción de clave o facturación pendiente en Google Cloud. Puedes usar OpenStreetMap (100% libre) o configurar tu propia Clave API con el botón [API Key].');
      if (prevAuthFailure) prevAuthFailure();
    };
    return () => {
      (window as any).gm_authFailure = prevAuthFailure;
    };
  }, []);

  // Ruta seleccionada actualmente de la base de datos o archivo
  const [selectedRouteId, setSelectedRouteId] = useState<string>(routes[0]?.id || 'CUSTOM');
  const [showTrafficLayer, setShowTrafficLayer] = useState<boolean>(true);
  const [showTollsLayer, setShowTollsLayer] = useState<boolean>(true);
  const [activeSimulatedVehicleType, setActiveSimulatedVehicleType] = useState<'NPR' | 'NLR'>('NPR');
  const [clickToAddEnabled, setClickToAddEnabled] = useState<boolean>(true);
  const [showTownCatalog, setShowTownCatalog] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [focusCediTrigger, setFocusCediTrigger] = useState<number>(0);
  const [followRoads, setFollowRoads] = useState<boolean>(true);
  const [drivingMetrics, setDrivingMetrics] = useState<{ km: number; minutes: number } | null>(null);
  const [roadLegs, setRoadLegs] = useState<RouteLegInfo[]>([]);
  const [isCalculatingRoad, setIsCalculatingRoad] = useState<boolean>(false);
  const [includeReturnCircuit, setIncludeReturnCircuit] = useState<boolean>(true);
  const [showNationalTollCatalogModal, setShowNationalTollCatalogModal] = useState<boolean>(false);
  const [nationalTollFilter, setNationalTollFilter] = useState<string>('');
  const [manuallyAddedTolls, setManuallyAddedTolls] = useState<TollStation[]>([]);
  const [excludedTollIds, setExcludedTollIds] = useState<string[]>([]);
  const [calculatedRoadPath, setCalculatedRoadPath] = useState<{ lat: number; lng: number }[]>([]);

  // Estados de funcionalidad avanzada del mapa
  const [mapTypeId, setMapTypeId] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showQuotaModal, setShowQuotaModal] = useState<boolean>(false);
  const [panTarget, setPanTarget] = useState<{ lat: number; lng: number; zoom?: number; timestamp: number } | null>(null);
  const [mapSearchQuery, setMapSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Catálogo de peajes 2026 con persistencia de modificaciones del usuario pero sincronizando SIEMPRE coordenadas exactas de Google Maps
  const [allTolls] = useState<TollStation[]>(() => {
    const saved = localStorage.getItem('scj_custom_tolls');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return KNOWN_TOLLS.map(kt => {
            const userEdit = parsed.find((p: TollStation) => p.id === kt.id);
            if (userEdit) {
              return {
                ...userEdit,
                lat: kt.lat,
                lng: kt.lng,
                name: kt.name,
                corridor: kt.corridor,
                department: kt.department,
                municipality: kt.municipality
              };
            }
            return kt;
          });
        }
      } catch (e) {}
    }
    return KNOWN_TOLLS;
  });

  const handleRouteCalculated = useCallback((drivingKm: number, drivingMinutes: number, legs: RouteLegInfo[], roadPath?: { lat: number; lng: number }[]) => {
    setDrivingMetrics({ km: Math.round(drivingKm * 10) / 10, minutes: Math.round(drivingMinutes) });
    setRoadLegs(legs);
    if (roadPath && roadPath.length > 0) {
      setCalculatedRoadPath(roadPath);
    }
  }, []);

  // Puntos geográficos interactivos de la ruta en el mapa
  const [activePoints, setActivePoints] = useState<GeoCoord[]>(() => {
    if (routes[0]) {
      return resolveRouteCoordinates(routes[0].name, routes[0].storeIds, routes[0].originStoreId);
    }
    return [CEDI_CALDAS];
  });

  // Puntos efectivos considerando si se incluye el retorno a la bodega de salida (origen)
  const effectiveRoutingPoints = useMemo(() => {
    if (!includeReturnCircuit || activePoints.length < 2) return activePoints;
    const origin = activePoints[0];
    const last = activePoints[activePoints.length - 1];
    if (Math.abs(last.lat - origin.lat) < 0.001 && Math.abs(last.lng - origin.lng) < 0.001) {
      return activePoints;
    }
    return [
      ...activePoints,
      {
        ...origin,
        name: `Retorno a ${origin.name}`,
        municipality: origin.municipality,
        isWarehouse: true,
        dischargeMinutes: 0
      }
    ];
  }, [activePoints, includeReturnCircuit]);

  // Si estamos en OpenStreetMap y se pide trazar por carreteras reales, consultar OSRM
  useEffect(() => {
    if (mapEngine === 'osm' && followRoads && effectiveRoutingPoints.length >= 2) {
      setIsCalculatingRoad(true);
      fetchRoadRoute(effectiveRoutingPoints)
        .then(res => {
          setIsCalculatingRoad(false);
          handleRouteCalculated(res.totalKm, res.totalMinutes, res.legs, res.roadPoints);
        })
        .catch(err => {
          setIsCalculatingRoad(false);
          console.warn('Error calculando ruta en OpenStreetMap:', err);
        });
    }
  }, [mapEngine, followRoads, effectiveRoutingPoints, handleRouteCalculated]);

  // Nombre editable para la ruta
  const [customRouteName, setCustomRouteName] = useState<string>(routes[0]?.name || 'NUEVA RUTA DESDE MAPA');

  // Estado dinámico de tiendas Hogar y Moda y sincronización
  const [allStores, setAllStores] = useState<HogarYModaStore[]>(() => getCustomStores());

  // Estado para la edición inline de coordenadas GPS de paradas
  const [editingPointIndex, setEditingPointIndex] = useState<number | null>(null);
  const [editingPointData, setEditingPointData] = useState<{
    lat: number;
    lng: number;
    name: string;
    address: string;
    storeId?: string;
    dischargeMinutes: number;
    rawPaste: string;
  } | null>(null);

  // Escuchar eventos globales de sincronización de tiendas (desde Firestore o MasterData)
  useEffect(() => {
    const handleStoresUpdated = () => {
      const freshStores = getCustomStores();
      setAllStores(freshStores);
      const storeMap = getCustomStoresMap();
      setActivePoints(prev => prev.map(pt => {
        if (pt.storeId && storeMap[pt.storeId]) {
          const s = storeMap[pt.storeId];
          return {
            ...pt,
            lat: s.lat,
            lng: s.lng,
            name: s.name,
            municipality: s.municipality,
            dischargeMinutes: s.dischargeMinutes
          };
        }
        return pt;
      }));
    };
    window.addEventListener('scj_stores_updated', handleStoresUpdated);
    return () => window.removeEventListener('scj_stores_updated', handleStoresUpdated);
  }, []);

  const handleOpenEditPointModal = (index: number) => {
    const pt = activePoints[index];
    if (!pt) return;
    setEditingPointIndex(index);
    setEditingPointData({
      lat: pt.lat,
      lng: pt.lng,
      name: pt.name,
      address: '',
      storeId: pt.storeId,
      dischargeMinutes: pt.dischargeMinutes || (index === 0 ? 120 : 45),
      rawPaste: `${pt.lat}, ${pt.lng}`
    });
  };

  const handleParsePointCoordinates = (raw: string) => {
    if (!editingPointData) return;
    setEditingPointData(prev => prev ? ({ ...prev, rawPaste: raw }) : null);
    if (!raw.trim()) return;

    const atMatch = raw.match(/@(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
    if (atMatch) {
      setEditingPointData(prev => prev ? ({ ...prev, lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) }) : null);
      return;
    }

    const qMatch = raw.match(/[?&](?:q|destination)=(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
    if (qMatch) {
      setEditingPointData(prev => prev ? ({ ...prev, lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) }) : null);
      return;
    }

    const pairMatch = raw.match(/(-?\d+\.\d+)[\s,;]+(-?\d+\.\d+)/);
    if (pairMatch) {
      setEditingPointData(prev => prev ? ({ ...prev, lat: parseFloat(pairMatch[1]), lng: parseFloat(pairMatch[2]) }) : null);
      return;
    }
  };

  const handleSaveEditedPoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPointIndex === null || !editingPointData) return;

    const newLat = Number(editingPointData.lat);
    const newLng = Number(editingPointData.lng);

    // 1. Actualizar punto en activePoints
    setActivePoints(prev => {
      const copy = [...prev];
      copy[editingPointIndex] = {
        ...copy[editingPointIndex],
        lat: newLat,
        lng: newLng,
        name: editingPointData.name,
        dischargeMinutes: editingPointData.dischargeMinutes
      };
      return copy;
    });

    // 2. Si es una tienda oficial registrada (o CEDI L-000), actualizar también en la base de datos de tiendas y Firestore
    if (editingPointData.storeId) {
      const storeMap = getCustomStoresMap();
      const existing = storeMap[editingPointData.storeId] || HOGAR_Y_MODA_STORES_MAP[editingPointData.storeId];
      if (existing) {
        const updatedStore: HogarYModaStore = {
          ...existing,
          lat: newLat,
          lng: newLng,
          name: editingPointData.name,
          address: editingPointData.address || existing.address,
          dischargeMinutes: editingPointData.dischargeMinutes,
          updatedAt: new Date().toISOString()
        };
        addCustomStore(updatedStore);
        try {
          await saveStoreToFirestore(updatedStore);
          setStatusMessage(`📍 Coordenadas de "${updatedStore.name}" (${updatedStore.id}) guardadas en Firestore y actualizadas en el mapa.`);
        } catch (err) {
          setStatusMessage(`📍 Coordenadas de "${updatedStore.name}" actualizadas en el mapa.`);
        }
      }
    } else {
      setStatusMessage(`📍 Coordenada de parada actualizada a [${newLat.toFixed(5)}, ${newLng.toFixed(5)}].`);
    }

    setEditingPointIndex(null);
    setEditingPointData(null);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Si el usuario cambia la ruta en el selector, cargar sus puntos automáticamente
  const handleSelectRoute = (routeId: string) => {
    setSelectedRouteId(routeId);
    setManuallyAddedTolls([]);
    setExcludedTollIds([]);
    setCalculatedRoadPath([]);
    if (routeId === 'CUSTOM') {
      setActivePoints([CEDI_CALDAS]);
      setCustomRouteName('NUEVA RUTA EN MAPA');
    } else {
      const found = routes.find(r => r.id === routeId);
      if (found) {
        const coords = resolveRouteCoordinates(found.name, found.storeIds, found.originStoreId);
        setActivePoints(coords);
        setCustomRouteName(found.name);
      }
    }
  };

  // Si se abre el mapa enfocado en una ruta específica
  useEffect(() => {
    if (initialRouteId) {
      handleSelectRoute(initialRouteId);
    }
  }, [initialRouteId]);

  // Clic directo en cualquier parte del mapa para agregar una parada
  const handleMapClick = (e: MapMouseEvent) => {
    if (!clickToAddEnabled) return;
    const latLng = e.detail.latLng;
    if (!latLng) return;

    const newPoint: GeoCoord = {
      lat: latLng.lat,
      lng: latLng.lng,
      name: `Parada ${activePoints.length} (${latLng.lat.toFixed(3)}, ${latLng.lng.toFixed(3)})`,
      municipality: "Punto en Mapa",
      dischargeMinutes: 45
    };

    setActivePoints(prev => [...prev, newPoint]);
    setStatusMessage(`Parada agregada en el mapa: [${latLng.lat.toFixed(4)}, ${latLng.lng.toFixed(4)}]`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Agregar local oficial de Hogar y Moda del catálogo maestro
  const handleAddStore = (storeId: string) => {
    if (!storeId) return;
    const storeMap = getCustomStoresMap();
    const store = storeMap[storeId] || HOGAR_Y_MODA_STORES_MAP[storeId];
    if (!store) return;

    if (activePoints.some(p => p.storeId === store.id)) {
      setStatusMessage(`El local ${store.name} (${store.id}) ya está en la ruta.`);
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }

    const newPoint: GeoCoord = {
      lat: store.lat,
      lng: store.lng,
      name: store.name,
      municipality: store.municipality,
      storeId: store.id,
      dischargeMinutes: store.dischargeMinutes,
      isWarehouse: Boolean(store.isOriginWarehouse || store.id === 'L-000')
    };

    setActivePoints(prev => [...prev, newPoint]);
    setStatusMessage(`Local añadido: ${store.name} (${store.dischargeMinutes} min descargue)`);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Establecer una bodega o tienda como punto de salida (origen)
  const handleSetOriginStore = (storeId: string) => {
    const storeMap = getCustomStoresMap();
    const store = storeMap[storeId] || HOGAR_Y_MODA_STORES_MAP[storeId];
    if (!store) return;

    const newOrigin: GeoCoord = {
      lat: store.lat,
      lng: store.lng,
      name: store.name,
      municipality: store.municipality,
      storeId: store.id,
      dischargeMinutes: store.dischargeMinutes,
      isWarehouse: Boolean(store.isOriginWarehouse || store.id === 'L-000')
    };

    setActivePoints(prev => {
      const rest = prev.slice(1).filter(p => p.storeId !== store.id);
      return [newOrigin, ...rest];
    });
    setStatusMessage(`Bodega de salida cambiada a: ${store.name}`);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Establecer un punto existente de la ruta como el origen de salida
  const handleSetPointAsOrigin = (index: number) => {
    if (index === 0 || index >= activePoints.length) return;
    const selected = activePoints[index];
    const rest = activePoints.filter((_, i) => i !== index);
    setActivePoints([{ ...selected, isWarehouse: true }, ...rest]);
    setStatusMessage(`Punto de salida cambiado a: ${selected.name}`);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Agregar municipio predefinido del catálogo
  const handleAddTown = (townKey: string) => {
    const town = COLOMBIA_LOCATIONS[townKey];
    if (!town) return;

    // Si ya está como parada, evitar duplicar
    if (activePoints.some(p => p.name === town.name)) {
      setStatusMessage(`La parada ${town.name} ya está en la ruta activa.`);
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }

    setActivePoints(prev => [...prev, { ...town, dischargeMinutes: town.dischargeMinutes || 45 }]);
    setStatusMessage(`Municipio añadido: ${town.name}`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Reordenar paradas (permite mover la parada 1 arriba para intercambiar la salida)
  const handleMovePoint = (index: number, direction: 'UP' | 'DOWN') => {
    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= activePoints.length) return;

    const copy = [...activePoints];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    setActivePoints(copy);
  };

  // Eliminar una parada
  const handleRemovePoint = (index: number) => {
    if (activePoints.length <= 1) {
      setStatusMessage("La ruta debe contener al menos un punto.");
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }
    setActivePoints(prev => prev.filter((_, i) => i !== index));
  };

  // Reiniciar a solo base CEDI Caldas - Portal Industrial del Sur
  const handleResetPoints = () => {
    setActivePoints([CEDI_CALDAS]);
  };

  // Cálculos dinámicos de la ruta trazada en el mapa
  const geometricKm = useMemo(() => {
    return calculatePathTotalKm(activePoints);
  }, [activePoints]);

  const estimatedKm = useMemo(() => {
    if (followRoads && drivingMetrics && activePoints.length >= 2) {
      return drivingMetrics.km;
    }
    return geometricKm;
  }, [followRoads, drivingMetrics, activePoints.length, geometricKm]);

  const estimatedTransitHours = useMemo(() => {
    if (estimatedKm === 0) return 0;
    if (followRoads && drivingMetrics && activePoints.length >= 2) {
      return Math.max(0.5, Math.round((drivingMetrics.minutes / 60) * 10) / 10);
    }
    // Velocidad promedio de flota pesada en montaña colombiana: ~35-40 km/h
    return Math.max(1, Math.round((estimatedKm / 38) * 10) / 10);
  }, [estimatedKm, followRoads, drivingMetrics, activePoints.length]);

  // Desglose oficial de tiempos de servicio:
  // 120 min de cargue inicial de flota en CEDI Caldas / Portal Industrial del Sur
  // + suma del tiempo de descargue por cada local de Hogar y Moda visitado (30, 45, 60 o 90 min)
  const loadingTimeBreakdown = useMemo(() => {
    const cediLoadingMinutes = 120; // 2 horas de cargue y despacho en bodega principal
    let storesDischargeMinutes = 0;
    const storeLegs: { id: string; name: string; municipality: string; dischargeMinutes: number }[] = [];

    for (let i = 1; i < activePoints.length; i++) {
      const pt = activePoints[i];
      let mins = pt.dischargeMinutes;
      if (!mins && pt.storeId && HOGAR_Y_MODA_STORES_MAP[pt.storeId]) {
        mins = HOGAR_Y_MODA_STORES_MAP[pt.storeId].dischargeMinutes;
      }
      if (!mins) mins = 45;
      storesDischargeMinutes += mins;
      storeLegs.push({
        id: pt.storeId || `POS-${i}`,
        name: pt.name,
        municipality: pt.municipality || '',
        dischargeMinutes: mins
      });
    }

    const totalMinutes = cediLoadingMinutes + storesDischargeMinutes;
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

    return {
      cediLoadingMinutes,
      storesDischargeMinutes,
      totalMinutes,
      totalHours,
      storeLegs,
      visitedStoresCount: storeLegs.length
    };
  }, [activePoints]);

  const estimatedLoadingMinutes = loadingTimeBreakdown.totalMinutes;

  const estimatedTotalHours = useMemo(() => {
    return Math.round((estimatedTransitHours + loadingTimeBreakdown.totalHours) * 10) / 10;
  }, [estimatedTransitHours, loadingTimeBreakdown.totalHours]);

  const existingRoute = useMemo(() => routes.find(r => r.id === selectedRouteId), [routes, selectedRouteId]);

  // Detección precisa y georreferenciada de peajes a lo largo del corredor vial
  const corridorTolls = useMemo(() => {
    const matched: TollStation[] = [];
    const normalize = (val: any) => {
      if (!val) return '';
      const str = Array.isArray(val) ? val.join(' ') : String(val);
      return str
         .toLowerCase()
         .normalize('NFD')
         .replace(/[\u0300-\u036f]/g, '')
         .trim();
    };

    const routeTollStationsNorm = normalize(existingRoute?.tollStations);
    const customRouteNameNorm = normalize(customRouteName);

    const tollStationsRaw = existingRoute?.tollStations;
    const tollStationsStr = typeof tollStationsRaw === 'string'
      ? tollStationsRaw
      : (Array.isArray(tollStationsRaw) ? (tollStationsRaw as any[]).join(' + ') : '');

    allTolls.forEach(toll => {
      // 0. Si el usuario lo excluyó manualmente de esta simulación
      if (excludedTollIds.includes(toll.id)) return;

      const tollNameNorm = normalize(toll?.name).replace(/^peaje\s+/, '').trim();
      const tollCorridorNorm = normalize(toll?.corridor);

      // Comprobar coincidencia directa o por palabras clave normalizadas (sin tildes)
      const explicitInRoute = routeTollStationsNorm.length > 0 && (
        routeTollStationsNorm.includes(tollNameNorm) ||
        (tollNameNorm.includes('amaga') && routeTollStationsNorm.includes('amaga')) ||
        (tollNameNorm.includes('pintada') && routeTollStationsNorm.includes('pintada')) ||
        (tollNameNorm.includes('supia') && routeTollStationsNorm.includes('supia')) ||
        (tollNameNorm.includes('guaico') && routeTollStationsNorm.includes('guaico')) ||
        (tollNameNorm.includes('irra') && routeTollStationsNorm.includes('irra')) ||
        (tollNameNorm.includes('copacabana') && routeTollStationsNorm.includes('copacabana')) ||
        (tollNameNorm.includes('cisneros') && routeTollStationsNorm.includes('cisneros')) ||
        (tollNameNorm.includes('fuemia') && routeTollStationsNorm.includes('fuemia')) ||
        (tollNameNorm.includes('mutata') && routeTollStationsNorm.includes('mutata')) ||
        (tollNameNorm.includes('cirilo') && routeTollStationsNorm.includes('cirilo')) ||
        (tollNameNorm.includes('pandequeso') && routeTollStationsNorm.includes('pandequeso')) ||
        (tollNameNorm.includes('primavera') && routeTollStationsNorm.includes('primavera')) ||
        (tollNameNorm.includes('aburra') && routeTollStationsNorm.includes('aburra')) ||
        (tollNameNorm.includes('trapiche') && routeTollStationsNorm.includes('trapiche')) ||
        (tollNameNorm.includes('palmas') && routeTollStationsNorm.includes('palmas')) ||
        (tollNameNorm.includes('oriente') && routeTollStationsNorm.includes('oriente')) ||
        (tollNameNorm.includes('pajarito') && routeTollStationsNorm.includes('pajarito')) ||
        (tollNameNorm.includes('zambito') && routeTollStationsNorm.includes('zambito')) ||
        (tollNameNorm.includes('puerto berrio') && routeTollStationsNorm.includes('puerto berrio')) ||
        (tollNameNorm.includes('gomez') && routeTollStationsNorm.includes('gomez')) ||
        (tollNameNorm.includes('llanos') && routeTollStationsNorm.includes('llanos')) ||
        (tollNameNorm.includes('taraza') && routeTollStationsNorm.includes('taraza')) ||
        (tollNameNorm.includes('san carlos') && routeTollStationsNorm.includes('san carlos'))
      );

      // 1. Si la ruta proviene de la base de datos oficial SCJ y ya tiene definida su lista de casetas (ej: "Amagá + La Pintada + Supía")
      if (existingRoute && tollStationsStr.trim().length > 0) {
        if (explicitInRoute) {
          if (!matched.some(m => m.id === toll.id)) {
            matched.push(toll);
          }
        }
        return; // IMPORTANTE: no agregar peajes espurios lejanos para rutas oficiales fijas
      }

      // 2. Para rutas trazadas dinámicamente: verificar si la trayectoria vial calculada pasa por el peaje (a menos de 1.8 km de la calzada)
      if (calculatedRoadPath.length > 0) {
        const passesNearPolyline = calculatedRoadPath.some(pt => {
          const dLat = (pt.lat - toll.lat) * 111.0;
          const dLng = (pt.lng - toll.lng) * 111.0 * Math.cos((toll.lat * Math.PI) / 180.0);
          return (dLat * dLat + dLng * dLng) <= (1.8 * 1.8);
        });

        if (passesNearPolyline) {
          if (!matched.some(m => m.id === toll.id)) {
            matched.push(toll);
          }
          return;
        }
      }

      // 3. Coincidencia por corredor vial explícito en el nombre de la ruta
      const nameMatch = (
        (customRouteNameNorm.includes('amaga') && (tollNameNorm.includes('amaga') || tollCorridorNorm.includes('amaga'))) ||
        (customRouteNameNorm.includes('pintada') && (tollNameNorm.includes('pintada') || tollCorridorNorm.includes('pintada'))) ||
        (customRouteNameNorm.includes('supia') && (tollNameNorm.includes('supia') || tollCorridorNorm.includes('supia'))) ||
        (customRouteNameNorm.includes('cisneros') && (tollNameNorm.includes('cisneros') || tollCorridorNorm.includes('cisneros'))) ||
        (customRouteNameNorm.includes('guaico') && (tollNameNorm.includes('guaico') || tollCorridorNorm.includes('guaico'))) ||
        (customRouteNameNorm.includes('irra') && (tollNameNorm.includes('irra') || tollCorridorNorm.includes('irra'))) ||
        (customRouteNameNorm.includes('copacabana') && tollNameNorm.includes('copacabana')) ||
        (customRouteNameNorm.includes('dabeiba') && (tollNameNorm.includes('fuemia') || tollCorridorNorm.includes('dabeiba'))) ||
        (customRouteNameNorm.includes('mutata') && tollNameNorm.includes('mutata')) ||
        (customRouteNameNorm.includes('turbo') && tollNameNorm.includes('cirilo'))
      );

      if (nameMatch) {
        if (!matched.some(m => m.id === toll.id)) {
          matched.push(toll);
        }
      }
    });

    // Añadir peajes agregados manualmente por el usuario desde el catálogo nacional
    manuallyAddedTolls.forEach(toll => {
      if (!excludedTollIds.includes(toll.id) && !matched.some(m => m.id === toll.id)) {
        matched.push(toll);
      }
    });

    return matched;
  }, [allTolls, customRouteName, existingRoute, calculatedRoadPath, excludedTollIds, manuallyAddedTolls]);

  // Vehículos oficiales SCJ disponibles para simulación
  const nprVehicle = useMemo(() => {
    return vehicles.find(v => v.name.includes('NPR') || v.id.includes('npr') || v.category === 'NPR') || selectedVehicle;
  }, [vehicles, selectedVehicle]);

  const nlrVehicle = useMemo(() => {
    return vehicles.find(v => v.name.includes('NLR') || v.id.includes('nlr') || v.category === 'NLR') || selectedVehicle;
  }, [vehicles, selectedVehicle]);

  const activeSimulatedVehicle = activeSimulatedVehicleType === 'NLR' ? nlrVehicle : nprVehicle;
  const alternateVehicle = activeSimulatedVehicleType === 'NPR' ? nlrVehicle : nprVehicle;

  // Multiplicador de ida y vuelta según si incluye circuito cerrado de retorno
  const tripMultiplier = includeReturnCircuit ? 2 : 1;

  // Sumas de peajes según categoría de casetas en el corredor (ida y vuelta si aplica)
  const corridorTollSumNpr = useMemo(() => {
    return corridorTolls.reduce((sum, t) => sum + (t.tariffNprCOP * tripMultiplier), 0);
  }, [corridorTolls, tripMultiplier]);

  const corridorTollSumNlr = useMemo(() => {
    return corridorTolls.reduce((sum, t) => sum + (t.tariffNlrCOP * tripMultiplier), 0);
  }, [corridorTolls, tripMultiplier]);

  // Filtro de búsqueda para el catálogo nacional de peajes
  const filteredNationalTolls = useMemo(() => {
    if (!nationalTollFilter.trim()) return allTolls;
    const term = nationalTollFilter.toLowerCase().trim();
    return allTolls.filter(t =>
      (t.name || '').toLowerCase().includes(term) ||
      (t.department || '').toLowerCase().includes(term) ||
      (t.corridor || '').toLowerCase().includes(term) ||
      (t.municipality && t.municipality.toLowerCase().includes(term))
    );
  }, [allTolls, nationalTollFilter]);

  // Manejador para incluir o excluir peajes manualmente desde el catálogo
  const handleToggleTollInRoute = (toll: TollStation) => {
    const isExcluded = excludedTollIds.includes(toll.id);
    const isInCorridor = corridorTolls.some(t => t.id === toll.id);

    if (isExcluded) {
      setExcludedTollIds(prev => prev.filter(id => id !== toll.id));
      setStatusMessage(`Peaje "${toll.name}" restaurado en la ruta.`);
    } else if (isInCorridor) {
      setExcludedTollIds(prev => [...prev, toll.id]);
      setStatusMessage(`Peaje "${toll.name}" excluido de la ruta.`);
    } else {
      setManuallyAddedTolls(prev => [...prev, toll]);
      setStatusMessage(`Peaje "${toll.name}" añadido a la ruta.`);
    }
  };

  // Peajes estimados según vehículo activo: si hay peajes detectados o seleccionados, usar la suma exacta peaje por peaje
  const activeTollCost = useMemo(() => {
    if (corridorTolls.length > 0) {
      return activeSimulatedVehicleType === 'NLR' ? corridorTollSumNlr : corridorTollSumNpr;
    }
    if (activeSimulatedVehicleType === 'NLR') {
      if (existingRoute?.tollEstimatedCostNlr && existingRoute.tollEstimatedCostNlr > 0) {
        return includeReturnCircuit ? existingRoute.tollEstimatedCostNlr * 2 : existingRoute.tollEstimatedCostNlr;
      }
      return existingRoute?.tollEstimatedCost ? Math.round(existingRoute.tollEstimatedCost * 0.45) : Math.max(12600, Math.round((estimatedKm / 90) * 12600));
    } else {
      if (existingRoute?.tollEstimatedCost && existingRoute.tollEstimatedCost > 0) return existingRoute.tollEstimatedCost;
      return Math.max(25900, Math.round((estimatedKm / 90) * 28000));
    }
  }, [corridorTolls.length, activeSimulatedVehicleType, corridorTollSumNlr, corridorTollSumNpr, existingRoute, includeReturnCircuit, estimatedKm]);

  // Generar objeto DeliveryRoute para cotizar
  const dynamicRouteObject: DeliveryRoute = useMemo(() => {
    return {
      id: existingRoute ? existingRoute.id : `R-${Date.now().toString().slice(-4)}`,
      name: customRouteName.toUpperCase(),
      zone: existingRoute ? existingRoute.zone : 'Ruta Generada en Mapa',
      km: estimatedKm > 0 ? estimatedKm : (existingRoute?.km || 100),
      transitHours: estimatedTransitHours > 0 ? estimatedTransitHours : (existingRoute?.transitHours || 4),
      loadingMinutes: estimatedLoadingMinutes,
      storeIds: activePoints.map((p, i) => i === 0 ? 'L-000' : (p.storeId || `POS-${i}`)),
      tollEstimatedCost: activeTollCost,
      tollEstimatedCostNlr: corridorTolls.length > 0 ? corridorTollSumNlr : (existingRoute?.tollEstimatedCostNlr || corridorTollSumNlr),
      tollCount: corridorTolls.length > 0 ? corridorTolls.length : (existingRoute?.tollCount || Math.max(1, Math.round(estimatedKm / 90))),
      freightTariffNpr: existingRoute?.freightTariffNpr,
      freightTariffNlr: existingRoute?.freightTariffNlr,
      viaticosCOP: existingRoute?.viaticosCOP || 50000
    };
  }, [existingRoute, customRouteName, estimatedKm, estimatedTransitHours, estimatedLoadingMinutes, activePoints, activeTollCost, corridorTollSumNlr, corridorTolls.length]);

  // Costo en tiempo real para el vehículo simulado activo
  const dynamicBreakdown = useMemo(() => {
    return calculateRouteCost(dynamicRouteObject, activeSimulatedVehicle, laborConfig);
  }, [dynamicRouteObject, activeSimulatedVehicle, laborConfig]);

  // Costo en tiempo real para el vehículo alternativo (para comparar ahorro o impacto)
  const alternateTollCost = useMemo(() => {
    if (corridorTolls.length > 0) {
      return activeSimulatedVehicleType === 'NPR' ? corridorTollSumNlr : corridorTollSumNpr;
    }
    if (activeSimulatedVehicleType === 'NPR') {
      if (existingRoute?.tollEstimatedCostNlr && existingRoute.tollEstimatedCostNlr > 0) {
        return includeReturnCircuit ? existingRoute.tollEstimatedCostNlr * 2 : existingRoute.tollEstimatedCostNlr;
      }
      return existingRoute?.tollEstimatedCost ? Math.round(existingRoute.tollEstimatedCost * 0.45) : Math.max(12600, Math.round((estimatedKm / 90) * 12600));
    } else {
      if (existingRoute?.tollEstimatedCost && existingRoute.tollEstimatedCost > 0) return existingRoute.tollEstimatedCost;
      return Math.max(25900, Math.round((estimatedKm / 90) * 28000));
    }
  }, [corridorTolls.length, activeSimulatedVehicleType, corridorTollSumNlr, corridorTollSumNpr, existingRoute, includeReturnCircuit, estimatedKm]);

  const alternateBreakdown = useMemo(() => {
    const altRoute = { ...dynamicRouteObject, tollEstimatedCost: alternateTollCost };
    return calculateRouteCost(altRoute, alternateVehicle, laborConfig);
  }, [dynamicRouteObject, alternateTollCost, alternateVehicle, laborConfig]);

  // Flete facturado presupuestado (Ingreso)
  const activeFreight = useMemo(() => {
    if (activeSimulatedVehicleType === 'NLR') {
      return existingRoute?.freightTariffNlr || existingRoute?.freightTariffNpr || Math.round(estimatedKm * 3400);
    }
    return existingRoute?.freightTariffNpr || Math.round(estimatedKm * 3900);
  }, [existingRoute, activeSimulatedVehicleType, estimatedKm]);

  const activeNetProfit = activeFreight - dynamicBreakdown.totalTripCost;
  const activeMarginPct = activeFreight > 0 ? (activeNetProfit / activeFreight) * 100 : 0;
  const costPerKm = estimatedKm > 0 ? Math.round(dynamicBreakdown.totalTripCost / estimatedKm) : 0;
  const costPerHour = dynamicBreakdown.totalHours > 0 ? Math.round(dynamicBreakdown.totalTripCost / dynamicBreakdown.totalHours) : 0;
  const gallonsAcpm = activeSimulatedVehicle.kmPerGallon > 0 ? (estimatedKm / activeSimulatedVehicle.kmPerGallon) : 0;

  const nprCost = activeSimulatedVehicleType === 'NPR' ? dynamicBreakdown.totalTripCost : alternateBreakdown.totalTripCost;
  const nlrCost = activeSimulatedVehicleType === 'NLR' ? dynamicBreakdown.totalTripCost : alternateBreakdown.totalTripCost;
  const nlrSavings = Math.max(0, nprCost - nlrCost);

  // Guardar en la base de datos de rutas
  const handleSaveToDatabase = () => {
    onUpdateRoute(dynamicRouteObject);
    setStatusMessage(`¡Ruta "${dynamicRouteObject.name}" guardada exitosamente en la base de datos!`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // URL para abrir navegación directa en Google Maps (incluyendo el circuito completo de ida y retorno)
  const googleMapsExternalUrl = useMemo(() => {
    const pts = effectiveRoutingPoints;
    if (pts.length < 2) {
      return `https://www.google.com/maps/dir/?api=1&origin=Medellin,Colombia&destination=Medellin,Colombia&travelmode=driving`;
    }
    const origin = `${pts[0].lat},${pts[0].lng}`;
    const destination = `${pts[pts.length - 1].lat},${pts[pts.length - 1].lng}`;
    const waypoints = pts.slice(1, -1).map(p => `${p.lat},${p.lng}`).join('|');
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints ? `&waypoints=${waypoints}` : ''}&travelmode=driving`;
  }, [effectiveRoutingPoints]);

  // Sincronización de pantalla completa nativa
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return;
    if (!document.fullscreenElement) {
      mapContainerRef.current.requestFullscreen().catch(err => {
        console.warn('Error entering fullscreen:', err);
      });
    } else {
      document.exitFullscreen().catch(err => {
        console.warn('Error exiting fullscreen:', err);
      });
    }
  };

  // Compartir ruta completa con el conductor por WhatsApp con enlace GPS de Google Maps
  const handleShareRouteWhatsApp = () => {
    const points = effectiveRoutingPoints;
    const stopsList = points
      .map((p, idx) => {
        const prefix = idx === 0
          ? '🏢 *SALIDA CEDI:*'
          : idx === points.length - 1 && includeReturnCircuit
            ? '🏁 *RETORNO CEDI:*'
            : `📦 *Parada #${idx}:*`;
        return `${prefix} ${p.name} (${p.municipality || 'Antioquia'})`;
      })
      .join('\n');

    const distText = drivingMetrics ? `${drivingMetrics.km} km` : `${estimatedKm} km`;
    const hours = drivingMetrics ? Math.floor(drivingMetrics.minutes / 60) : Math.floor(estimatedTransitHours);
    const mins = drivingMetrics ? drivingMetrics.minutes % 60 : Math.round((estimatedTransitHours % 1) * 60);
    const timeText = `${hours > 0 ? `${hours}h ` : ''}${mins}m`;
    const tollsCount = corridorTolls.length;
    const tollsCost = formatCOP(activeTollCost);

    const message = `🚚 *HOJA DE RUTA Y DESPACHO - HOGAR Y MODA*
━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 *Ruta:* ${customRouteName}
🚛 *Vehículo Asignado:* ${activeSimulatedVehicleType}
📏 *Distancia Total:* ${distText}
⏱️ *Tiempo Estimado en Vía:* ${timeText}
🧾 *Peajes en Ruta:* ${tollsCount} caseta(s) (${tollsCost})

📋 *SECUENCIA DE ENTREGA:*
${stopsList}

━━━━━━━━━━━━━━━━━━━━━━━━━━
🗺️ *INICIAR NAVEGACIÓN GPS (Google Maps):*
${googleMapsExternalUrl}

_Generado por el Sistema de Rutas y Despacho SCJ._`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Búsqueda rápida de tiendas Hogar y Moda y peajes para centrar el mapa
  const searchResults = useMemo(() => {
    if (!mapSearchQuery.trim()) return [];
    const q = mapSearchQuery.toLowerCase();

    const matchedStores = allStores.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.municipality.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      (s.address && s.address.toLowerCase().includes(q))
    ).slice(0, 5).map(s => ({
      id: `store-${s.id}`,
      title: `${s.name} (${s.municipality})`,
      subtitle: `Tienda Hogar y Moda #${s.id}${s.address ? ` • ${s.address}` : ''}`,
      type: 'store' as const,
      lat: s.lat,
      lng: s.lng,
      zoom: 16
    }));

    const matchedTolls = allTolls.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.corridor.toLowerCase().includes(q) ||
      t.department.toLowerCase().includes(q)
    ).slice(0, 5).map(t => ({
      id: `toll-${t.id}`,
      title: `Peaje ${t.name}`,
      subtitle: `${t.corridor} • ${t.department}`,
      type: 'toll' as const,
      lat: t.lat,
      lng: t.lng,
      zoom: 15
    }));

    return [...matchedStores, ...matchedTolls];
  }, [mapSearchQuery, allTolls, allStores]);

  const handleSelectSearchResult = (item: { lat: number; lng: number; zoom: number; title: string }) => {
    setPanTarget({ lat: item.lat, lng: item.lng, zoom: item.zoom, timestamp: Date.now() });
    setIsSearchOpen(false);
    setMapSearchQuery('');
    setStatusMessage(`🎯 Mapa centrado en: ${item.title}`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="space-y-6">

      {/* Barra de Notificación Temporal */}
      {statusMessage && (
        <div className="bg-emerald-700 text-white text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center justify-between transition-all animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-300" />
            <span className="font-medium">{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-emerald-200 hover:text-white text-xs">
            Cerrar
          </button>
        </div>
      )}

      {/* Cabecera y Controles Principales */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-emerald-700" />
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Mapa Interactivo: Selección de Puntos y Tráfico en Vivo
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Haz clic directamente sobre el mapa para colocar paradas de entrega, selecciona municipios
              del archivo o añade destinos predefinidos para calcular los kilómetros y el costo en tiempo real.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Selector de Ruta del Archivo */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
              <FileText className="w-4 h-4 text-slate-500" />
              <span className="text-slate-600 font-medium">Ruta del Archivo:</span>
              <select
                value={selectedRouteId}
                onChange={(e) => handleSelectRoute(e.target.value)}
                className="font-bold text-slate-900 bg-white border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-emerald-600 max-w-[200px] truncate"
              >
                {routes.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.id}: {r.name}
                  </option>
                ))}
                <option value="CUSTOM">+ Trazar Nueva Ruta en Mapa</option>
              </select>
            </div>

            {/* Toggle Trazado por Vías Reales vs Línea Directa */}
            <button
              onClick={() => setFollowRoads(!followRoads)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                followRoads
                  ? 'bg-blue-700 text-white border-blue-800 shadow-xs'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
              title="Traza la ruta por las calles y carreteras reales de Google Maps con curvas de conducción vehicular"
            >
              <Route className="w-4 h-4" />
              <span>{followRoads ? 'Por Carreteras Reales: SÍ' : 'Línea Directa'}</span>
            </button>

            {/* Toggle Clic en el Mapa */}
            <button
              onClick={() => setClickToAddEnabled(!clickToAddEnabled)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                clickToAddEnabled
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
              title="Permite hacer clic sobre el mapa para colocar paradas"
            >
              <MousePointerClick className="w-4 h-4" />
              <span>{clickToAddEnabled ? 'Modo Clic: ACTIVO' : 'Activar Clic'}</span>
            </button>

            {/* Toggle Capa de Tráfico */}
            <button
              onClick={() => setShowTrafficLayer(!showTrafficLayer)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                showTrafficLayer
                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
              title="Muestra el tráfico vehicular en tiempo real de Google Maps"
            >
              <Car className="w-4 h-4 text-amber-600" />
              <span>{showTrafficLayer ? 'Tráfico en Vivo: SÍ' : 'Ver Tráfico'}</span>
            </button>
          </div>
        </div>

        {/* Barra de acciones rápidas sobre municipios y nombre */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-slate-500 font-medium shrink-0">Nombre de la Ruta:</span>
            <input
              type="text"
              value={customRouteName}
              onChange={(e) => setCustomRouteName(e.target.value)}
              placeholder="Ej: MEDELLIN - RIONEGRO - MARINILLA"
              className="px-2.5 py-1 text-xs font-bold font-mono text-slate-900 border border-slate-300 rounded-lg max-w-sm flex-1 focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveToDatabase}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              Guardar en Base de Datos
            </button>

            <button
              onClick={handleResetPoints}
              className="px-2.5 py-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium flex items-center gap-1"
              title="Reiniciar paradas a la base central"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reiniciar
            </button>
          </div>
        </div>
      </div>

      {/* Banner de Aviso de Fallo en Clave Google Maps (si aplica) */}
      {googleMapsErrorNotice && (
        <div className="bg-amber-50 border border-amber-300 text-amber-900 text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-medium">{googleMapsErrorNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setGoogleMapsErrorNotice(null)}
            className="text-amber-700 hover:text-amber-950 font-bold underline cursor-pointer shrink-0"
          >
            Entendido
          </button>
        </div>
      )}

      {/* Grid Principal: Mapa Grande de Google Maps / OSM + Panel de Control y Puntos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Contenedor del Mapa Interactivo (2 Columnas) - Sticky y altura adaptativa */}
        <div
          ref={mapContainerRef}
          className={`bg-white border border-slate-200 overflow-hidden shadow-2xs flex flex-col ${
            isFullscreen
              ? 'fixed inset-0 z-50 h-screen w-screen rounded-none'
              : 'lg:col-span-2 rounded-xl lg:sticky lg:top-4 h-[640px] lg:h-[calc(100vh-120px)] min-h-[580px]'
          }`}
        >
          {/* Barra Superior del Mapa */}
          <div className="bg-slate-900 text-white px-4 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="font-bold tracking-tight">{customRouteName}</span>
              <span className="text-blue-400 font-mono font-semibold">
                ({activePoints.length} {activePoints.length === 1 ? 'punto' : 'paradas'})
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Selector de Motor Cartográfico: OpenStreetMap vs Google Maps */}
              <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setMapEngine('osm');
                    if (typeof window !== 'undefined') localStorage.setItem('scj_map_engine', 'osm');
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                    mapEngine === 'osm' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Motor OpenStreetMap libre, ultra rápido y sin límites de facturación"
                >
                  <span>🗺️ OpenStreetMap (Libre)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMapEngine('google');
                    if (typeof window !== 'undefined') localStorage.setItem('scj_map_engine', 'google');
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                    mapEngine === 'google' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Google Maps oficial con fotos satelitales y tráfico en vivo"
                >
                  <span>🌐 Google Maps</span>
                </button>
              </div>

              {/* Botón para Configurar Clave API de Google Maps */}
              <button
                type="button"
                onClick={() => {
                  setApiKeyInput(customApiKey || apiKey);
                  setIsApiKeyModalOpen(true);
                }}
                className="px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700"
                title="Configurar o actualizar la Clave API de Google Maps Platform"
              >
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>API Key</span>
              </button>

              {/* Selector de Tipo de Mapa: Calles, Satélite, Relieve (visible en Google Maps) */}
              {mapEngine === 'google' && (
                <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setMapTypeId('roadmap')}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                      mapTypeId === 'roadmap' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Vista estándar de calles y carreteras"
                  >
                    Calles
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapTypeId('satellite')}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                      mapTypeId === 'satellite' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Vista satelital fotográfica de alta resolución"
                  >
                    Satélite
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapTypeId('terrain')}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                      mapTypeId === 'terrain' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Vista topográfica con relieve de montañas y cordilleras"
                  >
                    Relieve
                  </button>
                </div>
              )}

              {/* Botón Ver CEDI */}
              <button
                type="button"
                onClick={() => setFocusCediTrigger(n => n + 1)}
                className="text-amber-300 hover:text-amber-200 bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded border border-slate-700 flex items-center gap-1 font-semibold text-xs transition-colors shadow-2xs"
                title="Acercar y enfocar la bodega principal en Portal Industrial del Sur"
              >
                <Building2 className="w-3.5 h-3.5 text-amber-300" />
                <span>Ver CEDI</span>
              </button>

              {/* Trazado por Vías vs Directo */}
              <button
                type="button"
                onClick={() => setFollowRoads(!followRoads)}
                className={`px-2 py-1 rounded border flex items-center gap-1 font-semibold text-xs transition-colors ${
                  followRoads
                    ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
                title={followRoads ? "Trazando sobre calles y autopistas reales (Google Directions)" : "Trazado geométrico directo"}
              >
                <Route className="w-3.5 h-3.5" />
                <span>{followRoads ? '🛣️ Por Calles' : '📏 Directa'}</span>
              </button>

              {/* Capa de Tráfico */}
              <button
                type="button"
                onClick={() => setShowTrafficLayer(!showTrafficLayer)}
                className={`px-2 py-1 rounded border flex items-center gap-1 font-semibold text-xs transition-colors ${
                  showTrafficLayer
                    ? 'bg-amber-500/25 text-amber-300 border-amber-500/60'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                }`}
                title={showTrafficLayer ? "Ocultar capa de congestión de tráfico" : "Mostrar tráfico en tiempo real"}
              >
                <Car className="w-3.5 h-3.5" />
                <span>{showTrafficLayer ? 'Tráfico: ON' : 'Tráfico: OFF'}</span>
              </button>

              {/* Capa de Peajes del Corredor */}
              <button
                type="button"
                onClick={() => setShowTollsLayer(!showTollsLayer)}
                className={`px-2 py-1 rounded border flex items-center gap-1 font-semibold text-xs transition-colors ${
                  showTollsLayer
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-xs'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                }`}
                title="Mostrar u ocultar peajes georreferenciados en este corredor con sus tarifas para NPR y NLR"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>{showTollsLayer ? `Peajes (${corridorTolls.length}): ON` : 'Peajes: OFF'}</span>
              </button>

              {/* Retorno al CEDI */}
              <button
                type="button"
                onClick={() => setIncludeReturnCircuit(!includeReturnCircuit)}
                className={`px-2 py-1 rounded border flex items-center gap-1 font-semibold text-xs transition-colors ${
                  includeReturnCircuit
                    ? 'bg-purple-700 text-white border-purple-600 shadow-xs'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                }`}
                title={includeReturnCircuit ? "Circuito completo con retorno al CEDI incluido" : "Solo ida hasta la última tienda"}
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>{includeReturnCircuit ? '🔄 Retorno: ON' : '🔄 Retorno: OFF'}</span>
              </button>

              {/* Compartir con Conductor por WhatsApp */}
              <button
                type="button"
                onClick={handleShareRouteWhatsApp}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded border border-emerald-500 flex items-center gap-1 font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                title="Enviar hoja de ruta con paradas, peajes y enlace GPS al conductor por WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>

              {/* Botón Pantalla Completa */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded border border-slate-700 flex items-center gap-1 font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa para despacho y monitoreo"}
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                <span>{isFullscreen ? 'Salir' : 'Full'}</span>
              </button>

              {/* Botón Cuota Gratuita ($200 USD/mes) */}
              <button
                type="button"
                onClick={() => setShowQuotaModal(true)}
                className="bg-blue-900/60 hover:bg-blue-800 text-blue-300 hover:text-white px-2.5 py-1 rounded border border-blue-500/50 flex items-center gap-1 font-bold text-xs transition-colors shadow-2xs cursor-pointer"
                title="Consultar cuota gratis de Google Maps ($200 USD/mes), límites y fallback gratuito"
              >
                <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                <span>$200 Gratis/Mes</span>
              </button>

              {/* Enlace GPS Externo */}
              <a
                href={googleMapsExternalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium transition-colors ml-1"
                title="Abrir recorrido con waypoints en Google Maps"
              >
                <span>GPS</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Canvas de Google Maps con Buscador Rápido Flotante */}
          <div className="flex-1 w-full relative">
            {/* Buscador Rápido de Tiendas Hogar y Moda y Peajes (Flotante) */}
            <div className="absolute top-3 left-3 z-20 w-72">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={mapSearchQuery}
                  onChange={(e) => {
                    setMapSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  placeholder="Buscar tienda o peaje en el mapa..."
                  className="w-full pl-8 pr-7 py-1.5 text-xs bg-white/95 backdrop-blur-xs text-slate-900 rounded-lg border border-slate-300 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
                {mapSearchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setMapSearchQuery('');
                      setIsSearchOpen(false);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Menú Desplegable de Resultados de Búsqueda */}
              {isSearchOpen && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden divide-y divide-slate-100 max-h-60 overflow-y-auto z-30">
                  {searchResults.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectSearchResult(item)}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors flex items-start gap-2 text-xs"
                    >
                      {item.type === 'store' ? (
                        <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      ) : (
                        <Receipt className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-slate-900 truncate">{item.title}</div>
                        <div className="text-[10px] text-slate-500 truncate">{item.subtitle}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Banner de cálculo de carretera en progreso */}
            {isCalculatingRoad && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xs text-white text-xs px-3.5 py-1.5 rounded-full shadow-lg border border-blue-500/50 flex items-center gap-2 z-20 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                <span>Calculando recorrido por calzadas de carretera...</span>
              </div>
            )}

            {mapEngine === 'osm' ? (
              <OpenStreetMapCanvas
                coords={effectiveRoutingPoints}
                roadPath={calculatedRoadPath}
                showTraffic={showTrafficLayer}
                showTolls={showTollsLayer}
                tolls={corridorTolls}
                activeVehicleType={activeSimulatedVehicleType}
                clickToAddEnabled={clickToAddEnabled}
                onMapClick={(lat, lng) => {
                  if (!clickToAddEnabled) return;
                  const newPoint: GeoCoord = {
                    lat,
                    lng,
                    name: `Parada ${activePoints.length} (${lat.toFixed(3)}, ${lng.toFixed(3)})`,
                    municipality: "Punto en Mapa",
                    dischargeMinutes: 45
                  };
                  setActivePoints(prev => [...prev, newPoint]);
                  setStatusMessage(`Parada agregada en el mapa: [${lat.toFixed(4)}, ${lng.toFixed(4)}]`);
                  setTimeout(() => setStatusMessage(null), 3000);
                }}
                onEditPoint={(idx) => handleOpenEditPointModal(idx)}
                focusCediTrigger={focusCediTrigger}
                panTarget={panTarget}
                townCatalog={COLOMBIA_LOCATIONS}
                showTownCatalog={showTownCatalog}
                onAddTown={handleAddTown}
              />
            ) : (
              <ErrorBoundary
                fallbackTitle="Google Maps no pudo cargarse en este navegador"
                onSwitchMode={() => {
                  setMapEngine('osm');
                  if (typeof window !== 'undefined') localStorage.setItem('scj_map_engine', 'osm');
                }}
              >
                <APIProvider
                  apiKey={apiKey}
                  libraries={['places', 'geometry', 'routes', 'marker']}
                  region="CO"
                  language="es"
                  onError={(err) => {
                    console.warn('APIProvider error:', err);
                    setMapEngine('osm');
                    setGoogleMapsErrorNotice('No fue posible conectar con Google Maps. Se activó automáticamente OpenStreetMap.');
                  }}
                >
                  <Map
                    mapId="DEMO_MAP_ID"
                    mapTypeId={mapTypeId}
                    defaultCenter={{ lat: 5.85, lng: -75.65 }}
                    defaultZoom={10}
                    style={{ width: '100%', height: '100%' }}
                    gestureHandling="greedy"
                    disableDefaultUI={false}
                    onClick={handleMapClick}
                    internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
                  >
                    {/* Controlador reactivo para enfocar puntos buscados */}
                    <MapController panTarget={panTarget} />

                    {/* Capa de tráfico en tiempo real de Google */}
                    <TrafficLayerOverlay enabled={showTrafficLayer} />

                    {/* Trazado Inteligente: Carreteras Reales de Colombia o Línea Directa */}
                    <RouteDirections
                      coords={effectiveRoutingPoints}
                      followRoads={followRoads}
                      onRouteCalculated={handleRouteCalculated}
                      onCalculatingChange={setIsCalculatingRoad}
                    />

                    {/* Marcadores Secuenciales de la Ruta con Etiquetas Numeradas */}
                    {activePoints.map((coord, idx) => (
                      <AdvancedMarker
                        key={`${coord.name}-${idx}-${coord.lat}-${coord.lng}`}
                        position={{ lat: coord.lat, lng: coord.lng }}
                        title={`${idx === 0 ? '🏢 Bodega Principal: CEDI Hogar y Moda (Haz clic para editar GPS o arrastra el marcador)' : `Parada #${idx}: ${coord.name}\n📍 Coordenadas: ${coord.lat.toFixed(6)}, ${coord.lng.toFixed(6)}\nHaz clic para editar coordenadas GPS`}`}
                        draggable={idx === 0}
                        onClick={() => handleOpenEditPointModal(idx)}
                        onDragEnd={(e) => {
                          if (idx === 0 && e.latLng) {
                            const newLat = e.latLng.lat();
                            const newLng = e.latLng.lng();
                            setActivePoints(prev => {
                              const copy = [...prev];
                              copy[0] = {
                                ...copy[0],
                                lat: newLat,
                                lng: newLng,
                                name: "CEDI Hogar y Moda (Ubicación Ajustada)"
                              };
                              return copy;
                            });
                            setStatusMessage(`📍 CEDI reubicado a: ${newLat.toFixed(5)}, ${newLng.toFixed(5)}`);
                            setTimeout(() => setStatusMessage(null), 3500);
                          }
                        }}
                      >
                        {idx === 0 ? (
                          <div className="flex flex-col items-center cursor-move group">
                            <div className="bg-blue-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-lg border-2 border-white flex items-center gap-1.5 whitespace-nowrap hover:scale-105 transition-transform">
                              <Building2 className="w-3.5 h-3.5 text-amber-300" />
                              <span>CEDI Caldas - Portal Industrial del Sur</span>
                              <span className="bg-amber-400 text-slate-950 text-[9px] px-1 py-0.2 rounded font-extrabold">120m</span>
                            </div>
                            <div className="w-2.5 h-2.5 bg-blue-900 rotate-45 -mt-1 border-r border-b border-white" />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center cursor-pointer group">
                            <div className={`text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg border-2 border-white flex items-center gap-1.5 whitespace-nowrap hover:scale-110 transition-transform ${
                              idx === activePoints.length - 1
                                ? 'bg-purple-700 ring-2 ring-purple-400/50'
                                : 'bg-slate-900 ring-2 ring-slate-400/40'
                            }`}>
                              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
                                idx === activePoints.length - 1 ? 'bg-amber-300 text-purple-950' : 'bg-white/20 text-white'
                              }`}>
                                {idx}
                              </span>
                              <span className="max-w-[130px] truncate">
                                {coord.storeId ? `${coord.storeId}: ` : ''}{coord.name}
                              </span>
                              {coord.dischargeMinutes && (
                                <span className="text-[8px] bg-blue-100 text-blue-950 px-1 py-0.2 rounded font-mono font-bold">
                                  {coord.dischargeMinutes}m
                                </span>
                              )}
                              {idx === activePoints.length - 1 && (
                                <span className="text-[8px] bg-amber-300 text-purple-950 px-1 py-0.2 rounded font-black">
                                  FIN
                                </span>
                              )}
                            </div>
                            <div className={`w-2.5 h-2.5 rotate-45 -mt-1 border-r border-b border-white ${
                              idx === activePoints.length - 1 ? 'bg-purple-700' : 'bg-slate-900'
                            }`} />
                          </div>
                        )}
                      </AdvancedMarker>
                    ))}

                    {/* Marcadores de Peajes Oficiales Detectados en el Corredor */}
                    {showTollsLayer && corridorTolls.map((toll) => (
                      <AdvancedMarker
                        key={`corridor-toll-${toll.id}`}
                        position={{ lat: toll.lat, lng: toll.lng }}
                        title={`🧾 ${toll.name} (${toll.corridor})\n📍 Coordenadas: ${toll.lat.toFixed(6)}, ${toll.lng.toFixed(6)}\n🚛 NPR: ${formatCOP(toll.tariffNprCOP)} | 🚚 NLR: ${formatCOP(toll.tariffNlrCOP)}\nHaz clic para abrir en Google Maps`}
                        onClick={() => {
                          window.open(`https://www.google.com/maps/search/?api=1&query=${toll.lat},${toll.lng}`, '_blank');
                        }}
                      >
                        <div className="flex flex-col items-center group cursor-pointer">
                          <div className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-md border-2 border-white flex items-center gap-1.5 whitespace-nowrap hover:scale-110 transition-transform">
                            <Receipt className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                            <span className="font-bold">{toll.name}</span>
                            <span className="bg-slate-950 text-amber-300 text-[9px] px-1.5 py-0.2 rounded font-mono font-bold">
                              {activeSimulatedVehicleType === 'NLR' ? formatCOP(toll.tariffNlrCOP) : formatCOP(toll.tariffNprCOP)}
                            </span>
                          </div>
                          <div className="w-2 h-2 bg-amber-400 rotate-45 -mt-1 border-r border-b border-white" />
                        </div>
                      </AdvancedMarker>
                    ))}

                    {/* Marcadores de municipios disponibles para agregar con un clic */}
                    {showTownCatalog && Object.entries(COLOMBIA_LOCATIONS).map(([key, loc]) => {
                      const isAlreadyInRoute = activePoints.some(p => p.name === loc.name);
                      if (isAlreadyInRoute) return null;

                      return (
                        <AdvancedMarker
                          key={`catalog-${key}`}
                          position={{ lat: loc.lat, lng: loc.lng }}
                          title={`Haz clic para añadir ${loc.name} a la ruta`}
                          onClick={() => handleAddTown(key)}
                        >
                          <div className="bg-white/95 text-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm border border-slate-300 hover:border-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1 transition-transform hover:scale-110">
                            <span>+ {key}</span>
                          </div>
                        </AdvancedMarker>
                      );
                    })}

                    {/* Autoenfoque a las paradas */}
                    <FitBounds coords={activePoints} focusCediTrigger={focusCediTrigger} />
                  </Map>
                </APIProvider>
              </ErrorBoundary>
            )}

            {/* Leyenda y Ayuda Flotante */}
            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-slate-200 shadow-md text-[11px] font-sans text-slate-700 z-10 space-y-1.5 max-w-xs">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Paradas en Mapa:</span>
              </div>
              <div className="flex flex-col gap-1 text-[10px] text-slate-600">
                <a
                  href="https://maps.app.goo.gl/ssRAamgr3ux6Q7dFA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 font-bold text-blue-900 hover:text-blue-700 underline"
                  title="Abrir ubicación oficial de Hogar y Moda en Google Maps"
                >
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>CEDI Hogar y Moda (Parcelación Monte Azul)</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-slate-900 rounded-full inline-block" /> Paradas Intermedias
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-purple-600 rounded-full inline-block" /> Destino Final
                  </span>
                </div>
              </div>
              <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                <span className="text-slate-600 font-medium">Modo de Trazado:</span>
                <span className={`font-bold ${followRoads ? 'text-blue-700' : 'text-slate-700'}`}>
                  {followRoads ? '🛣️ Por Calles / Carreteras' : '📏 Línea Directa'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500">
                💡 CEDI ubicado en Parcelación Monte Azul. <span className="font-semibold text-emerald-800">Puedes arrastrar el pin con el dedo para ajustar la posición exacta.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Panel Lateral: Desglose en Vivo de Kilómetros, Costos y Secuencia */}
        <div className="space-y-4 flex flex-col">

          {/* Selector de Simulación de Vehículo (NPR vs NLR) */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-blue-600" />
                Simulador de Vehículo en Corredor:
              </span>
              <span className="text-[10px] text-slate-500 font-normal">Evalúa impacto en costos</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setActiveSimulatedVehicleType('NPR')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex flex-col items-center justify-center transition-all ${
                  activeSimulatedVehicleType === 'NPR'
                    ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-400/40'
                    : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center gap-1">🚛 NPR (4.8 Ton)</span>
                <span className={`text-[10px] font-normal ${activeSimulatedVehicleType === 'NPR' ? 'text-blue-100' : 'text-slate-500'}`}>
                  Turbo 2 Ejes (Cat II)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSimulatedVehicleType('NLR')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex flex-col items-center justify-center transition-all ${
                  activeSimulatedVehicleType === 'NLR'
                    ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-400/40'
                    : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center gap-1">🚐 NLR (3.0 Ton)</span>
                <span className={`text-[10px] font-normal ${activeSimulatedVehicleType === 'NLR' ? 'text-blue-100' : 'text-slate-500'}`}>
                  Liviano (Cat I)
                </span>
              </button>
            </div>
          </div>

          {/* Tarjeta de Rentabilidad y Auditoría Financiera de la Ruta */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Auditoría Financiera</span>
                <span className="text-xs font-bold text-slate-900 font-mono flex items-center gap-1.5">
                  <span>{dynamicRouteObject.id}</span>
                  <span className="text-slate-400 font-normal">|</span>
                  <span className="text-blue-700 font-sans font-bold">{activeSimulatedVehicleType}</span>
                </span>
              </div>

              {/* Semáforo de Rentabilidad */}
              <div className="text-right">
                <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full border shadow-2xs ${
                  activeMarginPct >= 25
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : activeMarginPct >= 10
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    activeMarginPct >= 25 ? 'bg-emerald-500 animate-pulse' : activeMarginPct >= 10 ? 'bg-amber-500' : 'bg-rose-500'
                  }`} />
                  <span>Margen: {activeMarginPct.toFixed(1)}%</span>
                </span>
              </div>
            </div>

            {/* Flete vs Gastos vs Utilidad Neta */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 text-center">
              <div>
                <span className="text-[10px] text-slate-500 block">Flete Cliente</span>
                <span className="text-xs font-bold text-slate-900 block mt-0.5">
                  {formatCOP(activeFreight)}
                </span>
              </div>
              <div className="border-x border-slate-200 px-1">
                <span className="text-[10px] text-slate-500 block">Gastos Totales</span>
                <span className="text-xs font-bold text-rose-700 block mt-0.5">
                  {formatCOP(dynamicBreakdown.totalTripCost)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Utilidad Neta</span>
                <span className={`text-xs font-black block mt-0.5 ${activeNetProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {formatCOP(activeNetProfit)}
                </span>
              </div>
            </div>

            {/* Desglose de Gastos Operativos */}
            <div className="space-y-1.5 text-xs border-t border-slate-100 pt-2.5">
              <div className="flex justify-between items-center text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Fuel className="w-3.5 h-3.5 text-blue-600" />
                  Combustible ACPM ({gallonsAcpm.toFixed(1)} gal):
                </span>
                <span className="text-slate-900 font-bold font-mono">{formatCOP(dynamicBreakdown.fuelCost)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-amber-600" />
                  Peajes ({dynamicRouteObject.tollCount} {dynamicRouteObject.tollCount === 1 ? 'estación' : 'estaciones'}):
                </span>
                <span className="text-slate-900 font-bold font-mono">{formatCOP(dynamicBreakdown.tollCost)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-slate-500" />
                  Mantenimiento SICE-TAC:
                </span>
                <span className="text-slate-900 font-bold font-mono">{formatCOP(dynamicBreakdown.totalMaintenanceCost)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  Mano de Obra CST ({dynamicBreakdown.totalHours.toFixed(1)} h):
                </span>
                <span className="text-slate-900 font-bold font-mono">{formatCOP(dynamicBreakdown.totalLaborCost)}</span>
              </div>
            </div>

            {/* KPIs Unitarios */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-center font-mono">
              <div className="bg-blue-50/60 p-1.5 rounded-md border border-blue-100">
                <span className="text-[10px] text-blue-900 font-sans block">Costo / Kilómetro</span>
                <span className="text-xs font-bold text-blue-950 mt-0.5 block">{formatCOP(costPerKm)} / km</span>
              </div>
              <div className="bg-slate-50 p-1.5 rounded-md border border-slate-200">
                <span className="text-[10px] text-slate-600 font-sans block">Costo / Hora</span>
                <span className="text-xs font-bold text-slate-900 mt-0.5 block">{formatCOP(costPerHour)} / h</span>
              </div>
            </div>

            {/* Recomendación de Eficiencia de Flota */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-2.5 text-[11px] text-amber-950 space-y-1">
              <div className="font-bold flex items-center gap-1 text-amber-900">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Recomendación Operativa SCJ:</span>
              </div>
              <p className="text-[10px] leading-relaxed text-amber-900/90">
                {activeSimulatedVehicleType === 'NPR' ? (
                  <>
                    Enviar <strong>NLR</strong> ahorra <strong>{formatCOP(nlrSavings)}</strong> en peajes (Cat I) y ACPM, elevando el margen comercial. Si el peso no supera 3.000 kg, programa NLR.
                  </>
                ) : (
                  <>
                    El <strong>NLR</strong> maximiza tu margen líquido en este trayecto. Para volúmenes pesados que superen 3.0T, conmuta a <strong>NPR</strong> (4.8T Turbo).
                  </>
                )}
              </p>
            </div>

            {/* Botón de Despacho Operativo Inmediato en 1 Clic */}
            {onNavigateToDispatch && (
              <button
                type="button"
                onClick={() => onNavigateToDispatch(dynamicRouteObject.id)}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Truck className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Despachar esta Ruta en Operaciones</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>

          {/* Tarjeta de Auditoría Peaje por Peaje y Flete (Categoría I NLR vs Categoría II NPR) */}
          <div className="bg-white rounded-xl p-4 border border-amber-200 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-amber-100 pb-2.5">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-amber-600" />
                  Auditoría Peaje por Peaje y Flete
                </span>
                <span className="text-[10px] text-slate-500 font-sans block">
                  Tarifas 2026 ANI / INVÍAS • {includeReturnCircuit ? 'Circuito Ida y Vuelta (x2)' : 'Solo Ida (x1)'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowNationalTollCatalogModal(true)}
                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="Explorar el catálogo nacional de peajes con tarifas actualizadas"
              >
                <Search className="w-3 h-3 text-amber-700" />
                <span>Catálogo ANI</span>
              </button>
            </div>

            {/* Comparativa Resumen: NLR Cat I vs NPR Cat II */}
            <div className="grid grid-cols-3 gap-2 bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/80 text-center">
              <div>
                <span className="text-[9px] text-slate-500 block font-semibold">NLR (Cat I)</span>
                <span className="text-xs font-black text-slate-900 font-mono block mt-0.5">
                  {formatCOP(corridorTollSumNlr)}
                </span>
                <span className="text-[9px] text-slate-400 block">
                  {corridorTolls.length > 0 && activeFreight > 0
                    ? `${((corridorTollSumNlr / activeFreight) * 100).toFixed(1)}% flete`
                    : 'Liviano'}
                </span>
              </div>
              <div className="border-x border-amber-200 px-1">
                <span className="text-[9px] text-slate-500 block font-semibold">NPR (Cat II)</span>
                <span className="text-xs font-black text-slate-900 font-mono block mt-0.5">
                  {formatCOP(corridorTollSumNpr)}
                </span>
                <span className="text-[9px] text-slate-400 block">
                  {corridorTolls.length > 0 && activeFreight > 0
                    ? `${((corridorTollSumNpr / activeFreight) * 100).toFixed(1)}% flete`
                    : '2 Ejes'}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-emerald-800 block font-bold">Ahorro con NLR</span>
                <span className="text-xs font-black text-emerald-700 font-mono block mt-0.5">
                  {formatCOP(Math.max(0, corridorTollSumNpr - corridorTollSumNlr))}
                </span>
                <span className="text-[9px] text-emerald-600 font-semibold block">
                  {corridorTollSumNpr > 0
                    ? `-${(((corridorTollSumNpr - corridorTollSumNlr) / corridorTollSumNpr) * 100).toFixed(0)}% peajes`
                    : '100%'}
                </span>
              </div>
            </div>

            {/* Lista Itemizada Peaje por Peaje */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                <span className="flex items-center gap-1">
                  <span>Casetas en Corredor ({corridorTolls.length}):</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  Vehículo activo: <strong className="text-blue-700 font-bold">{activeSimulatedVehicleType}</strong>
                </span>
              </div>

              {corridorTolls.length === 0 ? (
                <div className="p-3 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200 text-xs text-slate-500 space-y-1.5">
                  <p>No se detectaron casetas de peaje en este trazado local o urbano.</p>
                  <button
                    type="button"
                    onClick={() => setShowNationalTollCatalogModal(true)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                  >
                    + Agregar peaje manualmente desde el catálogo
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg max-h-56 overflow-y-auto text-xs bg-white">
                  {corridorTolls.map((toll, idx) => {
                    const nlrTotal = toll.tariffNlrCOP * tripMultiplier;
                    const nprTotal = toll.tariffNprCOP * tripMultiplier;
                    const tollSaving = nprTotal - nlrTotal;
                    return (
                      <div key={toll.id} className="p-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="space-y-0.5 truncate pr-2">
                          <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5 truncate">
                            <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[9px] flex items-center justify-center font-bold shrink-0">
                              {idx + 1}
                            </span>
                            <span className="truncate">{toll.name}</span>
                            <span className="text-[9px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-sans shrink-0">
                              {toll.department}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 truncate flex items-center gap-1.5">
                            <span className="truncate">{toll.corridor}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] pt-0.5 font-mono">
                            <span className="text-slate-600">
                              NLR: <strong className="text-slate-900">{formatCOP(nlrTotal)}</strong>
                              {includeReturnCircuit && <span className="text-slate-400 text-[9px]"> ({formatCOP(toll.tariffNlrCOP)} x2)</span>}
                            </span>
                            <span className="text-slate-600">
                              NPR: <strong className="text-slate-900">{formatCOP(nprTotal)}</strong>
                              {includeReturnCircuit && <span className="text-slate-400 text-[9px]"> ({formatCOP(toll.tariffNprCOP)} x2)</span>}
                            </span>
                            {tollSaving > 0 && (
                              <span className="text-emerald-700 font-bold">
                                Ahorro: +{formatCOP(tollSaving)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-1">
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${toll.lat},${toll.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                            title="Abrir ubicación exacta en Google Maps"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => setExcludedTollIds(prev => [...prev, toll.id])}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                            title="Excluir este peaje de la liquidación de la ruta"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Incidencia en la Tarifa de Flete */}
            <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg text-xs space-y-1">
              <div className="flex items-center justify-between text-blue-950 font-bold text-[11px]">
                <span className="flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5 text-blue-700" />
                  Incidencia de Peajes sobre el Flete:
                </span>
                <span className="font-mono text-blue-900">{formatCOP(activeFreight)}</span>
              </div>
              <p className="text-[10px] text-blue-900/90 leading-relaxed">
                En esta ruta con <strong>{activeSimulatedVehicleType}</strong>, los peajes representan el{' '}
                <strong>
                  {activeFreight > 0 ? ((activeTollCost / activeFreight) * 100).toFixed(1) : 0}%
                </strong>{' '}
                del valor cobrado al cliente. Al despachar un <strong>NLR</strong> en lugar de un NPR, liberas{' '}
                <strong>{formatCOP(Math.max(0, corridorTollSumNpr - corridorTollSumNlr))}</strong> que se convierten inmediatamente en utilidad líquida neta.
              </p>
            </div>
          </div>

          {/* Tarjeta de Tiempos de Servicio: Cargue en CEDI, Descargue en Locales y Retorno */}
          <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-blue-100 pb-2">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                Tiempos de Servicio y Jornada (Hogar y Moda)
              </span>
              <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                SCJ Logística
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 space-y-0.5">
                <span className="text-[10px] text-blue-900 font-bold block">🏢 Cargue en CEDI Caldas</span>
                <span className="text-sm font-black text-blue-950 font-mono block">120 min (2.0 h)</span>
                <span className="text-[10px] text-slate-500 block">Portal Industrial del Sur</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
                <span className="text-[10px] text-slate-700 font-bold block">🏪 Descargue ({loadingTimeBreakdown.visitedStoresCount} locales)</span>
                <span className="text-sm font-black text-slate-900 font-mono block">{loadingTimeBreakdown.storesDischargeMinutes} min</span>
                <span className="text-[10px] text-slate-500 block">Suma por tienda visitada</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Tiempo Total Cargue + Descargue:</span>
                <span className="font-bold text-slate-900 font-mono">
                  {loadingTimeBreakdown.totalMinutes} min ({loadingTimeBreakdown.totalHours} h)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Tránsito Estimado en Carretera:</span>
                <span className="font-bold text-blue-700 font-mono">{estimatedTransitHours} horas</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Distancia Total (Ida y Retorno):</span>
                <span className="font-bold text-slate-900 font-mono">{estimatedKm} km</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-emerald-900 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  Jornada Operativa Total:
                </span>
                <span className="text-[10px] text-emerald-700">Conducción + Cargue/Descargue</span>
              </div>
              <span className="font-black text-emerald-950 font-mono text-base">{estimatedTotalHours} h</span>
            </div>
          </div>

          {/* Recorrido Tramo a Tramo por Carretera */}
          {roadLegs.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Route className="w-4 h-4 text-blue-600" />
                  Recorrido por Carretera ({roadLegs.length} {roadLegs.length === 1 ? 'tramo' : 'tramos'})
                </span>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span>🛣️ Calzada Real</span>
                </span>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto text-xs pr-1">
                {roadLegs.map((leg) => (
                  <div key={leg.index} className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between hover:bg-slate-100/70 transition-colors">
                    <div className="space-y-0.5 truncate pr-2">
                      <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5 truncate">
                        <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[9px] flex items-center justify-center font-bold shrink-0">
                          {leg.index}
                        </span>
                        <span className="truncate">{leg.toName}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        Salida: <span className="text-slate-700">{leg.fromName}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-blue-700 font-mono text-xs">
                        {leg.distanceKm} km
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans">
                        ~{leg.durationMinutes} min
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Secuencia y Orden de las Paradas */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 flex-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600" />
                Secuencia de Paradas ({activePoints.length})
              </span>
              <div className="flex items-center gap-1.5">
                <label className="text-[10px] text-slate-500 font-semibold shrink-0">Salida:</label>
                <select
                  value={activePoints[0]?.storeId || 'L-000'}
                  onChange={(e) => handleSetOriginStore(e.target.value)}
                  className="text-[10px] font-semibold bg-slate-50 border border-slate-300 text-slate-800 rounded px-1.5 py-0.5 max-w-[170px] truncate cursor-pointer"
                  title="Seleccionar la bodega o punto de salida de la ruta"
                >
                  <option value="L-000">🏢 CEDI Caldas (Principal)</option>
                  {getCustomStores()
                    .filter(s => s.id !== 'L-000')
                    .map(s => (
                      <option key={s.id} value={s.id}>
                        {s.isOriginWarehouse ? '🏬 [Bodega] ' : '📍 '} {s.id} - {s.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Lista con flechas para reordenar */}
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg max-h-64 overflow-y-auto text-xs">
              {activePoints.map((point, idx) => (
                <div key={`${point.name}-${idx}`} className={`p-2.5 flex items-center justify-between transition-colors ${
                  idx === 0 ? 'bg-blue-50/80 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                }`}>
                  <div className="flex items-center gap-2.5 truncate pr-2">
                    <span className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                      idx === 0
                        ? 'bg-blue-600 text-white shadow-xs'
                        : (idx === activePoints.length - 1 ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-800')
                    }`}>
                      {idx === 0 ? '🏢' : idx}
                    </span>
                    <div className="truncate">
                      <div className="font-bold text-slate-900 text-xs truncate flex items-center gap-1.5">
                        {point.storeId && (
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded shrink-0 ${
                            idx === 0 ? 'bg-blue-200 text-blue-950' : 'bg-slate-200 text-slate-800'
                          }`}>
                            {point.storeId}
                          </span>
                        )}
                        <span className="truncate">{point.name}</span>
                        {idx === 0 ? (
                          <span className="text-[9px] bg-amber-400 text-slate-950 font-sans font-black px-1.5 py-0.2 rounded shrink-0 flex items-center gap-1">
                            <Flag className="w-2.5 h-2.5" />
                            SALIDA / ORIGEN
                          </span>
                        ) : point.isWarehouse ? (
                          <span className="text-[9px] bg-amber-100 text-amber-800 font-sans font-bold px-1.5 py-0.2 rounded shrink-0">
                            BODEGA
                          </span>
                        ) : null}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="truncate">{point.municipality || 'Punto'}</span>
                        <span className="text-slate-300">•</span>
                        <span className="font-mono text-[9px] bg-slate-100 text-slate-700 px-1 py-0.2 rounded border border-slate-200">
                          {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="font-semibold text-blue-700 shrink-0">
                          {idx === 0 ? '⏱️ 120 min cargue' : `⏱️ ${point.dischargeMinutes || 45} min descargue`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEditPointModal(idx)}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                      title="Editar o calibrar coordenadas GPS exactas (actualiza mapa y Firestore)"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={`https://www.google.com/maps?q=${point.lat},${point.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                      title="Abrir este punto en Google Maps"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => handleSetPointAsOrigin(idx)}
                        className="p-1 text-slate-400 hover:text-amber-600 rounded transition-colors cursor-pointer"
                        title="Establecer esta bodega o tienda como punto de salida"
                      >
                        <Flag className="w-3.5 h-3.5 text-amber-500" />
                      </button>
                    )}
                    <button
                      onClick={() => handleMovePoint(idx, 'UP')}
                      disabled={idx === 0}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 rounded cursor-pointer"
                      title={idx === 0 ? "Ya es el punto de salida" : "Mover hacia arriba"}
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMovePoint(idx, 'DOWN')}
                      disabled={idx === activePoints.length - 1}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 rounded cursor-pointer"
                      title={idx === activePoints.length - 1 ? "Última parada de entrega" : "Mover hacia abajo"}
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRemovePoint(idx)}
                      disabled={activePoints.length <= 1}
                      className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-20 rounded cursor-pointer"
                      title="Eliminar este local de la ruta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Indicador de Retorno al Origen de Salida */}
              {includeReturnCircuit && activePoints.length >= 2 && (
                <div className="p-2.5 bg-slate-50 flex items-center justify-between text-xs border-t-2 border-dashed border-slate-200 text-slate-600">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                      🔄
                    </span>
                    <div className="truncate">
                      <div className="font-bold text-slate-800 text-xs truncate flex items-center gap-1.5">
                        <span>Retorno a {activePoints[0]?.name || 'Bodega de Salida'}</span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                          CIRCUITO CERRADO
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Cierre de circuito de flota y liquidación de flete
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                    Retorno
                  </span>
                </div>
              )}
            </div>

            {/* Selector Maestro de Locales Hogar y Moda */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-blue-600" />
                  Añadir Local Hogar y Moda (Directorio Oficial):
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{allStores.length - 1} Locales</span>
              </div>

              <select
                onChange={(e) => {
                  handleAddStore(e.target.value);
                  e.target.value = '';
                }}
                defaultValue=""
                className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="" disabled>-- Selecciona un local de Hogar y Moda para añadir --</option>
                {allStores.filter(s => s.id !== 'L-000').map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.id}: {store.name} ({store.municipality}) - ⏱️ {store.dischargeMinutes} min descargue
                  </option>
                ))}
              </select>

              {/* Botones de Acceso Rápido por Zonas Operativas */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] text-slate-500 font-semibold block">
                  Accesos directos por corredor:
                </span>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                  {/* Suroeste */}
                  <button
                    onClick={() => handleAddStore("L-009")}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-800 border border-slate-200 rounded text-[10px] font-medium text-slate-700 transition-colors"
                  >
                    + Amagá (45m)
                  </button>
                  <button
                    onClick={() => handleAddStore("L-010")}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-800 border border-slate-200 rounded text-[10px] font-medium text-slate-700 transition-colors"
                  >
                    + Fredonia (45m)
                  </button>
                  <button
                    onClick={() => handleAddStore("L-011")}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-800 border border-slate-200 rounded text-[10px] font-medium text-slate-700 transition-colors"
                  >
                    + C. Bolívar (45m)
                  </button>
                  <button
                    onClick={() => handleAddStore("L-012")}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-800 border border-slate-200 rounded text-[10px] font-medium text-slate-700 transition-colors"
                  >
                    + Andes (60m)
                  </button>

                  {/* Eje Cafetero */}
                  <button
                    onClick={() => handleAddStore("L-001")}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-800 border border-slate-200 rounded text-[10px] font-medium text-slate-700 transition-colors"
                  >
                    + Supía (45m)
                  </button>
                  <button
                    onClick={() => handleAddStore("L-002")}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-800 border border-slate-200 rounded text-[10px] font-medium text-slate-700 transition-colors"
                  >
                    + Riosucio (45m)
                  </button>
                  <button
                    onClick={() => handleAddStore("L-003")}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-800 border border-slate-200 rounded text-[10px] font-medium text-slate-700 transition-colors"
                  >
                    + Anserma (45m)
                  </button>
                  <button
                    onClick={() => handleAddStore("L-004")}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-800 border border-slate-200 rounded text-[10px] font-medium text-slate-700 transition-colors"
                  >
                    + Viterbo (45m)
                  </button>
                  <button
                    onClick={() => handleAddStore("L-006")}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-800 border border-slate-200 rounded text-[10px] font-medium text-slate-700 transition-colors"
                  >
                    + Cartago (60m)
                  </button>

                  {/* Oriente */}
                  <button
                    onClick={() => handleAddStore("L-035")}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-800 border border-slate-200 rounded text-[10px] font-medium text-slate-700 transition-colors"
                  >
                    + Rionegro (90m)
                  </button>
                  <button
                    onClick={() => handleAddStore("L-037")}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-800 border border-slate-200 rounded text-[10px] font-medium text-slate-700 transition-colors"
                  >
                    + Marinilla (60m)
                  </button>
                  <button
                    onClick={() => handleAddStore("L-031")}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-800 border border-slate-200 rounded text-[10px] font-medium text-slate-700 transition-colors"
                  >
                    + La Ceja (60m)
                  </button>

                  {/* Norte y Urabá */}
                  <button
                    onClick={() => handleAddStore("L-019")}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-800 border border-slate-200 rounded text-[10px] font-medium text-slate-700 transition-colors"
                  >
                    + Yarumal (60m)
                  </button>
                  <button
                    onClick={() => handleAddStore("L-039")}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-800 border border-slate-200 rounded text-[10px] font-medium text-slate-700 transition-colors"
                  >
                    + Apartadó (90m)
                  </button>
                  <button
                    onClick={() => handleAddStore("L-045")}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-800 border border-slate-200 rounded text-[10px] font-medium text-slate-700 transition-colors"
                  >
                    + Barrancabermeja (90m)
                  </button>
                  <button
                    onClick={() => handleAddStore("L-018")}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-800 border border-slate-200 rounded text-[10px] font-medium text-slate-700 transition-colors"
                  >
                    + Montería (90m)
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Modal: Catálogo Nacional de Peajes ANI / INVÍAS (Actualizado 2026) */}
      {showNationalTollCatalogModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Cabecera del Modal */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Receipt className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-base tracking-tight text-white flex items-center gap-2">
                    <span>Catálogo Nacional de Peajes Colombia 2026</span>
                    <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full font-mono">
                      ANI / INVÍAS
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Tarifas vigentes por categoría vehicular: Cat I (NLR Liviano) vs Cat II (NPR Turbo 2 ejes)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNationalTollCatalogModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Barra de Búsqueda y Filtro */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={nationalTollFilter}
                  onChange={(e) => setNationalTollFilter(e.target.value)}
                  placeholder="Buscar por nombre (ej: Amagá, Supía, Guaico), departamento o concesión..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Total Casetas: <strong className="text-slate-900">{filteredNationalTolls.length}</strong></span>
                <span className="text-slate-300">•</span>
                <span>En esta Ruta: <strong className="text-blue-700">{corridorTolls.length}</strong></span>
              </div>
            </div>

            {/* Tabla de Casetas */}
            <div className="flex-1 overflow-y-auto p-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-[11px] font-bold">
                    <th className="py-2.5 px-3">Estación de Peaje</th>
                    <th className="py-2.5 px-3">Corredor / Concesión</th>
                    <th className="py-2.5 px-3 text-right">Cat I (NLR Liviano)</th>
                    <th className="py-2.5 px-3 text-right">Cat II (NPR 2 Ejes)</th>
                    <th className="py-2.5 px-3 text-right text-emerald-700">Diferencia NLR</th>
                    <th className="py-2.5 px-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredNationalTolls.map((toll) => {
                    const isInRoute = corridorTolls.some(t => t.id === toll.id);
                    const diff = toll.tariffNprCOP - toll.tariffNlrCOP;
                    return (
                      <tr
                        key={toll.id}
                        className={`hover:bg-slate-50 transition-colors ${
                          isInRoute ? 'bg-amber-50/40 font-semibold' : ''
                        }`}
                      >
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <Receipt className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>{toll.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {toll.department} {toll.municipality ? `• ${toll.municipality}` : ''}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600 text-[11px]">
                          <div>{toll.corridor}</div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                          {formatCOP(toll.tariffNlrCOP)}
                          <span className="block text-[9px] font-normal text-slate-400">ida simple</span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-blue-900">
                          {formatCOP(toll.tariffNprCOP)}
                          <span className="block text-[9px] font-normal text-slate-400">ida simple</span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                          +{formatCOP(diff)}
                          <span className="block text-[9px] font-normal text-emerald-600">
                            ahorro neto
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleTollInRoute(toll)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                              isInRoute
                                ? 'bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                            }`}
                          >
                            {isInRoute ? '✕ Quitar' : '+ Añadir'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pie del Modal */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Tarifas indexadas 2026 según resoluciones de MinTransporte, ANI y Concesiones 4G/5G.
              </span>
              <button
                type="button"
                onClick={() => setShowNationalTollCatalogModal(false)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Cerrar y Ver Ruta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Cuota Gratuita Mensual de Google Maps ($200 USD/mes) y Límites de Uso */}
      {showQuotaModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Cabecera */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base tracking-tight text-white">
                      Cuota Gratuita Mensual de Google Maps
                    </h3>
                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      $200 USD / Mes Gratis
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Límites oficiales de uso gratuito, consumo proyectado de flota y capas de seguridad
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQuotaModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido con scroll */}
            <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-xs">

              {/* Tarjeta de Resumen del Crédito */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                <div className="p-2 bg-emerald-600 text-white rounded-lg shrink-0 mt-0.5 shadow-xs">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-emerald-950 text-sm">
                    Google otorga $200 USD de crédito recurrente cada mes
                  </h4>
                  <p className="text-emerald-900 leading-relaxed text-xs">
                    Toda cuenta de Google Cloud / Google Maps Platform recibe de forma automática y renovable
                    <strong> $200 USD de saldo libre el día 1 de cada mes</strong>. Mientras tu consumo mensual
                    no supere ese valor, <strong>el costo de uso es exactamente $0 COP</strong>.
                  </p>
                </div>
              </div>

              {/* Grid de Métricas de Cuota Gratuita */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>¿Cuántas interacciones puedes hacer al mes sin pagar?</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
                    <div className="text-[11px] font-semibold text-slate-500">Cargas de Mapa Dinámico</div>
                    <div className="text-xl font-black text-slate-900 font-mono">28.500</div>
                    <div className="text-[10px] text-slate-500 leading-tight">
                      aperturas de mapa / mes (~950 cargas al día)
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
                    <div className="text-[11px] font-semibold text-slate-500">Rutas con Tráfico en Vivo</div>
                    <div className="text-xl font-black text-blue-700 font-mono">40.000</div>
                    <div className="text-[10px] text-slate-500 leading-tight">
                      cálculos de ruta / mes (~1.330 rutas al día)
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
                    <div className="text-[11px] font-semibold text-slate-500">Búsquedas y Geocodificación</div>
                    <div className="text-xl font-black text-purple-700 font-mono">40.000</div>
                    <div className="text-[10px] text-slate-500 leading-tight">
                      consultas de lugares y direcciones / mes
                    </div>
                  </div>
                </div>
              </div>

              {/* Comparativa con la Flota Real de Hogar y Moda */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-blue-950 text-xs flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-blue-700" />
                    <span>Consumo Real Estimado para la Red de Rutas</span>
                  </h4>
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Consumo &lt; 5% del crédito
                  </span>
                </div>
                <p className="text-blue-900 leading-relaxed text-xs">
                  Para una operación logística que despacha su flota de camiones a diario y consulta
                  la red de rutas maestras, se generan entre <strong>600 y 1.500 interacciones al mes</strong>.
                  Esto representa <strong>menos del 5% del cupo mensual gratuito</strong> que entrega Google,
                  dejándote más del 95% de margen sin riesgo de cobro.
                </p>
                <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '5%' }} />
                </div>
                <div className="flex justify-between text-[10px] text-blue-800 font-medium">
                  <span>Tu Flota: ~1.200 consultas/mes (5%)</span>
                  <span>Cupo Gratis Google: 28.500 cargas/mes (100%)</span>
                </div>
              </div>

              {/* 3 Capas de Protección Cero Costos */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>3 Capas de Protección Cero Costos Implementadas:</span>
                </h4>

                <div className="space-y-2">
                  <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">1. Caché Inteligente en Navegador:</strong>
                      <span className="text-slate-600"> Cuando consultas una ruta por carretera, se memoriza localmente. Si vuelves a abrir la misma ruta en el día, se reutiliza desde memoria sin consumir llamadas de API (costo $0 y 0 requests).</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">2. Fallback Automático Gratuito (OSRM / OpenStreetMap):</strong>
                      <span className="text-slate-600"> Si no se suministra API Key o si en algún momento se agotara la cuota, la aplicación cambia instantáneamente a los servidores abiertos de OpenStreetMap sin detener la operación ni generar facturas.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">3. Tope de Presupuesto en Google Cloud:</strong>
                      <span className="text-slate-600"> En la consola de Google Cloud (Facturación &gt; Presupuestos) puedes establecer una alerta de presupuesto en $0 USD para asegurarte de que Google te notifique y bloquee cualquier cobro imprevisto.</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Pie del Modal */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Crédito oficial documentado en Google Cloud Pricing 2026.
              </span>
              <button
                type="button"
                onClick={() => setShowQuotaModal(false)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Entendido, Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Calibración / Edición Directa de Coordenadas de Parada o Tienda */}
      {editingPointIndex !== null && editingPointData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden my-6">

            {/* Cabecera */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white tracking-tight">
                    {editingPointIndex === 0
                      ? 'Calibrar Ubicación de Bodega CEDI'
                      : (editingPointData.storeId ? `Editar GPS: ${editingPointData.storeId}` : `Editar Coordenadas Parada #${editingPointIndex}`)}
                  </h3>
                  <p className="text-xs text-slate-300 truncate max-w-xs">
                    {editingPointData.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setEditingPointIndex(null); setEditingPointData(null); }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSaveEditedPoint} className="p-5 space-y-4 text-xs">

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Nombre del Punto o Almacén *
                </label>
                <input
                  type="text"
                  value={editingPointData.name}
                  onChange={(e) => setEditingPointData(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                  required
                  className="w-full p-2 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              {/* Caja Inteligente de Coordenadas */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-950 text-xs flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-blue-700" />
                    Coordenadas GPS (WGS84)
                  </span>
                  {editingPointData.storeId && (
                    <span className="text-[10px] bg-blue-200 text-blue-900 font-bold px-1.5 py-0.2 rounded font-mono">
                      {editingPointData.storeId}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Pegar enlace o par de coordenadas (Auto-extracción):
                  </label>
                  <input
                    type="text"
                    value={editingPointData.rawPaste}
                    onChange={(e) => handleParsePointCoordinates(e.target.value)}
                    placeholder="Ej: 5.452800, -75.651400 o URL de Google Maps..."
                    className="w-full p-2 bg-white border border-blue-300 rounded-lg text-xs font-mono text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Latitud Decimal *
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={editingPointData.lat}
                      onChange={(e) => setEditingPointData(prev => prev ? ({ ...prev, lat: parseFloat(e.target.value) || 0 }) : null)}
                      required
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Longitud Decimal *
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={editingPointData.lng}
                      onChange={(e) => setEditingPointData(prev => prev ? ({ ...prev, lng: parseFloat(e.target.value) || 0 }) : null)}
                      required
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-500">
                    Comprobar ubicación en Google Maps:
                  </span>
                  <a
                    href={`https://www.google.com/maps?q=${editingPointData.lat},${editingPointData.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-blue-700 border border-blue-200 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors shadow-2xs"
                  >
                    <ExternalLink className="w-3 h-3 text-blue-600" />
                    <span>Abrir en Google Maps</span>
                  </a>
                </div>
              </div>

              {/* Tiempo de Operación */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Tiempo de Descargue / Cargue (min)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={editingPointData.dischargeMinutes}
                    onChange={(e) => setEditingPointData(prev => prev ? ({ ...prev, dischargeMinutes: parseInt(e.target.value, 10) || 0 }) : null)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Dirección o Referencia
                  </label>
                  <input
                    type="text"
                    value={editingPointData.address}
                    onChange={(e) => setEditingPointData(prev => prev ? ({ ...prev, address: e.target.value }) : null)}
                    placeholder="Ej: Cra 10 # 20-30"
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {editingPointData.storeId && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    Al guardar, las coordenadas se actualizarán automáticamente en la colección <strong>stores</strong> de Firestore y en el directorio maestro de Hogar y Moda.
                  </span>
                </div>
              )}

              {/* Botones */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => { setEditingPointIndex(null); setEditingPointData(null); }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-sm shadow-blue-500/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar y Actualizar Mapa</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Modal para configurar API Key de Google Maps */}
      {isApiKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Clave API de Google Maps</h4>
                  <p className="text-[11px] text-slate-500">Google Cloud Maps Platform</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsApiKeyModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                Ingresa tu clave de API de Google Maps con las APIs de <strong>Maps JavaScript, Places, Geocoding y Directions</strong> habilitadas en Google Cloud Console.
              </p>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Google Maps API Key:
                </label>
                <input
                  type="text"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value.trim())}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800">💡 Alternativa Libre sin Costo:</div>
                <p>
                  Si no cuentas con facturación activa en Google Cloud, puedes seleccionar <strong>🗺️ OpenStreetMap</strong> en la barra superior: funciona sin clave, sin límites y sin costo.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('scj_google_maps_api_key');
                  setCustomApiKey('');
                  setApiKeyInput('');
                  setIsApiKeyModalOpen(false);
                  setStatusMessage('Clave API restablecida a la configuración predeterminada.');
                  setTimeout(() => setStatusMessage(null), 3000);
                }}
                className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-medium cursor-pointer"
              >
                Restablecer
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsApiKeyModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (apiKeyInput.trim()) {
                      localStorage.setItem('scj_google_maps_api_key', apiKeyInput.trim());
                      setCustomApiKey(apiKeyInput.trim());
                      setMapEngine('google');
                      localStorage.setItem('scj_map_engine', 'google');
                      setGoogleMapsErrorNotice(null);
                    }
                    setIsApiKeyModalOpen(false);
                    setStatusMessage('Clave API de Google Maps actualizada con éxito.');
                    setTimeout(() => setStatusMessage(null), 3500);
                  }}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm cursor-pointer"
                >
                  Guardar y Activar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
