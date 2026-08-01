package com.eugenehoh.assessment.exception;

public class FavouritePlaceNotFoundException extends RuntimeException {
    public FavouritePlaceNotFoundException(Long id) {
        super("FavouritePlace not found with id " + id);
    }
}
