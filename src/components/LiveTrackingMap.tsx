import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Navigation, MapPin, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DriverLocation } from '@/services/RealtimeLocationService';

// Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHhpZ3g5amcwMW1lMnFzOWd5YjZ4OXJyIn0.r3cJ_TGFSJv_GjM4_jOdRQ';

interface LiveTrackingMapProps {
  driverLocation: DriverLocation | null;
  pickupLocation?: { lat: number; lng: number; label?: string };
  dropLocation?: { lat: number; lng: number; label?: string };
  userLocation?: { lat: number; lng: number };
  isDriver?: boolean;
  className?: string;
}

const LiveTrackingMap = ({
  driverLocation,
  pickupLocation,
  dropLocation,
  userLocation,
  isDriver = false,
  className = '',
}: LiveTrackingMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const driverMarker = useRef<mapboxgl.Marker | null>(null);
  const pickupMarker = useRef<mapboxgl.Marker | null>(null);
  const dropMarker = useRef<mapboxgl.Marker | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const initialCenter: [number, number] = driverLocation
      ? [driverLocation.lng, driverLocation.lat]
      : pickupLocation
      ? [pickupLocation.lng, pickupLocation.lat]
      : [77.5946, 12.9716]; // Default: Bangalore

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: initialCenter,
      zoom: 15,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update driver marker when location changes
  useEffect(() => {
    if (!map.current || !mapLoaded || !driverLocation) return;

    const { lat, lng, heading } = driverLocation;

    // Create driver marker with car icon
    const createDriverMarkerElement = () => {
      const el = document.createElement('div');
      el.className = 'driver-marker';
      el.innerHTML = `
        <div class="relative">
          <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg animate-pulse">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8c-.1.3-.1.5-.1.8v4.5c0 .6.4 1 1 1h2"/>
              <circle cx="7" cy="17" r="2"/>
              <circle cx="17" cy="17" r="2"/>
            </svg>
          </div>
          ${heading !== undefined ? `
          <div class="absolute -top-2 left-1/2 transform -translate-x-1/2 text-primary" style="transform: rotate(${heading}deg);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L8 10h8L12 2z"/>
            </svg>
          </div>
          ` : ''}
        </div>
      `;
      return el;
    };

    if (!driverMarker.current) {
      driverMarker.current = new mapboxgl.Marker({
        element: createDriverMarkerElement(),
        anchor: 'center',
      })
        .setLngLat([lng, lat])
        .addTo(map.current);
    } else {
      driverMarker.current.setLngLat([lng, lat]);
      // Update rotation if heading is available
      if (heading !== undefined) {
        const el = driverMarker.current.getElement();
        const arrow = el.querySelector('.absolute');
        if (arrow) {
          (arrow as HTMLElement).style.transform = `translateX(-50%) rotate(${heading}deg)`;
        }
      }
    }

    // Smoothly pan to driver location
    map.current.easeTo({
      center: [lng, lat],
      duration: 1000,
    });

    setLastUpdate(new Date().toLocaleTimeString());
  }, [driverLocation, mapLoaded]);

  // Add pickup marker
  useEffect(() => {
    if (!map.current || !mapLoaded || !pickupLocation) return;

    const createPickupMarkerElement = () => {
      const el = document.createElement('div');
      el.className = 'pickup-marker';
      el.innerHTML = `
        <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      `;
      return el;
    };

    if (!pickupMarker.current) {
      pickupMarker.current = new mapboxgl.Marker({
        element: createPickupMarkerElement(),
        anchor: 'bottom',
      })
        .setLngLat([pickupLocation.lng, pickupLocation.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div class="p-2"><strong>Pickup</strong><br/>${pickupLocation.label || 'Pickup Point'}</div>`
          )
        )
        .addTo(map.current);
    }
  }, [pickupLocation, mapLoaded]);

  // Add drop marker
  useEffect(() => {
    if (!map.current || !mapLoaded || !dropLocation) return;

    const createDropMarkerElement = () => {
      const el = document.createElement('div');
      el.className = 'drop-marker';
      el.innerHTML = `
        <div class="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      `;
      return el;
    };

    if (!dropMarker.current) {
      dropMarker.current = new mapboxgl.Marker({
        element: createDropMarkerElement(),
        anchor: 'bottom',
      })
        .setLngLat([dropLocation.lng, dropLocation.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div class="p-2"><strong>Drop-off</strong><br/>${dropLocation.label || 'Destination'}</div>`
          )
        )
        .addTo(map.current);
    }
  }, [dropLocation, mapLoaded]);

  // Add user location marker
  useEffect(() => {
    if (!map.current || !mapLoaded || !userLocation) return;

    const createUserMarkerElement = () => {
      const el = document.createElement('div');
      el.className = 'user-marker';
      el.innerHTML = `
        <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
          <div class="w-2 h-2 bg-white rounded-full"></div>
        </div>
      `;
      return el;
    };

    if (!userMarker.current) {
      userMarker.current = new mapboxgl.Marker({
        element: createUserMarkerElement(),
        anchor: 'center',
      })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map.current);
    } else {
      userMarker.current.setLngLat([userLocation.lng, userLocation.lat]);
    }
  }, [userLocation, mapLoaded]);

  // Draw route between points
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const points: [number, number][] = [];
    if (pickupLocation) points.push([pickupLocation.lng, pickupLocation.lat]);
    if (driverLocation) points.push([driverLocation.lng, driverLocation.lat]);
    if (dropLocation) points.push([dropLocation.lng, dropLocation.lat]);

    if (points.length < 2) return;

    // Fit bounds to show all markers
    const bounds = new mapboxgl.LngLatBounds();
    points.forEach((point) => bounds.extend(point));

    map.current.fitBounds(bounds, {
      padding: { top: 100, bottom: 100, left: 50, right: 50 },
      maxZoom: 16,
    });
  }, [pickupLocation, dropLocation, driverLocation, mapLoaded]);

  const recenterOnDriver = () => {
    if (!map.current || !driverLocation) return;
    map.current.flyTo({
      center: [driverLocation.lng, driverLocation.lat],
      zoom: 16,
      duration: 1000,
    });
  };

  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`}>
      <div ref={mapContainer} className="w-full h-full min-h-[300px]" />

      {/* Controls overlay */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
        {/* Live indicator */}
        <div className="bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium">Live Tracking</span>
        </div>

        {/* Last update */}
        {lastUpdate && (
          <div className="bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
            <span className="text-xs text-muted-foreground">Updated: {lastUpdate}</span>
          </div>
        )}
      </div>

      {/* Recenter button */}
      {driverLocation && (
        <Button
          size="icon"
          variant="secondary"
          className="absolute bottom-4 right-4 shadow-lg"
          onClick={recenterOnDriver}
        >
          <Navigation className="w-4 h-4" />
        </Button>
      )}

      {/* Driver info card */}
      {driverLocation && !isDriver && (
        <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-[200px]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Navigation className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Driver En Route</p>
              {driverLocation.speed !== undefined && (
                <p className="text-xs text-muted-foreground">
                  {Math.round(driverLocation.speed * 3.6)} km/h
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveTrackingMap;
