package com.sliit.smartcampus.dto;

import com.sliit.smartcampus.enums.ResourceStatus;

public class ResourceStatusUpdateRequest {

    private ResourceStatus status;

    public ResourceStatusUpdateRequest() {}

    public ResourceStatus getStatus() {
        return status;
    }

    public void setStatus(ResourceStatus status) {
        this.status = status;
    }
}