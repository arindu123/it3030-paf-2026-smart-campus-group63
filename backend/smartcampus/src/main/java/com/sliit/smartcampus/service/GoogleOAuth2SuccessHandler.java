package com.sliit.smartcampus.service;

import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.enums.AuthProvider;
import com.sliit.smartcampus.enums.UserRole;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class GoogleOAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private static final Logger log = LoggerFactory.getLogger(GoogleOAuth2SuccessHandler.class);

    private final UserService userService;

    @Value("${app.oauth2.frontend-success-url:http://localhost:3000/Component/Login}")
    private String frontendSuccessUrl;

    public GoogleOAuth2SuccessHandler(UserService userService) {
        this.userService = userService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        try {
            OAuth2AuthenticationToken authToken = (OAuth2AuthenticationToken) authentication;
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
            String registrationId = authToken.getAuthorizedClientRegistrationId();
            AuthProvider provider = "github".equalsIgnoreCase(registrationId) ? AuthProvider.GITHUB : AuthProvider.GOOGLE;

            String email = resolveEmail(registrationId, authToken, oAuth2User);
            email = email == null ? null : email.trim();
            String name = resolveName(registrationId, oAuth2User);
            String providerId = resolveProviderId(registrationId, oAuth2User);

            if (email == null || email.isBlank()) {
                sendOAuthErrorRedirect(request, response, provider.name() + " account email is required");
                return;
            }

            User user = userService.recordLogin(userService.handleOAuthLogin(email, name, providerId, provider));
            UserRole role = user.getRole() == null ? UserRole.USER : user.getRole();

            String redirectUrl = UriComponentsBuilder
                    .fromUriString(frontendSuccessUrl)
                    .queryParam("oauth", "success")
                    .queryParam("email", user.getEmail())
                    .queryParam("fullName", user.getFullName())
                    .queryParam("role", role.name())
                    .queryParam("provider", registrationId)
                    .build()
                    .toUriString();

            getRedirectStrategy().sendRedirect(request, response, redirectUrl);
        } catch (Exception ex) {
            log.error("OAuth sign-in success handler failed", ex);
            String message = ex.getMessage() == null || ex.getMessage().isBlank()
                    ? "OAuth sign-in failed"
                    : "OAuth sign-in failed: " + ex.getMessage();
            sendOAuthErrorRedirect(request, response, message);
        }
    }

    private String resolveEmail(String registrationId, OAuth2AuthenticationToken authToken, OAuth2User oAuth2User) {
        String email = oAuth2User.getAttribute("email");
        if (email != null && !email.isBlank()) {
            return email;
        }

        if (!"github".equalsIgnoreCase(registrationId)) {
            return null;
        }

        String login = oAuth2User.getAttribute("login");
        String stableKey = (login == null || login.isBlank()) ? resolveProviderId(registrationId, oAuth2User) : login;
        if (stableKey == null || stableKey.isBlank()) {
            return null;
        }

        return stableKey + "@github.local";
    }

    private String resolveName(String registrationId, OAuth2User oAuth2User) {
        String name = oAuth2User.getAttribute("name");
        if (name != null && !name.isBlank()) {
            return name;
        }

        if ("github".equalsIgnoreCase(registrationId)) {
            String login = oAuth2User.getAttribute("login");
            if (login != null && !login.isBlank()) {
                return login;
            }
        }

        return "Campus User";
    }

    private String resolveProviderId(String registrationId, OAuth2User oAuth2User) {
        if ("github".equalsIgnoreCase(registrationId)) {
            Object id = oAuth2User.getAttribute("id");
            return id == null ? oAuth2User.getAttribute("login") : String.valueOf(id);
        }

        return oAuth2User.getAttribute("sub");
    }

    private void sendOAuthErrorRedirect(HttpServletRequest request,
                                        HttpServletResponse response,
                                        String message) throws IOException {
        String errorUrl = frontendSuccessUrl
                + "?oauth=error&message="
                + URLEncoder.encode(message, StandardCharsets.UTF_8);
        getRedirectStrategy().sendRedirect(request, response, errorUrl);
    }
}
