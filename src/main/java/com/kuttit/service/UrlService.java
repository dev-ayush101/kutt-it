package com.kuttit.service;

import com.kuttit.model.Url;
import com.kuttit.repository.UrlRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class UrlService {

    private final UrlRepository urlRepository;

    private static final String CHAR_SET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int CODE_LENGTH = 6;

    public UrlService(UrlRepository urlRepository) {
        this.urlRepository = urlRepository;
    }

    // Create Short URL
    public String shortenUrl(String originalUrl) {
        String shortCode;

        do {
            shortCode = generateShortCode();
        } while (urlRepository.findByShortCode(shortCode).isPresent());

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

    // Generate random short code
    private String generateShortCode() {
        Random random = new Random();
        StringBuilder sb = new StringBuilder();

        for(int i = 0; i < CODE_LENGTH; i++){
            int index = random.nextInt(CHAR_SET.length());
            sb.append(CHAR_SET.charAt(index));
        }

        return sb.toString();
    }
}
