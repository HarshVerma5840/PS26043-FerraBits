package com.saamyukt.SIH26043.service;

import com.saamyukt.SIH26043.entity.NotificationEvent;
import com.saamyukt.SIH26043.repository.NotificationEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class NotificationService {

    private final NotificationEventRepository notificationEventRepository;
    private final java.util.List<NotificationDeliveryProvider> deliveryProviders;

    public NotificationService(NotificationEventRepository notificationEventRepository,
                               java.util.List<NotificationDeliveryProvider> deliveryProviders) {
        this.notificationEventRepository = notificationEventRepository;
        this.deliveryProviders = deliveryProviders;
    }

    /**
     * Creates a notification event in the same transaction as the caller, 
     * but handles external delivery safely to prevent rollbacks.
     */
    @Transactional(propagation = Propagation.REQUIRED)
    public void notifyUser(UUID userId, UUID problemId, String eventType, String title, String body,
                           String previousStatus, String newStatus, String deduplicationKey,
                           com.saamyukt.SIH26043.enums.DeliveryChannel channel) {
        
        if (deduplicationKey != null && notificationEventRepository.existsByUserIdAndDeduplicationKey(userId, deduplicationKey)) {
            return;
        }

        NotificationEvent event = new NotificationEvent();
        event.setUserId(userId);
        event.setProblemId(problemId);
        event.setEventType(eventType);
        event.setTitle(title);
        event.setBody(body);
        event.setPreviousStatus(previousStatus);
        event.setNewStatus(newStatus);
        event.setDeduplicationKey(deduplicationKey);
        event.setChannel(channel != null ? channel : com.saamyukt.SIH26043.enums.DeliveryChannel.IN_APP);
        event.setDeliveryState(com.saamyukt.SIH26043.enums.DeliveryStatus.PENDING);
        
        event = notificationEventRepository.save(event);

        deliverEventSafely(event);
    }
    
    // For backwards compatibility with old usages
    @Transactional(propagation = Propagation.REQUIRED)
    public void notifyUser(UUID userId, UUID problemId, String eventType, String title, String body) {
        notifyUser(userId, problemId, eventType, title, body, null, null, null, com.saamyukt.SIH26043.enums.DeliveryChannel.IN_APP);
    }

    private void deliverEventSafely(NotificationEvent event) {
        event.setLastAttemptAt(java.time.Instant.now());
        event.setRetryCount(event.getRetryCount() + 1);

        if (event.getChannel() == com.saamyukt.SIH26043.enums.DeliveryChannel.IN_APP) {
            event.setDeliveryState(com.saamyukt.SIH26043.enums.DeliveryStatus.DELIVERED);
            notificationEventRepository.save(event);
            return;
        }

        try {
            for (NotificationDeliveryProvider provider : deliveryProviders) {
                if (provider.supports(event.getChannel())) {
                    provider.deliver(event);
                    event.setDeliveryState(com.saamyukt.SIH26043.enums.DeliveryStatus.DELIVERED);
                    notificationEventRepository.save(event);
                    return;
                }
            }
            // No provider found, just mark failed
            event.setDeliveryState(com.saamyukt.SIH26043.enums.DeliveryStatus.FAILED);
        } catch (Exception e) {
            // Log error here (omitted for brevity)
            event.setDeliveryState(com.saamyukt.SIH26043.enums.DeliveryStatus.FAILED);
        }
        notificationEventRepository.save(event);
    }
}
