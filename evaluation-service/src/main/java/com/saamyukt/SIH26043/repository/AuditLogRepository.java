package com.saamyukt.SIH26043.repository;

import com.saamyukt.SIH26043.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
}
