package com.sliit.smartcampus.dto.ticket;

import com.sliit.smartcampus.enums.UserRole;

import java.time.LocalDateTime;

public class TicketCommentResponse {
    private Long id;
    private String commentText;
    private String owner;
    private UserRole ownerRole;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCommentText() {
        return commentText;
    }

    public void setCommentText(String commentText) {
        this.commentText = commentText;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public UserRole getOwnerRole() {
        return ownerRole;
    }

    public void setOwnerRole(UserRole ownerRole) {
        this.ownerRole = ownerRole;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
