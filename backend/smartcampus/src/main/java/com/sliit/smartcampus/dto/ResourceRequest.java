package com.sliit.smartcampus.dto;

import com.sliit.smartcampus.enums.ResourceStatus;
import com.sliit.smartcampus.enums.ResourceType;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalTime;

public class ResourceRequest {

    @NotBlank(message = "Resource name is required.")
    @Size(min = 3, max = 100, message = "Resource name must be between 3 and 100 characters.")
    private String name;

    @NotNull(message = "Resource type is required.")
    private ResourceType type;

    @NotNull(message = "Capacity is required.")
    @Min(value = 1, message = "Capacity must be greater than 0.")
    @Max(value = 1000, message = "Capacity must be 1000 or fewer.")
    private Integer capacity;

    @NotBlank(message = "Location is required.")
    @Size(max = 100, message = "Location must be 100 characters or fewer.")
    private String location;

    @NotBlank(message = "Description is required.")
    @Size(max = 500, message = "Description must be 500 characters or fewer.")
    private String description;

    @NotNull(message = "Available from time is required.")
    private LocalTime availableFrom;

    @NotNull(message = "Available to time is required.")
    private LocalTime availableTo;

    @NotNull(message = "Resource status is required.")
    private ResourceStatus status;

    public ResourceRequest() {}

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public ResourceType getType() {
        return type;
    }

    public void setType(ResourceType type) {
        this.type = type;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalTime getAvailableFrom() {
        return availableFrom;
    }

    public void setAvailableFrom(LocalTime availableFrom) {
        this.availableFrom = availableFrom;
    }

    public LocalTime getAvailableTo() {
        return availableTo;
    }

    public void setAvailableTo(LocalTime availableTo) {
        this.availableTo = availableTo;
    }

    public ResourceStatus getStatus() {
        return status;
    }

    public void setStatus(ResourceStatus status) {
        this.status = status;
    }

    @AssertTrue(message = "Available from time must be earlier than available to time.")
    public boolean isAvailabilityWindowValid() {
        if (availableFrom == null || availableTo == null) {
            return true;
        }

        return availableFrom.isBefore(availableTo);
    }
}
