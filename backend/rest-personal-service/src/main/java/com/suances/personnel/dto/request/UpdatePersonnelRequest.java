package com.suances.personnel.dto.request;

import jakarta.validation.constraints.Size;

public class UpdatePersonnelRequest {

    @Size(max = 100, message = "El nombre no puede superar 100 caracteres")
    private String fullName;

    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    private String password;

    private String imageUrl;

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
