package com.sliit.smartcampus.controller;

import com.sliit.smartcampus.dto.AdminUserDto;
import com.sliit.smartcampus.dto.AdminCreateUserRequest;
import com.sliit.smartcampus.dto.AdminUserRoleUpdateRequest;
import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.enums.UserRole;
import com.sliit.smartcampus.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final UserService userService;

    public AdminController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users")
    public List<AdminUserDto> getAllUsers() {
        return userService.getAllUsers().stream()
            .map(AdminUserDto::fromUser)
            .toList();
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody AdminCreateUserRequest request) {
        try {
            User created = userService.createAdminUser(request);
            return ResponseEntity.ok(AdminUserDto.fromUser(created));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id,
                                            @RequestBody AdminUserRoleUpdateRequest request) {
        try {
            if (request.getRole() == null || request.getRole().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Role is required"));
            }

            UserRole role = UserRole.valueOf(request.getRole().toUpperCase(Locale.ROOT));
            User updated = userService.updateUserRole(id, role);
            return ResponseEntity.ok(AdminUserDto.fromUser(updated));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(404).body(Map.of("message", ex.getMessage()));
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(404).body(Map.of("message", ex.getMessage()));
        }
    }
}
