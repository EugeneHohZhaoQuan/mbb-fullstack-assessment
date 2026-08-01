package com.eugenehoh.assessment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record FavouritePlaceRequestDto(
        @NotBlank String placeId,
        @NotBlank String name,
        String address,
        @NotNull Double latitude,
        @NotNull Double longitude
) {
}
