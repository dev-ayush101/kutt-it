package com.kuttit.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "clicks")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Click {

    @Id
    private String id;

    private String shortCode;
    private LocalDateTime timestamp;
    private String ip;
    private String userAgent;
    private String referrer;
}
