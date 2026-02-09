-- 1. Relax the Insert Policy for Events
-- Old policy: CREATE POLICY "Admins can insert events" ON public.events FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));
-- New policy: Allow any authenticated user to create an event.
DROP POLICY IF EXISTS "Admins can insert events" ON public.events;
CREATE POLICY "Authenticated users can create events" ON public.events FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 2. Establish Trigger to sync auth.users -> public.users
-- This ensures the Foreign Key 'created_by' references a valid public.user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, 'admin') -- Default to admin so they can manage things immediately
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Backfill existing users
-- If the user already exists in auth.users but not public.users, insert them now.
INSERT INTO public.users (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET role = 'admin'; -- Promotes existing users to admin to ensure they can manage events
