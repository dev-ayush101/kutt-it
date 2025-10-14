package com.kuttit.service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {
    private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    // Authenticated users get 120 requests/hour
    private Bucket authenticatedBucket() {
        Bandwidth limit = Bandwidth.classic(120, Refill.greedy(120, Duration.ofHours(1)));
        return Bucket.builder().addLimit(limit).build();
    }

    // Anonymous users get 10 requests/hour
    private Bucket anonymousBucket() {
        Bandwidth limit = Bandwidth.classic(10, Refill.greedy(10, Duration.ofHours(1)));
        return Bucket.builder().addLimit(limit).build();
    }

    public Bucket resolveBucket(String key, boolean isAuthenticated) {
        return buckets.computeIfAbsent(key, k -> isAuthenticated ? authenticatedBucket() : anonymousBucket());
    }
}