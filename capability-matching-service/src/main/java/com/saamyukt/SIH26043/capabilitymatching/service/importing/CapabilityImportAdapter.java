package com.saamyukt.SIH26043.capabilitymatching.service.importing;

import com.saamyukt.SIH26043.capabilitymatching.dto.importing.ImportDTOs.RegistryImportRequest;
import java.time.OffsetDateTime;

/**
 * Adapter boundary for future integration with AISHE or other capability registries.
 */
public interface CapabilityImportAdapter {
    String getProviderName();
    
    /**
     * Fetch updates from the external provider since the given timestamp.
     */
    RegistryImportRequest fetchUpdates(OffsetDateTime since);
}
