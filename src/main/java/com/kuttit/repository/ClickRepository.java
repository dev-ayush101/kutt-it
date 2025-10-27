package com.kuttit.repository;

import com.kuttit.model.Click;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ClickRepository extends MongoRepository<Click, String> {
    List<Click> findByShortCode(String shortCode);
    long countByShortCode(String shortCode);
}
