-- Migration: Add user_quotas table for tracking AI generation limits
-- Description: Track lifetime AI-generated flashcard count per user

-- Create user_quotas table
CREATE TABLE user_quotas (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    ai_generation_count INTEGER NOT NULL DEFAULT 0,
    ai_generation_limit INTEGER NOT NULL DEFAULT 20,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add trigger for updated_at
CREATE TRIGGER update_user_quotas_updated_at
    BEFORE UPDATE ON user_quotas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE user_quotas ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_quotas table
-- Users can view their own quota
CREATE POLICY "Users can view own quota"
    ON user_quotas FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own quota (for initial creation)
CREATE POLICY "Users can create own quota"
    ON user_quotas FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own quota (count increment only via API)
CREATE POLICY "Users can update own quota"
    ON user_quotas FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create function to increment AI generation count
-- Returns the new count and remaining quota, or error if limit exceeded
CREATE OR REPLACE FUNCTION increment_ai_generation_count(
    p_user_id UUID,
    p_count INTEGER
)
RETURNS TABLE (
    new_count INTEGER,
    remaining INTEGER,
    limit_value INTEGER
) AS $$
DECLARE
    v_current_count INTEGER;
    v_limit INTEGER;
BEGIN
    -- Upsert user quota record
    INSERT INTO user_quotas (user_id, ai_generation_count, ai_generation_limit)
    VALUES (p_user_id, 0, 20)
    ON CONFLICT (user_id) DO NOTHING;

    -- Get current values with lock
    SELECT ai_generation_count, ai_generation_limit
    INTO v_current_count, v_limit
    FROM user_quotas
    WHERE user_id = p_user_id
    FOR UPDATE;

    -- Check if limit would be exceeded
    IF v_current_count + p_count > v_limit THEN
        RAISE EXCEPTION 'AI generation limit exceeded. You have % remaining out of % total.',
            v_limit - v_current_count, v_limit;
    END IF;

    -- Increment the count
    UPDATE user_quotas
    SET ai_generation_count = ai_generation_count + p_count
    WHERE user_id = p_user_id;

    -- Return new values
    RETURN QUERY
    SELECT
        v_current_count + p_count AS new_count,
        v_limit - (v_current_count + p_count) AS remaining,
        v_limit AS limit_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user quota (creates record if not exists)
CREATE OR REPLACE FUNCTION get_user_quota(p_user_id UUID)
RETURNS TABLE (
    count INTEGER,
    remaining INTEGER,
    limit_value INTEGER
) AS $$
BEGIN
    -- Upsert user quota record
    INSERT INTO user_quotas (user_id, ai_generation_count, ai_generation_limit)
    VALUES (p_user_id, 0, 20)
    ON CONFLICT (user_id) DO NOTHING;

    -- Return quota info
    RETURN QUERY
    SELECT
        uq.ai_generation_count AS count,
        uq.ai_generation_limit - uq.ai_generation_count AS remaining,
        uq.ai_generation_limit AS limit_value
    FROM user_quotas uq
    WHERE uq.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
