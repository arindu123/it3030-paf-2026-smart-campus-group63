package com.sliit.smartcampus.dto.ticket;

import com.sliit.smartcampus.enums.TicketCategory;
import com.sliit.smartcampus.enums.TicketPriority;
import com.sliit.smartcampus.enums.TicketStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class TicketResponse {
    private Long id;
    private String title;
    private TicketCategory category;
    private String description;
    private TicketPriority priority;
    private String preferredContactDetails;
    private String relatedResource;
    private Long relatedResourceId;
    private String relatedLocation;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private TicketStatus status;
    private String assignedTo;
    private String resolutionNote;
    private String rejectionReason;
    private List<AttachmentResponse> attachments = new ArrayList<>();
    private List<TicketCommentResponse> comments = new ArrayList<>();
    private List<TicketProgressUpdateResponse> progressUpdates = new ArrayList<>();

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

    public String getRelatedResource() {
        return relatedResource;
    }

    public void setRelatedResource(String relatedResource) {
        this.relatedResource = relatedResource;
    }

    public Long getRelatedResourceId() {
        return relatedResourceId;
    }

    public void setRelatedResourceId(Long relatedResourceId) {
        this.relatedResourceId = relatedResourceId;
    }

    public String getRelatedLocation() {
        return relatedLocation;
    }

    public void setRelatedLocation(String relatedLocation) {
        this.relatedLocation = relatedLocation;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
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

    public TicketStatus getStatus() {
        return status;
    }

    public void setStatus(TicketStatus status) {
        this.status = status;
    }

    public String getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(String assignedTo) {
        this.assignedTo = assignedTo;
    }

    public String getResolutionNote() {
        return resolutionNote;
    }

    public void setResolutionNote(String resolutionNote) {
        this.resolutionNote = resolutionNote;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public List<AttachmentResponse> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<AttachmentResponse> attachments) {
        this.attachments = attachments;
    }

    public List<TicketCommentResponse> getComments() {
        return comments;
    }

    public void setComments(List<TicketCommentResponse> comments) {
        this.comments = comments;
    }

    public List<TicketProgressUpdateResponse> getProgressUpdates() {
        return progressUpdates;
    }

    public void setProgressUpdates(List<TicketProgressUpdateResponse> progressUpdates) {
        this.progressUpdates = progressUpdates;
    }
}
