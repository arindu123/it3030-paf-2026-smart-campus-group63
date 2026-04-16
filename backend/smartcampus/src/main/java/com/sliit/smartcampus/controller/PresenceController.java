package com.sliit.smartcampus.controller;

import com.sliit.smartcampus.dto.PresenceHeartbeatRequest;
import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/presence")
@CrossOrigin(origins = "*")
public class PresenceController {

    private final UserService userService;

    public PresenceController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/heartbeat")
    public ResponseEntity<?> heartbeat(@RequestBody PresenceHeartbeatRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }

        try {
            User user = userService.recordHeartbeat(request.getEmail());
            return ResponseEntity.ok(Map.of(
                "message", "Presence updated",
                "email", user.getEmail()
            ));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", ex.getMessage() == null ? "Presence update failed" : ex.getMessage()
            ));
        }
    }
}
