package com.sliit.smartcampus.dto;

import com.sliit.smartcampus.entity.User;
import com.sliit.smartcampus.enums.AuthProvider;

import java.time.Instant;

public class ProfileResponse {

    private String email;
    private String fullName;
    private String profilePhotoUrl;
    private String phoneNumber;
    private String address;
    private String department;
    private String preferredContactMethod;
    private String role;
    private String provider;
    private Instant joinedDate;
    private String status;
    private Boolean notificationEnabled;
    private boolean googleConnected;
    private boolean githubConnected;
    private boolean localPasswordEnabled;

    public static ProfileResponse fromUser(User user) {
        ProfileResponse response = new ProfileResponse();
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setProfilePhotoUrl(user.getProfilePhotoUrl());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setAddress(user.getAddress());
        response.setDepartment(user.getDepartment());
        response.setPreferredContactMethod(user.getPreferredContactMethod());
        response.setRole(user.getRole() == null ? null : user.getRole().name());
        response.setProvider(user.getProvider() == null ? null : user.getProvider().name());
        response.setJoinedDate(user.getLastLoginAt());
        response.setStatus((user.getStatus() == null || user.getStatus().isBlank()) ? "ACTIVE" : user.getStatus());
        response.setNotificationEnabled(user.getNotificationEnabled() == null ? Boolean.TRUE : user.getNotificationEnabled());
        response.setGoogleConnected(user.getProvider() == AuthProvider.GOOGLE);
        response.setGithubConnected(user.getProvider() == AuthProvider.GITHUB);
        response.setLocalPasswordEnabled(user.getProvider() == null || user.getProvider() == AuthProvider.LOCAL);
        return response;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getProfilePhotoUrl() {
        return profilePhotoUrl;
    }

    public void setProfilePhotoUrl(String profilePhotoUrl) {
        this.profilePhotoUrl = profilePhotoUrl;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getPreferredContactMethod() {
        return preferredContactMethod;
    }

    public void setPreferredContactMethod(String preferredContactMethod) {
        this.preferredContactMethod = preferredContactMethod;
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

    public Instant getJoinedDate() {
        return joinedDate;
    }

    public void setJoinedDate(Instant joinedDate) {
        this.joinedDate = joinedDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getNotificationEnabled() {
        return notificationEnabled;
    }

    public void setNotificationEnabled(Boolean notificationEnabled) {
        this.notificationEnabled = notificationEnabled;
    }

    public boolean isGoogleConnected() {
        return googleConnected;
    }

    public void setGoogleConnected(boolean googleConnected) {
        this.googleConnected = googleConnected;
    }

    public boolean isGithubConnected() {
        return githubConnected;
    }

    public void setGithubConnected(boolean githubConnected) {
        this.githubConnected = githubConnected;
    }

    public boolean isLocalPasswordEnabled() {
        return localPasswordEnabled;
    }

    public void setLocalPasswordEnabled(boolean localPasswordEnabled) {
        this.localPasswordEnabled = localPasswordEnabled;
    }
}