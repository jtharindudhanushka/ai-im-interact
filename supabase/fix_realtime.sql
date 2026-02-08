-- Enable Realtime for relevant tables safely (Idempotent)
-- Run this in Supabase SQL Editor

DO $$
BEGIN
  -- Check and add 'poll_votes'
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'poll_votes') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.poll_votes;
  END IF;

  -- Check and add 'polls'
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'polls') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.polls;
  END IF;
  
  -- Check and add 'questions'
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'questions') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.questions;
  END IF;
END $$;

-- Verify replica identity (safe to run multiple times)
alter table questions replica identity full;
alter table polls replica identity full;
alter table poll_votes replica identity full;
