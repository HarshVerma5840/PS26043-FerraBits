CREATE TABLE conversation (
    conversation_id UUID PRIMARY KEY,
    conversation_type VARCHAR(50) NOT NULL,
    name VARCHAR(255),
    reference_id UUID, -- E.g. project_id or team_id
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE conversation_participant (
    participant_id UUID PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES conversation(conversation_id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    last_read_message_id UUID,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(conversation_id, user_id)
);

CREATE INDEX idx_conv_part_user ON conversation_participant(user_id);

CREATE TABLE message (
    message_id UUID PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES conversation(conversation_id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    content TEXT,
    correlation_id VARCHAR(100),
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID
);

CREATE INDEX idx_message_conv_time ON message(conversation_id, created_at DESC);
CREATE INDEX idx_message_correlation ON message(correlation_id);
