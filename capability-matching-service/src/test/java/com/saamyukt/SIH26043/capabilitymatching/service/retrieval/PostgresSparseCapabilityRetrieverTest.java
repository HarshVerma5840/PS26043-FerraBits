package com.saamyukt.SIH26043.capabilitymatching.service.retrieval;

import com.saamyukt.SIH26043.capabilitymatching.dto.retrieval.RetrievalDTOs.CapabilityCandidate;
import com.saamyukt.SIH26043.capabilitymatching.dto.retrieval.RetrievalDTOs.SparseRetrievalRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Testcontainers
public class PostgresSparseCapabilityRetrieverTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16")
            .withDatabaseName("sih_capability")
            .withUsername("sih")
            .withPassword("sih");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.flyway.enabled", () -> "true");
        // Disable eureka client in tests
        registry.add("eureka.client.enabled", () -> "false");
    }

    @Autowired
    private PostgresSparseCapabilityRetriever retriever;

    @Test
    void testRetrieve_SeededInstitutionReturned_WithCorrectEquipment_AndUnknownEquipmentIdentifiedAsMissing() {
        SparseRetrievalRequest request = SparseRetrievalRequest.builder()
                .registryVersionId(1)
                .requiredSkills(List.of("Water Quality Testing", "IoT Sensor Integration"))
                .requiredEquipment(List.of("Water testing kit", "Unknown Scanner"))
                .topK(10)
                .build();

        List<CapabilityCandidate> candidates = retriever.retrieve(request);

        assertThat(candidates).isNotEmpty();
        
        CapabilityCandidate result = candidates.get(0);
        assertThat(result.getInstitutionId()).isEqualTo(UUID.fromString("40000000-0000-4000-8000-000000000001"));
        assertThat(result.getName()).isEqualTo("Example University");
        
        // Confirm an unknown equipment item is identified as missing
        assertThat(result.isExactEquipmentMiss()).isTrue();
    }
    
    @Test
    void testRetrieve_InactiveEquipmentNotReportedAsOperational() {
        SparseRetrievalRequest request = SparseRetrievalRequest.builder()
                .registryVersionId(1)
                .requiredSkills(List.of("Water Quality Testing"))
                .requiredEquipment(List.of("Spectrometer"))
                .topK(10)
                .build();

        List<CapabilityCandidate> candidates = retriever.retrieve(request);

        assertThat(candidates).isNotEmpty();
        
        CapabilityCandidate result = candidates.get(0);
        assertThat(result.getInstitutionId()).isEqualTo(UUID.fromString("40000000-0000-4000-8000-000000000001"));
        
        // Since spectrometer is not operational, it shouldn't be included in the eq_names returned by the query
        // Thus exactEquipmentMiss should be true
        assertThat(result.isExactEquipmentMiss()).isTrue();
    }
    
    @Test
    void testRetrieve_RegistryVersionFilteringWorks() {
        SparseRetrievalRequest request = SparseRetrievalRequest.builder()
                .registryVersionId(999)
                .requiredSkills(List.of("Water Quality Testing"))
                .topK(10)
                .build();

        List<CapabilityCandidate> candidates = retriever.retrieve(request);

        assertThat(candidates).isEmpty();
    }
}
