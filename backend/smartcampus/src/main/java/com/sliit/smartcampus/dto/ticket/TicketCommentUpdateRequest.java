package com.sliit.smartcampus.dto.ticket;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class TicketCommentUpdateRequest {

    @NotBlank(message = "Comment text is required")
    @Size(max = 1000, message = "Comment text must be 1000 characters or less")
    private String commentText;

    public String getCommentText() {
        return commentText;
    }

    public void setCommentText(String commentText) {
        this.commentText = commentText;
    }
}
