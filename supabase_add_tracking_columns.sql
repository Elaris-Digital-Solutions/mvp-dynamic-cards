-- Add new columns for enhanced tracking and data snapshotting
ALTER TABLE public.click_events
ADD COLUMN IF NOT EXISTS platform TEXT NOT NULL DEFAULT 'unknown',
ADD COLUMN IF NOT EXISTS button_label TEXT,
ADD COLUMN IF NOT EXISTS url TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Note: IP hash is already part of the schema (ip_hash TEXT)

-- Add indexes for future analytics performance and scalability
-- Index on profile_id and platform for fast analytical queries (e.g. clicks per platform per user)
CREATE INDEX IF NOT EXISTS idx_click_events_profile_platform 
ON public.click_events (profile_id, platform);

-- Index on created_at for fast time-series queries
CREATE INDEX IF NOT EXISTS idx_click_events_created_at 
ON public.click_events (created_at DESC);
