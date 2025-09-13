package com.kuttit.repository;

import com.kuttit.model.Url;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UrlRepository extends MongoRepository<Url, String> {

    Optional<Url> findByShortCode(String shortCode);

    boolean existsByShortCode(String shortCode);
}
