package com.sliit.smartcampus.controller;

import com.sliit.smartcampus.dto.notification.CampusNotificationResponse;
import com.sliit.smartcampus.service.CampusNotificationService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private static final String ACTOR_HEADER = "X-User-Email";
    private final CampusNotificationService notificationService;

    public NotificationController(CampusNotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<CampusNotificationResponse> getMyNotifications(@RequestHeader(ACTOR_HEADER) String actorEmail) {
        return notificationService.getMyNotifications(actorEmail);
    }

    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount(@RequestHeader(ACTOR_HEADER) String actorEmail) {
        return Map.of("count", notificationService.getUnreadCount(actorEmail));
    }

    @PatchMapping("/{notificationId}/read")
    public CampusNotificationResponse markAsRead(@PathVariable Long notificationId,
                                                 @RequestHeader(ACTOR_HEADER) String actorEmail) {
        return notificationService.markAsRead(notificationId, actorEmail);
    }
}