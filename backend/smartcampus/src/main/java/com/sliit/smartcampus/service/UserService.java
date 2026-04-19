package com.sliit.smartcampus.service;

import com.sliit.smartcampus.dto.LoginRequest;
import com.sliit.smartcampus.dto.AdminCreateUserRequest;
import com.sliit.smartcampus.dto.ChangePasswordRequest;
import com.sliit.smartcampus.dto.ProfileUpdateRequest;
import com.sliit.smartcampus.dto.RegisterRequest;
import com.sliit.smartcampus.entity.Booking;
import com.sliit.smartcampus.entity.Ticket;
import com.sliit.smartcampus.entity.TicketComment;
import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.enums.AuthProvider;
import com.sliit.smartcampus.enums.CampusNotificationType;
import com.sliit.smartcampus.enums.UserRole;
import com.sliit.smartcampus.repository.BookingRepository;
import com.sliit.smartcampus.repository.CampusNotificationRepository;
import com.sliit.smartcampus.repository.TicketCommentRepository;
import com.sliit.smartcampus.repository.TicketRepository;
import com.sliit.smartcampus.repository.TicketNotificationRepository;
import com.sliit.smartcampus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;
import java.time.Instant;
import java.util.Locale;

@Service
public class UserService {

    private static final String DELETED_USER_NAME = "Deleted User";
    private static final String DELETED_USER_EMAIL = "deleted-user@smartcampus.local";
    private static final String PROFILE_PHOTO_PATH_SEGMENT = "/api/profile/photo/";

    private final UserRepository userRepository;
    private final CampusNotificationService campusNotificationService;
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final TicketCommentRepository ticketCommentRepository;
    private final TicketNotificationRepository ticketNotificationRepository;
    private final CampusNotificationRepository campusNotificationRepository;

    @Value("${app.profile.photos.dir:uploads/profile-photos}")
    private String profilePhotosDir;

    public UserService(UserRepository userRepository,
                       CampusNotificationService campusNotificationService,
                       BookingRepository bookingRepository,
                       TicketRepository ticketRepository,
                       TicketCommentRepository ticketCommentRepository,
                       TicketNotificationRepository ticketNotificationRepository,
                       CampusNotificationRepository campusNotificationRepository) {
        this.userRepository = userRepository;
        this.campusNotificationService = campusNotificationService;
        this.bookingRepository = bookingRepository;
        this.ticketRepository = ticketRepository;
        this.ticketCommentRepository = ticketCommentRepository;
        this.ticketNotificationRepository = ticketNotificationRepository;
        this.campusNotificationRepository = campusNotificationRepository;
    }

    public User registerUser(RegisterRequest request) {
        String email = request.getEmail() == null ? "" : request.getEmail().trim();
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            if (isDeactivated(existingUser.get())) {
                throw new IllegalArgumentException("This email belongs to a deactivated account and cannot be used");
            }
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

        if (!email.contains("@") || !email.contains(".")) {
            throw new IllegalArgumentException("Invalid email format");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(email);
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
        String email = request.getEmail() == null ? "" : request.getEmail().trim();
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            if (isDeactivated(existingUser.get())) {
                throw new IllegalArgumentException("This email belongs to a deactivated account and cannot be used");
            }
            throw new IllegalArgumentException("Email already exists");
        }

        if (request.getFullName() == null || request.getFullName().isBlank()
            || email.isBlank()
            || request.getPhoneNumber() == null || request.getPhoneNumber().isBlank()
            || request.getDepartment() == null || request.getDepartment().isBlank()) {
            throw new IllegalArgumentException("All user fields are required");
        }

        if (!email.contains("@") || !email.contains(".")) {
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
        user.setEmail(email);
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
                .filter(user -> !isDeactivated(user))
                .filter(user -> user.getPassword() != null && user.getPassword().equals(request.getPassword()));
    }

    public boolean isDeactivatedAccount(String email) {
        return userRepository.findByEmail(email)
            .map(this::isDeactivated)
            .orElse(false);
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
            if (isDeactivated(user)) {
                throw new IllegalArgumentException("This account is deactivated. Please contact an admin.");
            }
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
        User savedUser = userRepository.save(user);

        String fullName = savedUser.getFullName() == null || savedUser.getFullName().isBlank()
            ? "there"
            : savedUser.getFullName();

        campusNotificationService.notifyEmail(
            savedUser.getEmail(),
            savedUser.getRole(),
            CampusNotificationType.WELCOME_BACK,
            "Welcome Back",
            "Welcome back, " + fullName + "! You have successfully logged in.",
            "USER",
            savedUser.getId()
        );

        return savedUser;
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

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new NoSuchElementException("User not found"));
    }

    public User updateMyProfile(String actorEmail, ProfileUpdateRequest request) {
        User user = getUserByEmail(actorEmail);

        String phoneNumber = request.getPhoneNumber() == null ? "" : request.getPhoneNumber().trim();
        String address = request.getAddress() == null ? "" : request.getAddress().trim();
        String department = request.getDepartment() == null ? "" : request.getDepartment().trim();
        String preferredContactMethod = request.getPreferredContactMethod() == null
            ? "EMAIL"
            : request.getPreferredContactMethod().trim().toUpperCase(Locale.ROOT);
        String profilePhotoUrl = request.getProfilePhotoUrl() == null ? "" : request.getProfilePhotoUrl().trim();
        Boolean notificationEnabled = request.getNotificationEnabled();

        if (phoneNumber.isBlank() || department.isBlank()) {
            throw new IllegalArgumentException("Phone number and department are required");
        }

        if (!("EMAIL".equals(preferredContactMethod)
            || "PHONE".equals(preferredContactMethod)
            || "WHATSAPP".equals(preferredContactMethod))) {
            throw new IllegalArgumentException("Preferred contact method must be EMAIL, PHONE, or WHATSAPP");
        }

        user.setPhoneNumber(phoneNumber);
        user.setAddress(address.isBlank() ? null : address);
        user.setDepartment(department);
        user.setPreferredContactMethod(preferredContactMethod);
        user.setProfilePhotoUrl(profilePhotoUrl.isBlank() ? null : profilePhotoUrl);
        if (notificationEnabled != null) {
            user.setNotificationEnabled(notificationEnabled);
        }
        return userRepository.save(user);
    }

    public void changeMyPassword(String actorEmail, ChangePasswordRequest request) {
        User user = getUserByEmail(actorEmail);

        if (user.getProvider() != null && user.getProvider() != AuthProvider.LOCAL) {
            throw new IllegalArgumentException("Password is managed by your OAuth provider");
        }

        String currentPassword = request.getCurrentPassword() == null ? "" : request.getCurrentPassword();
        String newPassword = request.getNewPassword() == null ? "" : request.getNewPassword();
        String confirmPassword = request.getConfirmPassword() == null ? "" : request.getConfirmPassword();

        if (!currentPassword.equals(user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        if (newPassword.length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters");
        }
        if (!newPassword.equals(confirmPassword)) {
            throw new IllegalArgumentException("Confirm password does not match");
        }

        user.setPassword(newPassword);
        userRepository.save(user);
    }

    public User deactivateMyProfile(String actorEmail) {
        throw new IllegalArgumentException("Users cannot deactivate their own account. Please contact an admin.");
    }

    public User adminDeactivateUser(String adminEmail, Long userId) {
        User admin = getUserByEmail(adminEmail);
        if (admin.getRole() != UserRole.ADMIN) {
            throw new IllegalArgumentException("Only admins can deactivate users");
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new NoSuchElementException("User not found"));

        if (user.getRole() == UserRole.ADMIN && userRepository.countByRole(UserRole.ADMIN) <= 1) {
            throw new IllegalArgumentException("Cannot deactivate the last admin account");
        }

        user.setStatus("DEACTIVATED");
        return userRepository.save(user);
    }

    public User adminActivateUser(String adminEmail, Long userId) {
        User admin = getUserByEmail(adminEmail);
        if (admin.getRole() != UserRole.ADMIN) {
            throw new IllegalArgumentException("Only admins can activate users");
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new NoSuchElementException("User not found"));

        user.setStatus("ACTIVE");
        return userRepository.save(user);
    }

    public User updateProfilePhoto(String actorEmail, String profilePhotoUrl) {
        User user = getUserByEmail(actorEmail);
        user.setProfilePhotoUrl(profilePhotoUrl);
        return userRepository.save(user);
    }

    @Transactional
    public void deleteMyProfile(String actorEmail) {
        User user = getUserByEmail(actorEmail);

        if (user.getRole() == UserRole.ADMIN && userRepository.countByRole(UserRole.ADMIN) <= 1) {
            throw new IllegalArgumentException("Cannot delete the last admin account");
        }

        deleteUserAndRelatedData(user);
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

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new NoSuchElementException("User not found"));

        if (user.getRole() == UserRole.ADMIN && userRepository.countByRole(UserRole.ADMIN) <= 1) {
            throw new IllegalArgumentException("Cannot delete the last admin account");
        }

        deleteUserAndRelatedData(user);
    }

    private void deleteUserAndRelatedData(User user) {
        Long userId = user.getId();
        String userEmail = user.getEmail();

        if (userId != null) {
            detachUserFromBookings(userId);
            detachUserFromTickets(userId, userEmail);
            detachUserFromTicketComments(userId);
        }

        if (userEmail != null && !userEmail.isBlank()) {
            campusNotificationRepository.deleteByRecipientEmail(userEmail);
            ticketNotificationRepository.deleteByRecipientEmail(userEmail);
        }

        deleteProfilePhotoFile(user.getProfilePhotoUrl());
        userRepository.delete(user);
    }

    private void detachUserFromBookings(Long userId) {
        List<Booking> bookings = bookingRepository.findByCreatedByUser_Id(userId);
        if (bookings.isEmpty()) {
            return;
        }

        for (Booking booking : bookings) {
            booking.setCreatedByUser(null);
            booking.setCreatedBy(DELETED_USER_NAME);
        }
        bookingRepository.saveAll(bookings);
    }

    private void detachUserFromTickets(Long userId, String userEmail) {
        List<Ticket> createdTickets = ticketRepository.findByCreatedByUser_IdOrderByCreatedAtDesc(userId);
        for (Ticket ticket : createdTickets) {
            ticket.setCreatedByUser(null);
            ticket.setCreatedBy(DELETED_USER_EMAIL);
        }

        List<Ticket> assignedTickets = ticketRepository.findByAssignedToUser_IdOrderByCreatedAtDesc(userId);
        for (Ticket ticket : assignedTickets) {
            ticket.setAssignedToUser(null);
            if (userEmail != null && userEmail.equalsIgnoreCase(ticket.getAssignedTo())) {
                ticket.setAssignedTo(null);
            }
        }

        if (!createdTickets.isEmpty()) {
            ticketRepository.saveAll(createdTickets);
        }
        if (!assignedTickets.isEmpty()) {
            ticketRepository.saveAll(assignedTickets);
        }
    }

    private void detachUserFromTicketComments(Long userId) {
        List<TicketComment> comments = ticketCommentRepository.findByOwnerUser_Id(userId);
        if (comments.isEmpty()) {
            return;
        }

        for (TicketComment comment : comments) {
            comment.setOwnerUser(null);
            comment.setOwnerEmail(DELETED_USER_EMAIL);
        }
        ticketCommentRepository.saveAll(comments);
    }

    private void deleteProfilePhotoFile(String profilePhotoUrl) {
        String fileName = extractPhotoFileName(profilePhotoUrl);
        if (fileName == null) {
            return;
        }

        try {
            Path root = Paths.get(profilePhotosDir).toAbsolutePath().normalize();
            Path file = root.resolve(fileName).normalize();
            if (file.startsWith(root)) {
                Files.deleteIfExists(file);
            }
        } catch (Exception ignored) {
            // Account deletion should not fail due to file cleanup issues.
        }
    }

    private String extractPhotoFileName(String profilePhotoUrl) {
        if (profilePhotoUrl == null || profilePhotoUrl.isBlank()) {
            return null;
        }

        int markerIndex = profilePhotoUrl.indexOf(PROFILE_PHOTO_PATH_SEGMENT);
        if (markerIndex < 0) {
            return null;
        }

        String fileName = profilePhotoUrl.substring(markerIndex + PROFILE_PHOTO_PATH_SEGMENT.length()).trim();
        if (fileName.isBlank() || fileName.contains("/") || fileName.contains("\\")) {
            return null;
        }

        return fileName;
    }

    private boolean isDeactivated(User user) {
        return "DEACTIVATED".equalsIgnoreCase(user.getStatus());
    }
}
