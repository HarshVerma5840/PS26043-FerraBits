package com.saamyukt.SIH26043.repository;

import com.saamyukt.SIH26043.entity.NotificationEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

public interface NotificationEventRepository extends JpaRepository<NotificationEvent, UUID> {

    Page<NotificationEvent> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    boolean existsByUserIdAndDeduplicationKey(UUID userId, String deduplicationKey);

    long countByUserIdAndReadFalse(UUID userId);

    @Modifying
    @Query("UPDATE NotificationEvent n SET n.read = true WHERE n.eventId = :eventId AND n.userId = :userId")
    int markAsRead(UUID eventId, UUID userId);

    @Modifying
    @Query("UPDATE NotificationEvent n SET n.read = true WHERE n.userId = :userId AND n.read = false")
    int markAllAsRead(UUID userId);
}
