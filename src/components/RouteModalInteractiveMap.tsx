import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TollStation } from '../data/colombiaTolls';
import { getCustomStores, HogarYModaStore } from '../data/hogarYModaStores';
import { searchAddressOrCoords, GeocodedLocation } from '../utils/geocodingService';
import { COLOMBIA_LOCATIONS } from '../data/colombiaCoordinates';
import {
  MapPin,
  Trash2,
  Plus,
  Flag,
  Navigation,
  Store,
  Layers,
  Crosshair,
  X,
  ArrowUpDown,
  Loader2,
  Check,
  Search,
  Sparkles,
  Building2,
  ChevronDown
} from 'lucide-react';

export interface RouteMapStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  isWarehouse?: boolean;
  unloadMinutes: number;
}

export interface RouteModalInteractiveMapProps {
  stops: RouteMapStop[];
  onAddStopFromMap: (name: string, lat: number, lng: number, isWarehouse?: boolean, unloadMinutes?: number) => void;
  onRemoveStopFromMap: (index: number) => void;
  onSetOriginFromMap: (index: number) => void;
  onSetOriginFromCoords: (name: string, lat: number, lng: number) => void;
  onUpdateStop?: (index: number, updatedStop: RouteMapStop) => void;
  onSwapStops?: (index1: number, index2: number) => void;
  roadPoints?: { lat: number; lng: number }[];
  panTarget?: { lat: number; lng: number; zoom?: number; timestamp: number } | null;
  includeReturn: boolean;
  detectedTolls?: TollStation[];
  onCloseMap?: () => void;
  isCalculatingRoute?: boolean;
}

// Letras para las paradas: 0 -> A, 1 -> B, 2 -> C, etc.
const getPointLetter = (idx: number) => String.fromCharCode(65 + idx);

export const RouteModalInteractiveMap: React.FC<RouteModalInteractiveMapProps> = ({
  stops,
  onAddStopFromMap,
  onRemoveStopFromMap,
  onSetOriginFromMap,
  onSetOriginFromCoords,
  onUpdateStop,
  onSwapStops,
  roadPoints = [],
  panTarget,
  includeReturn,
  detectedTolls = [],
  onCloseMap,
  isCalculatingRoute = false
}) => {
  // Motor cartográfico: 'osm' (OpenStreetMap) o 'google' (Google Maps)
  const [mapEngine, setMapEngine] = useState<'osm' | 'google'>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('scj_map_engine') : null;
    return saved === 'google' ? 'google' : 'osm';
  });

  const [mapTypeId, setMapTypeId] = useState<'roadmap' | 'hybrid'>('roadmap');
  const [showStoreCatalog, setShowStoreCatalog] = useState<boolean>(true);

  // Estados para búsqueda por punto (A, B, C...) estilo Google Maps
  const [activeSearchIndex, setActiveSearchIndex] = useState<number | null>(null);
  const [searchInputs, setSearchInputs] = useState<Record<number, string>>({});
  const [searchResultsByPoint, setSearchResultsByPoint] = useState<Record<number, GeocodedLocation[]>>({});
  const [isSearchingPoint, setIsSearchingPoint] = useState<boolean>(false);

  // Buscador libre de coordenadas / dirección en la barra superior
  const [quickCoordQuery, setQuickCoordQuery] = useState<string>('');
  const [quickSearching, setQuickSearching] = useState<boolean>(false);

  // Ubicación seleccionada al hacer clic en el mapa
  const [clickedMapLocation, setClickedMapLocation] = useState<{
    lat: number;
    lng: number;
    suggestedName: string;
  } | null>(null);

  // Parada existente seleccionada para inspección/eliminación
  const [selectedStopIndex, setSelectedStopIndex] = useState<number | null>(null);

  // Tienda del catálogo seleccionada
  const [selectedStore, setSelectedStore] = useState<HogarYModaStore | null>(null);

  // Mensaje temporal de feedback
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  // Contenedores DOM para Leaflet y Google Maps
  const osmContainerRef = useRef<HTMLDivElement>(null);
  const googleContainerRef = useRef<HTMLDivElement>(null);

  // Instancias de mapas
  const osmMapRef = useRef<L.Map | null>(null);
  const osmLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const googleMapRef = useRef<any>(null);
  const googleMarkersRef = useRef<any[]>([]);
  const googlePolylineRef = useRef<any>(null);
  const googleBorderPolylineRef = useRef<any>(null);

  const stores = useMemo(() => getCustomStores(), []);

  // API Key de Google Maps
  const apiKey = typeof window !== 'undefined'
    ? (localStorage.getItem('scj_google_maps_api_key') || (import.meta.env as any).VITE_GOOGLE_MAPS_API_KEY )
    : "";

  // Sincronizar inputs locales con los nombres de las paradas
  useEffect(() => {
    const updated: Record<number, string> = {};
    stops.forEach((s, idx) => {
      // Solo sobreescribir si no se está editando activamente
      if (activeSearchIndex !== idx) {
        updated[idx] = s.name;
      }
    });
    setSearchInputs(prev => ({ ...updated, ...prev }));
  }, [stops, activeSearchIndex]);

  // ==========================================
  // 1. MOTOR LEAFLET (OPENSTREETMAP)
  // ==========================================
  useEffect(() => {
    if (mapEngine !== 'osm' || !osmContainerRef.current) return;

    if (!osmMapRef.current) {
      try {
        const centerLat = stops[0]?.lat || 6.11888;
        const centerLng = stops[0]?.lng || -75.62755;

        const map = L.map(osmContainerRef.current, {
          center: [centerLat, centerLng],
          zoom: 11,
          zoomControl: true,
          attributionControl: true
        });

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap',
          maxZoom: 19
        }).addTo(map);

        const layerGroup = L.layerGroup().addTo(map);
        osmLayerGroupRef.current = layerGroup;
        osmMapRef.current = map;

        map.on('click', (e: L.LeafletMouseEvent) => {
          setSelectedStopIndex(null);
          setSelectedStore(null);
          setClickedMapLocation({
            lat: Number(e.latlng.lat.toFixed(5)),
            lng: Number(e.latlng.lng.toFixed(5)),
            suggestedName: `Punto GPS (${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)})`
          });
        });

        setTimeout(() => {
          try { map.invalidateSize(); } catch (e) {}
        }, 120);
      } catch (err) {
        console.warn('Error inicializando Leaflet:', err);
      }
    }
  }, [mapEngine]);

  // Redimensionar Leaflet
  useEffect(() => {
    if (mapEngine !== 'osm' || !osmMapRef.current || !osmContainerRef.current) return;
    const observer = new ResizeObserver(() => {
      try { osmMapRef.current?.invalidateSize(); } catch (e) {}
    });
    observer.observe(osmContainerRef.current);
    return () => observer.disconnect();
  }, [mapEngine]);

  // Actualizar capas de Leaflet (Paradas con Letras A, B, C..., Trazado, Tiendas)
  useEffect(() => {
    if (mapEngine !== 'osm') return;
    const map = osmMapRef.current;
    const layerGroup = osmLayerGroupRef.current;
    if (!map || !layerGroup) return;

    try {
      layerGroup.clearLayers();

      // 1. Trazado vial
      const pathPoints = (roadPoints && roadPoints.length > 0)
        ? roadPoints
        : stops.map(s => ({ lat: s.lat, lng: s.lng }));

      if (pathPoints.length >= 2) {
        const latLngs: L.LatLngTuple[] = pathPoints.map(p => [p.lat, p.lng]);

        L.polyline(latLngs, {
          color: '#0f172a',
          weight: 6,
          opacity: 0.9,
          lineJoin: 'round'
        }).addTo(layerGroup);

        L.polyline(latLngs, {
          color: '#2563eb',
          weight: 3.5,
          opacity: 1.0,
          lineJoin: 'round'
        }).addTo(layerGroup);
      }

      // 2. Marcadores de paradas con letras estilo Google Maps (A, B, C...)
      stops.forEach((stop, idx) => {
        const isOrigin = idx === 0;
        const letter = getPointLetter(idx);
        const bgCol = isOrigin ? '#16a34a' : (idx === stops.length - 1 && stops.length > 1 ? '#dc2626' : '#2563eb');

        const iconHtml = `
          <div style="transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <div style="background-color: ${bgCol}; color: #ffffff; font-size: 11px; font-weight: 800; padding: 2px 7px; border-radius: 9999px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.35); border: 2px solid #ffffff; display: flex; align-items: center; gap: 4px; white-space: nowrap;">
              <span style="background-color: #ffffff; color: ${bgCol}; font-size: 10px; width: 16px; height: 16px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-weight: 900;">${letter}</span>
              <span style="max-width: 120px; overflow: hidden; text-overflow: ellipsis;">${stop.name}</span>
            </div>
            <div style="width: 8px; height: 8px; background-color: ${bgCol}; transform: rotate(45deg); margin-top: -4px; border-right: 2px solid #ffffff; border-bottom: 2px solid #ffffff;"></div>
          </div>
        `;

        const icon = L.divIcon({
          html: iconHtml,
          className: 'scj-stop-marker',
          iconSize: [0, 0]
        });

        const marker = L.marker([stop.lat, stop.lng], { icon });
        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          setClickedMapLocation(null);
          setSelectedStore(null);
          setSelectedStopIndex(idx);
        });
        marker.addTo(layerGroup);
      });

      // 3. Tiendas de Hogar y Moda
      if (showStoreCatalog) {
        stores.forEach(st => {
          const already = stops.some(s => s.id === st.id || (Math.abs(s.lat - st.lat) < 0.001 && Math.abs(s.lng - st.lng) < 0.001));
          if (already) return;

          const storeHtml = `
            <div style="transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center; cursor: pointer; opacity: 0.85;">
              <div style="background-color: ${st.isOriginWarehouse ? '#047857' : '#0284c7'}; color: #ffffff; font-size: 9px; font-weight: bold; padding: 1px 5px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); border: 1px solid #ffffff; display: flex; align-items: center; gap: 3px; white-space: nowrap;">
                <span>${st.isOriginWarehouse ? '🏢' : '🏪'}</span>
                <span>${st.id} ${st.name.slice(0, 14)}</span>
              </div>
            </div>
          `;

          const storeIcon = L.divIcon({
            html: storeHtml,
            className: 'scj-store-marker',
            iconSize: [0, 0]
          });

          const storeMarker = L.marker([st.lat, st.lng], { icon: storeIcon });
          storeMarker.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            setClickedMapLocation(null);
            setSelectedStopIndex(null);
            setSelectedStore(st);
          });
          storeMarker.addTo(layerGroup);
        });
      }

      // Auto-centrar si hay paradas
      if (stops.length >= 2 && !panTarget) {
        const bounds = L.latLngBounds(stops.map(s => [s.lat, s.lng]));
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    } catch (err) {
      console.warn('Error en capas Leaflet:', err);
    }
  }, [stops, roadPoints, showStoreCatalog, stores, mapEngine, panTarget]);

  // Manejar panTarget en Leaflet
  useEffect(() => {
    if (mapEngine !== 'osm' || !osmMapRef.current || !panTarget) return;
    try {
      osmMapRef.current.flyTo([panTarget.lat, panTarget.lng], panTarget.zoom || 14, { duration: 1.0 });
    } catch (e) {}
  }, [mapEngine, panTarget]);

  // ==========================================
  // 2. MOTOR GOOGLE MAPS NATIVO
  // ==========================================
  useEffect(() => {
    if (mapEngine !== 'google' || !googleContainerRef.current) return;

    const g = typeof window !== 'undefined' ? (window as any).google : undefined;
    if (!g?.maps?.Map) {
      const scriptId = 'google-maps-script-tag';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry,routes&region=CO&language=es`;
        script.async = true;
        script.onload = () => initGoogleMap();
        script.onerror = () => setMapEngine('osm');
        document.head.appendChild(script);
      }
      return;
    }

    initGoogleMap();

    function initGoogleMap() {
      const googleMaps = (window as any).google?.maps;
      if (!googleMaps || !googleContainerRef.current) return;

      if (!googleMapRef.current) {
        const center = stops[0] ? { lat: stops[0].lat, lng: stops[0].lng } : { lat: 6.11888, lng: -75.62755 };
        const map = new googleMaps.Map(googleContainerRef.current, {
          center,
          zoom: 11,
          mapTypeId,
          disableDefaultUI: false,
          gestureHandling: 'greedy'
        });

        map.addListener('click', (e: any) => {
          setSelectedStopIndex(null);
          setSelectedStore(null);
          if (e.latLng) {
            const lat = Number(e.latLng.lat().toFixed(5));
            const lng = Number(e.latLng.lng().toFixed(5));
            setClickedMapLocation({
              lat,
              lng,
              suggestedName: `Punto GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`
            });
          }
        });

        googleMapRef.current = map;
      }
    }
  }, [mapEngine, apiKey]);

  // Actualizar capas en Google Maps
  useEffect(() => {
    if (mapEngine !== 'google' || !googleMapRef.current) return;
    const g = (window as any).google?.maps;
    if (!g) return;

    const map = googleMapRef.current;
    map.setMapTypeId(mapTypeId);

    googleMarkersRef.current.forEach(m => m.setMap(null));
    googleMarkersRef.current = [];

    if (googlePolylineRef.current) {
      googlePolylineRef.current.setMap(null);
      googlePolylineRef.current = null;
    }
    if (googleBorderPolylineRef.current) {
      googleBorderPolylineRef.current.setMap(null);
      googleBorderPolylineRef.current = null;
    }

    const pathPoints = (roadPoints && roadPoints.length > 0)
      ? roadPoints
      : stops.map(s => ({ lat: s.lat, lng: s.lng }));

    if (pathPoints.length >= 2) {
      googleBorderPolylineRef.current = new g.Polyline({
        path: pathPoints,
        strokeColor: '#0f172a',
        strokeOpacity: 0.9,
        strokeWeight: 6,
        map
      });

      googlePolylineRef.current = new g.Polyline({
        path: pathPoints,
        strokeColor: '#2563eb',
        strokeOpacity: 1.0,
        strokeWeight: 3.5,
        map
      });
    }

    stops.forEach((stop, idx) => {
      const letter = getPointLetter(idx);
      const marker = new g.Marker({
        position: { lat: stop.lat, lng: stop.lng },
        map,
        title: `${letter}: ${stop.name}`,
        label: {
          text: letter,
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: '11px'
        }
      });

      marker.addListener('click', () => {
        setClickedMapLocation(null);
        setSelectedStore(null);
        setSelectedStopIndex(idx);
      });

      googleMarkersRef.current.push(marker);
    });

    if (stops.length >= 2 && !panTarget) {
      const bounds = new g.LatLngBounds();
      stops.forEach(s => bounds.extend({ lat: s.lat, lng: s.lng }));
      map.fitBounds(bounds);
    }
  }, [mapEngine, stops, roadPoints, showStoreCatalog, stores, mapTypeId, panTarget]);

  // ==========================================
  // 3. BUSCADOR POR PUNTO ESTILO GOOGLE MAPS (A, B, C...)
  // ==========================================
  const handlePointSearch = async (index: number, query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsSearchingPoint(true);
    setActiveSearchIndex(index);

    // 1. Detección inmediata de coordenadas directas: "6.1759, -75.5917"
    const coordMatch = trimmed.match(/^([-+]?\d+\.?\d*)[,\s]+([-+]?\d+\.?\d*)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      if (!isNaN(lat) && !isNaN(lng)) {
        applyLocationToPoint(index, {
          name: `Punto GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
          displayAddress: `Coordenadas Lat ${lat.toFixed(5)}, Lng ${lng.toFixed(5)}`,
          lat,
          lng,
          source: 'coords'
        });
        setIsSearchingPoint(false);
        return;
      }
    }

    // 2. Búsqueda local en tiendas de Hogar y Moda
    const q = trimmed.toLowerCase();
    const matchedStores: GeocodedLocation[] = stores
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

    // 3. Búsqueda en municipios colombianos
    const matchedLocations: GeocodedLocation[] = Object.entries(COLOMBIA_LOCATIONS)
      .filter(([k, loc]) => k.includes(q.toUpperCase()) || loc.name.toLowerCase().includes(q))
      .map(([_, loc]) => ({
        name: loc.name,
        displayAddress: `${loc.name}, Colombia`,
        lat: loc.lat,
        lng: loc.lng,
        source: 'catalog' as const
      }));

    // 4. Búsqueda geocodificada en línea
    let onlineResults: GeocodedLocation[] = [];
    try {
      onlineResults = await searchAddressOrCoords(trimmed);
    } catch (e) {}

    const combined = [
      ...matchedStores,
      ...matchedLocations.filter(m => !matchedStores.some(s => Math.abs(s.lat - m.lat) < 0.001)),
      ...onlineResults.filter(o => !matchedStores.some(s => Math.abs(s.lat - o.lat) < 0.001))
    ].slice(0, 6);

    setSearchResultsByPoint(prev => ({ ...prev, [index]: combined }));
    setIsSearchingPoint(false);
  };

  // Aplicar ubicación seleccionada a la parada específica
  const applyLocationToPoint = (index: number, loc: GeocodedLocation) => {
    if (onUpdateStop && stops[index]) {
      const isOrigin = index === 0;
      const matchedStore = stores.find(s => s.name === loc.name || loc.name.includes(s.id));
      onUpdateStop(index, {
        ...stops[index],
        id: matchedStore ? matchedStore.id : (isOrigin ? 'ORIGIN' : `STOP-${index}`),
        name: loc.name,
        lat: loc.lat,
        lng: loc.lng,
        isWarehouse: isOrigin ? true : (matchedStore ? Boolean(matchedStore.isOriginWarehouse) : stops[index].isWarehouse)
      });
    }

    setSearchInputs(prev => ({ ...prev, [index]: loc.name }));
    setSearchResultsByPoint(prev => ({ ...prev, [index]: [] }));
    setActiveSearchIndex(null);

    // Centrar mapa suavemente
    if (osmMapRef.current) {
      try { osmMapRef.current.flyTo([loc.lat, loc.lng], 14, { duration: 1.0 }); } catch (e) {}
    }
    if (googleMapRef.current) {
      try {
        googleMapRef.current.panTo({ lat: loc.lat, lng: loc.lng });
        googleMapRef.current.setZoom(14);
      } catch (e) {}
    }

    showFeedback(`📍 Punto ${getPointLetter(index)} fijado en "${loc.name}"`);
  };

  // Búsqueda rápida superior (dirección o coordenadas)
  const handleQuickSearch = async () => {
    if (!quickCoordQuery.trim()) return;
    setQuickSearching(true);
    try {
      const results = await searchAddressOrCoords(quickCoordQuery);
      if (results && results.length > 0) {
        const top = results[0];
        setClickedMapLocation({
          lat: top.lat,
          lng: top.lng,
          suggestedName: top.name
        });
        if (osmMapRef.current) {
          try { osmMapRef.current.flyTo([top.lat, top.lng], 14, { duration: 1.0 }); } catch (e) {}
        }
        if (googleMapRef.current) {
          try {
            googleMapRef.current.panTo({ lat: top.lat, lng: top.lng });
            googleMapRef.current.setZoom(14);
          } catch (e) {}
        }
        showFeedback(`🎯 Ubicado en mapa: ${top.name}`);
      } else {
        showFeedback('No se encontró la dirección. Intenta con "Lat, Lng" o nombre de municipio.');
      }
    } catch (e) {
      showFeedback('Error en búsqueda de coordenadas.');
    } finally {
      setQuickSearching(false);
    }
  };

  // ==========================================
  // 4. ACCIONES SOBRE EL MAPA
  // ==========================================
  const handleAddClickedAsDestination = () => {
    if (!clickedMapLocation) return;
    onAddStopFromMap(
      clickedMapLocation.suggestedName,
      clickedMapLocation.lat,
      clickedMapLocation.lng,
      false,
      30
    );
    showFeedback(`📍 Punto ${getPointLetter(stops.length)} agregado: [${clickedMapLocation.lat}, ${clickedMapLocation.lng}]`);
    setClickedMapLocation(null);
  };

  const handleSetClickedAsOrigin = () => {
    if (!clickedMapLocation) return;
    onSetOriginFromCoords(
      clickedMapLocation.suggestedName,
      clickedMapLocation.lat,
      clickedMapLocation.lng
    );
    showFeedback(`🚩 Salida (Punto A) fijada en: [${clickedMapLocation.lat}, ${clickedMapLocation.lng}]`);
    setClickedMapLocation(null);
  };

  const handleRemoveSelectedStop = () => {
    if (selectedStopIndex === null) return;
    const removedName = stops[selectedStopIndex]?.name;
    onRemoveStopFromMap(selectedStopIndex);
    setSelectedStopIndex(null);
    showFeedback(`🗑️ Parada eliminada: "${removedName}"`);
  };

  const handlePromoteSelectedToOrigin = () => {
    if (selectedStopIndex === null) return;
    onSetOriginFromMap(selectedStopIndex);
    setSelectedStopIndex(null);
    showFeedback(`🚩 Punto ${getPointLetter(selectedStopIndex)} es ahora la Salida.`);
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col text-slate-100">

      {/* 1. BARRA SUPERIOR: Motor, capas y buscador rápido */}
      <div className="bg-slate-950 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600 rounded-lg text-white shadow-xs">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs">Trazador de Ruta Estilo Google Maps</span>
              <span className="bg-blue-900/90 text-blue-300 font-mono text-[10px] px-2 py-0.5 rounded-full font-bold border border-blue-700/60">
                Punto A ➡️ Punto {getPointLetter(stops.length - 1)} ({stops.length} ubicaciones)
              </span>
              {isCalculatingRoute && (
                <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-950/70 px-2 py-0.5 rounded border border-amber-800 animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Calculando calzadas viales...</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Buscador de Coordenadas Directas o Dirección */}
        <div className="flex items-center gap-1.5 flex-1 max-w-md">
          <div className="relative flex-1">
            <input
              type="text"
              value={quickCoordQuery}
              onChange={(e) => setQuickCoordQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleQuickSearch(); } }}
              placeholder="Buscar dirección o coordenadas (ej: 6.1759, -75.5917)..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {quickCoordQuery && (
              <button
                type="button"
                onClick={() => setQuickCoordQuery('')}
                className="absolute right-2 top-1 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={handleQuickSearch}
            disabled={quickSearching || !quickCoordQuery.trim()}
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
          >
            {quickSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>Ubicar</span>
          </button>
        </div>

        {/* Controles de motor de mapa */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-700 text-[10px]">
            <button
              type="button"
              onClick={() => {
                setMapEngine('osm');
                if (typeof window !== 'undefined') localStorage.setItem('scj_map_engine', 'osm');
              }}
              className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                mapEngine === 'osm' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              OpenStreetMap
            </button>
            <button
              type="button"
              onClick={() => {
                setMapEngine('google');
                if (typeof window !== 'undefined') localStorage.setItem('scj_map_engine', 'google');
              }}
              className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                mapEngine === 'google' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Google Maps
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowStoreCatalog(!showStoreCatalog)}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors border cursor-pointer ${
              showStoreCatalog ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <Store className="w-3 h-3" />
            <span>{stores.length} Tiendas</span>
          </button>

          {mapEngine === 'google' && (
            <button
              type="button"
              onClick={() => setMapTypeId(prev => prev === 'roadmap' ? 'hybrid' : 'roadmap')}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold border border-slate-700 flex items-center gap-1 cursor-pointer"
            >
              <Layers className="w-3 h-3 text-amber-400" />
              <span>{mapTypeId === 'roadmap' ? 'Satélite' : 'Mapa'}</span>
            </button>
          )}

          {onCloseMap && (
            <button
              type="button"
              onClick={onCloseMap}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
              title="Ocultar Mapa"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Feedback flotante */}
      {feedbackMessage && (
        <div className="bg-emerald-600 text-white text-[11px] font-bold px-3 py-1 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            <span>{feedbackMessage}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-emerald-200 hover:text-white">✕</button>
        </div>
      )}

      {/* 2. CUERPO PRINCIPAL: PANEL LATERAL DE PUNTOS (A, B, C...) + MAPA */}
      <div className="flex flex-col lg:flex-row h-[460px] bg-slate-950">

        {/* PANEL DE PUNTOS DE RUTA ESTILO GOOGLE MAPS (PUNTO A, B, C...) */}
        <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-900/95 flex flex-col p-3 overflow-y-auto shrink-0 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>Paradas de la Ruta</span>
              <span className="text-[10px] text-blue-400 font-mono">({stops.length})</span>
            </span>

            {/* Intercambiar A y B */}
            {stops.length >= 2 && onSwapStops && (
              <button
                type="button"
                onClick={() => onSwapStops(0, 1)}
                className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded border border-slate-700 cursor-pointer"
                title="Invertir sentido entre Punto A y Punto B"
              >
                <ArrowUpDown className="w-3 h-3" />
                <span>Invertir A ⇄ B</span>
              </button>
            )}
          </div>

          {/* LISTADO DE INPUTS PARA CADA PUNTO (A, B, C, D...) */}
          <div className="space-y-2">
            {stops.map((stop, idx) => {
              const letter = getPointLetter(idx);
              const isOrigin = idx === 0;
              const isDest = idx === 1;
              const dotColor = isOrigin ? 'bg-emerald-500 ring-emerald-400/40' : (isDest ? 'bg-rose-500 ring-rose-400/40' : 'bg-blue-500 ring-blue-400/40');
              const searchResults = searchResultsByPoint[idx] || [];

              return (
                <div key={`stop-input-${stop.id}-${idx}`} className="relative bg-slate-950/80 rounded-xl p-2 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-5 h-5 rounded-full ${dotColor} ring-2 text-white font-extrabold flex items-center justify-center text-[10px]`}>
                        {letter}
                      </span>
                      <span className="font-bold text-slate-200">
                        {isOrigin ? 'Punto A (Salida / Origen)' : `Punto ${letter} (Destino ${idx})`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Botón eliminar parada (si hay más de 2) */}
                      {stops.length > 2 && (
                        <button
                          type="button"
                          onClick={() => onRemoveStopFromMap(idx)}
                          className="text-slate-400 hover:text-rose-400 p-0.5 rounded hover:bg-slate-800 cursor-pointer"
                          title="Quitar esta parada"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Input de búsqueda, nombre personalizado o coordenadas para este punto */}
                  <div className="flex items-center gap-1">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={searchInputs[idx] !== undefined ? searchInputs[idx] : stop.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSearchInputs(prev => ({ ...prev, [idx]: val }));
                          setActiveSearchIndex(idx);
                          // Actualizar nombre inmediatamente en tiempo real para nombres libres
                          if (onUpdateStop && stops[idx]) {
                            onUpdateStop(idx, { ...stops[idx], name: val });
                          }
                          if (val.trim().length >= 2) {
                            handlePointSearch(idx, val);
                          } else {
                            setSearchResultsByPoint(prev => ({ ...prev, [idx]: [] }));
                          }
                        }}
                        onBlur={() => {
                          if (onUpdateStop && stops[idx] && searchInputs[idx] !== undefined) {
                            onUpdateStop(idx, { ...stops[idx], name: searchInputs[idx] });
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handlePointSearch(idx, searchInputs[idx] || stop.name);
                          }
                        }}
                        placeholder={idx === 0 ? "Escribe nombre de bodega, dirección o Lat, Lng..." : `Escribe nombre, dirección o Lat, Lng para Punto ${letter}...`}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePointSearch(idx, searchInputs[idx] || stop.name)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 cursor-pointer"
                      title="Buscar punto"
                    >
                      <Search className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Selector rápido opcional de locales registrados del catálogo */}
                  <div className="pt-0.5">
                    <select
                      value={stop.id && stop.id.startsWith('L-') ? stop.id : ''}
                      onChange={(e) => {
                        const storeId = e.target.value;
                        if (!storeId) return;
                        const st = stores.find(s => s.id === storeId);
                        if (st) {
                          applyLocationToPoint(idx, {
                            name: st.isOriginWarehouse ? st.name : `${st.id} - ${st.name} (${st.municipality})`,
                            displayAddress: st.address ? `${st.address}, ${st.municipality}` : st.municipality,
                            lat: st.lat,
                            lng: st.lng,
                            source: 'catalog'
                          });
                        }
                      }}
                      className="w-full text-[10px] bg-slate-900/90 text-slate-300 border border-slate-800 rounded px-1.5 py-0.5 focus:border-blue-500 focus:outline-none cursor-pointer truncate"
                    >
                      <option value="">🏪 O seleccionar de Locales Registrados...</option>
                      {stores.map(st => (
                        <option key={st.id} value={st.id}>
                          {st.isOriginWarehouse ? '🏬 [Bodega] ' : '📍 '} {st.id} - {st.name} ({st.municipality})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono px-0.5">
                    <span>GPS: {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}</span>
                    {!isOrigin && <span>⏱️ {stop.unloadMinutes}m descargue</span>}
                  </div>

                  {/* Resultados de búsqueda flotantes para este punto */}
                  {activeSearchIndex === idx && searchResults.length > 0 && (
                    <div className="bg-slate-900 border border-blue-500/80 rounded-xl overflow-hidden shadow-2xl p-1 z-[1200] max-h-48 overflow-y-auto space-y-0.5">
                      <div className="text-[10px] text-slate-400 font-bold px-2 py-1 flex items-center justify-between">
                        <span>Sugerencias para Punto {letter}:</span>
                        <button type="button" onClick={() => setActiveSearchIndex(null)} className="text-slate-400 hover:text-white">✕</button>
                      </div>
                      {searchResults.map((res, rIdx) => (
                        <div
                          key={`res-${rIdx}`}
                          onClick={() => applyLocationToPoint(idx, res)}
                          className="p-1.5 rounded-lg hover:bg-blue-600/30 border border-transparent hover:border-blue-500/50 flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <div className="space-y-0.5 truncate pr-1">
                            <div className="font-bold text-slate-100 text-[11px] truncate flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
                              <span className="truncate">{res.name}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">{res.displayAddress}</div>
                          </div>
                          <span className="text-[9px] bg-blue-900/80 text-blue-200 px-1.5 py-0.5 rounded font-mono shrink-0">
                            Fijar {letter}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Botón para agregar más destinos (Punto C, Punto D...) */}
          <button
            type="button"
            onClick={() => {
              const nextLetter = getPointLetter(stops.length);
              onAddStopFromMap(
                `Punto ${nextLetter}`,
                stops[stops.length - 1]?.lat ? stops[stops.length - 1].lat + 0.015 : 6.1722,
                stops[stops.length - 1]?.lng ? stops[stops.length - 1].lng - 0.015 : -75.6097,
                false,
                30
              );
              showFeedback(`➕ Agregado nuevo Punto ${nextLetter}. Puedes escribir su dirección o coordenadas.`);
            }}
            className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-dashed border-slate-700 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Agregar Parada (Punto {getPointLetter(stops.length)})</span>
          </button>
        </div>

        {/* ÁREA DEL MAPA INTERACTIVO (OPENSTREETMAP / GOOGLE MAPS) */}
        <div className="relative flex-1 h-full bg-slate-950">

          {/* Contenedor OpenStreetMap */}
          <div
            ref={osmContainerRef}
            className={`w-full h-full ${mapEngine === 'osm' ? 'block' : 'hidden'}`}
          />

          {/* Contenedor Google Maps */}
          <div
            ref={googleContainerRef}
            className={`w-full h-full ${mapEngine === 'google' ? 'block' : 'hidden'}`}
          />

          {/* Tarjeta flotante 1: Clic en cualquier parte del mapa */}
          {clickedMapLocation && (
            <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-white rounded-xl shadow-2xl border-2 border-blue-600 p-3.5 z-[1000] text-slate-900 animate-in fade-in duration-100">
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-1.5 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <div className="font-bold text-xs text-slate-900">Ubicación Clicada en Mapa</div>
                    <div className="font-mono text-[10px] text-slate-500">
                      Lat {clickedMapLocation.lat}, Lng {clickedMapLocation.lng}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setClickedMapLocation(null)}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={handleAddClickedAsDestination}
                  className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar como Parada (Punto {getPointLetter(stops.length)})</span>
                </button>

                <button
                  type="button"
                  onClick={handleSetClickedAsOrigin}
                  className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Fijar como Punto A (Salida / Origen)</span>
                </button>
              </div>
            </div>
          )}

          {/* Tarjeta flotante 2: Inspeccionar o quitar parada existente */}
          {selectedStopIndex !== null && stops[selectedStopIndex] && (
            <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-white rounded-xl shadow-2xl border-2 border-slate-800 p-3.5 z-[1000] text-slate-900 animate-in fade-in duration-100">
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-1.5 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] text-white ${
                    selectedStopIndex === 0 ? 'bg-emerald-600' : 'bg-blue-600'
                  }`}>
                    {getPointLetter(selectedStopIndex)}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900 line-clamp-1">
                      {stops[selectedStopIndex].name}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {selectedStopIndex === 0 ? 'Punto A (Salida de Ruta)' : `Punto ${getPointLetter(selectedStopIndex)} (Destino)`}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStopIndex(null)}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                >
                  ✕
                </button>
              </div>

              <div className="text-[11px] text-slate-600 mb-2 space-y-0.5">
                <div>📍 Coords: <span className="font-mono text-slate-800">{stops[selectedStopIndex].lat.toFixed(4)}, {stops[selectedStopIndex].lng.toFixed(4)}</span></div>
                <div>⏱️ Tiempo estimado descargue: <strong>{stops[selectedStopIndex].unloadMinutes} min</strong></div>
              </div>

              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={handleRemoveSelectedStop}
                  className="w-full py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Quitar este Punto de la Ruta</span>
                </button>

                {selectedStopIndex !== 0 && (
                  <button
                    type="button"
                    onClick={handlePromoteSelectedToOrigin}
                    className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Flag className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Convertir en Punto A (Salida)</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tarjeta flotante 3: Tienda Hogar y Moda */}
          {selectedStore && (
            <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-white rounded-xl shadow-2xl border-2 border-sky-600 p-3.5 z-[1000] text-slate-900 animate-in fade-in duration-100">
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-1.5 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-sky-600 shrink-0" />
                  <div>
                    <div className="font-bold text-xs text-slate-900">
                      {selectedStore.id} - {selectedStore.name}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {selectedStore.municipality} • {selectedStore.address || 'Hogar y Moda'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStore(null)}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onAddStopFromMap(
                      selectedStore.isOriginWarehouse ? selectedStore.name : `${selectedStore.id} - ${selectedStore.name} (${selectedStore.municipality})`,
                      selectedStore.lat,
                      selectedStore.lng,
                      Boolean(selectedStore.isOriginWarehouse),
                      selectedStore.dischargeMinutes || 30
                    );
                    setSelectedStore(null);
                    showFeedback(`➕ Tienda agregada: ${selectedStore.id} ${selectedStore.name}`);
                  }}
                  className="w-full py-1.5 px-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar como Parada</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSetOriginFromCoords(
                      selectedStore.isOriginWarehouse ? selectedStore.name : `${selectedStore.id} - ${selectedStore.name} (${selectedStore.municipality})`,
                      selectedStore.lat,
                      selectedStore.lng
                    );
                    setSelectedStore(null);
                    showFeedback(`🚩 Salida fijada en: ${selectedStore.id} ${selectedStore.name}`);
                  }}
                  className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Establecer como Punto A (Salida)</span>
                </button>
              </div>
            </div>
          )}

          {/* Guía en esquina del mapa */}
          <div className="absolute top-2.5 left-2.5 z-[400] pointer-events-none">
            <div className="bg-slate-900/85 backdrop-blur-xs text-white text-[10px] px-2.5 py-1 rounded-md border border-slate-700 shadow-md flex items-center gap-1.5">
              <Crosshair className="w-3 h-3 text-amber-400" />
              <span>Haz clic en el mapa para marcar o escribe en Punto A/B</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
