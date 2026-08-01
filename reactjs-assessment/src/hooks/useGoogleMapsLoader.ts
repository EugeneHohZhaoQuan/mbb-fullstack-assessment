import { useEffect, useState } from 'react';

interface GoogleMapsLoaderState {
  isLoaded: boolean;
  loadError: Error | null;
}

let bootstrapped = false;

function bootstrapLoader(apiKey: string): void {
  if (bootstrapped) return;
  bootstrapped = true;

  ((g: any) => {
    let h: any, a: any, k: any;
    const p = 'The Google Maps JavaScript API';
    const c = 'google';
    const l = 'importLibrary';
    const q = '__ib__';
    const m = document;
    let b: any = window;
    b = b[c] || (b[c] = {});
    const d: any = b.maps || (b.maps = {});
    const r = new Set();
    const e = new URLSearchParams();
    const u = () =>
      h ||
      (h = new Promise(async (f, n) => {
        a = m.createElement('script');
        e.set('libraries', [...r] + '');
        for (k in g)
          e.set(
            k.replace(/[A-Z]/g, (t: string) => '_' + t[0].toLowerCase()),
            g[k],
          );
        e.set('callback', c + '.maps.' + q);
        a.src = `https://maps.${c}apis.com/maps/api/js?` + e;
        d[q] = f;
        a.onerror = () => (h = n(Error(p + ' could not load.')));
        a.nonce =
          m.querySelector<HTMLScriptElement>('script[nonce]')?.nonce || '';
        m.head.append(a);
      }));
    d[l]
      ? console.warn(p + ' only loads once. Ignoring:', g)
      : (d[l] = (f: any, ...n: any[]) =>
          r.add(f) && u().then(() => d[l](f, ...n)));
  })({ key: apiKey, v: 'weekly' });
}

export function useGoogleMapsLoader(): GoogleMapsLoaderState {
  const [state, setState] = useState<GoogleMapsLoaderState>({
    isLoaded: false,
    loadError: null,
  });

  useEffect(() => {
    let cancelled = false;
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    bootstrapLoader(apiKey);

    Promise.all([
      google.maps.importLibrary('places'),
      google.maps.importLibrary('maps'),
    ])
      .then(() => {
        if (!cancelled) setState({ isLoaded: true, loadError: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({
            isLoaded: false,
            loadError: err instanceof Error ? err : new Error(String(err)),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
