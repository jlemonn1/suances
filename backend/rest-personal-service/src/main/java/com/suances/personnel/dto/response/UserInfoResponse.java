package com.suances.personnel.dto.response;

import java.util.UUID;

import com.suances.personnel.domain.enums.Rol;

public class UserInfoResponse {

    private UUID id;
    private String fullName;
    private Rol role;
    private String imageUrl;

    public UserInfoResponse(UUID id, String fullName, Rol role, String imageUrl) {
        this.id = id;
        this.fullName = fullName;
        this.role = role;
        this.imageUrl = imageUrl;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public Rol getRole() {
        return role;
    }

    public void setRole(Rol role) {
        this.role = role;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
