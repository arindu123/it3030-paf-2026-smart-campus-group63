package com.sliit.smartcampus.service;

import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.enums.AuthProvider;
import com.sliit.smartcampus.enums.CampusNotificationType;
import com.sliit.smartcampus.enums.UserRole;
import com.sliit.smartcampus.repository.BookingRepository;
import com.sliit.smartcampus.repository.CampusNotificationRepository;
import com.sliit.smartcampus.repository.TicketCommentRepository;
import com.sliit.smartcampus.repository.TicketNotificationRepository;
import com.sliit.smartcampus.repository.TicketRepository;
import com.sliit.smartcampus.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceOAuthRecreateAfterDeleteTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CampusNotificationService campusNotificationService;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private TicketCommentRepository ticketCommentRepository;

    @Mock
    private TicketNotificationRepository ticketNotificationRepository;

    @Mock
    private CampusNotificationRepository campusNotificationRepository;

    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(
            userRepository,
            campusNotificationService,
            bookingRepository,
            ticketRepository,
            ticketCommentRepository,
            ticketNotificationRepository,
            campusNotificationRepository
        );
    }

    @Test
    void shouldRecreateOAuthUserAsFreshAccountAfterProfileDeletion() {
        String email = "deleted.oauth.user@sliit.lk";

        User existing = new User();
        existing.setId(10L);
        existing.setEmail(email);
        existing.setRole(UserRole.USER);
        existing.setProvider(AuthProvider.GOOGLE);

        when(userRepository.findByEmail(email))
            .thenReturn(Optional.of(existing))
            .thenReturn(Optional.empty());
        when(bookingRepository.findByCreatedByUser_Id(10L)).thenReturn(Collections.emptyList());
        when(ticketRepository.findByCreatedByUser_IdOrderByCreatedAtDesc(10L)).thenReturn(Collections.emptyList());
        when(ticketRepository.findByAssignedToUser_IdOrderByCreatedAtDesc(10L)).thenReturn(Collections.emptyList());
        when(ticketCommentRepository.findByOwnerUser_Id(10L)).thenReturn(Collections.emptyList());

        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            if (saved.getId() == null) {
                saved.setId(99L);
            }
            return saved;
        });

        userService.deleteMyProfile(email);

        User recreated = userService.handleOAuthLogin(email, "Recreated User", "provider-id-1", AuthProvider.GOOGLE);
        User loggedIn = userService.recordLogin(recreated);

        assertNotNull(recreated.getId());
        assertEquals(99L, recreated.getId());
        assertEquals(email, recreated.getEmail());
        assertEquals("Recreated User", recreated.getFullName());
        assertEquals(UserRole.USER, recreated.getRole());
        assertEquals(AuthProvider.GOOGLE, recreated.getProvider());
        assertEquals("provider-id-1", recreated.getProviderId());
        assertEquals("N/A", recreated.getPhoneNumber());
        assertEquals("General", recreated.getDepartment());
        assertTrue(recreated.getPassword().startsWith("GOOGLE_"));

        assertNotNull(loggedIn.getLastLoginAt());
        assertNotNull(loggedIn.getLastSeenAt());

        verify(userRepository, times(1)).delete(existing);
        verify(campusNotificationRepository, times(1)).deleteByRecipientEmail(email);
        verify(ticketNotificationRepository, times(1)).deleteByRecipientEmail(email);
        verify(campusNotificationService, times(1)).notifyEmail(
            eq(email),
            eq(UserRole.USER),
            eq(CampusNotificationType.WELCOME_BACK),
            eq("Welcome Back"),
            eq("Welcome back, Recreated User! You have successfully logged in."),
            eq("USER"),
            eq(99L)
        );
    }
}
