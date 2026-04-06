package com.sliit.smartcampus.service;

import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.enums.UserRole;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

            String email = oAuth2User.getAttribute("email");
            String name = oAuth2User.getAttribute("name");
            String providerId = oAuth2User.getAttribute("sub");

            if (email == null || email.isBlank()) {
                sendOAuthErrorRedirect(request, response, "Google account email is required");
                return;
            }

            User user = userService.handleGoogleLogin(email, name, providerId);
            UserRole role = user.getRole() == null ? UserRole.USER : user.getRole();

            String redirectUrl = UriComponentsBuilder
                    .fromUriString(frontendSuccessUrl)
                    .queryParam("oauth", "success")
                    .queryParam("email", user.getEmail())
                    .queryParam("fullName", user.getFullName())
                    .queryParam("role", role.name())
                    .build()
                    .toUriString();

            getRedirectStrategy().sendRedirect(request, response, redirectUrl);
        } catch (Exception ex) {
            log.error("Google sign-in success handler failed", ex);
            String message = ex.getMessage() == null || ex.getMessage().isBlank()
                    ? "Google sign-in failed"
                    : "Google sign-in failed: " + ex.getMessage();
            sendOAuthErrorRedirect(request, response, message);
        }
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
