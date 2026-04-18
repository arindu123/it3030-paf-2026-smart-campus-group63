package com.sliit.smartcampus.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Controller
@ConditionalOnMissingBean(ClientRegistrationRepository.class)
public class GoogleOAuth2FallbackController {

    @Value("${app.oauth2.frontend-success-url:http://localhost:3000/Component/Login}")
    private String frontendLoginUrl;

    @GetMapping("/oauth2/authorization/google")
    public String handleUnavailableGoogleAuthorization() {
        return "redirect:" + frontendLoginUrl
                + "?oauth=error&message="
                + URLEncoder.encode(
                    "Google sign-in is not configured on the backend. Set the Google OAuth environment variables and restart the server.",
                    StandardCharsets.UTF_8
                );
    }

    @GetMapping("/oauth2/authorization/github")
    public String handleUnavailableGithubAuthorization() {
        return "redirect:" + frontendLoginUrl
                + "?oauth=error&message="
                + URLEncoder.encode(
                    "GitHub sign-in is not configured on the backend. Set the GitHub OAuth environment variables and restart the server.",
                    StandardCharsets.UTF_8
                );
    }
}
