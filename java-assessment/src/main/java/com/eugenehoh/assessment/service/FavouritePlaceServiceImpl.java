package com.eugenehoh.assessment.service;

import com.eugenehoh.assessment.client.ThirdPartyEnrichmentClient;
import com.eugenehoh.assessment.dto.FavouritePlaceRequestDto;
import com.eugenehoh.assessment.dto.FavouritePlaceResponseDto;
import com.eugenehoh.assessment.exception.DuplicatePlaceException;
import com.eugenehoh.assessment.exception.FavouritePlaceNotFoundException;
import com.eugenehoh.assessment.model.FavouritePlace;
import com.eugenehoh.assessment.repository.FavouritePlaceRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class FavouritePlaceServiceImpl implements FavouritePlaceService {

    private final FavouritePlaceRepository repository;
    private final ThirdPartyEnrichmentClient enrichmentClient;

    public FavouritePlaceServiceImpl(FavouritePlaceRepository repository, ThirdPartyEnrichmentClient enrichmentClient) {
        this.repository = repository;
        this.enrichmentClient = enrichmentClient;
    }

    @Override
    @Transactional
    public FavouritePlaceResponseDto create(FavouritePlaceRequestDto request) {
        if (repository.findByPlaceId(request.placeId()).isPresent()) {
            throw new DuplicatePlaceException(request.placeId());
        }

        FavouritePlace entity = new FavouritePlace();
        entity.setPlaceId(request.placeId());
        entity.setName(request.name());
        entity.setAddress(request.address());
        entity.setLatitude(request.latitude());
        entity.setLongitude(request.longitude());
        entity = repository.save(entity);

        String enrichedLocation = enrichmentClient.reverseGeocode(entity.getLatitude(), entity.getLongitude());

        return toResponseDto(entity, enrichedLocation);
    }

    @Override
    public FavouritePlaceResponseDto getById(Long id) {
        FavouritePlace entity = repository.findById(id)
                .orElseThrow(() -> new FavouritePlaceNotFoundException(id));
        return toResponseDto(entity, null);
    }

    @Override
    public Page<FavouritePlaceResponseDto> list(Pageable pageable) {
        return repository.findAll(pageable).map(entity -> toResponseDto(entity, null));
    }

    @Override
    @Transactional
    public FavouritePlaceResponseDto update(Long id, FavouritePlaceRequestDto request) {
        FavouritePlace entity = repository.findById(id)
                .orElseThrow(() -> new FavouritePlaceNotFoundException(id));

        entity.setPlaceId(request.placeId());
        entity.setName(request.name());
        entity.setAddress(request.address());
        entity.setLatitude(request.latitude());
        entity.setLongitude(request.longitude());
        
        return toResponseDto(entity, null);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new FavouritePlaceNotFoundException(id);
        }
        repository.deleteById(id);
    }

    private FavouritePlaceResponseDto toResponseDto(FavouritePlace entity, String enrichedLocation) {
        return new FavouritePlaceResponseDto(
                entity.getId(),
                entity.getPlaceId(),
                entity.getName(),
                entity.getAddress(),
                entity.getLatitude(),
                entity.getLongitude(),
                entity.getSavedAt(),
                enrichedLocation
        );
    }
}
