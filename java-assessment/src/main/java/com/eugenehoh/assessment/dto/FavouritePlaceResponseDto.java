package com.eugenehoh.assessment.dto;

import java.time.Instant;

public record FavouritePlaceResponseDto(
        Long id,
        String placeId,
        String name,
        String address,
        Double latitude,
        Double longitude,
        Instant savedAt,
        String enrichedLocation
) {
}
