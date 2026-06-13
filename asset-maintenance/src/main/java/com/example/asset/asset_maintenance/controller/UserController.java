package com.example.asset.asset_maintenance.controller;

import com.example.asset.asset_maintenance.dto.RegisterRequest;
import com.example.asset.asset_maintenance.dto.UserDTO;
import com.example.asset.asset_maintenance.entity.Role;
import com.example.asset.asset_maintenance.entity.User;
import com.example.asset.asset_maintenance.entity.UserRole;
import com.example.asset.asset_maintenance.repository.RoleRepository;
import com.example.asset.asset_maintenance.repository.UserRepository;
import com.example.asset.asset_maintenance.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public List<UserDTO> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream().map(this::mapToDTO).toList();
    }

    @PostMapping("/register")
    public UserDTO registerUser(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("User with this email already exists");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);

        // Fetch USER role (default)
        Role userRole = roleRepository.findByRoleName(Role.RoleName.USER)
                .orElseThrow(() -> new RuntimeException("Default USER role not found in database"));

        UserRole mapping = UserRole.builder()
                .user(savedUser)
                .role(userRole)
                .build();
        userRoleRepository.save(mapping);

        return UserDTO.builder()
                .id(savedUser.getId())
                .fullName(savedUser.getFullName())
                .email(savedUser.getEmail())
                .role("USER")
                .build();
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public UserDTO getProfile(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToDTO(user);
    }

    @PutMapping("/{userId}/role/{roleName}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public UserDTO changeUserRole(@PathVariable Long userId, @PathVariable String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Role.RoleName parsedRoleName;
        try {
            parsedRoleName = Role.RoleName.valueOf(roleName.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role name: " + roleName);
        }

        Role newRole = roleRepository.findByRoleName(parsedRoleName)
                .orElseThrow(() -> new RuntimeException("Role not found in database: " + parsedRoleName));

        // Delete existing roles for this user
        if (user.getUserRoles() != null) {
            userRoleRepository.deleteAll(user.getUserRoles());
            user.getUserRoles().clear();
        }

        // Assign new role
        UserRole newMapping = UserRole.builder()
                .user(user)
                .role(newRole)
                .build();
        userRoleRepository.save(newMapping);
        user.getUserRoles().add(newMapping);

        userRepository.saveAndFlush(user);

        return mapToDTO(user);
    }


    private UserDTO mapToDTO(User u) {
        String roleName = "USER";
        if (u.getUserRoles() != null && !u.getUserRoles().isEmpty()) {
            roleName = u.getUserRoles().get(0).getRole().getRoleName().name();
        }
        return UserDTO.builder()
                .id(u.getId())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .role(roleName)
                .build();
    }
}
