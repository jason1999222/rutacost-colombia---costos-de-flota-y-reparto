import React, { useState, useCallback } from 'react';
import { MapPin, Search, X, Navigation, Plus } from 'lucide-react';
import { OpenStreetMapCanvas } from './OpenStreetMapCanvas';
import { searchAddressOrCoords, GeocodedLocation } from '../utils/geocodingService';

interface LocationPickerProps {
  isOpen: boolean;
  onLocationSelect: (location: { name: string; lat: number; lng: number }) => void;
  onClose: () => void;
}

/**
 * Selector de ubicación visual con mapa interactivo.
 * Permite buscar direcciones o hacer clic en el mapa para seleccionar.
 */
export const LocationPicker: React.FC<LocationPickerProps> = ({
  isOpen,
  onLocationSelect,
  onClose,
}) => {
  if (!isOpen) return null;
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodedLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    lat: number;
    lng: number;
  } | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 6.175, lng: -75.591 }); // Medellín por defecto
  const [mapZoom, setMapZoom] = useState(12);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await searchAddressOrCoords(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setSelectedLocation({
      name: `Punto (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
      lat,
      lng,
    });
    setMapCenter({ lat, lng });
  }, []);

  const handleConfirm = useCallback(() => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
      onClose();
    }
  }, [selectedLocation, onLocationSelect, onClose]);

  const handleResultClick = useCallback((result: GeocodedLocation) => {
    setSelectedLocation({
      name: result.name,
      lat: result.lat,
      lng: result.lng,
    });
    setMapCenter({ lat: result.lat, lng: result.lng });
    setMapZoom(15);
    setSearchResults([]);
  }, []);

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base">Seleccionar Ubicación</h2>
              <p className="text-xs text-blue-100">
                Busca una dirección o haz clic en el mapa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Ej: Cra 43A # 1-50 Medellín, o 6.175, -75.591"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
            >
              {isSearching ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Buscando...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Buscar</span>
                </>
              )}
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-3 max-h-40 overflow-y-auto space-y-1">
              {searchResults.map((result, idx) => (
                <button
                  key={idx}
                  onClick={() => handleResultClick(result)}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors flex items-start gap-2"
                >
                  <MapPin className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">
                      {result.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {result.displayAddress}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 min-h-[400px] relative">
          <OpenStreetMapCanvas
            stops={selectedLocation ? [selectedLocation] : []}
            onMapClick={handleMapClick}
            center={mapCenter}
            zoom={mapZoom}
            height="100%"
            coords={selectedLocation ? [selectedLocation] : []}
          />

          {/* Selected Location Info */}
          {selectedLocation && (
            <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl shadow-lg p-4 border border-slate-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Navigation className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">
                      {selectedLocation.name}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Lat: {selectedLocation.lat.toFixed(5)}, Lng: {selectedLocation.lng.toFixed(5)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-colors flex items-center gap-2 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Confirmar</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
