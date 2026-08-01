import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './app/hooks';
import AutocompleteInput from './components/AutocompleteInput';
import MapView from './components/MapView';
import SearchHistoryList from './components/SearchHistoryList';
import { useGoogleMapsLoader } from './hooks/useGoogleMapsLoader';
import { addSearch, favouritePlace } from './features/search/searchThunks';
import { historyItemSelected, selectHistory, selectSelectedPlace } from './features/search/searchSlice';
import type { Place } from './types/place';

export default function App() {
  const dispatch = useAppDispatch();
  const { isLoaded, loadError } = useGoogleMapsLoader();
  const history = useAppSelector(selectHistory);
  const selectedPlace = useAppSelector(selectSelectedPlace);

  const handlePlaceSelected = useCallback(
    (place: Place) => {
      dispatch(addSearch(place));
    },
    [dispatch],
  );

  const handleSelectHistory = useCallback(
    (id: string) => {
      dispatch(historyItemSelected(id));
    },
    [dispatch],
  );

  const handleFavourite = useCallback(
    (id: string) => {
      const entry = history.find((h) => h.id === id);
      if (entry) dispatch(favouritePlace(entry));
    },
    [dispatch, history],
  );

  if (loadError) {
    return (
      <div className="p-6 text-red-600">
        Failed to load Google Maps: {loadError.message}. Check VITE_GOOGLE_MAPS_API_KEY in your .env file.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Place Search</h1>

        <AutocompleteInput isLoaded={isLoaded} onPlaceSelected={handlePlaceSelected} />

        <MapView isLoaded={isLoaded} place={selectedPlace} />

        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Search history</h2>
          <SearchHistoryList
            history={history}
            selectedId={selectedPlace?.id}
            onSelect={handleSelectHistory}
            onFavourite={handleFavourite}
          />
        </div>
      </div>
    </div>
  );
}
