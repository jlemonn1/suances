package com.suances.carta.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class PlatoImagenRequest {

    @NotBlank(message = "La URL es obligatoria")
    @Size(max = 500, message = "La URL no puede exceder 500 caracteres")
    private String url;

    private Integer orden = 0;

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public Integer getOrden() { return orden; }
    public void setOrden(Integer orden) { this.orden = orden != null ? orden : 0; }
}
