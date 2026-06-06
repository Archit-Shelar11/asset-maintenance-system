package com.example.asset.asset_maintenance.repository;

import com.example.asset.asset_maintenance.entity.UserRole;
import com.example.asset.asset_maintenance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRoleRepository extends JpaRepository<UserRole, Long> {

    // it will fetch all the user
    List<UserRole> findByUser(User user);
}