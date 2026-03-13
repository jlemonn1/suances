package com.suances.personnel.dto.request;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class ToggleModoEspiaRequest {

    @NotNull
    private Boolean activo;

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }
}
