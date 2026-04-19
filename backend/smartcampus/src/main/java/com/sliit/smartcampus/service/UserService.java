package com.sliit.smartcampus.service;

import com.sliit.smartcampus.dto.LoginRequest;
import com.sliit.smartcampus.dto.AdminCreateUserRequest;
import com.sliit.smartcampus.dto.RegisterRequest;
import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.enums.AuthProvider;
import com.sliit.smartcampus.enums.UserRole;
import com.sliit.smartcampus.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;
import java.time.Instant;

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
        user.setLastLoginAt(null);
        user.setLastSeenAt(null);

        return userRepository.save(user);
    }

    public User createAdminUser(AdminCreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        if (request.getFullName() == null || request.getFullName().isBlank()
            || request.getEmail() == null || request.getEmail().isBlank()
            || request.getPhoneNumber() == null || request.getPhoneNumber().isBlank()
            || request.getDepartment() == null || request.getDepartment().isBlank()) {
            throw new IllegalArgumentException("All user fields are required");
        }

        if (!request.getEmail().contains("@") || !request.getEmail().contains(".")) {
            throw new IllegalArgumentException("Invalid email format");
        }

        UserRole role = request.getRole() == null ? UserRole.USER : request.getRole();
        AuthProvider provider = request.getProvider() == null ? AuthProvider.LOCAL : request.getProvider();

        if (provider == AuthProvider.LOCAL) {
            if (request.getPassword() == null || request.getPassword().isBlank()) {
                throw new IllegalArgumentException("Password is required for LOCAL accounts");
            }
            if (request.getPassword().length() < 6) {
                throw new IllegalArgumentException("Password must be at least 6 characters");
            }
            if (!request.getPassword().equals(request.getConfirmPassword())) {
                throw new IllegalArgumentException("Confirm password does not match");
            }
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setDepartment(request.getDepartment());
        user.setRole(role);
        user.setProvider(provider);
        user.setProviderId(null);
        if (provider == AuthProvider.LOCAL) {
            user.setPassword(request.getPassword());
        } else {
            user.setPassword(provider.name() + "_" + UUID.randomUUID());
        }
        user.setLastLoginAt(null);
        user.setLastSeenAt(null);

        return userRepository.save(user);
    }

    public Optional<User> authenticate(LoginRequest request) {
        return userRepository.findByEmail(request.getEmail())
                .filter(user -> user.getPassword() != null && user.getPassword().equals(request.getPassword()));
    }

    public boolean isSocialAccount(String email) {
        return userRepository.findByEmail(email)
                .map(user -> user.getProvider() != null && user.getProvider() != AuthProvider.LOCAL)
                .orElse(false);
    }

    public User handleOAuthLogin(String email, String fullName, String providerId, AuthProvider provider) {
        Optional<User> existingUser = userRepository.findByEmail(email);

        if (existingUser.isPresent()) {
            User user = existingUser.get();
            boolean changed = false;

            if (user.getRole() == null) {
                user.setRole(UserRole.USER);
                changed = true;
            }
            if (user.getProvider() == null) {
                user.setProvider(provider);
                changed = true;
            }
            if (user.getFullName() == null || user.getFullName().isBlank()) {
                user.setFullName((fullName == null || fullName.isBlank()) ? "Campus User" : fullName);
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
                user.setPassword(provider.name() + "_" + UUID.randomUUID());
                changed = true;
            }
            if (providerId != null && !providerId.isBlank() && !providerId.equals(user.getProviderId())) {
                user.setProviderId(providerId);
                changed = true;
            }

            return changed ? userRepository.save(user) : user;
        }

        User newUser = new User();
        newUser.setEmail(email);
        newUser.setFullName((fullName == null || fullName.isBlank()) ? "Campus User" : fullName);
        newUser.setPassword(provider.name() + "_" + UUID.randomUUID());
        newUser.setPhoneNumber("N/A");
        newUser.setDepartment("General");
        newUser.setRole(UserRole.USER);
        newUser.setProvider(provider);
        newUser.setProviderId(providerId);
        newUser.setLastLoginAt(null);
        newUser.setLastSeenAt(null);

        return userRepository.save(newUser);
    }

    public User handleGoogleLogin(String email, String fullName, String providerId) {
        return handleOAuthLogin(email, fullName, providerId, AuthProvider.GOOGLE);
    }

    public User handleGitHubLogin(String email, String fullName, String providerId) {
        return handleOAuthLogin(email, fullName, providerId, AuthProvider.GITHUB);
    }

    public User recordLogin(User user) {
        user.setLastLoginAt(Instant.now());
        user.setLastSeenAt(Instant.now());
        return userRepository.save(user);
    }

    public User recordHeartbeat(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new NoSuchElementException("User not found"));

        user.setLastSeenAt(Instant.now());
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User updateUserRole(Long id, UserRole newRole) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new NoSuchElementException("User not found"));

        if (newRole == null) {
            throw new IllegalArgumentException("Role is required");
        }

        if (user.getRole() == UserRole.ADMIN && newRole != UserRole.ADMIN
            && userRepository.countByRole(UserRole.ADMIN) <= 1) {
            throw new IllegalArgumentException("Cannot remove the last admin account");
        }

        user.setRole(newRole);
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new NoSuchElementException("User not found"));

        if (user.getRole() == UserRole.ADMIN && userRepository.countByRole(UserRole.ADMIN) <= 1) {
            throw new IllegalArgumentException("Cannot delete the last admin account");
        }

        userRepository.delete(user);
    }
}
