package com.sliit.smartcampus;

import com.sliit.smartcampus.service.GoogleOAuth2SuccessHandler;
import com.sliit.smartcampus.service.GoogleOAuth2FailureHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    private final GoogleOAuth2SuccessHandler googleOAuth2SuccessHandler;
    private final GoogleOAuth2FailureHandler googleOAuth2FailureHandler;

    public SecurityConfig(GoogleOAuth2SuccessHandler googleOAuth2SuccessHandler,
                          GoogleOAuth2FailureHandler googleOAuth2FailureHandler) {
        this.googleOAuth2SuccessHandler = googleOAuth2SuccessHandler;
        this.googleOAuth2FailureHandler = googleOAuth2FailureHandler;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .headers(headers -> headers.frameOptions(frame -> frame.disable()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/h2-console/**").permitAll()
                .requestMatchers("/oauth2/*", "/login/oauth2/*").permitAll()
                .anyRequest().permitAll()
            )
            .oauth2Login(oauth2 -> oauth2
                .successHandler(googleOAuth2SuccessHandler)
                .failureHandler(googleOAuth2FailureHandler)
            );

        return http.build();
    }
}