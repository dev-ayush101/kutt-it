package com.kuttit.service;

import com.kuttit.model.Url;
import com.kuttit.repository.UrlRepository;
import com.kuttit.util.Base62Encoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class UrlService {

    private final UrlRepository urlRepository;

    public UrlService(UrlRepository urlRepository) {
        this.urlRepository = urlRepository;
    }

    // Create Short URL
    public String shortenUrl(String originalUrl) {
        String shortCode = generateShortCode();

        Url url = Url.builder()
                .originalUrl(originalUrl)
                .shortCode(shortCode)
                .build();

        urlRepository.save(url);
        return shortCode;
    }

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    // Get original URL
    public String getOriginalUrl(String shortCode) {

        // 1. Check Redis Cache
        String cachedUrl = redisTemplate.opsForValue().get(shortCode);

        if (cachedUrl != null) {
            System.out.println("Cache hit for shortCode: " + shortCode);
            return cachedUrl;
        }

        // 2. Cache Miss - Fetch from MongoDB
        Url url = urlRepository.findByShortCode(shortCode)
                .orElseThrow(() -> new RuntimeException("URL Not Found"));

        // 3. Store in Redis Cache with TTL of 12hrs
        redisTemplate.opsForValue().set(
                shortCode,
                url.getOriginalUrl(),
                Duration.ofHours(12)
        );

        System.out.println("Cache miss for shortCode: " + shortCode + ". Caching original URL.");

        return url.getOriginalUrl();
    }

    @Autowired
    private CounterService counterService;

    public String generateShortCode() {
        long id = counterService.getNextSequence("url_sequence");
        return Base62Encoder.encode(id);
    }
}
