package com.saamyukt.SIH26043.repository;

import com.saamyukt.SIH26043.entity.Problem;
import com.saamyukt.SIH26043.enums.ProblemStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProblemRepository extends JpaRepository<Problem, UUID> {

    List<Problem> findBySubmittedByUserId(UUID userId);

    Page<Problem> findBySubmittedByUserId(UUID userId, Pageable pageable);

    Page<Problem> findBySubmittedByUserIdAndStatus(UUID userId, ProblemStatus status, Pageable pageable);

    long countByStatus(ProblemStatus status);

    long countBySourceId(UUID sourceId);

    List<Problem> findByLocationIdIn(List<UUID> locationIds);

    boolean existsBySubmittedByUserIdAndIdempotencyKey(UUID userId, String idempotencyKey);

    @org.springframework.data.jpa.repository.Query(value = """
            SELECT p.* FROM problem p
            JOIN location l ON p.location_id = l.location_id
            WHERE p.status NOT IN ('DRAFT', 'REJECTED', 'ARCHIVED')
              AND (
                  CAST(:query AS text) IS NULL 
                  OR p.title ILIKE '%' || CAST(:query AS text) || '%' 
                  OR p.description ILIKE '%' || CAST(:query AS text) || '%'
              )
              AND (6371 * acos(cos(radians(CAST(:latitude AS double precision))) 
                    * cos(radians(l.latitude)) 
                    * cos(radians(l.longitude) - radians(CAST(:longitude AS double precision))) 
                    + sin(radians(CAST(:latitude AS double precision))) 
                    * sin(radians(l.latitude)))) <= CAST(:radiusKm AS double precision)
            ORDER BY (6371 * acos(cos(radians(CAST(:latitude AS double precision))) 
                    * cos(radians(l.latitude)) 
                    * cos(radians(l.longitude) - radians(CAST(:longitude AS double precision))) 
                    + sin(radians(CAST(:latitude AS double precision))) 
                    * sin(radians(l.latitude)))) ASC
            """, nativeQuery = true)
    Page<Problem> findNearbyProblems(
            @org.springframework.data.repository.query.Param("latitude") double latitude,
            @org.springframework.data.repository.query.Param("longitude") double longitude,
            @org.springframework.data.repository.query.Param("radiusKm") double radiusKm,
            @org.springframework.data.repository.query.Param("query") String query,
            Pageable pageable);
}
