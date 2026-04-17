package com.sliit.smartcampus.dto.ticket;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class TicketProgressCreateRequest {

    @NotBlank(message = "Progress update text is required")
    @Size(max = 1200, message = "Progress update text must be 1200 characters or less")
    private String updateText;

    public String getUpdateText() {
        return updateText;
    }

    public void setUpdateText(String updateText) {
        this.updateText = updateText;
    }
}
