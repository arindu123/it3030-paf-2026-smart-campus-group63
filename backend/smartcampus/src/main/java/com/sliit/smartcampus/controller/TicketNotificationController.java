package com.sliit.smartcampus.controller;

import com.sliit.smartcampus.dto.ticket.TicketNotificationResponse;
import com.sliit.smartcampus.service.TicketNotificationService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/tickets/notifications")
public class TicketNotificationController {

    private static final String ACTOR_HEADER = "X-User-Email";
    private final TicketNotificationService ticketNotificationService;

    public TicketNotificationController(TicketNotificationService ticketNotificationService) {
        this.ticketNotificationService = ticketNotificationService;
    }

    @GetMapping
    public List<TicketNotificationResponse> getMyNotifications(@RequestHeader(ACTOR_HEADER) String actorEmail) {
        return ticketNotificationService.getMyNotifications(actorEmail);
    }

    @PatchMapping("/{notificationId}/read")
    public TicketNotificationResponse markAsRead(@PathVariable Long notificationId,
                                                 @RequestHeader(ACTOR_HEADER) String actorEmail) {
        return ticketNotificationService.markAsRead(notificationId, actorEmail);
    }
}
