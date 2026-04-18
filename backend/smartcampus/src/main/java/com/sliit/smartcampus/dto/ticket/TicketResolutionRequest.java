package com.sliit.smartcampus.dto.ticket;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class TicketResolutionRequest {

    @NotBlank(message = "Resolution note is required")
    @Size(max = 2000, message = "Resolution note must be 2000 characters or less")
    private String resolutionNote;

    public String getResolutionNote() {
        return resolutionNote;
    }

    public void setResolutionNote(String resolutionNote) {
        this.resolutionNote = resolutionNote;
    }
}
