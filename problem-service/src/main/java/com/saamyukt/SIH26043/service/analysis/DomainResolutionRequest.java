package com.saamyukt.SIH26043.service.analysis;

import java.util.List;
import java.util.UUID;

/**
 * Input to a {@link DomainResolutionProvider}.
 *
 * <p>Only the minimum fields needed for classification are carried here.
 * No phone numbers, no personal addresses, no full PII — only the text
 * context and the canonical taxonomy options the model is allowed to pick from.
 */
public record DomainResolutionRequest(
        /** Identifies this classification attempt for correlation logging. */
        String correlationId,

        /** The problem's short title. Never null; may be blank if the submitter omitted it. */
        String title,

        /** The problem's description text (citizen-supplied, possibly in Hindi / Hinglish). */
        String description,

        /**
         * The human-readable names the submitter suggested for their own domains.
         * Non-binding context only — the provider is free to disagree.
         * May be empty, never null.
         */
        List<String> submitterHintNames,

        /**
         * The canonical taxonomy options the model is allowed to classify into.
         * The provider MUST NOT return a domain not present in this list.
         * Each option carries a stable UUID, a name, and an optional description.
         */
        List<DomainOption> taxonomyOptions
) {
    /**
     * One row of the allowed taxonomy presented to the model.
     *
     * @param domainId    stable, deterministic UUID matching {@code domain.domain_id} in the DB
     * @param domainName  human-readable name (e.g. "Healthcare")
     * @param description short description of what problems fall under this domain
     */
    public record DomainOption(UUID domainId, String domainName, String description) {}
}
