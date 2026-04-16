package com.sliit.smartcampus.dto;

import com.sliit.smartcampus.entity.User;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

public class AdminUserDto {

    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String department;
    private String role;
    private String provider;
    private Instant lastLoginAt;
    private Instant lastSeenAt;
    private boolean online;

    public static AdminUserDto fromUser(User user) {
        AdminUserDto dto = new AdminUserDto();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setDepartment(user.getDepartment());
        dto.setRole(user.getRole() == null ? null : user.getRole().name());
        dto.setProvider(user.getProvider() == null ? null : user.getProvider().name());
        dto.setLastLoginAt(user.getLastLoginAt());
        dto.setLastSeenAt(user.getLastSeenAt());
        dto.setOnline(user.getLastSeenAt() != null && user.getLastSeenAt().isAfter(Instant.now().minus(2, ChronoUnit.MINUTES)));
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public Instant getLastLoginAt() {
        return lastLoginAt;
    }

    public void setLastLoginAt(Instant lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }

    public Instant getLastSeenAt() {
        return lastSeenAt;
    }

    public void setLastSeenAt(Instant lastSeenAt) {
        this.lastSeenAt = lastSeenAt;
    }

    public boolean isOnline() {
        return online;
    }

    public void setOnline(boolean online) {
        this.online = online;
    }
}
