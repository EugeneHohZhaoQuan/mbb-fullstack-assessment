package com.eugenehoh.assessment.service;

import com.eugenehoh.assessment.dto.FavouritePlaceRequestDto;
import com.eugenehoh.assessment.dto.FavouritePlaceResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface FavouritePlaceService {
    FavouritePlaceResponseDto create(FavouritePlaceRequestDto request);

    FavouritePlaceResponseDto getById(Long id);

    Page<FavouritePlaceResponseDto> list(Pageable pageable);

    FavouritePlaceResponseDto update(Long id, FavouritePlaceRequestDto request);

    void delete(Long id);
}
