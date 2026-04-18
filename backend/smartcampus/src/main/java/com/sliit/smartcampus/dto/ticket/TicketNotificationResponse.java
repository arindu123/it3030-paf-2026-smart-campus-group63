package com.sliit.smartcampus.dto.ticket;

import com.sliit.smartcampus.enums.TicketNotificationType;

import java.time.LocalDateTime;

public class TicketNotificationResponse {
    private Long id;
    private Long ticketId;
    private TicketNotificationType type;
    private String message;
    private Boolean read;
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTicketId() {
        return ticketId;
    }

    public void setTicketId(Long ticketId) {
        this.ticketId = ticketId;
    }

    public TicketNotificationType getType() {
        return type;
    }

    public void setType(TicketNotificationType type) {
        this.type = type;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
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
