package com.saamyukt.SIH26043.capabilitymatching.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;

import com.saamyukt.SIH26043.capabilitymatching.service.MatchingAlgorithmService;
import com.saamyukt.SIH26043.capabilitymatching.repository.MatchingRunRepository;
import com.saamyukt.SIH26043.capabilitymatching.service.importing.CapabilityImportService;
import com.saamyukt.SIH26043.capabilitymatching.repository.RegistryVersionRepository;
import com.saamyukt.SIH26043.capabilitymatching.service.embedding.EmbeddingGenerationService;
import com.saamyukt.SIH26043.capabilitymatching.repository.InstitutionRepository;
import com.saamyukt.SIH26043.security.JwtAuthFilter;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
public class MatchingApiControllerSecurityTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @MockitoBean private com.saamyukt.SIH26043.security.JwtService jwtService;
    @MockitoBean private MatchingAlgorithmService matchingAlgorithmService;
    @MockitoBean private MatchingRunRepository matchingRunRepository;
    @MockitoBean private CapabilityImportService capabilityImportService;
    @MockitoBean private RegistryVersionRepository registryVersionRepository;
    @MockitoBean private EmbeddingGenerationService embeddingGenerationService;
    @MockitoBean private InstitutionRepository institutionRepository;
    @MockitoBean private com.saamyukt.SIH26043.capabilitymatching.service.registry.RegistryService registryService;

    @BeforeEach
    public void setup() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    @Test
    public void testAnonymousMatchingRejection() throws Exception {
        mockMvc.perform(post("/capability/runs")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "USER")
    public void testNonAdminRegistryMutationRejection() throws Exception {
        mockMvc.perform(post("/capability/registry/import")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isForbidden());
                
        mockMvc.perform(post("/capability/registry/publish?versionId=1"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void testAdminRegistryMutationSuccess() throws Exception {
        mockMvc.perform(post("/capability/registry/publish?versionId=1"))
                .andExpect(status().isNotFound()); 
    }
}
