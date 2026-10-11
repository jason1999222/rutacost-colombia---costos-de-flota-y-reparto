import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoCoord } from '../data/colombiaCoordinates';
import { TollStation } from '../data/colombiaTolls';
import { formatCOP } from '../utils/costCalculator';

interface OpenStreetMapCanvasProps {
  coords: GeoCoord[];
  roadPath?: { lat: number; lng: number }[];
  showTraffic?: boolean;
  showTolls?: boolean;
  tolls?: TollStation[];
  activeVehicleType?: 'NPR' | 'NLR';
  clickToAddEnabled?: boolean;
  onMapClick?: (lat: number, lng: number) => void;
  onEditPoint?: (index: number) => void;
  focusCediTrigger?: number;
  panTarget?: { lat: number; lng: number; zoom?: number; timestamp: number } | null;
  townCatalog?: Record<string, GeoCoord>;
  showTownCatalog?: boolean;
  onAddTown?: (key: string) => void;
  stops?: { name: string; lat: number; lng: number }[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
}

export const OpenStreetMapCanvas: React.FC<OpenStreetMapCanvasProps> = ({
  coords,
  roadPath = [],
  showTolls = true,
  tolls = [],
  activeVehicleType = 'NPR',
  clickToAddEnabled = true,
  onMapClick,
  onEditPoint,
  focusCediTrigger,
  panTarget,
  townCatalog = {},
  showTownCatalog = false,
  onAddTown,
  stops,
  center,
  zoom,
  height
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Inicializar el mapa de Leaflet una sola vez (100% bundled sin depender de scripts externos)
  useEffect(() => {
    if (!containerRef.current || mapInstanceRef.current) return;

    let resizeObserver: ResizeObserver | null = null;

    try {
      if (typeof window !== 'undefined') {
        (window as any).L = L;
      }

      // Centro por defecto: Antioquia / Eje Cafetero
      const map = L.map(containerRef.current, {
        center: [5.85, -75.65],
        zoom: 10,
        zoomControl: true,
        attributionControl: true
      });

      // Capa base oficial de OpenStreetMap (100% libre, sin marcas de agua ni restricciones de API key)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      // Evento de clic en el mapa para agregar paradas
      map.on('click', (e: any) => {
        if (clickToAddEnabled && onMapClick) {
          onMapClick(e.latlng.lat, e.latlng.lng);
        }
      });

      // Forzar recalculo de dimensiones del mapa tras montar
      setTimeout(() => {
        try { map.invalidateSize(); } catch (e) {}
      }, 150);

      if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
        resizeObserver = new ResizeObserver(() => {
          try { map.invalidateSize(); } catch (e) {}
        });
        resizeObserver.observe(containerRef.current);
      }
    } catch (err) {
      console.warn('Error inicializando OpenStreetMap Leaflet:', err);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Actualizar el listener de clic si cambia clickToAddEnabled
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.off('click');
    map.on('click', (e: any) => {
      if (clickToAddEnabled && onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    });
  }, [clickToAddEnabled, onMapClick]);

  // Manejar el enfoque a un punto de búsqueda (panTarget)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !panTarget) return;
    try {
      map.flyTo([panTarget.lat, panTarget.lng], panTarget.zoom || 14, { duration: 1.2 });
    } catch (e) {}
  }, [panTarget]);

  // Manejar enfoque al CEDI principal
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !focusCediTrigger || focusCediTrigger === 0) return;
    try {
      map.flyTo([6.11888, -75.62755], 16, { duration: 1.2 });
    } catch (e) {}
  }, [focusCediTrigger]);

  // Redibujar capas de ruta, paradas, peajes y catálogo
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    try {
      layerGroup.clearLayers();

      const validCoords = coords.filter(c =>
        typeof c.lat === 'number' && typeof c.lng === 'number' && !isNaN(c.lat) && !isNaN(c.lng)
      );

      // 1. Trazado de Carretera (Polyline)
      const pathPoints = (roadPath && roadPath.length > 0)
        ? roadPath
        : validCoords.map(c => ({ lat: c.lat, lng: c.lng }));

      if (pathPoints.length >= 2) {
        const latLngs: L.LatLngTuple[] = pathPoints.map(p => [p.lat, p.lng]);

        // Casing exterior oscuro
        L.polyline(latLngs, {
          color: '#1e3a8a',
          weight: 7,
          opacity: 0.9,
          lineJoin: 'round'
        }).addTo(layerGroup);

        // Línea central azul vibrante
        L.polyline(latLngs, {
          color: '#2563eb',
          weight: 4,
          opacity: 1.0,
          lineJoin: 'round'
        }).addTo(layerGroup);
      }

      // 2. Marcadores Secuenciales de Paradas
      validCoords.forEach((coord, idx) => {
        const isCedi = idx === 0;
        const isLast = idx === validCoords.length - 1 && validCoords.length > 1;

        let iconHtml = '';
        if (isCedi) {
          iconHtml = `
            <div style="transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center; cursor: pointer;">
              <div style="background-color: #1e3a8a; color: #ffffff; font-size: 10px; font-weight: bold; padding: 3px 8px; border-radius: 6px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); border: 2px solid #ffffff; display: flex; align-items: center; gap: 4px; white-space: nowrap;">
                <span style="color: #fde047;">🏢</span>
                <span>CEDI Caldas</span>
                <span style="background-color: #facc15; color: #020617; font-size: 9px; padding: 1px 4px; border-radius: 3px; font-weight: 900;">120m</span>
              </div>
              <div style="width: 8px; height: 8px; background-color: #1e3a8a; transform: rotate(45deg); margin-top: -4px; border-right: 2px solid #ffffff; border-bottom: 2px solid #ffffff;"></div>
            </div>
          `;
        } else {
          const bgCol = isLast ? '#6b21a8' : '#0f172a';
          iconHtml = `
            <div style="transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center; cursor: pointer;">
              <div style="background-color: ${bgCol}; color: #ffffff; font-size: 10px; font-weight: bold; padding: 2px 7px; border-radius: 9999px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); border: 2px solid #ffffff; display: flex; align-items: center; gap: 4px; white-space: nowrap;">
                <span style="background-color: ${isLast ? '#facc15' : 'rgba(255,255,255,0.25)'}; color: ${isLast ? '#581c87' : '#ffffff'}; font-size: 9px; width: 15px; height: 15px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-weight: 900;">${idx}</span>
                <span style="max-width: 130px; overflow: hidden; text-overflow: ellipsis;">${coord.storeId ? coord.storeId + ': ' : ''}${coord.name}</span>
                ${coord.dischargeMinutes ? `<span style="background-color: #dbeafe; color: #172554; font-size: 8px; padding: 1px 3px; border-radius: 3px; font-weight: bold;">${coord.dischargeMinutes}m</span>` : ''}
                ${isLast ? `<span style="background-color: #facc15; color: #581c87; font-size: 8px; padding: 1px 3px; border-radius: 3px; font-weight: 900;">FIN</span>` : ''}
              </div>
              <div style="width: 8px; height: 8px; background-color: ${bgCol}; transform: rotate(45deg); margin-top: -4px; border-right: 2px solid #ffffff; border-bottom: 2px solid #ffffff;"></div>
            </div>
          `;
        }

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'scj-osm-marker',
          iconSize: [0, 0]
        });

        const marker = L.marker([coord.lat, coord.lng], { icon: customIcon });

        const popupContent = document.createElement('div');
        popupContent.style.cssText = 'font-size: 12px; font-family: sans-serif; min-width: 180px; padding: 4px;';
        popupContent.innerHTML = `
          <div style="font-weight: bold; color: #0f172a; margin-bottom: 2px;">${coord.name}</div>
          <div style="font-size: 10px; color: #64748b; margin-bottom: 6px;">${coord.municipality || 'Punto en Mapa'}</div>
          <div style="font-size: 11px; margin-bottom: 6px;">
            <span>⏱️ Tiempo estimado: <strong>${coord.dischargeMinutes || 45} min</strong></span>
          </div>
          <div style="display: flex; gap: 4px; margin-top: 6px;">
            <a href="https://www.google.com/maps?q=${coord.lat},${coord.lng}" target="_blank" rel="noopener noreferrer" style="font-size: 10px; background-color: #2563eb; color: #ffffff; padding: 3px 6px; border-radius: 4px; text-decoration: none; font-weight: bold;">Google Maps ↗</a>
          </div>
        `;

        if (onEditPoint) {
          const editBtn = document.createElement('button');
          editBtn.innerText = '✏️ Editar GPS';
          editBtn.style.cssText = 'font-size: 10px; background-color: #f1f5f9; color: #0f172a; padding: 3px 6px; border-radius: 4px; border: 1px solid #cbd5e1; cursor: pointer; font-weight: bold; margin-left: 4px;';
          editBtn.onclick = () => onEditPoint(idx);
          popupContent.querySelector('div:last-child')?.appendChild(editBtn);
        }

        marker.bindPopup(popupContent);
        marker.addTo(layerGroup);
      });

      // 3. Peajes oficiales en el corredor
      if (showTolls && tolls && tolls.length > 0) {
        tolls.forEach(toll => {
          const tariff = activeVehicleType === 'NLR' ? toll.tariffNlrCOP : toll.tariffNprCOP;
          const tollHtml = `
            <div style="transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center; cursor: pointer;">
              <div style="background-color: #f59e0b; color: #020617; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 5px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); border: 2px solid #ffffff; display: flex; align-items: center; gap: 3px; white-space: nowrap;">
                <span>🧾</span>
                <span>${toll.name}</span>
                <span style="background-color: #020617; color: #fde047; font-size: 9px; padding: 1px 4px; border-radius: 3px; font-family: monospace;">${formatCOP(tariff)}</span>
              </div>
              <div style="width: 7px; height: 7px; background-color: #f59e0b; transform: rotate(45deg); margin-top: -3px; border-right: 2px solid #ffffff; border-bottom: 2px solid #ffffff;"></div>
            </div>
          `;
          const tollIcon = L.divIcon({
            html: tollHtml,
            className: 'scj-osm-toll-marker',
            iconSize: [0, 0]
          });
          const tollMarker = L.marker([toll.lat, toll.lng], { icon: tollIcon });
          tollMarker.bindPopup(`
            <div style="font-size: 12px; font-family: sans-serif; padding: 4px;">
              <div style="font-weight: bold; color: #b45309;">🧾 Peaje ${toll.name}</div>
              <div style="font-size: 10px; color: #64748b;">${toll.corridor} • ${toll.department}</div>
              <div style="margin-top: 4px; font-size: 11px;">
                <div>🚛 Tarifa NPR: <strong>${formatCOP(toll.tariffNprCOP)}</strong></div>
                <div>🚚 Tarifa NLR: <strong>${formatCOP(toll.tariffNlrCOP)}</strong></div>
              </div>
              <div style="margin-top: 6px;">
                <a href="https://www.google.com/maps/search/?api=1&query=${toll.lat},${toll.lng}" target="_blank" rel="noopener noreferrer" style="font-size: 10px; color: #2563eb; font-weight: bold;">Abrir en Google Maps ↗</a>
              </div>
            </div>
          `);
          tollMarker.addTo(layerGroup);
        });
      }

      // 4. Catálogo de municipios para añadir con un clic
      if (showTownCatalog && townCatalog) {
        Object.entries(townCatalog).forEach(([key, loc]) => {
          const isAlreadyIn = validCoords.some(c => c.name === loc.name);
          if (isAlreadyIn) return;

          const townHtml = `
            <div style="background-color: rgba(255,255,255,0.95); color: #334155; font-size: 10px; font-weight: bold; padding: 2px 5px; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.15); border: 1px solid #cbd5e1; cursor: pointer; white-space: nowrap;">
              + ${key}
            </div>
          `;
          const townIcon = L.divIcon({
            html: townHtml,
            className: 'scj-osm-town-marker',
            iconSize: [0, 0]
          });
          const townMarker = L.marker([loc.lat, loc.lng], { icon: townIcon });
          townMarker.on('click', () => {
            if (onAddTown) onAddTown(key);
          });
          townMarker.addTo(layerGroup);
        });
      }

      // Autoajustar encuadre a los puntos de la ruta si hay al menos 2
      if (validCoords.length >= 2) {
        const bounds = L.latLngBounds(validCoords.map(c => [c.lat, c.lng]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      } else if (validCoords.length === 1) {
        map.setView([validCoords[0].lat, validCoords[0].lng], 13);
      }
    } catch (err) {
      console.warn('Error renderizando capas en OpenStreetMap:', err);
    }
  }, [coords, roadPath, showTolls, tolls, activeVehicleType, showTownCatalog, townCatalog]);

  return (
    <div className="w-full h-full relative bg-slate-100 flex items-center justify-center">
      <div ref={containerRef} className="w-full h-full" style={{ minHeight: '520px' }} />
    </div>
  );
};
