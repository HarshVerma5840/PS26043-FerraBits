package com.saamyukt.SIH26043.service;

import com.saamyukt.SIH26043.entity.NotificationEvent;

public interface NotificationDeliveryProvider {
    boolean supports(com.saamyukt.SIH26043.enums.DeliveryChannel channel);
    
    /**
     * Delivers the notification. Throws an exception if delivery fails.
     */
    void deliver(NotificationEvent event);
}
