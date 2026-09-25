package com.saamyukt.SIH26043.capabilitymatching.service;

import com.saamyukt.SIH26043.capabilitymatching.dto.SecureMessagingDTOs.*;
import com.saamyukt.SIH26043.capabilitymatching.entity.*;
import com.saamyukt.SIH26043.capabilitymatching.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SecureMessagingService {

    private final ConversationRepository conversationRepository;
    private final ConversationParticipantRepository participantRepository;
    private final MessageRepository messageRepository;

    public SecureMessagingService(ConversationRepository conversationRepository,
                                  ConversationParticipantRepository participantRepository,
                                  MessageRepository messageRepository) {
        this.conversationRepository = conversationRepository;
        this.participantRepository = participantRepository;
        this.messageRepository = messageRepository;
    }

    @Transactional
    public ConversationDto createConversation(ConversationDto dto, UUID currentUserId) {
        Conversation conv = new Conversation();
        conv.setConversationId(UUID.randomUUID());
        conv.setConversationType(dto.getConversationType());
        conv.setName(dto.getName());
        conv.setReferenceId(dto.getReferenceId());
        conv.setCreatedAt(OffsetDateTime.now());
        conv.setUpdatedAt(OffsetDateTime.now());
        conversationRepository.save(conv);

        addParticipantInternal(conv, currentUserId);
        
        return mapConversation(conv, currentUserId);
    }

    @Transactional(readOnly = true)
    public List<ConversationDto> getUserConversations(UUID currentUserId) {
        return conversationRepository.findActiveConversationsByUserId(currentUserId).stream()
                .map(c -> mapConversation(c, currentUserId))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ConversationDto getConversation(UUID conversationId, UUID currentUserId, boolean isAdmin) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        
        checkAccess(conv, currentUserId, isAdmin);
        return mapConversation(conv, currentUserId);
    }

    @Transactional
    public ParticipantDto addParticipant(UUID conversationId, UUID targetUserId, UUID currentUserId, boolean isAdmin) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        
        // Only existing participants or admins can add
        checkAccess(conv, currentUserId, isAdmin);
        
        ConversationParticipant participant = addParticipantInternal(conv, targetUserId);
        return mapParticipant(participant);
    }

    private ConversationParticipant addParticipantInternal(Conversation conv, UUID userId) {
        return participantRepository.findByConversation_ConversationIdAndUserId(conv.getConversationId(), userId)
                .map(p -> {
                    p.setIsActive(true);
                    return participantRepository.save(p);
                })
                .orElseGet(() -> {
                    ConversationParticipant p = new ConversationParticipant();
                    p.setParticipantId(UUID.randomUUID());
                    p.setConversation(conv);
                    p.setUserId(userId);
                    p.setJoinedAt(OffsetDateTime.now());
                    p.setIsActive(true);
                    return participantRepository.save(p);
                });
    }

    @Transactional
    public void removeParticipant(UUID conversationId, UUID targetUserId, UUID currentUserId, boolean isAdmin) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        
        // Users can remove themselves, or admins can remove users
        if (!targetUserId.equals(currentUserId) && !isAdmin) {
            throw new AccessDeniedException("Cannot remove other users unless admin");
        }
        
        participantRepository.findByConversation_ConversationIdAndUserId(conversationId, targetUserId)
                .ifPresent(p -> {
                    p.setIsActive(false);
                    participantRepository.save(p);
                });
    }

    @Transactional
    public MessageDto sendMessage(UUID conversationId, CreateMessageDto dto, UUID currentUserId, boolean isAdmin) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        
        checkAccess(conv, currentUserId, isAdmin);
        
        // Basic abuse check (e.g. rate limit, skipped complex logic for now, could check last message time)
        
        Message msg = new Message();
        msg.setMessageId(UUID.randomUUID());
        msg.setConversation(conv);
        msg.setSenderId(currentUserId);
        msg.setContent(dto.getContent());
        msg.setCorrelationId(dto.getCorrelationId());
        msg.setIsDeleted(false);
        msg.setCreatedAt(OffsetDateTime.now());
        msg.setUpdatedAt(OffsetDateTime.now());
        
        messageRepository.save(msg);
        
        conv.setUpdatedAt(OffsetDateTime.now());
        conversationRepository.save(conv);
        
        return mapMessage(msg);
    }

    @Transactional(readOnly = true)
    public Page<MessageDto> getMessages(UUID conversationId, int page, int size, UUID currentUserId, boolean isAdmin) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        
        checkAccess(conv, currentUserId, isAdmin);
        
        Pageable pageable = PageRequest.of(page, size);
        return messageRepository.findByConversation_ConversationIdOrderByCreatedAtDesc(conversationId, pageable)
                .map(this::mapMessage);
    }

    @Transactional
    public void markAsRead(UUID conversationId, UUID messageId, UUID currentUserId) {
        participantRepository.findByConversation_ConversationIdAndUserId(conversationId, currentUserId)
                .ifPresent(p -> {
                    p.setLastReadMessageId(messageId);
                    participantRepository.save(p);
                });
    }

    @Transactional
    public void deleteMessage(UUID messageId, UUID currentUserId, boolean isAdmin) {
        Message msg = messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));
        
        if (!msg.getSenderId().equals(currentUserId) && !isAdmin) {
            throw new AccessDeniedException("Cannot delete someone else's message");
        }
        
        msg.setIsDeleted(true);
        msg.setDeletedAt(OffsetDateTime.now());
        msg.setDeletedBy(currentUserId);
        // Retain metadata, but mask content
        msg.setContent("[DELETED]");
        messageRepository.save(msg);
    }

    private void checkAccess(Conversation conv, UUID userId, boolean isAdmin) {
        boolean isParticipant = participantRepository
                .findByConversation_ConversationIdAndUserId(conv.getConversationId(), userId)
                .map(ConversationParticipant::getIsActive)
                .orElse(false);
        
        if (isParticipant) return;
        
        if (isAdmin && "ADMIN".equals(conv.getConversationType())) {
            return;
        }
        
        throw new AccessDeniedException("Not authorized to access this conversation");
    }

    private ConversationDto mapConversation(Conversation c, UUID userId) {
        ConversationDto dto = new ConversationDto();
        dto.setConversationId(c.getConversationId());
        dto.setConversationType(c.getConversationType());
        dto.setName(c.getName());
        dto.setReferenceId(c.getReferenceId());
        dto.setCreatedAt(c.getCreatedAt());
        
        long unread = messageRepository.countUnreadMessagesByConversationAndUser(c.getConversationId(), userId);
        dto.setUnreadCount(unread);
        
        if (c.getParticipants() != null) {
            dto.setParticipants(c.getParticipants().stream().map(this::mapParticipant).collect(Collectors.toList()));
        }
        
        return dto;
    }

    private ParticipantDto mapParticipant(ConversationParticipant p) {
        ParticipantDto dto = new ParticipantDto();
        dto.setParticipantId(p.getParticipantId());
        dto.setUserId(p.getUserId());
        dto.setLastReadMessageId(p.getLastReadMessageId());
        dto.setJoinedAt(p.getJoinedAt());
        dto.setIsActive(p.getIsActive());
        return dto;
    }

    private MessageDto mapMessage(Message m) {
        MessageDto dto = new MessageDto();
        dto.setMessageId(m.getMessageId());
        dto.setConversationId(m.getConversation().getConversationId());
        dto.setSenderId(m.getSenderId());
        dto.setContent(m.getContent());
        dto.setCorrelationId(m.getCorrelationId());
        dto.setIsDeleted(m.getIsDeleted());
        dto.setCreatedAt(m.getCreatedAt());
        return dto;
    }
}
