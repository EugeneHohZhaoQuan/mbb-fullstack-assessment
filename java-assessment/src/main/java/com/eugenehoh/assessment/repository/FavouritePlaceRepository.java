package com.eugenehoh.assessment.repository;

import com.eugenehoh.assessment.model.FavouritePlace;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FavouritePlaceRepository extends JpaRepository<FavouritePlace, Long> {
    Optional<FavouritePlace> findByPlaceId(String placeId);
}
