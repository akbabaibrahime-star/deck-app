import React, { useState, useEffect, useRef } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { MapPinIcon, CloseIcon, GpsIcon } from './Icons';

interface MapSelectorProps {
  onClose: () => void;
  onLocationSelect: (address: { street: string; city: string; country: string }) => void;
}

// Nominatim has a usage policy: max 1 request/sec. We debounce the address fetching.
const useDebouncedEffect = (effect: () => void, deps: React.DependencyList, delay: number) => {
    useEffect(() => {
        const handler = setTimeout(() => effect(), delay);
        return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...deps, delay]);
};

export const MapSelector: React.FC<MapSelectorProps> = ({ onClose, onLocationSelect }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<LeafletMap | null>(null);
  const isComponentMounted = useRef(true);

  const [mapCenter, setMapCenter] = useState<[number, number]>([41.0082, 28.9784]); // Istanbul
  const [selectedAddress, setSelectedAddress] = useState<{ street: string; city: string; country: string } | null>(null);
  const [displayAddress, setDisplayAddress] = useState('Konumu bulmak için haritayı hareket ettirin...');
  const [isLoading, setIsLoading] = useState(true);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseAddress = (data: any): { street: string; city: string; country: string } | null => {
    const { address } = data;
    if (!address) return null;

    const road = address.road || '';
    const house_number = address.house_number || '';
    // Combine road and house number for street, fallback to other location types
    const street = `${road} ${house_number}`.trim() || address.suburb || address.quarter || address.village || 'Bilinmeyen sokak';
    const city = address.city || address.town || address.state || 'Bilinmeyen şehir';
    const country = address.country || 'Bilinmeyen ülke';

    if (country) {
        return { street, city, country };
    }
    return null;
  };
  
  // Effect for fetching address, debounced to respect Nominatim API limits
  useDebouncedEffect(() => {
    const fetchAddress = async (lat: number, lon: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=en`);
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            if (!isComponentMounted.current) return;

            if (data.error) throw new Error(data.error);

            const parsed = parseAddress(data);
            if (parsed) {
                setSelectedAddress(parsed);
                setDisplayAddress(`${parsed.street}, ${parsed.city}, ${parsed.country}`);
            } else {
                setDisplayAddress(data.display_name || 'Adres detayı bulunamadı.');
                setSelectedAddress(null);
            }
        } catch (e: any) {
            if (!isComponentMounted.current) return;
            setError('Adres bulunamadı. Lütfen tekrar deneyin.');
            setDisplayAddress('Adres bulunamadı.');
            setSelectedAddress(null);
            console.error(e);
        } finally {
            if (isComponentMounted.current) setIsLoading(false);
        }
    };
    
    fetchAddress(mapCenter[0], mapCenter[1]);
  }, [mapCenter], 1000); // 1-second debounce

  const handleUseCurrentLocation = (silent = false) => {
    if (navigator.geolocation) {
        setIsGeolocating(true);
        if (!silent) setError(null);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                if (isComponentMounted.current) {
                    const { latitude, longitude } = position.coords;
                    mapInstance.current?.setView([latitude, longitude], 16);
                }
                setIsGeolocating(false);
            },
            (err) => {
                if (isComponentMounted.current && !silent) {
                    setError('Konum alınamadı. Lütfen tarayıcı izinlerini kontrol edin.');
                }
                setIsGeolocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    } else {
        if (isComponentMounted.current && !silent) {
            setError('Tarayıcınız konum servisini desteklemiyor.');
        }
    }
  };

  useEffect(() => {
    isComponentMounted.current = true;
    let map: LeafletMap;

    Promise.all([
      import('leaflet'),
      import('leaflet-geosearch')
    // FIX: Destructure named exports from leaflet-geosearch to correctly instantiate classes.
    ]).then(([L, { OpenStreetMapProvider, GeoSearchControl }]) => {
        if (!mapRef.current || mapInstance.current || !isComponentMounted.current) return;
    
        map = L.map(mapRef.current!, {
            center: mapCenter,
            zoom: 13,
            zoomControl: false,
        });
        mapInstance.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        const provider = new OpenStreetMapProvider();
        const searchControl = new GeoSearchControl({
            provider: provider,
            style: 'bar',
            showMarker: false,
            showPopup: false,
            autoClose: true,
            retainZoomLevel: false,
            animateZoom: true,
            keepResult: true,
            searchLabel: 'Adres ara...',
        });
        map.addControl(searchControl);

        map.on('geosearch/showlocation', (result: any) => {
            if(isComponentMounted.current) {
                setMapCenter([result.location.y, result.location.x]);
            }
        });

        map.on('moveend', () => {
            const center = map.getCenter();
            if (isComponentMounted.current) {
                setMapCenter([center.lat, center.lng]);
            }
        });

        // Try to get user's location on initial load
        handleUseCurrentLocation(true);

    }).catch(err => {
        console.error("Failed to load map modules", err);
        setError("Harita yüklenemedi.");
        setIsLoading(false);
    });

    return () => {
        isComponentMounted.current = false;
        mapInstance.current?.remove();
        mapInstance.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
    const handleConfirm = () => {
        if (selectedAddress) {
            onLocationSelect(selectedAddress);
        }
    };

    return (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 z-50 flex flex-col animate-fadeIn"
          onClick={onClose}
        >
          <div 
            className="w-full h-full max-w-md mx-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="p-4 flex justify-between items-center bg-[#121212] flex-shrink-0">
              <h2 className="text-xl font-bold">Konum Seç</h2>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
                <CloseIcon className="w-6 h-6" />
              </button>
            </header>
    
            <div className="flex-grow relative bg-gray-700">
              <div ref={mapRef} className="w-full h-full" />
              {error && (
                  <div className="absolute inset-x-0 top-14 flex items-center justify-center bg-black/80 p-2 text-center z-[1000]">
                      <p className="text-yellow-400 text-sm">{error}</p>
                  </div>
              )}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full text-red-500 pointer-events-none z-[1000]">
                <MapPinIcon className="w-12 h-12 drop-shadow-lg"/>
              </div>
              <button onClick={() => handleUseCurrentLocation()} disabled={isGeolocating} className="absolute bottom-4 right-4 bg-[#121212] p-3 rounded-full shadow-lg hover:bg-gray-800 transition-colors disabled:opacity-50 z-[1000]">
                 {isGeolocating ? (
                    <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <GpsIcon className="w-6 h-6 text-white" />
                )}
              </button>
            </div>
    
            <footer className="p-4 bg-[#121212] flex-shrink-0 space-y-3">
              <div className="bg-gray-800 p-3 rounded-lg min-h-[72px]">
                {isLoading ? <p className="text-gray-400">Adres aranıyor...</p> : <p className="font-semibold">{displayAddress}</p>}
                
              </div>
              <button 
                onClick={handleConfirm}
                disabled={!selectedAddress || isLoading || !!error}
                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                Konumu Onayla
              </button>
            </footer>
          </div>
          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
            .leaflet-container {
                font-family: 'Inter', sans-serif;
            }
          `}</style>
        </div>
      );
};