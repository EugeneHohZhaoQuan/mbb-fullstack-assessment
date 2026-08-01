package com.eugenehoh.assessment.controller;

import com.eugenehoh.assessment.dto.FavouritePlaceRequestDto;
import com.eugenehoh.assessment.dto.FavouritePlaceResponseDto;
import com.eugenehoh.assessment.dto.PagedResponseDto;
import com.eugenehoh.assessment.service.FavouritePlaceService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/favourites")
public class FavouritePlaceController {

    private final FavouritePlaceService service;

    public FavouritePlaceController(FavouritePlaceService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<FavouritePlaceResponseDto> create(@Valid @RequestBody FavouritePlaceRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @GetMapping("/{id}")
    public FavouritePlaceResponseDto getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping
    public PagedResponseDto<FavouritePlaceResponseDto> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return PagedResponseDto.from(service.list(pageable));
    }

    @PutMapping("/{id}")
    public FavouritePlaceResponseDto update(@PathVariable Long id, @Valid @RequestBody FavouritePlaceRequestDto request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
