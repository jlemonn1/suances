package com.suances.personnel.service;

import com.suances.personnel.domain.model.Usuario;
import com.suances.personnel.dto.request.ChangeRoleRequest;
import com.suances.personnel.dto.request.CreatePersonnelRequest;
import com.suances.personnel.dto.request.UpdatePersonnelRequest;
import com.suances.personnel.dto.response.PersonnelResponse;
import com.suances.personnel.dto.response.RoleChangeResponse;
import com.suances.personnel.exception.BusinessRuleException;
import com.suances.personnel.exception.ResourceNotFoundException;
import com.suances.personnel.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PersonnelService {

    private static final Logger log = LoggerFactory.getLogger(PersonnelService.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public PersonnelService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public PersonnelResponse crear(CreatePersonnelRequest request) {
        if (usuarioRepository.existsByUsername(request.getUsername())) {
            throw new BusinessRuleException("El username '" + request.getUsername() + "' ya existe");
        }

        Usuario usuario = new Usuario();
        usuario.setUsername(request.getUsername());
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        usuario.setFullName(request.getFullName());
        usuario.setRole(request.getRole());
        usuario.setImageUrl(request.getImageUrl());

        usuario = usuarioRepository.save(usuario);
        log.info("Usuario creado: {} con rol {}", usuario.getUsername(), usuario.getRole());

        return toResponse(usuario);
    }

    public List<PersonnelResponse> listar() {
        return usuarioRepository.findByActivoTrue().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public PersonnelResponse obtener(UUID id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + id));
        return toResponse(usuario);
    }

    public PersonnelResponse actualizar(UUID id, UpdatePersonnelRequest request) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + id));

        if (request.getFullName() != null) {
            usuario.setFullName(request.getFullName());
        }
        if (request.getPassword() != null) {
            usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getImageUrl() != null) {
            usuario.setImageUrl(request.getImageUrl());
        }

        usuario = usuarioRepository.save(usuario);
        log.info("Usuario actualizado: {}", usuario.getUsername());

        return toResponse(usuario);
    }

    public RoleChangeResponse cambiarRol(UUID id, ChangeRoleRequest request) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + id));

        usuario.setRole(request.getRole());
        usuario = usuarioRepository.save(usuario);
        log.info("Rol cambiado para {}: {}", usuario.getUsername(), usuario.getRole());

        return new RoleChangeResponse(usuario.getId(), usuario.getUsername(), usuario.getRole());
    }

    public void desactivar(UUID id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + id));

        usuario.setActivo(false);
        usuarioRepository.save(usuario);
        log.info("Usuario desactivado: {}", usuario.getUsername());
    }

    private PersonnelResponse toResponse(Usuario usuario) {
        return new PersonnelResponse(
                usuario.getId(),
                usuario.getUsername(),
                usuario.getFullName(),
                usuario.getRole(),
                usuario.getImageUrl(),
                usuario.getActivo(),
                usuario.getCreatedAt());
    }
}
