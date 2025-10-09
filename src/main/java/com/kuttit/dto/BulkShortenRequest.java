package com.kuttit.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BulkShortenRequest {

    @NotEmpty
    @Size(max = 120, message = "Maximum 120 URLs per bulk request")
    private List<@Valid ShortenRequest> urls;
}
