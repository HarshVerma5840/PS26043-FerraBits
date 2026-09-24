package com.saamyukt.SIH26043.service.analysis;

public interface ProblemFingerprintProvider {
    /**
     * The unique name of this provider (e.g., "OPENAI_COMPATIBLE_FINGERPRINT", "MOCK_FINGERPRINT")
     */
    String providerName();

    /**
     * Extracts structured problem fingerprint from problem text contexts.
     * Throws ProviderException for transient/terminal errors.
     */
    FingerprintExtractionResult extract(FingerprintExtractionRequest request);
}
