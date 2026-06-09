package com.example.asset.asset_maintenance.config;

import com.example.asset.asset_maintenance.entity.*;
import com.example.asset.asset_maintenance.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRoleRepository userRoleRepository;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Roles if not present
        if (roleRepository.count() == 0) {
            Role admin = Role.builder().roleName(Role.RoleName.ADMIN).description("System Administrator").build();
            Role manager = Role.builder().roleName(Role.RoleName.MANAGER).description("Factory Maintenance Manager").build();
            Role technician = Role.builder().roleName(Role.RoleName.TECHNICIAN).description("Maintenance Technician").build();
            Role user = Role.builder().roleName(Role.RoleName.USER).description("Machinery Operator / Reporter").build();

            roleRepository.saveAll(List.of(admin, manager, technician, user));
        }

        // Retrieve saved roles
        Role adminRole = roleRepository.findByRoleName(Role.RoleName.ADMIN)
                .orElseThrow(() -> new RuntimeException("ADMIN role not found"));
        Role managerRole = roleRepository.findByRoleName(Role.RoleName.MANAGER)
                .orElseThrow(() -> new RuntimeException("MANAGER role not found"));
        Role technicianRole = roleRepository.findByRoleName(Role.RoleName.TECHNICIAN)
                .orElseThrow(() -> new RuntimeException("TECHNICIAN role not found"));
        Role userRole = roleRepository.findByRoleName(Role.RoleName.USER)
                .orElseThrow(() -> new RuntimeException("USER role not found"));

        // Ensure a manager user exists (outside of any count check)
        User managerUser = userRepository.findByEmail("manager@factory.com")
                .orElseGet(() -> {
                    User newManager = User.builder()
                            .fullName("Marcus Vance")
                            .email("manager@factory.com")
                            .password(passwordEncoder.encode("password123"))
                            .isActive(true)
                            .build();
                    userRepository.save(newManager);
                    userRoleRepository.save(UserRole.builder().user(newManager).role(managerRole).build());
                    return newManager;
                });

        // 2. Seed each user individually (idempotent – skips users that already exist)
        // Admin
        userRepository.findByEmail("admin@factory.com").orElseGet(() -> {
            User adminUser = User.builder()
                    .fullName("Chief Administrator")
                    .email("admin@factory.com")
                    .password(passwordEncoder.encode("password123"))
                    .isActive(true)
                    .build();
            userRepository.save(adminUser);
            userRoleRepository.save(UserRole.builder().user(adminUser).role(adminRole).build());
            return adminUser;
        });

        // Technician 1
        userRepository.findByEmail("tech1@factory.com").orElseGet(() -> {
            User tech1 = User.builder()
                    .fullName("Elena Rostova")
                    .email("tech1@factory.com")
                    .password(passwordEncoder.encode("password123"))
                    .isActive(true)
                    .build();
            userRepository.save(tech1);
            userRoleRepository.save(UserRole.builder().user(tech1).role(technicianRole).build());
            return tech1;
        });

        // Technician 2
        userRepository.findByEmail("tech2@factory.com").orElseGet(() -> {
            User tech2 = User.builder()
                    .fullName("Julian Hales")
                    .email("tech2@factory.com")
                    .password(passwordEncoder.encode("password123"))
                    .isActive(true)
                    .build();
            userRepository.save(tech2);
            userRoleRepository.save(UserRole.builder().user(tech2).role(technicianRole).build());
            return tech2;
        });

        // Operator 1
        userRepository.findByEmail("user1@factory.com").orElseGet(() -> {
            User op1 = User.builder()
                    .fullName("Frank Miller")
                    .email("user1@factory.com")
                    .password(passwordEncoder.encode("password123"))
                    .isActive(true)
                    .build();
            userRepository.save(op1);
            userRoleRepository.save(UserRole.builder().user(op1).role(userRole).build());
            return op1;
        });

        // Operator 2
        userRepository.findByEmail("user2@factory.com").orElseGet(() -> {
            User op2 = User.builder()
                    .fullName("Sarah Connor")
                    .email("user2@factory.com")
                    .password(passwordEncoder.encode("password123"))
                    .isActive(true)
                    .build();
            userRepository.save(op2);
            userRoleRepository.save(UserRole.builder().user(op2).role(userRole).build());
            return op2;
        });


        // 3. Seed Assets if empty
        if (assetRepository.count() == 0) {
            Asset cnc = Asset.builder()
                    .assetCode("CNC-301")
                    .assetName("CNC Milling Machine")
                    .category("Milling")
                    .location("Section A - Machining Center")
                    .manufacturer("Siemens")
                    .installationDate(LocalDate.of(2024, 1, 15))
                    .status("OPERATIONAL")
                    .description("High-precision 5-axis CNC vertical milling machine.")
                    .manager(managerUser)
                    .build();

            Asset press = Asset.builder()
                    .assetCode("HYD-102")
                    .assetName("Hydraulic Press 500T")
                    .category("Pressing")
                    .location("Section B - Metal Stamping")
                    .manufacturer("Bosch Rexroth")
                    .installationDate(LocalDate.of(2023, 11, 20))
                    .status("OPERATIONAL")
                    .description("Heavy-duty hydraulic metal stamping and pressing machine.")
                    .manager(managerUser)
                    .build();

            Asset conveyor = Asset.builder()
                    .assetCode("CONV-503")
                    .assetName("Main Assembly Conveyor")
                    .category("Logistics")
                    .location("Section C - Assembly Line")
                    .manufacturer("Dematic")
                    .installationDate(LocalDate.of(2025, 2, 10))
                    .status("OPERATIONAL")
                    .description("Variable speed automated belt conveyor for main line assembly.")
                    .manager(managerUser)
                    .build();

            Asset robot = Asset.builder()
                    .assetCode("ROB-204")
                    .assetName("Robotic Welder Arm")
                    .category("Robotics")
                    .location("Section A - Machining Center")
                    .manufacturer("KUKA")
                    .installationDate(LocalDate.of(2024, 8, 5))
                    .status("DEGRADED")
                    .description("Articulated welding robotic arm with automatic tool changer.")
                    .manager(managerUser)
                    .build();

            assetRepository.saveAll(List.of(cnc, press, conveyor, robot));
        }
    }
}
