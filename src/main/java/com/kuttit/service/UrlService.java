package com.kuttit.service;

import com.kuttit.model.Url;
import com.kuttit.repository.UrlRepository;
import com.kuttit.util.Base62Encoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

    // Get original URL
    public String getOriginalUrl(String shortCode) {
        return urlRepository.findByShortCode(shortCode)
                .map(Url::getOriginalUrl)
                .orElseThrow(() -> new RuntimeException("URL Not Found"));
    }

    @Autowired
    private CounterService counterService;

    public String generateShortCode() {
        long id = counterService.getNextSequence("url_sequence");
        return Base62Encoder.encode(id);
    }
}
