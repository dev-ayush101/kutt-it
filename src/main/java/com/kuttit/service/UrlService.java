package com.kuttit.service;

import com.kuttit.dto.ShortenRequest;
import com.kuttit.dto.UpdateUrlRequest;
import com.kuttit.exception.ExpiredUrlException;
import com.kuttit.model.Url;
import com.kuttit.repository.UrlRepository;
import com.kuttit.util.Base62Encoder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UrlService {

    private final UrlRepository urlRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final CounterService counterService;

    // Create Short URL
    public String shortenUrl(String originalUrl, String customAlias, String userId, LocalDateTime expirationDate, List<String> tags) {
        String shortCode;

        if (customAlias != null && !customAlias.isBlank()) {
            Optional<Url> existing = urlRepository.findByShortCode(customAlias);
            if (existing.isPresent()) {
                boolean isExpired = existing.get().getExpirationDate() != null && LocalDateTime.now().isAfter(existing.get().getExpirationDate());
                boolean isDeleted = existing.get().isDeleted();
                if (!isExpired && !isDeleted) {
                    throw new RuntimeException("Custom alias already exists");
                }
                urlRepository.delete(existing.get());
            }
            shortCode = customAlias;
        } else {
            shortCode = generateShortCode();
        }

        Url url = Url.builder()
                .originalUrl(originalUrl)
                .shortCode(shortCode)
                .customAlias(customAlias)
                .createdAt(LocalDateTime.now())
                .userId(userId)
                .expirationDate(expirationDate)
                .tags(tags != null ? tags : new ArrayList<>())
                .build();

        urlRepository.save(url);
        return shortCode;
    }

    // Get original URL
    public String getOriginalUrl(String shortCode) {

        // 1. Check Redis Cache
        String cachedUrl = (String) redisTemplate.opsForValue().get(shortCode);

        if (cachedUrl != null) {
            log.info("Cache hit for shortCode: {}", shortCode);
            return cachedUrl;
        }

        // 2. Cache Miss - Fetch from MongoDB
        Url url = urlRepository.findByShortCode(shortCode)
                .orElseThrow(() -> new RuntimeException("URL Not Found"));

        if (url.isDeleted()) {
            throw new RuntimeException("URL has been deleted");
        }

        // 3. Check Expiration
        if (url.getExpirationDate() != null && LocalDateTime.now().isAfter(url.getExpirationDate())) {
            throw new ExpiredUrlException("URL has expired");
        }

        // 4. Store in Redis Cache with TTL of 12hrs
        redisTemplate.opsForValue().set(
                shortCode,
                url.getOriginalUrl(),
                Duration.ofHours(12)
        );

        log.info("Cache miss for shortCode: {}. Fetched from MongoDB and cached.", shortCode);

        return url.getOriginalUrl();
    }

    public String generateShortCode() {
        long id = counterService.getNextSequence("url_sequence") + 3843;
        return Base62Encoder.encode(id);
    }

    // Fetch URLs by userId
    public List<Url> getLinksByUser(String userId) {
        return urlRepository.findByUserId(userId).stream()
                .filter(url -> !url.isDeleted())
                .collect(Collectors.toList());
    }

    // Get URL by short code
    public Url getUrlByShortCode(String shortCode) {
        return urlRepository.findByShortCode(shortCode).orElse(null);
    }

    // Update URL by short code
    public Url updateUrl(String shortCode, UpdateUrlRequest request, String userId) {
        Url url = urlRepository.findByShortCode(shortCode)
                .orElseThrow(() -> new RuntimeException("URL Not Found"));

        if (url.isDeleted()) {
            throw new RuntimeException("URL has been deleted");
        }

        if (!userId.equals(url.getUserId())) {
            throw new RuntimeException("You do not own this link");
        }

        if (request.getOriginalUrl() != null && !request.getOriginalUrl().isBlank()) {
            url.setOriginalUrl(request.getOriginalUrl());
        }

        if (request.getCustomAlias() != null && !request.getCustomAlias().isBlank() && !request.getCustomAlias().equals(url.getShortCode())) {
            if (urlRepository.existsByShortCode(request.getCustomAlias())) {
                throw new RuntimeException("Alias already in use");
            }

            redisTemplate.delete(url.getShortCode());
            url.setShortCode(request.getCustomAlias());
            url.setCustomAlias(request.getCustomAlias());
        }

        if (request.getExpirationDate() != null) {
            url.setExpirationDate(request.getExpirationDate());
        }

        urlRepository.save(url);
        redisTemplate.delete(shortCode);
        return url;
    }

    // Delete URL by short code
    public void deleteUrl(String shortCode, String userId) {
        Url url = urlRepository.findByShortCode(shortCode)
                .orElseThrow(() -> new RuntimeException("URL Not Found"));

        if (url.isDeleted()) {
            throw new RuntimeException("URL has been deleted");
        }

        if (!userId.equals(url.getUserId())) {
            throw new RuntimeException("You do not own this link");
        }

        url.setDeleted(true);
        urlRepository.save(url);
        redisTemplate.delete(shortCode);
    }

    // Bulk Shortening of URLs
    public List<Map<String, Object>> shortenBulk(List<ShortenRequest> requests, String userId) {
        return requests.stream().map(req -> {
            try {
                String shortCode = shortenUrl(req.getUrl(), req.getCustomAlias(), userId, req.getExpirationDate(), req.getTags());
                return Map.<String, Object>of(
                        "originalUrl", req.getUrl(),
                        "shortCode", shortCode,
                        "shortUrl", "http://localhost:8080/api/r/" + shortCode
                );
            } catch (Exception e) {
                return Map.<String, Object>of(
                        "originalUrl", req.getUrl(),
                        "error", e.getMessage()
                );
            }
        }).collect(Collectors.toList());
    }

    // Fetch the links by their tags
    public List<Url> getLinksByTags(String userId, String tag) {
        return urlRepository.findByUserIdAndTagsContaining(userId, tag).stream()
                .filter(url -> !url.isDeleted())
                .collect(Collectors.toList());
    }
}
