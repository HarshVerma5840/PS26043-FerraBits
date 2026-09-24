package com.saamyukt.SIH26043.repository;

import com.saamyukt.SIH26043.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LocationRepository extends JpaRepository<Location, UUID> {

    Optional<Location> findByLgdCode(String lgdCode);

    List<Location> findByStateAndDistrictAndBlockTehsil(String state, String district, String blockTehsil);

    /**
     * Haversine-based radius search (no PostGIS dependency).
     * Returns location IDs within {@code radiusKm} of the given point.
     */
    @Query(value = """
            SELECT l.location_id FROM location l
            WHERE (6371 * acos(
                cos(radians(:lat)) * cos(radians(l.latitude))
                * cos(radians(l.longitude) - radians(:lng))
                + sin(radians(:lat)) * sin(radians(l.latitude))
            )) <= :radiusKm
            ORDER BY (6371 * acos(
                cos(radians(:lat)) * cos(radians(l.latitude))
                * cos(radians(l.longitude) - radians(:lng))
                + sin(radians(:lat)) * sin(radians(l.latitude))
            )) ASC
            LIMIT 50
            """, nativeQuery = true)
    List<UUID> findNearbyLocationIds(@Param("lat") BigDecimal lat,
                                     @Param("lng") BigDecimal lng,
                                     @Param("radiusKm") double radiusKm);
}
