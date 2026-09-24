package com.saamyukt.SIH26043.web;

import com.saamyukt.SIH26043.service.NearbyLookupService;
import com.saamyukt.SIH26043.web.dto.ProblemResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/problems/nearby")
public class NearbyController {

    private final NearbyLookupService nearbyLookupService;

    public NearbyController(NearbyLookupService nearbyLookupService) {
        this.nearbyLookupService = nearbyLookupService;
    }

    @GetMapping
    public List<ProblemResponse> getNearbyProblems(
            @RequestParam BigDecimal lat,
            @RequestParam BigDecimal lng,
            @RequestParam(defaultValue = "10.0") double radiusKm) {
        return nearbyLookupService.findNearbyProblems(lat, lng, radiusKm).stream()
                .map(ProblemResponse::from)
                .toList();
    }
}
