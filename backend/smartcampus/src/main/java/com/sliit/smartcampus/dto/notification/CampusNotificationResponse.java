package com.sliit.smartcampus.dto.notification;

import com.sliit.smartcampus.enums.CampusNotificationType;
import com.sliit.smartcampus.enums.UserRole;

import java.time.LocalDateTime;

public class CampusNotificationResponse {

    private Long id;
    private String title;
    private String message;
    private CampusNotificationType type;
    private String relatedType;
    private Long relatedId;
    private String recipientEmail;
    private UserRole recipientRole;
    private Boolean read;
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public CampusNotificationType getType() {
        return type;
    }

    public void setType(CampusNotificationType type) {
        this.type = type;
    }

    public String getRelatedType() {
        return relatedType;
    }

    public void setRelatedType(String relatedType) {
        this.relatedType = relatedType;
    }

    public Long getRelatedId() {
        return relatedId;
    }

    public void setRelatedId(Long relatedId) {
        this.relatedId = relatedId;
    }

    public String getRecipientEmail() {
        return recipientEmail;
    }

    public void setRecipientEmail(String recipientEmail) {
        this.recipientEmail = recipientEmail;
    }

    public UserRole getRecipientRole() {
        return recipientRole;
    }

    public void setRecipientRole(UserRole recipientRole) {
        this.recipientRole = recipientRole;
    }

    public Boolean getRead() {
        return read;
    }

    public void setRead(Boolean read) {
        this.read = read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}