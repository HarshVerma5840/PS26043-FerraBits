package com.saamyukt.SIH26043.capabilitymatching.service;

import com.saamyukt.SIH26043.capabilitymatching.dto.SecureMessagingDTOs.*;
import com.saamyukt.SIH26043.capabilitymatching.entity.*;
import com.saamyukt.SIH26043.capabilitymatching.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SecureMessagingServiceTest {

    @Mock
    private ConversationRepository conversationRepository;
    @Mock
    private ConversationParticipantRepository participantRepository;
    @Mock
    private MessageRepository messageRepository;

    @InjectMocks
    private SecureMessagingService service;

    private UUID conversationId;
    private UUID currentUserId;
    private Conversation conv;

    @BeforeEach
    void setUp() {
        conversationId = UUID.randomUUID();
        currentUserId = UUID.randomUUID();
        
        conv = new Conversation();
        conv.setConversationId(conversationId);
        conv.setConversationType("PROJECT");
    }

    @Test
    void testSendMessageAuthorizedParticipant() {
        CreateMessageDto dto = new CreateMessageDto();
        dto.setContent("Hello");

        when(conversationRepository.findById(conversationId)).thenReturn(Optional.of(conv));
        
        ConversationParticipant p = new ConversationParticipant();
        p.setIsActive(true);
        when(participantRepository.findByConversation_ConversationIdAndUserId(conversationId, currentUserId))
            .thenReturn(Optional.of(p));

        when(messageRepository.save(any(Message.class))).thenAnswer(i -> {
            Message m = i.getArgument(0);
            m.setMessageId(UUID.randomUUID());
            return m;
        });

        MessageDto result = service.sendMessage(conversationId, dto, currentUserId, false);
        
        assertNotNull(result);
        assertEquals("Hello", result.getContent());
        assertFalse(result.getIsDeleted());
        verify(messageRepository, times(1)).save(any(Message.class));
    }

    @Test
    void testSendMessageUnauthorizedThrowsAccessDenied() {
        CreateMessageDto dto = new CreateMessageDto();
        dto.setContent("Hello");

        when(conversationRepository.findById(conversationId)).thenReturn(Optional.of(conv));
        
        when(participantRepository.findByConversation_ConversationIdAndUserId(conversationId, currentUserId))
            .thenReturn(Optional.empty());

        assertThrows(AccessDeniedException.class, () -> 
            service.sendMessage(conversationId, dto, currentUserId, false)
        );
    }

    @Test
    void testAdminCanAccessGovernanceConversationsEvenIfNotParticipant() {
        Conversation govConv = new Conversation();
        govConv.setConversationId(conversationId);
        govConv.setConversationType("ADMIN");

        when(conversationRepository.findById(conversationId)).thenReturn(Optional.of(govConv));
        
        when(participantRepository.findByConversation_ConversationIdAndUserId(conversationId, currentUserId))
            .thenReturn(Optional.empty());

        when(messageRepository.findByConversation_ConversationIdOrderByCreatedAtDesc(eq(conversationId), any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of()));

        Page<MessageDto> msgs = service.getMessages(conversationId, 0, 10, currentUserId, true);
        assertNotNull(msgs);
    }

    @Test
    void testDeleteMessageSoftDeletesAndMasksContent() {
        UUID msgId = UUID.randomUUID();
        Message m = new Message();
        m.setMessageId(msgId);
        m.setSenderId(currentUserId);
        m.setContent("Secret Info");

        when(messageRepository.findById(msgId)).thenReturn(Optional.of(m));
        
        service.deleteMessage(msgId, currentUserId, false);

        assertTrue(m.getIsDeleted());
        assertEquals("[DELETED]", m.getContent());
        assertNotNull(m.getDeletedAt());
        assertEquals(currentUserId, m.getDeletedBy());
        verify(messageRepository, times(1)).save(m);
    }

    @Test
    void testCannotDeleteOtherUserMessageUnlessAdmin() {
        UUID msgId = UUID.randomUUID();
        Message m = new Message();
        m.setMessageId(msgId);
        m.setSenderId(UUID.randomUUID()); // Different user

        when(messageRepository.findById(msgId)).thenReturn(Optional.of(m));
        
        assertThrows(AccessDeniedException.class, () -> 
            service.deleteMessage(msgId, currentUserId, false)
        );
    }
}
