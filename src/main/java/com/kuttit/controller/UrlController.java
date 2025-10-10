package com.kuttit.controller;

import com.kuttit.dto.BulkShortenRequest;
import com.kuttit.dto.ShortenRequest;
import com.kuttit.dto.UpdateUrlRequest;
import com.kuttit.exception.ExpiredUrlException;
import com.kuttit.model.Url;
import com.kuttit.service.ClickService;
import com.kuttit.service.UrlService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UrlController {

    private final UrlService urlService;
    private final ClickService clickService;

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
    public void redirect(@PathVariable String shortCode, HttpServletRequest request, HttpServletResponse response) throws IOException {

        String originalUrl = urlService.getOriginalUrl(shortCode);

        String ip = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");
        String referrer = request.getHeader("Referer");
        clickService.logClick(shortCode, ip, userAgent, referrer);

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

    // Update URL
    @PutMapping("/links/{shortCode}")
    public ResponseEntity<?> updateLink(@PathVariable String shortCode, @RequestBody @Valid UpdateUrlRequest request, @AuthenticationPrincipal UserDetails userDetails) {
        Url updated = urlService.updateUrl(shortCode, request, userDetails.getUsername());
        return ResponseEntity.ok(updated);
    }

    // Delete URL - soft delete
    @DeleteMapping("/links/{shortCode}")
    public ResponseEntity<?> deleteLink(@PathVariable String shortCode, @AuthenticationPrincipal UserDetails userDetails) {
        urlService.deleteUrl(shortCode, userDetails.getUsername());
        return ResponseEntity.ok(Map.of("message", "Link deleted successfully"));
    }

    // Log URL redirect analytics
    @GetMapping("/analytics/{shortCode}")
    public ResponseEntity<?> getAnalytics(@PathVariable String shortCode, @AuthenticationPrincipal UserDetails userDetails) {
        Url url = urlService.getUrlByShortCode(shortCode);
        if (url == null || !url.getUserId().equals(userDetails.getUsername())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }
        return ResponseEntity.ok(clickService.getAnalytics(shortCode));
    }

    // Bulk URLs
    @PostMapping("/shorten/bulk")
    public ResponseEntity<?> shortenBulk(@RequestBody @Valid BulkShortenRequest request, @AuthenticationPrincipal UserDetails userDetails) {
        String userId = userDetails.getUsername();
        List<Map<String, Object>> results = urlService.shortenBulk(request.getUrls(), userId);
        return ResponseEntity.ok(results);
    }
}
