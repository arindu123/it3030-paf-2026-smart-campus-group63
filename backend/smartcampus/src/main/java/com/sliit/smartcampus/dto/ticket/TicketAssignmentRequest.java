package com.sliit.smartcampus.dto.ticket;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class TicketAssignmentRequest {

    @NotBlank(message = "Technician email is required")
    @Email(message = "Technician email must be a valid email")
    private String technicianEmail;

    public String getTechnicianEmail() {
        return technicianEmail;
    }

    public void setTechnicianEmail(String technicianEmail) {
        this.technicianEmail = technicianEmail;
    }
}
