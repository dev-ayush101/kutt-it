package com.kuttit.service;

import com.kuttit.model.Counter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.*;
import org.springframework.stereotype.Service;

@Service
public class CounterService {

    @Autowired
    private MongoTemplate mongoTemplate;

    public long getNextSequence(String key) {
        Query query = new Query(Criteria.where("_id").is(key));
        Update update = new Update().inc("seq", 1);

        FindAndModifyOptions options = FindAndModifyOptions.options()
                .returnNew(true)
                .upsert(true);

        Counter counter = mongoTemplate.findAndModify(
                query,
                update,
                options,
                Counter.class
        );

        assert counter != null;
        return counter.getSeq();
    }
}
