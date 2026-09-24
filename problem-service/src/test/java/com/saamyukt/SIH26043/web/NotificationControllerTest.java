package com.saamyukt.SIH26043.web;

import com.saamyukt.SIH26043.entity.NotificationEvent;
import com.saamyukt.SIH26043.enums.KycStatus;
import com.saamyukt.SIH26043.enums.UserRole;
import com.saamyukt.SIH26043.repository.NotificationEventRepository;
import com.saamyukt.SIH26043.security.AuthUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class NotificationControllerTest {

    private NotificationEventRepository repository;
    private NotificationController controller;
    private AuthUser me;

    @BeforeEach
    void setUp() {
        repository = mock(NotificationEventRepository.class);
        controller = new NotificationController(repository);
        me = new AuthUser(UUID.randomUUID(), "111", UserRole.SUBMITTER, KycStatus.VERIFIED);
    }

    @Test
    void shouldReturnMyNotifications() {
        NotificationEvent event = new NotificationEvent();
        event.setEventId(UUID.randomUUID());
        event.setUserId(me.getUserId());

        when(repository.findByUserIdOrderByCreatedAtDesc(me.getUserId(), Pageable.unpaged()))
                .thenReturn(new PageImpl<>(List.of(event)));

        Page<com.saamyukt.SIH26043.web.dto.NotificationResponse> res = controller.getMyNotifications(me, Pageable.unpaged());
        assertThat(res).hasSize(1);
        assertThat(res.getContent().get(0).eventId()).isEqualTo(event.getEventId());
    }

    @Test
    void shouldMarkAsRead() {
        UUID eventId = UUID.randomUUID();
        controller.markAsRead(eventId, me);
        verify(repository).markAsRead(eventId, me.getUserId());
    }
}
