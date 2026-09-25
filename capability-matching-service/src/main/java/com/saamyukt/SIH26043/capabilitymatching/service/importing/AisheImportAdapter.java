package com.saamyukt.SIH26043.capabilitymatching.service.importing;

import com.saamyukt.SIH26043.capabilitymatching.dto.importing.ImportDTOs.RegistryImportRequest;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;

@Service
public class AisheImportAdapter implements CapabilityImportAdapter {

    @Override
    public String getProviderName() {
        return "AISHE";
    }

    @Override
    public RegistryImportRequest fetchUpdates(OffsetDateTime since) {
        // As per requirements: "Do not integrate with a live AISHE endpoint in this prompt. 
        // Create the adapter boundary and document the expected future integration."
        throw new UnsupportedOperationException("AISHE live integration not yet implemented. Expected future integration via REST API mapping AISHE codes to InstitutionImportDto.");
    }
}
