package com.eugenehoh.assessment.exception;

public class DuplicatePlaceException extends RuntimeException {
    public DuplicatePlaceException(String placeId) {
        super("FavouritePlace already exists with placeId " + placeId);
    }
}
