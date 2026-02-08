-- Allow any user with role 'moderator' to view/update questions for any event
-- This bypasses the need for explicit event_access assignment for the MVP

DROP POLICY IF EXISTS "Moderators view all questions" ON public.questions;
CREATE POLICY "Moderators view all questions" ON public.questions FOR SELECT USING (
  auth.role() = 'authenticated' AND (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'moderator') OR
    EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND created_by = auth.uid())
  )
);

DROP POLICY IF EXISTS "Moderators can update questions" ON public.questions;
CREATE POLICY "Moderators can update questions" ON public.questions FOR UPDATE USING (
  auth.role() = 'authenticated' AND (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'moderator') OR
    EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND created_by = auth.uid())
  )
);
