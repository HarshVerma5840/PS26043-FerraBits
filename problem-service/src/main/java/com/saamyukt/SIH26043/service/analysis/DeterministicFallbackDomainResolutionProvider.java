package com.saamyukt.SIH26043.service.analysis;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Deterministic, keyword-based domain resolver that requires no external AI service.
 *
 * <p>This is the guaranteed fallback: it always returns a result, never throws,
 * and never makes a network call. Classification quality is lower than AI providers
 * but its availability is unconditional.
 *
 * <p>Strategy: for each taxonomy option in the request, count how many domain-specific
 * keywords appear in the combined title + description. The options with the highest
 * keyword-hit count are selected (max 3). If no keywords match at all, returns the
 * first option in the taxonomy list as a last-resort fallback.
 *
 * <p>Selected as primary provider when {@code app.ai.domain-resolver.provider=deterministic}
 * (which is the default when no provider is configured), AND also used as a safety net
 * by the {@link DomainResolutionOrchestrationService} when a primary AI provider fails.
 */
@Service
@ConditionalOnProperty(
        name = "app.ai.domain-resolver.provider",
        havingValue = "deterministic",
        matchIfMissing = true
)
public class DeterministicFallbackDomainResolutionProvider implements DomainResolutionProvider {

    private static final Logger log =
            LoggerFactory.getLogger(DeterministicFallbackDomainResolutionProvider.class);

    /**
     * Keyword map: each taxonomy domain name (lowercased, simplified) → keywords to scan for.
     * Keywords are applied case-insensitively. This list is deliberately conservative
     * (no false-positive risk from overly broad terms).
     */
    private static final Map<String, List<String>> DOMAIN_KEYWORDS = Map.ofEntries(
            Map.entry("healthcare", List.of(
                    "hospital", "clinic", "doctor", "health", "medicine", "medical", "patient",
                    "disease", "illness", "treatment", "nurse", "ambulance", "pharmacy",
                    "vaccine", "mental", "counseling", "nutrition", "anemia", "malaria",
                    "tuberculosis", "tb", "diabetes", "blood", "surgery", "icu", "arogya",
                    "swasthya", "bimari", "ilaj", "dawai", "dawakhana")),
            Map.entry("agriculture & food", List.of(
                    "farm", "crop", "farmer", "agriculture", "irrigation", "soil", "seed",
                    "fertilizer", "pesticide", "harvest", "mandi", "grain", "rice", "wheat",
                    "pulses", "vegetable", "fruit", "kisan", "fasal", "kheti", "khet",
                    "beej", "urvarak", "pani ki kami", "sookha", "drought", "flood damage",
                    "animal husbandry", "livestock", "goat", "buffalo", "cow", "milk",
                    "storage", "cold chain", "food security", "ration", "msme agri")),
            Map.entry("water & sanitation", List.of(
                    "water", "drinking water", "tap", "hand pump", "borewell", "pipe",
                    "sanitation", "toilet", "latrine", "open defecation", "waste", "sewage",
                    "drain", "gutter", "flood", "waterlogging", "contamination", "pollution",
                    "pani", "nal", "kuan", "shauchalay", "naali", "safai", "garbage",
                    "solid waste", "municipal waste", "leakage", "overflow")),
            Map.entry("education & skills", List.of(
                    "school", "student", "teacher", "education", "literacy", "dropout",
                    "classroom", "textbook", "mid-day meal", "scholarship", "college",
                    "vocational", "skill", "training", "coaching", "exam", "board",
                    "vidyalaya", "paathshala", "shiksha", "shikshak", "siksha",
                    "baccha", "pathshala", "anganwadi", "primary school")),
            Map.entry("transportation & mobility", List.of(
                    "road", "highway", "bridge", "pothole", "transport", "bus", "train",
                    "connectivity", "footpath", "street light", "traffic", "accident",
                    "railway", "public transit", "last mile", "sadak", "rasta", "puliya",
                    "chauraha", "ghadda", "kharab sadak", "no road", "broken road")),
            Map.entry("public safety & justice", List.of(
                    "crime", "theft", "violence", "safety", "police", "security", "harassment",
                    "women safety", "child abuse", "disaster", "flood relief", "fire",
                    "earthquake", "cyclone", "rescue", "legal", "court", "justice",
                    "FIR", "complaint", "suraksha", "apradh", "police thana",
                    "atrocity", "dacoity", "murder", "robbery")),
            Map.entry("environment & climate", List.of(
                    "pollution", "air quality", "smog", "climate", "environment", "deforestation",
                    "forest", "wildlife", "biodiversity", "plastic", "toxic", "waste dump",
                    "mining", "encroachment", "river", "lake", "pond", "wetland",
                    "prdushan", "vayu", "jal pradushan", "forest fire", "greenhouse")),
            Map.entry("energy & utilities", List.of(
                    "electricity", "power", "light", "voltage", "blackout", "transformer",
                    "solar", "renewable", "grid", "load shedding", "power cut",
                    "bijli", "bijali", "meter", "connection", "street light", "generator",
                    "line loss", "electrification", "gas supply", "lpg", "cooking gas")),
            Map.entry("digital & e-governance", List.of(
                    "digital", "internet", "wifi", "broadband", "connectivity", "e-governance",
                    "portal", "app", "online", "certificate", "ration card", "aadhar",
                    "birth certificate", "document", "government service", "grievance",
                    "cyber", "network", "computer", "it", "data", "api", "interoperability")),
            Map.entry("rural & urban development", List.of(
                    "village", "panchayat", "gram sabha", "municipality", "housing",
                    "urban", "rural", "slum", "colony", "planning", "construction",
                    "building", "street", "park", "land", "encroachment",
                    "gaon", "gram", "nagar", "mohalla", "basti", "makan", "ghar")),
            Map.entry("employment & livelihoods", List.of(
                    "job", "employment", "unemployment", "work", "labour", "wages",
                    "livelihood", "income", "msme", "business", "enterprise", "startup",
                    "nrega", "mgnrega", "rozgar", "kaam", "majduri", "swarojgar",
                    "entrepreneur", "loan", "credit", "mudra", "self help group", "shg")),
            Map.entry("tourism & culture", List.of(
                    "tourism", "tourist", "heritage", "monument", "temple", "culture",
                    "festival", "art", "craft", "museum", "pilgrimage", "tirth",
                    "paryatan", "mandir", "masjid", "church", "fair", "mela",
                    "promotion", "amenity", "accommodation", "hotel"))
    );

    @Override
    public String providerName() {
        return "DETERMINISTIC";
    }

    @Override
    public DomainResolutionResult resolve(DomainResolutionRequest request) {
        log.debug("Deterministic fallback resolver running for correlationId={}",
                request.correlationId());

        if (request.taxonomyOptions() == null || request.taxonomyOptions().isEmpty()) {
            log.warn("No taxonomy options supplied to deterministic resolver; returning empty");
            return DomainResolutionResult.fallback(List.of(), "NO_TAXONOMY_OPTIONS");
        }

        String haystack = ((request.title() == null ? "" : request.title()) + " " +
                (request.description() == null ? "" : request.description()))
                .toLowerCase(Locale.ROOT);

        // Score each option by keyword hits
        List<ScoredOption> scored = new ArrayList<>();
        for (DomainResolutionRequest.DomainOption option : request.taxonomyOptions()) {
            int hits = countKeywordHits(option.domainName(), haystack);
            if (hits > 0) {
                scored.add(new ScoredOption(option.domainId().toString(), hits));
            }
        }

        if (scored.isEmpty()) {
            // No keywords matched at all — return the first option as a last-resort signal
            // but flag it with zero confidence so the caller can route it to human review.
            String firstId = request.taxonomyOptions().get(0).domainId().toString();
            log.warn("Deterministic resolver: no keyword match for correlationId={}; "
                    + "returning first taxonomy option ({}) as last resort",
                    request.correlationId(), firstId);
            return DomainResolutionResult.fallback(List.of(firstId), "NO_KEYWORD_MATCH");
        }

        // Sort by score descending, take up to 3
        scored.sort((a, b) -> Integer.compare(b.score(), a.score()));
        List<String> selected = scored.stream()
                .limit(3)
                .map(ScoredOption::domainId)
                .toList();

        log.info("Deterministic resolver: correlationId={} matched domain ids {} with scores",
                request.correlationId(), selected);

        return DomainResolutionResult.fallback(selected, null);
    }

    private int countKeywordHits(String domainName, String haystack) {
        String key = domainName.toLowerCase(Locale.ROOT);
        List<String> keywords = DOMAIN_KEYWORDS.get(key);
        if (keywords == null) {
            // No keyword list defined; fall back to a simple name-match check
            return haystack.contains(key) ? 1 : 0;
        }
        int count = 0;
        for (String kw : keywords) {
            if (haystack.contains(kw)) {
                count++;
            }
        }
        return count;
    }

    private record ScoredOption(String domainId, int score) {}
}
