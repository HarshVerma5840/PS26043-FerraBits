package com.saamyukt.SIH26043.service;

import com.saamyukt.SIH26043.entity.NotificationEvent;
import com.saamyukt.SIH26043.enums.DeliveryChannel;
import com.saamyukt.SIH26043.enums.DeliveryStatus;
import com.saamyukt.SIH26043.repository.NotificationEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class NotificationServiceTest {

    private NotificationEventRepository repository;
    private MockNotificationDeliveryProvider mockProvider;
    private NotificationService service;

    @BeforeEach
    void setUp() {
        repository = mock(NotificationEventRepository.class);
        mockProvider = new MockNotificationDeliveryProvider();
        service = new NotificationService(repository, List.of(mockProvider));
    }

    @Test
    void shouldCreateEventAndDeliverSuccessfully() {
        UUID userId = UUID.randomUUID();
        UUID problemId = UUID.randomUUID();

        when(repository.save(any(NotificationEvent.class))).thenAnswer(inv -> inv.getArgument(0));

        service.notifyUser(userId, problemId, "STATUS_CHANGED", "Title", "Body",
                "DRAFT", "SUBMITTED", "dedup-1", DeliveryChannel.SMS);

        ArgumentCaptor<NotificationEvent> captor = ArgumentCaptor.forClass(NotificationEvent.class);
        verify(repository, times(2)).save(captor.capture()); // Once initially, once after delivery

        NotificationEvent saved = captor.getValue();
        assertThat(saved.getUserId()).isEqualTo(userId);
        assertThat(saved.getProblemId()).isEqualTo(problemId);
        assertThat(saved.getDeliveryState()).isEqualTo(DeliveryStatus.DELIVERED);
        assertThat(saved.getRetryCount()).isEqualTo(1);
        assertThat(saved.getLastAttemptAt()).isNotNull();
    }

    @Test
    void shouldMarkAsFailedWhenProviderThrows() {
        mockProvider.setSimulateFailure(true);
        UUID userId = UUID.randomUUID();

        when(repository.save(any(NotificationEvent.class))).thenAnswer(inv -> inv.getArgument(0));

        service.notifyUser(userId, UUID.randomUUID(), "STATUS_CHANGED", "Title", "Body",
                "DRAFT", "SUBMITTED", "dedup-2", DeliveryChannel.EMAIL);

        ArgumentCaptor<NotificationEvent> captor = ArgumentCaptor.forClass(NotificationEvent.class);
        verify(repository, times(2)).save(captor.capture());

        NotificationEvent saved = captor.getValue();
        assertThat(saved.getDeliveryState()).isEqualTo(DeliveryStatus.FAILED);
        // Exception should not bubble up!
    }

    @Test
    void shouldPreventDuplicateEvents() {
        UUID userId = UUID.randomUUID();
        String dedup = "my-dedup-key";

        when(repository.existsByUserIdAndDeduplicationKey(userId, dedup)).thenReturn(true);

        service.notifyUser(userId, UUID.randomUUID(), "STATUS_CHANGED", "Title", "Body",
                "DRAFT", "SUBMITTED", dedup, DeliveryChannel.IN_APP);

        verify(repository, never()).save(any());
    }
}
