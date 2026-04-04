package com.sliit.smartcampus.controller;

import com.sliit.smartcampus.dto.LoginResponse;
import com.sliit.smartcampus.dto.RegisterRequest;
import com.sliit.smartcampus.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/register")
@CrossOrigin(origins = "*")
public class RegisterController {

    private final UserService userService;

    public RegisterController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<LoginResponse> register(@RequestBody RegisterRequest request) {
        if (request.getFullName() == null || request.getEmail() == null || request.getPassword() == null
            || request.getConfirmPassword() == null || request.getPhoneNumber() == null
            || request.getDepartment() == null
            || request.getFullName().isBlank() || request.getEmail().isBlank() || request.getPassword().isBlank()
            || request.getConfirmPassword().isBlank() || request.getPhoneNumber().isBlank() || request.getDepartment().isBlank()) {
            return ResponseEntity.badRequest()
                .body(new LoginResponse(false, "All register fields are required"));
        }

        try {
            userService.registerUser(request);
            return ResponseEntity.ok(new LoginResponse(true, "Registration successful as USER"));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(new LoginResponse(false, ex.getMessage()));
        }
    }
}
