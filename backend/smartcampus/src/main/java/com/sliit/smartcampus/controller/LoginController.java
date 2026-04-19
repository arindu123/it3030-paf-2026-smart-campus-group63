package com.sliit.smartcampus.controller;

import com.sliit.smartcampus.dto.LoginRequest;
import com.sliit.smartcampus.dto.LoginResponse;
import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/login")
@CrossOrigin(origins = "*")
public class LoginController {

    private final UserService userService;

    public LoginController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        if (request.getEmail() == null || request.getPassword() == null
            || request.getEmail().isBlank() || request.getPassword().isBlank()) {
            return ResponseEntity.badRequest()
                .body(new LoginResponse(false, "Email and password are required"));
        }

        if (userService.isSocialAccount(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(new LoginResponse(false, "This account uses social sign-in. Please click Continue with Google or GitHub."));
        }

        User user = userService.authenticate(request).orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new LoginResponse(false, "Invalid username or password"));
        }

        User updatedUser = userService.recordLogin(user);

        return ResponseEntity.ok(new LoginResponse(true, "Login successful", updatedUser.getEmail(), updatedUser.getFullName(), updatedUser.getRole().name()));
    }
}
