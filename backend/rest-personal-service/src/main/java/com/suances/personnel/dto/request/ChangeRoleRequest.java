package com.suances.personnel.dto.request;

import com.suances.personnel.domain.enums.Rol;
import jakarta.validation.constraints.NotNull;

public class ChangeRoleRequest {

    @NotNull(message = "El rol es obligatorio")
    private Rol role;

    public Rol getRole() {
        return role;
    }

    public void setRole(Rol role) {
        this.role = role;
    }
}
