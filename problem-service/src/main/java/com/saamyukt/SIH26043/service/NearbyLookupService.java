package com.saamyukt.SIH26043.service;

import com.saamyukt.SIH26043.entity.Problem;
import com.saamyukt.SIH26043.repository.LocationRepository;
import com.saamyukt.SIH26043.repository.ProblemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class NearbyLookupService {

    private final LocationRepository locationRepository;
    private final ProblemRepository problemRepository;

    public NearbyLookupService(LocationRepository locationRepository, ProblemRepository problemRepository) {
        this.locationRepository = locationRepository;
        this.problemRepository = problemRepository;
    }

    @Transactional(readOnly = true)
    public List<Problem> findNearbyProblems(BigDecimal lat, BigDecimal lng, double radiusKm) {
        List<UUID> locationIds = locationRepository.findNearbyLocationIds(lat, lng, radiusKm);
        if (locationIds.isEmpty()) {
            return List.of();
        }
        return problemRepository.findByLocationIdIn(locationIds);
    }
}
