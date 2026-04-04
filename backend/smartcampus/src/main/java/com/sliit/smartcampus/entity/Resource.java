package com.sliit.smartcampus.entity;

import com.sliit.smartcampus.enums.ResourceStatus;
import com.sliit.smartcampus.enums.ResourceType;
import jakarta.persistence.*;

import java.time.LocalTime;

@Entity
@Table(name = "resources")
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Enumerated(EnumType.STRING)
    private ResourceType type;

    private Integer capacity;

    private String location;

    @Column(length = 1000)
    private String description;

    private LocalTime availableFrom;

    private LocalTime availableTo;

    @Enumerated(EnumType.STRING)
    private ResourceStatus status;

    // Constructors
    public Resource() {}

    public Resource(Long id, String name, ResourceType type, Integer capacity,
                    String location, String description,
                    LocalTime availableFrom, LocalTime availableTo,
                    ResourceStatus status) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.capacity = capacity;
        this.location = location;
        this.description = description;
        this.availableFrom = availableFrom;
        this.availableTo = availableTo;
        this.status = status;
    }

    // Getters & Setters
    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public ResourceType getType() {
        return type;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public String getLocation() {
        return location;
    }

    public String getDescription() {
        return description;
    }

    public LocalTime getAvailableFrom() {
        return availableFrom;
    }

    public LocalTime getAvailableTo() {
        return availableTo;
    }

    public ResourceStatus getStatus() {
        return status;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setType(ResourceType type) {
        this.type = type;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setAvailableFrom(LocalTime availableFrom) {
        this.availableFrom = availableFrom;
    }

    public void setAvailableTo(LocalTime availableTo) {
        this.availableTo = availableTo;
    }

    public void setStatus(ResourceStatus status) {
        this.status = status;
    }
}