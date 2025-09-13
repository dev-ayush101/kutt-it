package com.kuttit.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "counters")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Counter {

    @Id
    private String id;

    private long seq;
}
