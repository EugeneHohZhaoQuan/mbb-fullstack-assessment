export interface Place {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export type FavouriteStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface FavouriteState {
  status: FavouriteStatus;
  error: string | null;
}

export interface SearchHistoryEntry extends Place {
  id: string;
  timestamp: number;
  favourite: FavouriteState;
}

export interface FavouritePlaceResponse {
  id: number;
  placeId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  savedAt: string;
  enrichedLocation: string | null;
}
