package com.sliit.smartcampus.dto.ticket;

import com.sliit.smartcampus.enums.UserRole;

import java.time.LocalDateTime;

public class TicketProgressUpdateResponse {
    private Long id;
    private String updateText;
    private String updatedBy;
    private UserRole updatedByRole;
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUpdateText() {
        return updateText;
    }

    public void setUpdateText(String updateText) {
        this.updateText = updateText;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }

    public UserRole getUpdatedByRole() {
        return updatedByRole;
    }

    public void setUpdatedByRole(UserRole updatedByRole) {
        this.updatedByRole = updatedByRole;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
