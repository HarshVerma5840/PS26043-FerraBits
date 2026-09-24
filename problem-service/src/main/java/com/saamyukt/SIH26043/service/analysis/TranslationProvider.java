package com.saamyukt.SIH26043.service.analysis;

public interface TranslationProvider {
    /**
     * The unique name of this provider (e.g., "BHASHINI_TRANSLATE", "MOCK_TRANSLATE")
     */
    String providerName();

    /**
     * Translates text. Throws ProviderException for transient/terminal errors.
     */
    TranslationResult translate(TranslationRequest request);
}
