import { createAsyncThunk } from '@reduxjs/toolkit';
import { searchAdded } from './searchSlice';
import type { AppDispatch } from '../../app/store';
import type {
  FavouritePlaceResponse,
  Place,
  SearchHistoryEntry,
} from '../../types/place';

export const addSearch = (place: Place) => (dispatch: AppDispatch) => {
  dispatch(searchAdded(place));
};

export const favouritePlace = createAsyncThunk<
  FavouritePlaceResponse,
  SearchHistoryEntry
>('search/favouritePlace', async (entry) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const response = await fetch(`${baseUrl}/api/favourites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      placeId: entry.placeId,
      name: entry.name,
      address: entry.address,
      latitude: entry.lat,
      longitude: entry.lng,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to save favourite (status ${response.status})`);
  }

  return (await response.json()) as FavouritePlaceResponse;
});

export const fetchFavourites = createAsyncThunk<FavouritePlaceResponse[]>(
  'search/fetchFavourites',
  async () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    const response = await fetch(`${baseUrl}/api/favourites?size=100`);
    if (!response.ok) {
      throw new Error(`Failed to load favourites (status ${response.status})`);
    }

    const data = (await response.json()) as {
      content: FavouritePlaceResponse[];
    };
    return data.content;
  },
);

export const unfavouritePlace = createAsyncThunk<number, number>(
  'search/unfavouritePlace',
  async (id) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    const response = await fetch(`${baseUrl}/api/favourites/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to remove favourite (status ${response.status})`);
    }

    return id;
  },
);
