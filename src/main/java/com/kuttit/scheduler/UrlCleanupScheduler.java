package com.kuttit.scheduler;

import com.kuttit.repository.UrlRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class UrlCleanupScheduler {

    private final UrlRepository urlRepository;

    @Scheduled(cron = "0 0 * * * *")
    public void deleteExpiredUrls() {
        urlRepository.deleteByExpirationDateIsNotNullAndExpirationDateBefore(LocalDateTime.now());
    }
}
