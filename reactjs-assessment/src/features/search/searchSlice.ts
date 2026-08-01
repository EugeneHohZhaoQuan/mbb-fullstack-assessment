import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { favouritePlace, fetchFavourites, unfavouritePlace } from './searchThunks';
import type { RootState } from '../../app/store';
import type { FavouritePlaceResponse, Place, SearchHistoryEntry } from '../../types/place';

interface SearchState {
  history: SearchHistoryEntry[];
  selectedId: string | null;
  favourites: FavouritePlaceResponse[];
}

const initialState: SearchState = {
  history: [],
  selectedId: null,
  favourites: [],
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    searchAdded: {
      reducer(state, action: PayloadAction<SearchHistoryEntry>) {
        state.history.unshift(action.payload);
        state.selectedId = action.payload.id;
      },
      prepare(place: Place) {
        const payload: SearchHistoryEntry = {
          id: crypto.randomUUID(),
          placeId: place.placeId,
          name: place.name,
          address: place.address,
          lat: place.lat,
          lng: place.lng,
          timestamp: Date.now(),
          favourite: { status: 'idle', error: null },
        };
        return { payload };
      },
    },
    historyItemSelected(state, action: PayloadAction<string>) {
      state.selectedId = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(favouritePlace.pending, (state, action) => {
        const entry = state.history.find((h) => h.id === action.meta.arg.id);
        if (entry) entry.favourite = { status: 'loading', error: null };
      })
      .addCase(favouritePlace.fulfilled, (state, action) => {
        const entry = state.history.find((h) => h.id === action.meta.arg.id);
        if (entry) entry.favourite = { status: 'succeeded', error: null };
        if (!state.favourites.some((f) => f.placeId === action.payload.placeId)) {
          state.favourites.unshift(action.payload);
        }
      })
      .addCase(favouritePlace.rejected, (state, action) => {
        const entry = state.history.find((h) => h.id === action.meta.arg.id);
        if (entry) entry.favourite = { status: 'failed', error: action.error.message ?? 'Unknown error' };
      })
      .addCase(fetchFavourites.fulfilled, (state, action) => {
        state.favourites = action.payload;
      })
      .addCase(unfavouritePlace.fulfilled, (state, action) => {
        state.favourites = state.favourites.filter((f) => f.id !== action.payload);
      });
  },
});

export const { searchAdded, historyItemSelected } = searchSlice.actions;

export const selectHistory = (state: RootState) => state.search.history;
export const selectSelectedPlace = (state: RootState) =>
  state.search.history.find((h) => h.id === state.search.selectedId) ?? null;
export const selectFavourites = (state: RootState) => state.search.favourites;
export const selectFavouritePlaceIds = createSelector(selectFavourites, (favourites) =>
  new Set(favourites.map((f) => f.placeId)),
);

export default searchSlice.reducer;
