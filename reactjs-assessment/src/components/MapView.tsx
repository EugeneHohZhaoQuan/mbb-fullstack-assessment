import { useEffect, useRef } from 'react';
import type { SearchHistoryEntry } from '../types/place';

interface MapViewProps {
  isLoaded: boolean;
  place: SearchHistoryEntry | null;
}

export default function MapView({ isLoaded, place }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current || mapRef.current) return;
    mapRef.current = new google.maps.Map(mapContainerRef.current, {
      center: { lat: 0, lng: 0 },
      zoom: 2,
      minZoom: 2,
      mapTypeControlOptions: { position: google.maps.ControlPosition.TOP_RIGHT },
      streetViewControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
      zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
    });
  }, [isLoaded]);

  useEffect(() => {
    if (!mapRef.current || !place) return;
    const position = { lat: place.lat, lng: place.lng };
    mapRef.current.setCenter(position);
    mapRef.current.setZoom(15);

    if (markerRef.current) {
      markerRef.current.setPosition(position);
      markerRef.current.setTitle(place.name);
    } else {
      markerRef.current = new google.maps.Marker({
        position,
        map: mapRef.current,
        title: place.name,
      });
    }
  }, [place]);

  return (
    <div ref={mapContainerRef} className="w-full h-full rounded-lg shadow" />
  );
}
