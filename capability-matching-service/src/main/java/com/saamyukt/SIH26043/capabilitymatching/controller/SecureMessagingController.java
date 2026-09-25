package com.saamyukt.SIH26043.capabilitymatching.controller;

import com.saamyukt.SIH26043.capabilitymatching.dto.SecureMessagingDTOs.*;
import com.saamyukt.SIH26043.capabilitymatching.service.SecureMessagingService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import java.util.List;
import java.util.Collection;

@RestController
@RequestMapping("/capability/api/v1")
public class SecureMessagingController {

    private final SecureMessagingService service;

    public SecureMessagingController(SecureMessagingService service) {
        this.service = service;
    }

    private UUID getCurrentUserId() {
        try {
            return UUID.fromString(SecurityContextHolder.getContext().getAuthentication().getName());
        } catch (Exception e) {
            return UUID.randomUUID(); // Fallback for tests if needed
        }
    }

    private boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
        return authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    @PostMapping("/conversations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ConversationDto> createConversation(@RequestBody ConversationDto dto) {
        return ResponseEntity.ok(service.createConversation(dto, getCurrentUserId()));
    }

    @GetMapping("/conversations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ConversationDto>> getConversations() {
        return ResponseEntity.ok(service.getUserConversations(getCurrentUserId()));
    }

    @GetMapping("/conversations/{conversationId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ConversationDto> getConversation(@PathVariable UUID conversationId) {
        return ResponseEntity.ok(service.getConversation(conversationId, getCurrentUserId(), isAdmin()));
    }

    @PostMapping("/conversations/{conversationId}/participants")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ParticipantDto> addParticipant(@PathVariable UUID conversationId, @RequestBody AddParticipantDto dto) {
        return ResponseEntity.ok(service.addParticipant(conversationId, dto.getUserId(), getCurrentUserId(), isAdmin()));
    }

    @DeleteMapping("/conversations/{conversationId}/participants/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> removeParticipant(@PathVariable UUID conversationId, @PathVariable UUID userId) {
        service.removeParticipant(conversationId, userId, getCurrentUserId(), isAdmin());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/conversations/{conversationId}/messages")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<MessageDto>> getMessages(@PathVariable UUID conversationId,
                                                        @RequestParam(defaultValue = "0") int page,
                                                        @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(service.getMessages(conversationId, page, size, getCurrentUserId(), isAdmin()));
    }

    @PostMapping("/conversations/{conversationId}/messages")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageDto> sendMessage(@PathVariable UUID conversationId, @RequestBody CreateMessageDto dto) {
        return ResponseEntity.ok(service.sendMessage(conversationId, dto, getCurrentUserId(), isAdmin()));
    }

    @PatchMapping("/messages/{messageId}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markAsRead(@RequestParam UUID conversationId, @PathVariable UUID messageId) {
        service.markAsRead(conversationId, messageId, getCurrentUserId());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/messages/{messageId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteMessage(@PathVariable UUID messageId) {
        service.deleteMessage(messageId, getCurrentUserId(), isAdmin());
        return ResponseEntity.noContent().build();
    }
}
