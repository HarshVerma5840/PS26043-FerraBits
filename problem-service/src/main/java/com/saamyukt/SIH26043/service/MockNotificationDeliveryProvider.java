package com.saamyukt.SIH26043.service;

import com.saamyukt.SIH26043.entity.NotificationEvent;
import com.saamyukt.SIH26043.enums.DeliveryChannel;
import org.springframework.stereotype.Component;

@Component
public class MockNotificationDeliveryProvider implements NotificationDeliveryProvider {

    private boolean simulateFailure = false;

    public void setSimulateFailure(boolean simulateFailure) {
        this.simulateFailure = simulateFailure;
    }

    @Override
    public boolean supports(DeliveryChannel channel) {
        return channel == DeliveryChannel.SMS || channel == DeliveryChannel.EMAIL || channel == DeliveryChannel.WHATSAPP || channel == DeliveryChannel.PUSH;
    }

    @Override
    public void deliver(NotificationEvent event) {
        if (simulateFailure) {
            throw new RuntimeException("Mock delivery failure");
        }
        // Pretend delivery was successful
    }
}
