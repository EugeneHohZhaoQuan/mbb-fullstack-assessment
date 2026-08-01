package com.eugenehoh.assessment.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Component
public class ThirdPartyEnrichmentClient {

    private static final Logger log = LoggerFactory.getLogger(ThirdPartyEnrichmentClient.class);

    private final RestClient restClient = RestClient.builder()
            .baseUrl("https://nominatim.openstreetmap.org")
            .defaultHeader("User-Agent", "mbb-fullstack-assessment/1.0")
            .build();

    @SuppressWarnings("unchecked")
    public String reverseGeocode(double latitude, double longitude) {
        try {
            Map<String, Object> response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/reverse")
                            .queryParam("format", "json")
                            .queryParam("lat", latitude)
                            .queryParam("lon", longitude)
                            .build())
                    .retrieve()
                    .body(Map.class);

            return response == null ? null : (String) response.get("display_name");
        } catch (Exception e) {
            log.warn("Reverse geocoding failed for ({}, {}): {}", latitude, longitude, e.getMessage());
            return null;
        }
    }
}
