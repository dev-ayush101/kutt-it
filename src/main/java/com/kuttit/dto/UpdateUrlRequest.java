package com.kuttit.dto;

import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.URL;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateUrlRequest {

    @URL
    private String originalUrl;

    @Pattern(regexp = "^[a-zA-Z0-9-]{3,30}$", message = "Alias must be 3-30 alphanumeric characters or hyphens")
    private String customAlias;

    private LocalDateTime expirationDate;
}
