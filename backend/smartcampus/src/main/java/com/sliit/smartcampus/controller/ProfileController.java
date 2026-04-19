package com.sliit.smartcampus.controller;

import com.sliit.smartcampus.dto.ChangePasswordRequest;
import com.sliit.smartcampus.dto.ProfileResponse;
import com.sliit.smartcampus.dto.ProfileUpdateRequest;
import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.service.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "*")
public class ProfileController {

    private static final String ACTOR_HEADER = "X-User-Email";
    private static final Set<String> IMAGE_TYPES = Set.of("image/jpeg", "image/png", "image/webp", "image/gif");
    private final UserService userService;

    @Value("${app.profile.photos.dir:uploads/profile-photos}")
    private String profilePhotosDir;

    @Value("${app.profile.photos.max-size-bytes:5242880}")
    private long maxPhotoSizeBytes;

    public ProfileController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<?> getMyProfile(@RequestHeader(ACTOR_HEADER) String actorEmail) {
        try {
            User user = userService.getUserByEmail(actorEmail);
            return ResponseEntity.ok(ProfileResponse.fromUser(user));
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(404).body(Map.of("message", ex.getMessage()));
        }
    }

    @PutMapping
    public ResponseEntity<?> updateMyProfile(@RequestHeader(ACTOR_HEADER) String actorEmail,
                                             @RequestBody ProfileUpdateRequest request) {
        try {
            User updated = userService.updateMyProfile(actorEmail, request);
            return ResponseEntity.ok(ProfileResponse.fromUser(updated));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(404).body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changeMyPassword(@RequestHeader(ACTOR_HEADER) String actorEmail,
                                              @RequestBody ChangePasswordRequest request) {
        try {
            userService.changeMyPassword(actorEmail, request);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(404).body(Map.of("message", ex.getMessage()));
        }
    }

    @PatchMapping("/deactivate")
    public ResponseEntity<?> deactivateMyProfile(@RequestHeader(ACTOR_HEADER) String actorEmail) {
        try {
            userService.deactivateMyProfile(actorEmail);
            return ResponseEntity.badRequest().body(Map.of(
                "message", "Users cannot deactivate their own account. Please contact an admin."
            ));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(404).body(Map.of("message", ex.getMessage()));
        }
    }

    @DeleteMapping
    public ResponseEntity<?> deleteMyProfile(@RequestHeader(ACTOR_HEADER) String actorEmail) {
        try {
            userService.deleteMyProfile(actorEmail);
            return ResponseEntity.ok(Map.of("message", "Your account was deleted successfully"));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(404).body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/photo")
    public ResponseEntity<?> uploadProfilePhoto(@RequestHeader(ACTOR_HEADER) String actorEmail,
                                                @RequestParam("file") MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Profile photo file is required"));
            }

            if (file.getSize() > maxPhotoSizeBytes) {
                return ResponseEntity.badRequest().body(Map.of("message", "File is too large. Max 5MB allowed"));
            }

            String contentType = file.getContentType() == null ? "" : file.getContentType();
            if (!IMAGE_TYPES.contains(contentType)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Only JPEG, PNG, WEBP, and GIF images are allowed"));
            }

            String originalName = file.getOriginalFilename() == null ? "photo" : file.getOriginalFilename();
            String extension = "";
            int dot = originalName.lastIndexOf('.');
            if (dot >= 0) {
                extension = originalName.substring(dot);
            }

            String savedFileName = UUID.randomUUID() + extension;
            Path uploadDir = Paths.get(profilePhotosDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadDir);
            Path targetPath = uploadDir.resolve(savedFileName).normalize();
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            String publicUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/profile/photo/")
                .path(savedFileName)
                .toUriString();

            User updated = userService.updateProfilePhoto(actorEmail, publicUrl);
            return ResponseEntity.ok(Map.of(
                "message", "Profile photo uploaded successfully",
                "profilePhotoUrl", updated.getProfilePhotoUrl()
            ));
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(404).body(Map.of("message", ex.getMessage()));
        } catch (IOException ex) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Failed to store profile photo"));
        }
    }

    @GetMapping("/photo/{fileName:.+}")
    public ResponseEntity<?> getProfilePhoto(@PathVariable String fileName) {
        try {
            Path root = Paths.get(profilePhotosDir).toAbsolutePath().normalize();
            Path file = root.resolve(fileName).normalize();

            if (!file.startsWith(root) || !Files.exists(file)) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new UrlResource(file.toUri());
            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = Files.probeContentType(file);
            MediaType mediaType;
            try {
                mediaType = contentType == null ? MediaType.APPLICATION_OCTET_STREAM : MediaType.parseMediaType(contentType);
            } catch (Exception ex) {
                mediaType = MediaType.APPLICATION_OCTET_STREAM;
            }

            return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                .body(resource);
        } catch (IOException ex) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Failed to read profile photo"));
        }
    }
}