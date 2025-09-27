package com.kuttit.controller;

import com.kuttit.model.Url;
import com.kuttit.service.UrlService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UrlService urlService;

    @GetMapping("/links")
    public ResponseEntity<List<Url>> getUserLinks(@AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        List<Url> links = urlService.getLinksByUser(email);
        return ResponseEntity.ok(links);
    }
}
