package com.saamyukt.SIH26043.service.analysis;

public interface SpeechToTextProvider {
    /**
     * The unique name of this provider (e.g. "BHASHINI", "MOCK")
     */
    String providerName();

    /**
     * Transcribes audio synchronously. 
     * Throws an unchecked exception (e.g., ProviderException) on failure.
     */
    TranscriptionResult transcribe(TranscriptionRequest request);
}
