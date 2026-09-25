package com.saamyukt.SIH26043.capabilitymatching.service.retrieval;

import com.saamyukt.SIH26043.capabilitymatching.dto.retrieval.RetrievalDTOs.CapabilityCandidate;
import com.saamyukt.SIH26043.capabilitymatching.dto.retrieval.RetrievalDTOs.RrfResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ReciprocalRankFusionService {

    @Value("${rrf.constant.k:60}")
    private int constantK;

    public List<RrfResult> fuse(List<CapabilityCandidate> denseCandidates, 
                                List<CapabilityCandidate> sparseCandidates, 
                                int topK) {
        
        Map<UUID, RrfResultBuilder> map = new HashMap<>();

        // Process Dense
        for (int i = 0; i < denseCandidates.size(); i++) {
            CapabilityCandidate dc = denseCandidates.get(i);
            RrfResultBuilder builder = map.computeIfAbsent(dc.getInstitutionId(), id -> new RrfResultBuilder(id, dc.getName()));
            builder.denseRank = i + 1;
            builder.denseScore = dc.getScore();
            // Dense doesn't compute exact equipment miss easily, rely on sparse if present
            builder.exactEquipmentMiss = dc.isExactEquipmentMiss();
        }

        // Process Sparse
        for (int i = 0; i < sparseCandidates.size(); i++) {
            CapabilityCandidate sc = sparseCandidates.get(i);
            RrfResultBuilder builder = map.computeIfAbsent(sc.getInstitutionId(), id -> new RrfResultBuilder(id, sc.getName()));
            builder.sparseRank = i + 1;
            builder.sparseScore = sc.getScore();
            builder.exactEquipmentMiss = sc.isExactEquipmentMiss();
        }

        List<RrfResult> results = new ArrayList<>();
        for (RrfResultBuilder b : map.values()) {
            double rrfScore = 0.0;
            if (b.denseRank != null) {
                rrfScore += 1.0 / (constantK + b.denseRank);
            }
            if (b.sparseRank != null) {
                rrfScore += 1.0 / (constantK + b.sparseRank);
            }
            
            results.add(RrfResult.builder()
                    .institutionId(b.institutionId)
                    .name(b.name)
                    .rrfScore(rrfScore)
                    .denseRank(b.denseRank)
                    .denseScore(b.denseScore)
                    .sparseRank(b.sparseRank)
                    .sparseScore(b.sparseScore)
                    .exactEquipmentMiss(b.exactEquipmentMiss)
                    .build());
        }

        // Stable tie-breaking: RRF Score DESC, exact equipment miss (false first), then Institution ID ASC
        results.sort((a, b) -> {
            int cmp = Double.compare(b.getRrfScore(), a.getRrfScore());
            if (cmp != 0) return cmp;
            
            int missCmp = Boolean.compare(a.isExactEquipmentMiss(), b.isExactEquipmentMiss());
            if (missCmp != 0) return missCmp;
            
            return a.getInstitutionId().compareTo(b.getInstitutionId());
        });

        if (results.size() > topK) {
            return results.subList(0, topK);
        }
        return results;
    }

    private static class RrfResultBuilder {
        UUID institutionId;
        String name;
        Integer denseRank;
        Double denseScore;
        Integer sparseRank;
        Double sparseScore;
        boolean exactEquipmentMiss = false;

        RrfResultBuilder(UUID id, String name) {
            this.institutionId = id;
            this.name = name;
        }
    }
}
