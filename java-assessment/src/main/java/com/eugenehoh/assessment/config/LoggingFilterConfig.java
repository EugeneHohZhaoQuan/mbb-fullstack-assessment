package com.eugenehoh.assessment.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
public class LoggingFilterConfig extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger("com.eugenehoh.assessment.RequestResponseLog");

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        ContentCachingRequestWrapper wrappedRequest = new ContentCachingRequestWrapper(request);
        ContentCachingResponseWrapper wrappedResponse = new ContentCachingResponseWrapper(response);

        try {
            chain.doFilter(wrappedRequest, wrappedResponse);
        } finally {
            log.info("REQUEST {} {} body={}",
                    wrappedRequest.getMethod(),
                    wrappedRequest.getRequestURI() + queryString(wrappedRequest),
                    bodyAsString(wrappedRequest.getContentAsByteArray()));
            log.info("RESPONSE status={} body={}",
                    wrappedResponse.getStatus(),
                    bodyAsString(wrappedResponse.getContentAsByteArray()));
            wrappedResponse.copyBodyToResponse();
        }
    }

    private String queryString(HttpServletRequest request) {
        return request.getQueryString() == null ? "" : "?" + request.getQueryString();
    }

    private String bodyAsString(byte[] content) {
        return content.length == 0 ? "" : new String(content, StandardCharsets.UTF_8);
    }
}
