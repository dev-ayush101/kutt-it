package com.kuttit.repository;

import com.kuttit.model.Url;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UrlRepository extends MongoRepository<Url, String> {

    Optional<Url> findByShortCode(String shortCode);

    List<Url> findByUserId(String userId);

    boolean existsByShortCode(String shortCode);
}
