package com.suances.personnel.dto.response;

import com.suances.personnel.domain.enums.Rol;
import java.time.LocalDateTime;
import java.util.UUID;

public class PersonnelResponse {

    private UUID id;
    private String username;
    private String fullName;
    private Rol role;
    private String imageUrl;
    private Boolean activo;
    private LocalDateTime createdAt;

    public PersonnelResponse(UUID id, String username, String fullName, Rol role,
            String imageUrl, Boolean activo, LocalDateTime createdAt) {
        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.role = role;
        this.imageUrl = imageUrl;
        this.activo = activo;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
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

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
