package com.saamyukt.SIH26043.repository;

import com.saamyukt.SIH26043.entity.Domain;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface DomainRepository extends JpaRepository<Domain, UUID> {

    Optional<Domain> findByDomainName(String domainName);

    java.util.List<Domain> findByParentDomainIsNull();

    java.util.List<Domain> findByParentDomainDomainId(UUID parentId);
}