package com.kuttit.service;

import com.kuttit.model.Url;
import com.kuttit.repository.UrlRepository;
import com.kuttit.util.ShortCodeGenerator;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UrlService {

    private final UrlRepository urlRepository;

    public UrlService(UrlRepository urlRepository) {
        this.urlRepository = urlRepository;
    }

    // Create Short URL
    public String shortenUrl(String originalUrl) {
        String shortCode;
        int attempts = 0;

        do {
            String saltedUrl = originalUrl + attempts;
            shortCode = ShortCodeGenerator.generate(saltedUrl);
            attempts++;
        } while (urlRepository.existsByShortCode(shortCode) && attempts < 5);

        Url url = Url.builder()
                .originalUrl(originalUrl)
                .shortCode(shortCode)
                .createdAt(LocalDateTime.now())
                .build();

        urlRepository.save(url);
        return shortCode;
    }

    // Get original URL
    public String getOriginalUrl(String shortCode) {
        return urlRepository.findByShortCode(shortCode)
                .map(Url::getOriginalUrl)
                .orElseThrow(() -> new RuntimeException("URL Not Found"));
    }
}
