package com.kuttit.controller;

import com.kuttit.dto.ShortenRequest;
import com.kuttit.exception.ExpiredUrlException;
import com.kuttit.service.UrlService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UrlController {

    private final UrlService urlService;

    // Create Short URL
    @PostMapping("/shorten")
    public ResponseEntity<?> shorten(@RequestBody @Valid ShortenRequest request, @AuthenticationPrincipal UserDetails userDetails) {

        String userId = (userDetails != null) ?  userDetails.getUsername() : null;
        String shortCode = urlService.shortenUrl(request.getUrl(), request.getCustomAlias(), userId, request.getExpirationDate());

        return ResponseEntity.ok(Map.of(
                "shortCode", shortCode,
                "shortUrl", "http://localhost:8080/api/r/" + shortCode
        ));
    }

    // Redirect to original URL
    @GetMapping("/r/{shortCode}")
    public void redirect(@PathVariable String shortCode, HttpServletResponse response) throws IOException {

        String originalUrl = urlService.getOriginalUrl(shortCode);
        response.sendRedirect(originalUrl);
    }

    @ExceptionHandler(ExpiredUrlException.class)
    public ResponseEntity<String> handleExpiredUrl(ExpiredUrlException ex) {
        return ResponseEntity.status(HttpStatus.GONE).body(ex.getMessage());
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
    }
}
