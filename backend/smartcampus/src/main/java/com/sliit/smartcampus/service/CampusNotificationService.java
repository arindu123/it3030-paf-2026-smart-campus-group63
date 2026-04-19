package com.sliit.smartcampus.service;

import com.sliit.smartcampus.dto.notification.CampusNotificationResponse;
import com.sliit.smartcampus.entity.CampusNotification;
import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.enums.CampusNotificationType;
import com.sliit.smartcampus.enums.UserRole;
import com.sliit.smartcampus.exception.NotFoundException;
import com.sliit.smartcampus.repository.CampusNotificationRepository;
import com.sliit.smartcampus.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class CampusNotificationService {

    private final CampusNotificationRepository notificationRepository;
    private final TicketAuthorizationService ticketAuthorizationService;
    private final UserRepository userRepository;

    public CampusNotificationService(CampusNotificationRepository notificationRepository,
                                     TicketAuthorizationService ticketAuthorizationService,
                                     UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.ticketAuthorizationService = ticketAuthorizationService;
        this.userRepository = userRepository;
    }

    public void notifyEmail(String recipientEmail,
                            UserRole recipientRole,
                            CampusNotificationType type,
                            String title,
                            String message,
                            String relatedType,
                            Long relatedId) {
        if (recipientEmail == null || recipientEmail.isBlank()) {
            return;
        }

        CampusNotification notification = new CampusNotification();
        notification.setRecipientEmail(recipientEmail.trim().toLowerCase(Locale.ROOT));
        notification.setRecipientRole(recipientRole);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setRelatedType(relatedType);
        notification.setRelatedId(relatedId);
        notificationRepository.save(notification);
    }

    public void notifyRole(UserRole role,
                           String actorEmailToSkip,
                           CampusNotificationType type,
                           String title,
                           String message,
                           String relatedType,
                           Long relatedId) {
        List<User> recipients = userRepository.findAllByRole(role);
        String skipEmail = actorEmailToSkip == null ? "" : actorEmailToSkip.trim();

        for (User recipient : recipients) {
            if (recipient.getEmail() != null && recipient.getEmail().equalsIgnoreCase(skipEmail)) {
                continue;
            }

            notifyEmail(recipient.getEmail(), recipient.getRole(), type, title, message, relatedType, relatedId);
        }
    }

    public List<CampusNotificationResponse> getMyNotifications(String actorEmail) {
        User actor = ticketAuthorizationService.requireActor(actorEmail);

        return notificationRepository.findByRecipientEmailOrderByCreatedAtDesc(actor.getEmail().trim().toLowerCase(Locale.ROOT))
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    public long getUnreadCount(String actorEmail) {
        User actor = ticketAuthorizationService.requireActor(actorEmail);
        return notificationRepository.countByRecipientEmailAndIsReadFalse(actor.getEmail().trim().toLowerCase(Locale.ROOT));
    }

    public CampusNotificationResponse markAsRead(Long notificationId, String actorEmail) {
        User actor = ticketAuthorizationService.requireActor(actorEmail);
        CampusNotification notification = notificationRepository.findByIdAndRecipientEmail(notificationId, actor.getEmail().trim().toLowerCase(Locale.ROOT))
            .orElseThrow(() -> new NotFoundException("Notification not found: " + notificationId));

        notification.setIsRead(Boolean.TRUE);
        return toResponse(notificationRepository.save(notification));
    }

    private CampusNotificationResponse toResponse(CampusNotification notification) {
        CampusNotificationResponse response = new CampusNotificationResponse();
        response.setId(notification.getId());
        response.setTitle(notification.getTitle());
        response.setMessage(notification.getMessage());
        response.setType(notification.getType());
        response.setRelatedType(notification.getRelatedType());
        response.setRelatedId(notification.getRelatedId());
        response.setRecipientEmail(notification.getRecipientEmail());
        response.setRecipientRole(notification.getRecipientRole());
        response.setRead(notification.getIsRead());
        response.setCreatedAt(notification.getCreatedAt());
        return response;
    }
}