package com.sliit.smartcampus.dto;

import com.sliit.smartcampus.enums.ResourceStatus;
import jakarta.validation.constraints.NotNull;

public class ResourceStatusUpdateRequest {

    @NotNull(message = "Resource status is required.")
    private ResourceStatus status;

    public ResourceStatusUpdateRequest() {}

    public ResourceStatus getStatus() {
        return status;
    }

    public void setStatus(ResourceStatus status) {
        this.status = status;
    }
}
