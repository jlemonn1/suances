package com.suances.personnel.service;

import com.suances.personnel.domain.model.AnotacionPersonal;
import com.suances.personnel.domain.model.Usuario;
import com.suances.personnel.dto.request.CreateAnotacionRequest;
import com.suances.personnel.dto.response.AnotacionPersonalResponse;
import com.suances.personnel.exception.ResourceNotFoundException;
import com.suances.personnel.repository.AnotacionPersonalRepository;
import com.suances.personnel.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AnotacionPersonalService {

    private static final Logger log = LoggerFactory.getLogger(AnotacionPersonalService.class);

    private final AnotacionPersonalRepository anotacionRepository;
    private final UsuarioRepository usuarioRepository;

    public AnotacionPersonalService(AnotacionPersonalRepository anotacionRepository,
                                    UsuarioRepository usuarioRepository) {
        this.anotacionRepository = anotacionRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public AnotacionPersonalResponse crear(CreateAnotacionRequest request) {
        Usuario usuario = usuarioRepository.findById(request.getUsuarioId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + request.getUsuarioId()));

        AnotacionPersonal anotacion = AnotacionPersonal.builder()
                .usuarioId(request.getUsuarioId())
                .tipoAccion(request.getTipoAccion())
                .comandaId(request.getComandaId())
                .mesaNumero(request.getMesaNumero())
                .reservaId(request.getReservaId())
                .detalle(request.getDetalle())
                .exitoso(request.getExitoso() != null ? request.getExitoso() : false)
                .build();

        anotacion = anotacionRepository.save(anotacion);
        
        log.info("Anotación creada para usuario {}: {} en comanda {}, mesa {}", 
                usuario.getUsername(), request.getTipoAccion(), request.getComandaId(), request.getMesaNumero());

        return toResponse(anotacion, usuario.getFullName());
    }

    public List<AnotacionPersonalResponse> listarPorUsuario(UUID usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + usuarioId));

        return anotacionRepository.findByUsuarioIdOrderByCreatedAtDesc(usuarioId).stream()
                .map(a -> toResponse(a, usuario.getFullName()))
                .collect(Collectors.toList());
    }

    public List<AnotacionPersonalResponse> listarTodas() {
        return anotacionRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(a -> {
                    Usuario usuario = usuarioRepository.findById(a.getUsuarioId()).orElse(null);
                    return toResponse(a, usuario != null ? usuario.getFullName() : "Desconocido");
                })
                .collect(Collectors.toList());
    }

    private AnotacionPersonalResponse toResponse(AnotacionPersonal anotacion, String usuarioNombre) {
        return new AnotacionPersonalResponse(
                anotacion.getId(),
                anotacion.getUsuarioId(),
                usuarioNombre,
                anotacion.getTipoAccion(),
                anotacion.getComandaId(),
                anotacion.getMesaNumero(),
                anotacion.getReservaId(),
                anotacion.getDetalle(),
                anotacion.getExitoso(),
                anotacion.getCreatedAt()
        );
    }
}
