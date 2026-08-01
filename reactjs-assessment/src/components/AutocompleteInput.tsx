import { useEffect, useRef } from 'react';
import type { Place } from '../types/place';

interface AutocompleteInputProps {
  isLoaded: boolean;
  onPlaceSelected: (place: Place) => void;
}

export default function AutocompleteInput({ isLoaded, onPlaceSelected }: AutocompleteInputProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!isLoaded || !container) return;

    const autocomplete = new google.maps.places.PlaceAutocompleteElement();
    autocomplete.className = 'w-full';
    container.appendChild(autocomplete);

    const handleSelect = async (event: google.maps.places.PlacePredictionSelectEvent) => {
      const place = event.placePrediction.toPlace();
      await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location'] });

      if (!place.location) return;

      onPlaceSelected({
        placeId: place.id,
        name: place.displayName ?? '',
        address: place.formattedAddress ?? '',
        lat: place.location.lat(),
        lng: place.location.lng(),
      });
    };

    autocomplete.addEventListener('gmp-select', handleSelect);

    return () => {
      autocomplete.removeEventListener('gmp-select', handleSelect);
      container.removeChild(autocomplete);
    };
  }, [isLoaded, onPlaceSelected]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Search for a place</label>
      {isLoaded ? (
        <div ref={containerRef} className="w-full" />
      ) : (
        <div className="w-full h-10 rounded-md border border-gray-200 bg-gray-100 animate-pulse" />
      )}
    </div>
  );
}
