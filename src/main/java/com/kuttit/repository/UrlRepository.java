package com.kuttit.repository;

import com.kuttit.model.Url;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UrlRepository extends MongoRepository<Url, String> {

    Optional<Url> findByShortCode(String shortCode);

    List<Url> findByUserId(String userId);

    boolean existsByShortCode(String shortCode);

    @Query(value = "{'$and': [{'expirationDate': {$ne: null}}, {'expirationDate': {$lt: ?0}}]}", delete = true)
    void deleteExpiredUrls(LocalDateTime now);

    List<Url> findByUserIdAndTagsContaining(String userId, String tag);
}
