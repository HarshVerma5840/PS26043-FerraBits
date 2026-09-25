package com.saamyukt.SIH26043.capabilitymatching.dto;

import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.List;

public class SecureMessagingDTOs {

    @Data
    public static class ConversationDto {
        private UUID conversationId;
        private String conversationType;
        private String name;
        private UUID referenceId;
        private OffsetDateTime createdAt;
        private Long unreadCount;
        private List<ParticipantDto> participants;
    }

    @Data
    public static class ParticipantDto {
        private UUID participantId;
        private UUID userId;
        private UUID lastReadMessageId;
        private OffsetDateTime joinedAt;
        private Boolean isActive;
    }

    @Data
    public static class MessageDto {
        private UUID messageId;
        private UUID conversationId;
        private UUID senderId;
        private String content;
        private String correlationId;
        private Boolean isDeleted;
        private OffsetDateTime createdAt;
    }

    @Data
    public static class CreateMessageDto {
        private String content;
        private String correlationId;
    }

    @Data
    public static class AddParticipantDto {
        private UUID userId;
    }
}
