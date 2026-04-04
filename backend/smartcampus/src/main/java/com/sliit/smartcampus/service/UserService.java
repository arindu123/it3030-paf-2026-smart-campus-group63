package com.sliit.smartcampus.service;

import com.sliit.smartcampus.dto.LoginRequest;
import com.sliit.smartcampus.dto.RegisterRequest;
import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.enums.UserRole;
import com.sliit.smartcampus.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

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

        return userRepository.save(user);
    }

    public Optional<User> authenticate(LoginRequest request) {
        return userRepository.findByEmail(request.getEmail())
                .filter(user -> user.getPassword().equals(request.getPassword()));
    }
}
