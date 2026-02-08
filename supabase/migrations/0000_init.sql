-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (Extension of Auth or standalone for roles)
-- We will link to auth.users if using Supabase Auth, but keep a public profile table for roles
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('admin', 'moderator')) NOT NULL DEFAULT 'moderator',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- 2. Events Table
CREATE TABLE public.events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  event_code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('draft', 'active', 'ended')) DEFAULT 'draft',
  settings JSONB DEFAULT '{"qa_enabled": true, "polls_enabled": true}'::jsonb
);

CREATE INDEX idx_events_code ON public.events(event_code);

-- 3. Event Access (Moderators for events)
CREATE TABLE public.event_access (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('moderator', 'viewer')) DEFAULT 'moderator',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- 4. Text Questions (Moderated)
CREATE TABLE public.questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 500),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  moderated_by UUID REFERENCES public.users(id),
  moderated_at TIMESTAMP WITH TIME ZONE,
  displayed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_questions_event_status ON public.questions(event_id, status);

-- 5. Polls (Unmoderated)
CREATE TABLE public.polls (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of {id, text, votes}
  poll_type TEXT CHECK (poll_type IN ('single', 'multiple')) DEFAULT 'single',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active BOOLEAN DEFAULT FALSE,
  activated_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  total_votes INTEGER DEFAULT 0
);

CREATE INDEX idx_polls_event_active ON public.polls(event_id, active);

-- 6. Poll Votes
CREATE TABLE public.poll_votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE,
  option_ids JSONB NOT NULL, -- Array of selected option IDs
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id TEXT NOT NULL -- Browser fingerprint/session ID
);

CREATE INDEX idx_poll_votes_poll_session ON public.poll_votes(poll_id, session_id);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- Policies

-- Users: Read own data
CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (auth.uid() = id);

-- Events: Public read (needed for participants to check event code)
CREATE POLICY "Anyone can view active events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Admins can insert events" ON public.events FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));
CREATE POLICY "Admins/Moderators can update events" ON public.events FOR UPDATE USING (
  auth.uid() = created_by OR 
  auth.uid() IN (SELECT user_id FROM public.event_access WHERE event_id = id AND role = 'moderator')
);

-- Questions: 
-- Insert: Anyone (Participants)
CREATE POLICY "Participants can submit questions" ON public.questions FOR INSERT WITH CHECK (true);
-- Select: Moderators (view all), Participants/Display (view approved)
CREATE POLICY "Moderators view all questions" ON public.questions FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM public.event_access WHERE event_id = event_id) OR
  EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND created_by = auth.uid()) OR
  auth.role() = 'service_role'
);
CREATE POLICY "Public views approved questions" ON public.questions FOR SELECT USING (status = 'approved');
-- Update: Moderators only
CREATE POLICY "Moderators can update questions" ON public.questions FOR UPDATE USING (
  auth.uid() IN (SELECT user_id FROM public.event_access WHERE event_id = event_id) OR
  EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND created_by = auth.uid())
);

-- Polls:
-- Read: Public (active/ended), Admins (all)
CREATE POLICY "Public views active polls" ON public.polls FOR SELECT USING (
  active = true OR ended_at IS NOT NULL OR 
  auth.uid() IN (SELECT created_by FROM public.events WHERE id = event_id)
);
-- Write: Admins/Moderators
CREATE POLICY "Admins manage polls" ON public.polls FOR ALL USING (
  auth.uid() IN (SELECT created_by FROM public.events WHERE id = event_id) OR
   auth.uid() IN (SELECT user_id FROM public.event_access WHERE event_id = event_id AND role = 'moderator')
);

-- Poll Votes:
-- Insert: Public (Participants)
CREATE POLICY "Participants can vote" ON public.poll_votes FOR INSERT WITH CHECK (true);
-- Read: Aggregate only usually, but for real-time checks we might need select. Public read disallowed to prevent scraping?
-- Actually, we need real-time counts. We'll aggregate on client or trigger.
-- For now allow read for display.
CREATE POLICY "Public can view votes" ON public.poll_votes FOR SELECT USING (true);

-- REALTIME setup
ALTER PUBLICATION supabase_realtime ADD TABLE public.questions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.polls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.poll_votes;
