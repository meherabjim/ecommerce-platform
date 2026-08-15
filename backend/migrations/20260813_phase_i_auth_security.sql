CREATE TABLE IF NOT EXISTS user_sessions (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    refresh_token_hash TEXT NOT NULL,

    device_name VARCHAR(255),

    ip_address VARCHAR(100),

    user_agent TEXT,

    last_active_at TIMESTAMP DEFAULT NOW(),

    expires_at TIMESTAMP NOT NULL,

    is_revoked BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);


CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id
ON user_sessions(user_id);



CREATE TABLE IF NOT EXISTS auth_audit_logs (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID,

    action VARCHAR(50) NOT NULL,

    ip_address VARCHAR(100),

    user_agent TEXT,

    metadata JSONB,

    created_at TIMESTAMP DEFAULT NOW()

);


CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_user_id
ON auth_audit_logs(user_id);