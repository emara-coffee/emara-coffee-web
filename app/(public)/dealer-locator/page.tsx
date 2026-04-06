"use client";

import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { fetchActiveDealers } from '@/api/public/dealers';
import { MapPin, Search, Navigation, Star, Phone, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const containerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 20.5937, lng: 78.9629 };

export default function DealerLocatorPage() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  });

  const [dealers, setDealers] = useState<any[]>([]);
  const [mapMarkers, setMapMarkers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState(defaultCenter);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDealers();
  }, []);

  const loadDealers = async (query = '') => {
    try {
      setIsLoading(true);
      const res = await fetchActiveDealers(query);
      setDealers(res.data || []);

      const markers = (res.data || []).map((dealer: any) => ({
        ...dealer,
        lat: userLocation.lat + (Math.random() - 0.5) * 0.1,
        lng: userLocation.lng + (Math.random() - 0.5) * 0.1
      }));
      setMapMarkers(markers);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(loc);

          if (window.google) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: loc }, (results, status) => {
              if (status === 'OK' && results && results[0]) {
                const city = results[0].address_components.find(c => c.types.includes('locality'))?.long_name || '';
                setSearchQuery(city);
                loadDealers(city);
              }
            });
          }
        },
        (error) => {
          console.error("Error fetching location", error);
        }
      );
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadDealers(searchQuery);
  };

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col md:flex-row bg-slate-50">
      <div className="w-full md:w-1/3 h-1/2 md:h-full bg-white shadow-xl z-10 flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-2xl font-black text-slate-900 mb-2">Find a Dealer</h1>
          <p className="text-slate-500 text-sm mb-6">Locate authorized Emara Coffee partners near you.</p>

          <form onSubmit={handleSearch} className="relative mb-4">
            <input
              type="text"
              placeholder="Enter city or pincode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
          </form>

          <button
            onClick={handleLocateMe}
            className="w-full flex items-center justify-center gap-2 text-green-600 bg-green-50 py-3 rounded-xl font-bold hover:bg-green-100 transition-colors"
          >
            <Navigation className="w-4 h-4" /> Use My Current Location
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-slate-400 animate-pulse">Searching...</div>
          ) : mapMarkers.length > 0 ? (
            mapMarkers.map((dealer) => (
              <div
                key={dealer.id}
                onMouseEnter={() => setActiveMarker(dealer.id)}
                onMouseLeave={() => setActiveMarker(null)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${activeMarker === dealer.id ? 'border-green-500 bg-green-50 shadow-md' : 'border-slate-200 bg-white hover:border-slate-300'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-900">{dealer.businessName}</h3>
                  <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs font-bold">
                    <Star className="w-3 h-3 fill-amber-500" /> {dealer.averageRating.toFixed(1)}
                  </div>
                </div>
                <p className="text-sm text-slate-500 mb-3 line-clamp-2">
                  {dealer.street}, {dealer.city}, {dealer.state} {dealer.pincode}
                </p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100/50">
                  <div className="flex items-center gap-1.5 text-slate-600 text-sm font-medium">
                    <Phone className="w-4 h-4" /> {dealer.phone}
                  </div>
                  <Link href={`/dealer-profile/${dealer.id}`} className="text-green-600 hover:text-green-700 font-bold text-sm flex items-center gap-1">
                    View Profile <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No dealers found in this area.</p>
            </div>
          )}
        </div>
      </div>

      <div className="w-full md:w-2/3 h-1/2 md:h-full relative">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={userLocation}
          zoom={12}
          options={{ disableDefaultUI: true, zoomControl: true }}
        >
          {mapMarkers.map((dealer) => (
            <Marker
              key={dealer.id}
              position={{ lat: dealer.lat, lng: dealer.lng }}
              onClick={() => setActiveMarker(dealer.id)}
              onMouseOver={() => setActiveMarker(dealer.id)}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                fillColor: activeMarker === dealer.id ? '#0ea5e9' : '#0f172a',
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: '#ffffff',
                scale: 10,
              }}
            >
              {activeMarker === dealer.id && (
                <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                  <div className="p-3 max-w-xs">
                    <h3 className="font-bold text-slate-900 mb-1">{dealer.businessName}</h3>
                    <p className="text-xs text-slate-500 mb-3">{dealer.city}, {dealer.state}</p>
                    <Link href={`/dealer-profile/${dealer.id}`} className="bg-green-500 text-white px-4 py-2 rounded-lg text-xs font-bold block text-center hover:bg-green-600">
                      View Dealer
                    </Link>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          ))}

          <Marker
            position={userLocation}
            icon={{
              path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              fillColor: '#ef4444',
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#ffffff',
              scale: 6,
            }}
          />
        </GoogleMap>
      </div>
    </div>
  );
}