package com.sliit.smartcampus.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Iterator;

@Controller
public class OAuthProviderController {

    @Value("${app.oauth2.frontend-success-url:http://localhost:3000/Component/Login}")
    private String frontendLoginUrl;

    private final ClientRegistrationRepository clientRegistrationRepository;

    public OAuthProviderController(ObjectProvider<ClientRegistrationRepository> clientRegistrationRepositoryProvider) {
        this.clientRegistrationRepository = clientRegistrationRepositoryProvider.getIfAvailable();
    }

    @GetMapping("/oauth2/safe/github")
    public String startGithubAuthorizationSafely() {
        String githubClientId = resolveGithubClientId();

        if (githubClientId == null
            || githubClientId.isBlank()
            || "github-client-placeholder".equalsIgnoreCase(githubClientId)) {
            return "redirect:" + frontendLoginUrl
                    + "?oauth=error&message="
                    + URLEncoder.encode(
                        "GitHub sign-in is not configured on the backend. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.",
                        StandardCharsets.UTF_8
                    );
        }

        return "redirect:/oauth2/authorization/github";
    }

    private String resolveGithubClientId() {
        if (!(clientRegistrationRepository instanceof Iterable<?> registrations)) {
            return null;
        }

        Iterator<?> iterator = registrations.iterator();
        while (iterator.hasNext()) {
            Object registration = iterator.next();
            if (registration instanceof ClientRegistration clientRegistration
                && "github".equalsIgnoreCase(clientRegistration.getRegistrationId())) {
                return clientRegistration.getClientId();
            }
        }

        return null;
    }
}