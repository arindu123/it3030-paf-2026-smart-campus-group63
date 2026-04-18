package com.sliit.smartcampus.dto.ticket;

import com.sliit.smartcampus.enums.TicketCategory;
import com.sliit.smartcampus.enums.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class TicketCreateRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 180, message = "Title must be 180 characters or less")
    private String title;

    @NotNull(message = "Category is required")
    private TicketCategory category;

    @NotBlank(message = "Description is required")
    @Size(max = 2000, message = "Description must be 2000 characters or less")
    private String description;

    @NotNull(message = "Priority is required")
    private TicketPriority priority;

    @NotBlank(message = "Preferred contact details are required")
    @Size(max = 120, message = "Preferred contact details must be 120 characters or less")
    private String preferredContactDetails;

    private Long relatedResourceId;

    @Size(max = 255, message = "Related resource must be 255 characters or less")
    private String relatedResource;

    @Size(max = 255, message = "Related location must be 255 characters or less")
    private String relatedLocation;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public TicketCategory getCategory() {
        return category;
    }

    public void setCategory(TicketCategory category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public TicketPriority getPriority() {
        return priority;
    }

    public void setPriority(TicketPriority priority) {
        this.priority = priority;
    }

    public String getPreferredContactDetails() {
        return preferredContactDetails;
    }

    public void setPreferredContactDetails(String preferredContactDetails) {
        this.preferredContactDetails = preferredContactDetails;
    }

    public Long getRelatedResourceId() {
        return relatedResourceId;
    }

    public void setRelatedResourceId(Long relatedResourceId) {
        this.relatedResourceId = relatedResourceId;
    }

    public String getRelatedResource() {
        return relatedResource;
    }

    public void setRelatedResource(String relatedResource) {
        this.relatedResource = relatedResource;
    }

    public String getRelatedLocation() {
        return relatedLocation;
    }

    public void setRelatedLocation(String relatedLocation) {
        this.relatedLocation = relatedLocation;
    }
}
