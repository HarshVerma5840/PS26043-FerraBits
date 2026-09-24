-- V10: Notification Delivery extensions
-- Adds robust delivery fields to notification_event table

CREATE TYPE delivery_channel AS ENUM ('IN_APP', 'PUSH', 'SMS', 'EMAIL', 'WHATSAPP');
CREATE TYPE delivery_status AS ENUM ('PENDING', 'DELIVERED', 'FAILED');

ALTER TABLE notification_event ADD COLUMN previous_status VARCHAR(50);
ALTER TABLE notification_event ADD COLUMN new_status VARCHAR(50);
ALTER TABLE notification_event ADD COLUMN template_key VARCHAR(100);
ALTER TABLE notification_event ADD COLUMN channel delivery_channel DEFAULT 'IN_APP';
ALTER TABLE notification_event ADD COLUMN retry_count INT DEFAULT 0;
ALTER TABLE notification_event ADD COLUMN delivery_state delivery_status DEFAULT 'PENDING';
ALTER TABLE notification_event ADD COLUMN last_attempt_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE notification_event ADD COLUMN deduplication_key VARCHAR(255);

CREATE UNIQUE INDEX idx_notification_dedup ON notification_event(user_id, deduplication_key) WHERE deduplication_key IS NOT NULL;
