-- Football Sorter: Supabase Schema (Phase 2)
-- Shared votes table, rate-limiting trigger, and Row-Level Security (RLS) policies.

-- 1. Ensure pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Votes table matching Vote type
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pool_id TEXT NOT NULL,
    a TEXT NOT NULL,
    b TEXT NOT NULL,
    result TEXT NOT NULL CHECK (result IN ('a', 'b', 'tie')),
    session_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance indices
CREATE INDEX IF NOT EXISTS idx_votes_pool_id ON public.votes (pool_id);
CREATE INDEX IF NOT EXISTS idx_votes_session_created ON public.votes (session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_votes_created_at ON public.votes (created_at DESC);

-- 3. Rate-limiting trigger (Enforce max 30 votes per session per minute)
CREATE OR REPLACE FUNCTION public.check_vote_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    recent_votes_count INTEGER;
    MAX_VOTES_PER_MINUTE CONSTANT INTEGER := 30;
BEGIN
    -- Count votes by this session_id in the last 60 seconds
    SELECT COUNT(*)
    INTO recent_votes_count
    FROM public.votes
    WHERE session_id = NEW.session_id
      AND created_at >= (now() - INTERVAL '1 minute');

    IF recent_votes_count >= MAX_VOTES_PER_MINUTE THEN
        RAISE EXCEPTION 'Rate limit exceeded: maximum % votes per session per minute.', MAX_VOTES_PER_MINUTE
            USING ERRCODE = 'P0001';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_vote_rate_limit ON public.votes;
CREATE TRIGGER trg_check_vote_rate_limit
    BEFORE INSERT ON public.votes
    FOR EACH ROW
    EXECUTE FUNCTION public.check_vote_rate_limit();

-- 4. Row Level Security (RLS)
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Anonymous users can insert votes
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.votes;
CREATE POLICY "Allow anonymous inserts"
    ON public.votes
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Anonymous users CANNOT update or delete
-- (No policies for UPDATE or DELETE means all update/delete requests are blocked by default)

-- Anonymous users cannot read other users' session IDs
DROP POLICY IF EXISTS "Allow reading own session votes" ON public.votes;
CREATE POLICY "Allow reading own session votes"
    ON public.votes
    FOR SELECT
    TO anon, authenticated
    USING (
        session_id = coalesce(
            current_setting('request.headers', true)::json->>'x-session-id',
            ''
        )
    );

-- 5. Public View for aggregated community rankings (omits session_id completely)
CREATE OR REPLACE VIEW public.community_votes AS
    SELECT id, pool_id, a, b, result, created_at
    FROM public.votes;

GRANT SELECT ON public.community_votes TO anon, authenticated;

