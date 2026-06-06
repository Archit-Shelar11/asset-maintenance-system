package com.example.asset.asset_maintenance.repository;

import com.example.asset.asset_maintenance.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository  extends JpaRepository<Role,Long> {
    Optional<Role> findByRoleName(Role.RoleName roleName);
}
