package com.sliit.smartcampus.service;

import com.sliit.smartcampus.dto.LoginRequest;
import com.sliit.smartcampus.dto.RegisterRequest;
import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.enums.AuthProvider;
import com.sliit.smartcampus.enums.UserRole;
import com.sliit.smartcampus.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User registerUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        if (request.getRole() != null && request.getRole() != UserRole.USER) {
            throw new IllegalArgumentException("Public registration allows USER role only");
        }

        if (request.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters");
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Confirm password does not match");
        }

        if (!request.getEmail().contains("@") || !request.getEmail().contains(".")) {
            throw new IllegalArgumentException("Invalid email format");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setDepartment(request.getDepartment());
        user.setRole(UserRole.USER);
        user.setProvider(AuthProvider.LOCAL);

        return userRepository.save(user);
    }

    public Optional<User> authenticate(LoginRequest request) {
        return userRepository.findByEmail(request.getEmail())
                .filter(user -> user.getPassword() != null && user.getPassword().equals(request.getPassword()));
    }

    public boolean isGoogleAccount(String email) {
        return userRepository.findByEmail(email)
                .map(user -> user.getProvider() == AuthProvider.GOOGLE)
                .orElse(false);
    }

    public User handleGoogleLogin(String email, String fullName, String providerId) {
        Optional<User> existingUser = userRepository.findByEmail(email);

        if (existingUser.isPresent()) {
            User user = existingUser.get();
            boolean changed = false;

            if (user.getRole() == null) {
                user.setRole(UserRole.USER);
                changed = true;
            }
            if (user.getProvider() == null) {
                user.setProvider(AuthProvider.GOOGLE);
                changed = true;
            }
            if (user.getFullName() == null || user.getFullName().isBlank()) {
                user.setFullName((fullName == null || fullName.isBlank()) ? "Google User" : fullName);
                changed = true;
            }
            if (user.getPhoneNumber() == null || user.getPhoneNumber().isBlank()) {
                user.setPhoneNumber("N/A");
                changed = true;
            }
            if (user.getDepartment() == null || user.getDepartment().isBlank()) {
                user.setDepartment("General");
                changed = true;
            }
            if (user.getPassword() == null || user.getPassword().isBlank()) {
                user.setPassword("GOOGLE_" + UUID.randomUUID());
                changed = true;
            }
            if (providerId != null && !providerId.isBlank()) {
                if (!providerId.equals(user.getProviderId())) {
                    user.setProviderId(providerId);
                    changed = true;
                }
            }

            return changed ? userRepository.save(user) : user;
        }

        User newUser = new User();
        newUser.setEmail(email);
        newUser.setFullName((fullName == null || fullName.isBlank()) ? "Google User" : fullName);
        newUser.setPassword("GOOGLE_" + UUID.randomUUID());
        newUser.setPhoneNumber("N/A");
        newUser.setDepartment("General");
        newUser.setRole(UserRole.USER);
        newUser.setProvider(AuthProvider.GOOGLE);
        newUser.setProviderId(providerId);

        return userRepository.save(newUser);
    }
}
