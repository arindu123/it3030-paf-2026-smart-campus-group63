package com.sliit.smartcampus;

import com.sliit.smartcampus.service.GoogleOAuth2SuccessHandler;
import com.sliit.smartcampus.service.GoogleOAuth2FailureHandler;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    private final GoogleOAuth2SuccessHandler googleOAuth2SuccessHandler;
    private final GoogleOAuth2FailureHandler googleOAuth2FailureHandler;
    private final ClientRegistrationRepository clientRegistrationRepository;

    public SecurityConfig(GoogleOAuth2SuccessHandler googleOAuth2SuccessHandler,
                          GoogleOAuth2FailureHandler googleOAuth2FailureHandler,
                          ObjectProvider<ClientRegistrationRepository> clientRegistrationRepositoryProvider) {
        this.googleOAuth2SuccessHandler = googleOAuth2SuccessHandler;
        this.googleOAuth2FailureHandler = googleOAuth2FailureHandler;
        this.clientRegistrationRepository = clientRegistrationRepositoryProvider.getIfAvailable();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/oauth2/*", "/login/oauth2/*").permitAll()
                .anyRequest().permitAll()
            );

        if (clientRegistrationRepository != null) {
            http.oauth2Login(oauth2 -> oauth2
                .successHandler(googleOAuth2SuccessHandler)
                .failureHandler(googleOAuth2FailureHandler)
            );
        }

        return http.build();
    }
}
