import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './app/hooks';
import AutocompleteInput from './components/AutocompleteInput';
import FavouritesList from './components/FavouritesList';
import MapView from './components/MapView';
import SearchHistoryList from './components/SearchHistoryList';
import { useGoogleMapsLoader } from './hooks/useGoogleMapsLoader';
import {
  addSearch,
  favouritePlace,
  fetchFavourites,
  unfavouritePlace,
} from './features/search/searchThunks';
import {
  historyItemSelected,
  selectFavourites,
  selectFavouritePlaceIds,
  selectHistory,
  selectSelectedPlace,
} from './features/search/searchSlice';
import type { Place } from './types/place';

export default function App() {
  const dispatch = useAppDispatch();
  const { isLoaded, loadError } = useGoogleMapsLoader();
  const history = useAppSelector(selectHistory);
  const selectedPlace = useAppSelector(selectSelectedPlace);
  const favourites = useAppSelector(selectFavourites);
  const favouritePlaceIds = useAppSelector(selectFavouritePlaceIds);

  useEffect(() => {
    dispatch(fetchFavourites());
  }, [dispatch]);

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

  const handleUnfavourite = useCallback(
    (id: number) => {
      dispatch(unfavouritePlace(id));
    },
    [dispatch],
  );

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-slate-900">
        <div className="p-6 text-red-400 bg-red-950/50 rounded-xl border border-red-900 backdrop-blur-md shadow-2xl">
          Failed to load Google Maps: {loadError.message}. Check
          VITE_GOOGLE_MAPS_API_KEY in your .env file.
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-900 font-sans antialiased text-slate-800">
      {/* 1. Full-Screen Background Map */}
      <div className="absolute inset-0 z-0 h-full w-full">
        <MapView isLoaded={isLoaded} place={selectedPlace} />
      </div>

      {/* 2. Floating Sidebar Overlay */}
      <aside className="absolute left-4 top-4 bottom-4 z-10 w-full max-w-sm flex flex-col gap-4 pointer-events-none">
        {/* Main Search Controls */}
        <div className="relative z-20 pointer-events-auto flex flex-col gap-4 p-5 rounded-3xl bg-white/80 backdrop-blur-md border border-white/40 shadow-2xl shadow-slate-900/10 transition-all">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              Places
            </h1>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-200/50 text-slate-600">
              v1.0
            </span>
          </div>

          <div className="relative rounded-2xl bg-slate-100/80 p-1 border border-slate-200/50 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
            <AutocompleteInput
              isLoaded={isLoaded}
              onPlaceSelected={handlePlaceSelected}
              placeholder="Search for a place..."
            />
          </div>
        </div>

        {/* 3. Favourites Panel */}
        <div className="pointer-events-auto flex-1 flex flex-col p-5 rounded-3xl bg-white/80 backdrop-blur-md border border-white/40 shadow-2xl shadow-slate-900/10 overflow-hidden">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
            Favourites
          </h2>

          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            <FavouritesList favourites={favourites} onUnfavourite={handleUnfavourite} />
          </div>
        </div>

        {/* 4. Search History Panel */}
        <div className="pointer-events-auto flex-1 flex flex-col p-5 rounded-3xl bg-white/80 backdrop-blur-md border border-white/40 shadow-2xl shadow-slate-900/10 overflow-hidden">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
            Recent Searches
          </h2>

          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            <SearchHistoryList
              history={history}
              selectedId={selectedPlace?.id}
              favouritePlaceIds={favouritePlaceIds}
              onSelect={handleSelectHistory}
              onFavourite={handleFavourite}
            />
          </div>
        </div>
      </aside>
    </div>
  );
}
