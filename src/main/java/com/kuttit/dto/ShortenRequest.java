package com.kuttit.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.URL;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ShortenRequest {

    @NotBlank
    @URL
    private String url;

    @Pattern(regexp = "^[a-zA-Z0-9-]{3,30}$", message = "Alias must be 3-30 characters, alphanumeric and hyphens only")
    private String customAlias;

    private LocalDateTime expirationDate;

    private List<String> tags;
}
