# Place Search

A single-page app: type into a textbox, get Google Places Autocomplete suggestions, select one,
see it pinned on a map. Every search is saved to Redux state and listed below the map (most
recent first) — click a past entry to re-center the map on it without a new API call. Each
history item also has a favourite (☆/⭐) button that calls a Java Spring Boot backend to persist
the place.

## Stack

- React 18 + Vite + TypeScript (strict mode)
- Redux Toolkit (`createSlice`, `createAsyncThunk`) with Thunk middleware
- Tailwind CSS v4 (via `@tailwindcss/vite`, no separate config file needed)
- Google Maps JavaScript API — the new `google.maps.places.PlaceAutocompleteElement`, libraries
  loaded dynamically via `google.maps.importLibrary`

## Getting a Google Maps API key

1. Create/select a project in the [Google Cloud Console](https://console.cloud.google.com/).
2. Enable **"Places API (New)"** and **"Maps JavaScript API"** for that project.
3. Create an API key under **APIs & Services → Credentials**.
4. Restrict the key to your local dev origin (`http://localhost:5173`) once you've confirmed it
   works — an unrestricted key is fine for the first test.

## Setup

```bash
npm install
cp .env.example .env
# edit .env and set VITE_GOOGLE_MAPS_API_KEY to your real key
npm run dev
```

`.env` variables:

| Variable                     | Purpose                                                         |
|-------------------------------|------------------------------------------------------------------|
| `VITE_GOOGLE_MAPS_API_KEY`    | Required. Your Google Maps key with Places API (New) enabled.   |
| `VITE_API_BASE_URL`           | Base URL of the Java favourites backend (default `http://localhost:8080`). |

To exercise the favourite button, run the backend in `../java-assessment` first (see that
folder's README) — CORS there is already set up for `http://localhost:5173`.

## Architecture

```
src/
  app/
    store.ts                       # configureStore, single `search` slice, exports RootState/AppDispatch
    hooks.ts                       # typed useAppDispatch / useAppSelector
  features/search/
    searchSlice.ts                 # history + selected-place state, favourite status per entry
    searchThunks.ts                # addSearch (thunk wrapper) + favouritePlace (createAsyncThunk)
  types/
    place.ts                       # Place / SearchHistoryEntry / FavouritePlaceResponse
    google-maps-extensions.d.ts    # ambient patch — see "Google Maps typing" below
  components/
    AutocompleteInput.tsx          # wraps PlaceAutocompleteElement (a web component, not a
                                    # React-controlled input) via a ref + imperative DOM append
    MapView.tsx                    # imperative google.maps.Map + Marker, recenters on prop change
    SearchHistoryList.tsx / SearchHistoryItem.tsx
  hooks/
    useGoogleMapsLoader.ts         # loads the Maps JS SDK exactly once, resolves once 'places'
                                    # and 'maps' libraries are ready
  App.tsx                          # wires hook + Redux state to the three components above
```

**Why `useGoogleMapsLoader` is a separate hook**: the Maps SDK's bootstrap loader is idempotent
by design (it warns if you call it twice), but React 18 StrictMode double-invokes effects in
dev and a component can remount at any time — pulling the load/init logic into one hook with a
module-level guard means every consumer sees a single shared load, instead of each component
having to reason about "did the script already load?"

**Favourite integration**: `favouritePlace` is a `createAsyncThunk` that POSTs to
`${VITE_API_BASE_URL}/api/favourites`. `searchSlice` tracks `pending`/`fulfilled`/`rejected` as
a per-entry `favourite.status` (`idle` → `loading` → `succeeded`/`failed`), which the star button
reflects directly (filled + disabled once saved, click-to-retry on failure). If the backend isn't
running, the call rejects, the button shows the failed state, and nothing else in the app breaks.

**TypeScript**: `store.ts` exports `RootState`/`AppDispatch`; `app/hooks.ts` wraps `useDispatch`/
`useSelector` with those types once (`useAppDispatch`, `useAppSelector`), so no component calls
the raw untyped Redux hooks. Shared domain types live in `types/place.ts`:

- `Place` — what `AutocompleteInput` hands back after a selection (placeId/name/address/lat/lng).
- `SearchHistoryEntry` — a `Place` plus `id`, `timestamp`, and per-entry `favourite` status; this
  is the shape stored in Redux and threaded through the history components.
- `FavouritePlaceResponse` — typed directly against `java-assessment`'s
  `FavouritePlaceResponseDto` (checked against that repo's source, not guessed), so the
  `favouritePlace` thunk's return type matches what the backend actually sends back
  (`id`, `placeId`, `name`, `address`, `latitude`, `longitude`, `savedAt`, `enrichedLocation`).

**Google Maps typing** — two deliberate decisions, not defaults reached for blindly:

1. `@types/google.maps` fully covers `PlaceAutocompleteElement`, the `gmp-select` event
   (`PlacePredictionSelectEvent`), and `PlacePrediction.toPlace()` — checked before assuming
   anything was missing, per the migration brief.
2. It does *not*, however, declare a `removeEventListener` overload for `PlaceAutocompleteElement`
   matching its own `addEventListener` event map — only `addEventListener` gets the typed
   `'gmp-select' → PlacePredictionSelectEvent` overload, so the cleanup call falls back to the
   generic DOM `removeEventListener(type: string, listener: EventListenerOrEventListenerObject)`
   and rejects a correctly-typed handler. `types/google-maps-extensions.d.ts` merges in the
   missing overload via declaration merging, rather than casting `as EventListener` at the call
   site — the goal is one documented, isolated patch instead of a scattered workaround.
3. The Maps SDK's official inline bootstrap loader (inside `useGoogleMapsLoader.ts`) is Google's
   own untyped snippet — it builds the `importLibrary` function itself via dynamic, string-keyed
   property assignment on `window`. That's inherently not worth precisely typing (there's no
   meaningful type to assign to code that's reconstructing a function via bracket-notation
   property injection), so its internals are explicitly typed `any`, isolated to that one
   function, with a comment explaining why — everything downstream of it (`google.maps.Map`,
   `google.maps.places.*`) is fully typed.

- Classic `google.maps.Marker` is used instead of `AdvancedMarkerElement` to avoid requiring a
  Map ID for this scope — swap it in if you need custom marker styling later.
- Not yet run against a real Google Maps key in this environment (none was available) — `npm run
  build`, `npm run dev`, and `tsc --noEmit` all pass cleanly, but the autocomplete/map rendering
  itself should be smoke-tested with a real key before considering this fully verified end-to-end.
