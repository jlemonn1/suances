package com.suances.sala.client.dto;

import java.util.UUID;

public class PlatoImagenSyncDto {

    private UUID id;
    private String url;
    private Integer orden;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public Integer getOrden() {
        return orden;
    }

    public void setOrden(Integer orden) {
        this.orden = orden;
    }
}
