package com.suances.caja.repository;

import com.suances.caja.domain.model.ComandaCobradaItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ComandaCobradaItemRepository extends JpaRepository<ComandaCobradaItem, UUID> {
}
