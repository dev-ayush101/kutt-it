package com.kuttit.service;

import com.kuttit.model.Click;
import com.kuttit.repository.ClickRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClickService {

    private final ClickRepository clickRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    @Async
    public void logClick(String shortCode, String ip, String userAgent, String referrer) {
        Click click = Click.builder()
                .shortCode(shortCode)
                .timestamp(LocalDateTime.now())
                .ip(ip)
                .userAgent(userAgent)
                .referrer(referrer)
                .build();
        clickRepository.save(click);
        redisTemplate.delete("analytics:" + shortCode);
    }

    public Map<String, Object> getAnalytics(String shortCode) {
        List<Click> clicks = clickRepository.findByShortCode(shortCode);
        String cacheKey = "analytics:" + shortCode;

        Object cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            return (Map<String, Object>) cached;
        }

        Map<String, Long> clicksByDate = clicks.stream()
                .collect(Collectors.groupingBy(
                        click -> click.getTimestamp().toLocalDate().toString(),
                        Collectors.counting()));

        Map<String, Object> result = new HashMap<>();
        result.put("ShortCode", shortCode);
        result.put("totalClicks", clicks.size());
        result.put("clicksByDate", clicksByDate);

        redisTemplate.opsForValue().set(cacheKey, result, Duration.ofMinutes(5));
        return result;
    }
}
