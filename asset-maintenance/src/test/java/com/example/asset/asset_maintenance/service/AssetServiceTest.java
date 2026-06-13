package com.example.asset.asset_maintenance.service;

import com.example.asset.asset_maintenance.entity.Asset;
import com.example.asset.asset_maintenance.entity.User;
import com.example.asset.asset_maintenance.repository.AssetRepository;
import com.example.asset.asset_maintenance.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.security.Principal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AssetServiceTest {

    @Mock
    private AssetRepository assetRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AssetService assetService;

    private User manager;
    private Asset asset;
    private Principal principal;

    @BeforeEach
    void setUp() {
        manager = User.builder()
                .id(1L)
                .email("manager@example.com")
                .fullName("Manager User")
                .build();

        asset = Asset.builder()
                .id(1L)
                .assetName("CNC Milling Machine")
                .location("Floor A")
                .status("ACTIVE")
                .build();

        principal = mock(Principal.class);
    }

    @Test
    void testCreateAssetSuccess() {
        when(principal.getName()).thenReturn("manager@example.com");
        when(userRepository.findByEmail("manager@example.com")).thenReturn(Optional.of(manager));
        when(assetRepository.save(any(Asset.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Asset created = assetService.createAsset(asset, principal);

        assertNotNull(created);
        assertNotNull(created.getAssetCode());
        assertTrue(created.getAssetCode().startsWith("ASSET-"));
        assertEquals(manager, created.getManager());
        
        verify(userRepository, times(1)).findByEmail("manager@example.com");
        verify(assetRepository, times(1)).save(asset);
    }

    @Test
    void testCreateAssetManagerNotFound() {
        when(principal.getName()).thenReturn("unknown@example.com");
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
                assetService.createAsset(asset, principal)
        );

        assertEquals("Manager user not found", exception.getMessage());
        verify(assetRepository, never()).save(any(Asset.class));
    }

    @Test
    void testGetAllAssets() {
        List<Asset> assets = Arrays.asList(asset, new Asset());
        when(assetRepository.findAll()).thenReturn(assets);

        List<Asset> result = assetService.getAllAssets();

        assertEquals(2, result.size());
        verify(assetRepository, times(1)).findAll();
    }

    @Test
    void testGetAssetByIdSuccess() {
        when(assetRepository.findById(1L)).thenReturn(Optional.of(asset));

        Asset result = assetService.getAssetById(1L);

        assertNotNull(result);
        assertEquals("CNC Milling Machine", result.getAssetName());
        verify(assetRepository, times(1)).findById(1L);
    }

    @Test
    void testGetAssetByIdNotFound() {
        when(assetRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
                assetService.getAssetById(99L)
        );

        assertEquals("Asset not found", exception.getMessage());
        verify(assetRepository, times(1)).findById(99L);
    }
}
