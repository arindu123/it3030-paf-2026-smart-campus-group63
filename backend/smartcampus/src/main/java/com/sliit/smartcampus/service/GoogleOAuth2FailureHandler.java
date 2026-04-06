package com.sliit.smartcampus.service;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class GoogleOAuth2FailureHandler extends SimpleUrlAuthenticationFailureHandler {

    @Value("${app.oauth2.frontend-success-url:http://localhost:3000/Component/Login}")
    private String frontendSuccessUrl;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request,
                                        HttpServletResponse response,
                                        AuthenticationException exception) throws IOException, ServletException {
        String message = exception.getMessage() == null || exception.getMessage().isBlank()
                ? "Google sign-in failed"
                : exception.getMessage();

        String errorUrl = frontendSuccessUrl
                + "?oauth=error&message="
                + URLEncoder.encode(message, StandardCharsets.UTF_8);

        getRedirectStrategy().sendRedirect(request, response, errorUrl);
    }
}
