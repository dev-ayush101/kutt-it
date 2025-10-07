package com.kuttit.service;

import com.kuttit.model.Click;
import com.kuttit.repository.ClickRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClickService {

    private final ClickRepository clickRepository;


    public void logClick(String shortCode, String ip, String userAgent, String referrer) {
        Click click = Click.builder()
                .shortCode(shortCode)
                .timestamp(LocalDateTime.now())
                .ip(ip)
                .userAgent(userAgent)
                .referrer(referrer)
                .build();
        clickRepository.save(click);
    }

    public Map<String, Object> getAnalytics(String shortCode) {
        List<Click> clicks = clickRepository.findByShortCode(shortCode);

        Map<String, Long> clicksByDate = clicks.stream()
                .collect(Collectors.groupingBy(
                        click -> click.getTimestamp().toLocalDate().toString(),
                        Collectors.counting()));

        return Map.of(
                "ShortCode", shortCode,
                "totalClicks", clicks.size(),
                "clicksByDate", clicksByDate
        );
    }
}
