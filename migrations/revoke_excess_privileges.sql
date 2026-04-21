-- Revocar privilegios SQL no necesarios de anon/authenticated (ítem amarillo #20)
-- TRUNCATE, REFERENCES, TRIGGER no son necesarios para la app — defense in depth.
-- RLS sigue gateando INSERT/UPDATE/DELETE; esto solo elimina superficie innecesaria.
-- Aplicar en Supabase > SQL Editor.

DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename IN ('profiles', 'action_buttons', 'click_events', 'nfc_cards')
  LOOP
    EXECUTE format('REVOKE TRUNCATE, REFERENCES, TRIGGER ON public.%I FROM anon, authenticated', tbl);
  END LOOP;
END;
$$;
