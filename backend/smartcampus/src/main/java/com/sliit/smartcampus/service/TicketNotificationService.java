package com.sliit.smartcampus.service;

import com.sliit.smartcampus.dto.ticket.TicketNotificationResponse;
import com.sliit.smartcampus.entity.Ticket;
import com.sliit.smartcampus.entity.TicketNotification;
import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.enums.TicketNotificationType;
import com.sliit.smartcampus.enums.TicketStatus;
import com.sliit.smartcampus.exception.NotFoundException;
import com.sliit.smartcampus.repository.TicketNotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TicketNotificationService {

    private final TicketNotificationRepository ticketNotificationRepository;
    private final TicketAuthorizationService ticketAuthorizationService;

    public TicketNotificationService(TicketNotificationRepository ticketNotificationRepository,
                                     TicketAuthorizationService ticketAuthorizationService) {
        this.ticketNotificationRepository = ticketNotificationRepository;
        this.ticketAuthorizationService = ticketAuthorizationService;
    }

    public void notifyTicketOwnerForStatusChange(Ticket ticket,
                                                 String changedByEmail,
                                                 TicketStatus oldStatus,
                                                 TicketStatus newStatus) {
        if (ticket.getCreatedBy() == null || ticket.getCreatedBy().isBlank()) {
            return;
        }

        if (ticket.getCreatedBy().equalsIgnoreCase(changedByEmail)) {
            return;
        }

        TicketNotification notification = new TicketNotification();
        notification.setTicket(ticket);
        notification.setRecipientEmail(ticket.getCreatedBy());
        notification.setRecipientUser(ticket.getCreatedByUser());
        notification.setType(TicketNotificationType.STATUS_CHANGED);
        notification.setMessage(
            "Ticket #" + ticket.getId() + " status changed from " + oldStatus + " to " + newStatus +
                " by " + changedByEmail + "."
        );

        ticketNotificationRepository.save(notification);
    }

    public void notifyTicketOwnerForNewComment(Ticket ticket, String commenterEmail) {
        if (ticket.getCreatedBy() == null || ticket.getCreatedBy().isBlank()) {
            return;
        }

        if (ticket.getCreatedBy().equalsIgnoreCase(commenterEmail)) {
            return;
        }

        TicketNotification notification = new TicketNotification();
        notification.setTicket(ticket);
        notification.setRecipientEmail(ticket.getCreatedBy());
        notification.setRecipientUser(ticket.getCreatedByUser());
        notification.setType(TicketNotificationType.NEW_COMMENT);
        notification.setMessage(
            "New comment on Ticket #" + ticket.getId() + " by " + commenterEmail + "."
        );

        ticketNotificationRepository.save(notification);
    }

    public List<TicketNotificationResponse> getMyNotifications(String actorEmail) {
        User actor = ticketAuthorizationService.requireActor(actorEmail);

        return ticketNotificationRepository.findByRecipientEmailOrderByCreatedAtDesc(actor.getEmail())
            .stream()
            .map(this::toResponse)
            .toList();
    }

    public TicketNotificationResponse markAsRead(Long notificationId, String actorEmail) {
        User actor = ticketAuthorizationService.requireActor(actorEmail);
        TicketNotification notification = ticketNotificationRepository.findByIdAndRecipientEmail(notificationId, actor.getEmail())
            .orElseThrow(() -> new NotFoundException("Notification not found: " + notificationId));

        notification.setIsRead(Boolean.TRUE);
        return toResponse(ticketNotificationRepository.save(notification));
    }

    private TicketNotificationResponse toResponse(TicketNotification notification) {
        TicketNotificationResponse response = new TicketNotificationResponse();
        response.setId(notification.getId());
        response.setTicketId(notification.getTicket() != null ? notification.getTicket().getId() : null);
        response.setType(notification.getType());
        response.setMessage(notification.getMessage());
        response.setRead(notification.getIsRead());
        response.setCreatedAt(notification.getCreatedAt());
        return response;
    }
}
