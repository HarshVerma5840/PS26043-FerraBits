package com.saamyukt.SIH26043.capabilitymatching.service.retrieval;

import com.saamyukt.SIH26043.capabilitymatching.dto.retrieval.RetrievalDTOs.CapabilityCandidate;
import com.saamyukt.SIH26043.capabilitymatching.dto.retrieval.RetrievalDTOs.SparseRetrievalRequest;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PostgresSparseCapabilityRetriever implements SparseCapabilityRetriever {

    private final EntityManager entityManager;

    public PostgresSparseCapabilityRetriever(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CapabilityCandidate> retrieve(SparseRetrievalRequest request) {
        
        String tsQueryStr = buildTsQueryString(request);
        
        if (tsQueryStr == null || tsQueryStr.trim().isEmpty()) {
            return new ArrayList<>();
        }

        String nativeSql = """
            WITH inst_docs AS (
                SELECT inst.institution_id, inst.name,
                    to_tsvector('english',
                        COALESCE(inst.name, '') || ' ' || 
                        COALESCE(inst.district, '') || ' ' ||
                        COALESCE((SELECT string_agg(eq.name, ' ') FROM equipment eq JOIN lab l ON eq.lab_id = l.lab_id JOIN department d ON l.department_id = d.department_id WHERE d.institution_id = inst.institution_id), '') || ' ' ||
                        COALESCE((SELECT string_agg(s.name, ' ') FROM skill s JOIN faculty_skill fs ON s.skill_id = fs.skill_id JOIN faculty f ON fs.faculty_id = f.faculty_id JOIN department d ON f.department_id = d.department_id WHERE d.institution_id = inst.institution_id), '') || ' ' ||
                        COALESCE((SELECT string_agg(s.name, ' ') FROM skill s JOIN student_skill ss ON s.skill_id = ss.skill_id JOIN student st ON ss.student_id = st.student_id JOIN department d ON st.department_id = d.department_id WHERE d.institution_id = inst.institution_id), '')
                    ) as document,
                    COALESCE((SELECT string_agg(eq.name, '||') FROM equipment eq JOIN lab l ON eq.lab_id = l.lab_id JOIN department d ON l.department_id = d.department_id WHERE d.institution_id = inst.institution_id), '') as eq_names
                FROM institution inst
                WHERE inst.active_status = true 
                  AND inst.verification_status = 'VERIFIED'
                  AND (CAST(:versionId AS int) IS NULL OR inst.registry_version_id = CAST(:versionId AS int))
            )
            SELECT institution_id, name, 
                   ts_rank(document, to_tsquery('english', :tsquery)) as score,
                   eq_names
            FROM inst_docs
            WHERE document @@ to_tsquery('english', :tsquery)
            ORDER BY score DESC, institution_id ASC
            LIMIT :topK
        """;

        Query query = entityManager.createNativeQuery(nativeSql);
        query.setParameter("versionId", request.getRegistryVersionId());
        query.setParameter("tsquery", tsQueryStr);
        query.setParameter("topK", request.getTopK() != null ? request.getTopK() : 50);

        List<Object[]> results = query.getResultList();
        List<CapabilityCandidate> candidates = new ArrayList<>();

        for (Object[] row : results) {
            UUID id = (UUID) row[0];
            String name = (String) row[1];
            double score = ((Number) row[2]).doubleValue();
            String eqNames = (String) row[3];

            boolean exactEquipmentMiss = false;
            if (request.getRequiredEquipment() != null && !request.getRequiredEquipment().isEmpty()) {
                String normalizedEqNames = eqNames.toLowerCase();
                for (String reqEq : request.getRequiredEquipment()) {
                    if (!normalizedEqNames.contains(reqEq.toLowerCase())) {
                        exactEquipmentMiss = true;
                        break;
                    }
                }
            }

            // We mock matchTerms since ts_stat or exact matched tokens requires heavy pg-side manipulation
            List<String> matchTerms = Arrays.asList(tsQueryStr.split("\\|"));

            candidates.add(CapabilityCandidate.builder()
                    .institutionId(id)
                    .name(name)
                    .score(score)
                    .matchTerms(matchTerms)
                    .exactEquipmentMiss(exactEquipmentMiss)
                    .build());
        }

        return candidates;
    }

    private String buildTsQueryString(SparseRetrievalRequest request) {
        List<String> terms = new ArrayList<>();

        if (request.getDomainTerms() != null && !request.getDomainTerms().isBlank()) {
            terms.add(formatTsQueryTerm(request.getDomainTerms()));
        }
        
        if (request.getDistrict() != null && !request.getDistrict().isBlank()) {
            terms.add(formatTsQueryTerm(request.getDistrict()));
        }

        if (request.getRequiredSkills() != null) {
            for (String skill : request.getRequiredSkills()) {
                terms.add(formatTsQueryTerm(skill));
            }
        }

        if (request.getRequiredEquipment() != null) {
            for (String eq : request.getRequiredEquipment()) {
                // Ensure exact equipment phrases are anchored using <->
                terms.add(formatTsQueryPhrase(eq));
            }
        }

        if (terms.isEmpty()) return "";

        // OR all terms to maximize recall in the sparse stage, RRF will sort it out.
        // Or we can AND them. The prompt requires us to "preserve exact equipment anchors".
        // Using OR with phrase queries helps recall, and RRF + exactEquipmentMiss handles precision.
        return String.join(" | ", terms);
    }

    private String formatTsQueryTerm(String input) {
        String cleaned = input.trim().replaceAll("[^a-zA-Z0-9 ]", "").replaceAll("\\s+", " & ");
        return "(" + cleaned + ")";
    }

    private String formatTsQueryPhrase(String input) {
        String cleaned = input.trim().replaceAll("[^a-zA-Z0-9 ]", "").replaceAll("\\s+", " <-> ");
        return "(" + cleaned + ")";
    }
}
