package com.suances.personnel.dto.response;

import java.util.UUID;

import com.suances.personnel.domain.enums.Rol;

public class RoleChangeResponse {

    private UUID id;
    private String username;
    private Rol role;

    public RoleChangeResponse(UUID id, String username, Rol role) {
        this.id = id;
        this.username = username;
        this.role = role;
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

    public Rol getRole() {
        return role;
    }

    public void setRole(Rol role) {
        this.role = role;
    }
}
