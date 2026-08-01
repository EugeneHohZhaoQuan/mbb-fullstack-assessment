// @types/google.maps types `PlaceAutocompleteElement.addEventListener` against its
// custom event map ("gmp-select" -> PlacePredictionSelectEvent) but never declares a
// matching `removeEventListener` overload, so it falls back to the inherited generic
// HTMLElement.removeEventListener typed against the standard DOM event map — which
// doesn't know "gmp-select" and rejects a correctly-typed handler. Merge in the
// missing overload instead of casting `as EventListener` at every call site.
declare namespace google.maps.places {
  interface PlaceAutocompleteElement {
    removeEventListener<K extends keyof PlaceAutocompleteElementEventMap>(
      type: K,
      listener: (this: PlaceAutocompleteElement, ev: PlaceAutocompleteElementEventMap[K]) => any,
      options?: boolean | EventListenerOptions,
    ): void;
  }
}
