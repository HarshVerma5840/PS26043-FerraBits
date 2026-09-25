package com.saamyukt.SIH26043.capabilitymatching.controller.registry;

import com.saamyukt.SIH26043.capabilitymatching.service.registry.RegistryService;
import com.saamyukt.SIH26043.capabilitymatching.service.importing.CapabilityImportService;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
class RegistryApiControllerSecurityTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @MockitoBean
    private RegistryService registryService;

    @MockitoBean
    private CapabilityImportService importService;

    // also need to mock JwtService if it fails to start context
    @MockitoBean 
    private com.saamyukt.SIH26043.security.JwtService jwtService;

    @BeforeEach
    public void setup() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    @Test
    void testGetVersions_Unauthorized() throws Exception {
        mockMvc.perform(get("/capability/registry/versions"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "USER") // Just a regular user
    void testGetVersions_AuthorizedAsUser() throws Exception {
        // GET endpoints are generally open to authenticated users?
        // Wait, the controller doesn't have @PreAuthorize on class level, only on POST endpoints
        mockMvc.perform(get("/capability/registry/versions"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "USER")
    void testPublishVersion_ForbiddenForUser() throws Exception {
        mockMvc.perform(post("/capability/registry/versions/1/publish"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testPublishVersion_AllowedForAdmin() throws Exception {
        mockMvc.perform(post("/capability/registry/versions/1/publish"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "REGISTRY_MANAGER")
    void testArchiveVersion_AllowedForManager() throws Exception {
        mockMvc.perform(post("/capability/registry/versions/1/archive"))
                .andExpect(status().isOk());
    }
}
