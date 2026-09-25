package com.saamyukt.SIH26043.capabilitymatching.repository;

import com.saamyukt.SIH26043.capabilitymatching.entity.RegistryVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RegistryVersionRepository extends JpaRepository<RegistryVersion, Integer> {
    Optional<RegistryVersion> findByIsActiveTrue();
}

