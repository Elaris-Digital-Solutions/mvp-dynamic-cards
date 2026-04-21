-- ============================================================
-- SCHEMA MIGRATION COMPLETA: MvpNFC → Nuevo proyecto Supabase
-- Generado: 2026-04-21
--
-- INSTRUCCIONES:
--   1. En el nuevo proyecto: Database → Extensions → habilitar:
--      • pg_trgm   • pgcrypto   • uuid-ossp   • pg_cron
--   2. Pegar TODO este archivo en el SQL Editor del nuevo proyecto
--      y ejecutar en un solo bloque.
--   3. Configurar en Auth Settings:
--      • Confirm email: ON
--      • Leaked password protection: ON
-- ============================================================


-- ─── 1. EXTENSIONES ───────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";


-- ─── 2. FUNCIONES PURAS (sin referencias a tablas) ────────────

CREATE OR REPLACE FUNCTION public.app_lock_key(input text)
  RETURNS bigint
  LANGUAGE sql
  IMMUTABLE
  SET search_path TO 'public', 'pg_catalog'
AS $$
  SELECT ('x' || substr(md5(input), 1, 16))::bit(64)::bigint;
$$;

CREATE OR REPLACE FUNCTION public.app_normalize_username(seed text, uid uuid)
  RETURNS text
  LANGUAGE plpgsql
  SET search_path TO 'public', 'pg_catalog'
AS $$
DECLARE
  raw_value  text;
  normalized text;
BEGIN
  raw_value  := COALESCE(seed, 'user');
  raw_value  := lower(raw_value);
  normalized := regexp_replace(raw_value, '[^a-z0-9_-]', '-', 'g');
  normalized := regexp_replace(normalized, '-{2,}', '-', 'g');
  normalized := trim(both '-' FROM normalized);
  IF normalized = '' THEN normalized := 'user'; END IF;
  RETURN substr(normalized, 1, 50);
END;
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path TO 'public', 'pg_catalog'
AS $$
BEGIN
  NEW.updated_at := timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_full_name()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path TO 'public', 'pg_catalog'
AS $$
BEGIN
  NEW.full_name := NULLIF(trim(concat_ws(' ', NEW.first_name, NEW.last_name)), '');
  RETURN NEW;
END;
$$;


-- ─── 3. TABLAS ────────────────────────────────────────────────

CREATE TABLE public.profiles (
  id                 uuid        NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username           text        NOT NULL UNIQUE,
  full_name          text,
  first_name         text,
  last_name          text,
  email              text        UNIQUE,
  avatar_url         text,
  banner_url         text,
  job_title          text,
  company            text,
  bio                text,
  phone              text,
  whatsapp           text,
  website            text,
  template_id        integer     NOT NULL DEFAULT 1,
  role               text        DEFAULT 'user',
  is_active          boolean     NOT NULL DEFAULT true,
  service_expires_at timestamptz,
  deleted_at         timestamptz,
  created_at         timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at         timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT profiles_username_format_chk CHECK (username ~ '^[a-z0-9_-]{3,20}$')
);

CREATE TABLE public.action_buttons (
  id         uuid        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid        REFERENCES public.profiles(id) ON DELETE CASCADE,
  label      text        NOT NULL,
  url        text        NOT NULL,
  icon       text        NOT NULL DEFAULT 'link',
  sort_order integer     NOT NULL DEFAULT 0,
  is_active  boolean     NOT NULL DEFAULT true,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.click_events (
  id           uuid        NOT NULL DEFAULT gen_random_uuid(),
  profile_id   uuid        NOT NULL,
  button_id    uuid,
  event_type   text        NOT NULL DEFAULT 'button_click',
  user_agent   text,
  ip_hash      text,
  platform     text,
  url          text,
  button_label text,
  metadata     jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
) PARTITION BY RANGE (created_at);

CREATE TABLE public.click_events_default PARTITION OF public.click_events DEFAULT;
CREATE TABLE public.click_events_2026_04 PARTITION OF public.click_events
  FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
CREATE TABLE public.click_events_2026_05 PARTITION OF public.click_events
  FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE public.click_events_2026_06 PARTITION OF public.click_events
  FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE public.click_events_2026_07 PARTITION OF public.click_events
  FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');

CREATE TABLE public.nfc_cards (
  id          uuid        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  card_uid    text        NOT NULL UNIQUE,
  profile_id  uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_active   boolean     DEFAULT true,
  notes       text,
  assigned_at timestamptz,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE public.admin_audit_log (
  id         uuid        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id   uuid        NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  action     text        NOT NULL,
  target_id  text,
  payload    jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);


-- ─── 4. FUNCIONES QUE REFERENCIAN TABLAS ─────────────────────

CREATE OR REPLACE FUNCTION public.app_is_admin()
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
      AND p.is_active = true
      AND p.deleted_at IS NULL
  );
$$;

-- (legacy — no usada en triggers activos, existe por compatibilidad)
CREATE OR REPLACE FUNCTION public.is_admin()
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.block_role_change_if_not_admin()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.app_is_admin() THEN
    RAISE EXCEPTION 'Solo un admin puede cambiar el campo role';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_profile_claims_to_jwt()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data ||
    jsonb_build_object(
      'app_role',      NEW.role,
      'app_is_active', NEW.is_active
    )
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_auth_user_created()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_catalog'
AS $$
DECLARE
  first_name_value   text;
  last_name_value    text;
  full_name_value    text;
  candidate_username text;
BEGIN
  first_name_value := nullif(trim(new.raw_user_meta_data ->> 'first_name'), '');
  last_name_value  := nullif(trim(new.raw_user_meta_data ->> 'last_name'), '');

  full_name_value := COALESCE(
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    nullif(trim(concat_ws(' ', first_name_value, last_name_value)), '')
  );

  candidate_username := public.app_normalize_username(
    COALESCE(
      nullif(new.raw_user_meta_data ->> 'username', ''),
      full_name_value,
      split_part(COALESCE(new.email, new.id::text), '@', 1)
    ),
    new.id
  );

  INSERT INTO public.profiles (
    id, username, full_name, first_name, last_name,
    email, template_id, is_active, created_at, updated_at
  )
  VALUES (
    new.id, candidate_username, full_name_value,
    first_name_value, last_name_value, new.email,
    1, true,
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  )
  ON CONFLICT (id) DO UPDATE SET
    email      = EXCLUDED.email,
    full_name  = COALESCE(public.profiles.full_name,  EXCLUDED.full_name),
    first_name = COALESCE(public.profiles.first_name, EXCLUDED.first_name),
    last_name  = COALESCE(public.profiles.last_name,  EXCLUDED.last_name),
    updated_at = timezone('utc'::text, now());

  RETURN new;
END;
$$;

-- (legacy — no usada en triggers activos)
CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_catalog'
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, email, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    true
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_button_quota()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path TO 'public', 'pg_catalog'
AS $$
DECLARE
  button_count integer;
BEGIN
  SELECT COUNT(*) INTO button_count
  FROM public.action_buttons
  WHERE profile_id = NEW.profile_id
    AND deleted_at IS NULL;

  IF button_count >= 6 THEN
    RAISE EXCEPTION 'Button quota exceeded: maximum 6 buttons per profile'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.app_enforce_action_buttons_limit()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  lock_key     bigint;
  active_links integer;
BEGIN
  IF COALESCE(NEW.is_active, true) = true AND NEW.deleted_at IS NULL THEN
    lock_key := public.app_lock_key(format('action_buttons:%s', NEW.profile_id));
    PERFORM pg_advisory_xact_lock(lock_key);

    SELECT count(*)::integer INTO active_links
    FROM public.action_buttons
    WHERE profile_id = NEW.profile_id
      AND is_active = true
      AND deleted_at IS NULL
      AND (TG_OP = 'INSERT' OR id <> NEW.id);

    IF active_links >= 6 THEN
      RAISE EXCEPTION 'Maximum 6 active links allowed'
        USING ERRCODE = '23514',
              DETAIL = format('profile_id=%s', NEW.profile_id);
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_next_click_events_partition()
  RETURNS void
  LANGUAGE plpgsql
  SET search_path TO 'public', 'pg_catalog'
AS $$
DECLARE
  next_month     DATE := DATE_TRUNC('month', NOW()) + INTERVAL '1 month';
  partition_name TEXT := 'click_events_' || TO_CHAR(next_month, 'YYYY_MM');
  start_date     TEXT := TO_CHAR(next_month, 'YYYY-MM-DD');
  end_date       TEXT := TO_CHAR(next_month + INTERVAL '1 month', 'YYYY-MM-DD');
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = partition_name
  ) THEN
    EXECUTE format(
      'CREATE TABLE public.%I PARTITION OF public.click_events FOR VALUES FROM (%L) TO (%L)',
      partition_name, start_date, end_date
    );
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', partition_name);
    RAISE NOTICE 'Created partition with RLS: %', partition_name;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.drop_old_click_events_partitions()
  RETURNS void
  LANGUAGE plpgsql
  SET search_path TO 'public', 'pg_catalog'
AS $$
DECLARE
  cutoff_month    DATE := DATE_TRUNC('month', NOW() - INTERVAL '90 days');
  partition_month DATE;
  r               RECORD;
BEGIN
  FOR r IN
    SELECT c.relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname ~ '^click_events_\d{4}_\d{2}$'
      AND c.relkind = 'r'
  LOOP
    BEGIN
      partition_month := TO_DATE(
        regexp_replace(r.relname, '^click_events_', ''),
        'YYYY_MM'
      );
      IF partition_month < cutoff_month THEN
        EXECUTE format('DROP TABLE IF EXISTS public.%I', r.relname);
        RAISE NOTICE 'Dropped old partition: %', r.relname;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipped %: %', r.relname, SQLERRM;
    END;
  END LOOP;
END;
$$;


-- ─── 5. ÍNDICES ───────────────────────────────────────────────

-- profiles
CREATE UNIQUE INDEX idx_profiles_username_lower_unique ON public.profiles USING btree (lower(username));
CREATE INDEX        idx_profiles_username              ON public.profiles USING btree (username);

-- action_buttons
CREATE INDEX idx_action_buttons_active_lookup
  ON public.action_buttons USING btree (profile_id, is_active, deleted_at, sort_order);

-- click_events (tabla padre — ONLY)
CREATE INDEX idx_click_events_created_at
  ON ONLY public.click_events USING btree (created_at DESC);
CREATE INDEX idx_click_events_profile_platform
  ON ONLY public.click_events USING btree (profile_id, platform);

-- particiones
CREATE INDEX click_events_2026_04_created_at_idx           ON public.click_events_2026_04 USING btree (created_at DESC);
CREATE INDEX click_events_2026_04_profile_id_platform_idx  ON public.click_events_2026_04 USING btree (profile_id, platform);
CREATE INDEX click_events_2026_05_created_at_idx           ON public.click_events_2026_05 USING btree (created_at DESC);
CREATE INDEX click_events_2026_05_profile_id_platform_idx  ON public.click_events_2026_05 USING btree (profile_id, platform);
CREATE INDEX click_events_2026_06_created_at_idx           ON public.click_events_2026_06 USING btree (created_at DESC);
CREATE INDEX click_events_2026_06_profile_id_platform_idx  ON public.click_events_2026_06 USING btree (profile_id, platform);
CREATE INDEX click_events_2026_07_created_at_idx           ON public.click_events_2026_07 USING btree (created_at DESC);
CREATE INDEX click_events_2026_07_profile_id_platform_idx  ON public.click_events_2026_07 USING btree (profile_id, platform);
CREATE INDEX click_events_default_created_at_idx           ON public.click_events_default  USING btree (created_at DESC);
CREATE INDEX click_events_default_profile_id_platform_idx  ON public.click_events_default  USING btree (profile_id, platform);

-- nfc_cards
CREATE INDEX idx_nfc_cards_profile_id ON public.nfc_cards USING btree (profile_id);

-- admin_audit_log
CREATE INDEX idx_audit_log_admin_id   ON public.admin_audit_log USING btree (admin_id);
CREATE INDEX idx_audit_log_created_at ON public.admin_audit_log USING btree (created_at DESC);


-- ─── 6. VISTAS ────────────────────────────────────────────────

CREATE OR REPLACE VIEW public.public_profiles AS
  SELECT
    id, username, full_name, first_name, last_name,
    email, phone, whatsapp,
    job_title, company, bio,
    avatar_url, banner_url, template_id
  FROM public.profiles
  WHERE is_active = true
    AND deleted_at IS NULL
    AND (service_expires_at IS NULL OR service_expires_at > now());


-- ─── 7. RLS ───────────────────────────────────────────────────

ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_buttons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.click_events   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.click_events_default  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.click_events_2026_04  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.click_events_2026_05  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.click_events_2026_06  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.click_events_2026_07  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nfc_cards      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "app_profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "app_profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "app_profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (((SELECT auth.uid()) = id) OR app_is_admin())
  WITH CHECK (
    app_is_admin() OR (
      (SELECT auth.uid()) = id
      AND role             = (SELECT p.role             FROM profiles p WHERE p.id = (SELECT auth.uid()))
      AND is_active        = (SELECT p.is_active        FROM profiles p WHERE p.id = (SELECT auth.uid()))
      AND NOT (service_expires_at IS DISTINCT FROM
               (SELECT p.service_expires_at FROM profiles p WHERE p.id = (SELECT auth.uid())))
    )
  );

-- action_buttons
CREATE POLICY "app_action_buttons_select_public" ON public.action_buttons
  FOR SELECT TO anon, authenticated
  USING (
    is_active = true AND deleted_at IS NULL AND
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = action_buttons.profile_id
        AND p.is_active = true AND p.deleted_at IS NULL
        AND (p.service_expires_at IS NULL OR p.service_expires_at > now())
    )
  );

CREATE POLICY "app_action_buttons_select_own" ON public.action_buttons
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = profile_id);

CREATE POLICY "app_action_buttons_insert_own" ON public.action_buttons
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = profile_id);

CREATE POLICY "app_action_buttons_update_own" ON public.action_buttons
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = profile_id)
  WITH CHECK ((SELECT auth.uid()) = profile_id);

CREATE POLICY "app_action_buttons_delete_own" ON public.action_buttons
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = profile_id);

-- click_events
CREATE POLICY "app_click_events_insert_public" ON public.click_events
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = click_events.profile_id
        AND p.is_active = true AND p.deleted_at IS NULL
    )
    AND (
      button_id IS NULL OR
      EXISTS (
        SELECT 1 FROM action_buttons ab
        WHERE ab.id = click_events.button_id
          AND ab.profile_id = click_events.profile_id
          AND ab.is_active = true AND ab.deleted_at IS NULL
      )
    )
  );

CREATE POLICY "app_click_events_select_own" ON public.click_events
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = profile_id);

CREATE POLICY "app_click_events_select_admin" ON public.click_events
  FOR SELECT TO authenticated
  USING (app_is_admin());

-- nfc_cards
CREATE POLICY "app_nfc_cards_select_public_active" ON public.nfc_cards
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "app_nfc_cards_select_own_or_admin" ON public.nfc_cards
  FOR SELECT TO authenticated
  USING (app_is_admin() OR profile_id = (SELECT auth.uid()));

CREATE POLICY "app_nfc_cards_insert_admin" ON public.nfc_cards
  FOR INSERT TO authenticated
  WITH CHECK (app_is_admin());

CREATE POLICY "app_nfc_cards_update_admin" ON public.nfc_cards
  FOR UPDATE TO authenticated
  USING (app_is_admin())
  WITH CHECK (app_is_admin());

CREATE POLICY "app_nfc_cards_delete_admin" ON public.nfc_cards
  FOR DELETE TO authenticated
  USING (app_is_admin());

-- admin_audit_log
CREATE POLICY "app_audit_log_select_admin" ON public.admin_audit_log
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );


-- ─── 8. TRIGGERS EN TABLAS PÚBLICAS ───────────────────────────

CREATE TRIGGER trg_sync_full_name
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION sync_full_name();

CREATE TRIGGER trg_profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

CREATE TRIGGER trg_block_role_change_if_not_admin
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION block_role_change_if_not_admin();

CREATE TRIGGER sync_profile_claims
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION sync_profile_claims_to_jwt();

CREATE TRIGGER enforce_button_quota
  BEFORE INSERT ON public.action_buttons
  FOR EACH ROW EXECUTE FUNCTION enforce_button_quota();

CREATE TRIGGER trg_action_buttons_enforce_limit
  BEFORE INSERT OR UPDATE ON public.action_buttons
  FOR EACH ROW EXECUTE FUNCTION app_enforce_action_buttons_limit();

CREATE TRIGGER trg_action_buttons_set_updated_at
  BEFORE UPDATE ON public.action_buttons
  FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();


-- ─── 9. TRIGGER EN auth.users ─────────────────────────────────

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_created();


-- ─── 10. REVOCAR PRIVILEGIOS EXCESIVOS ────────────────────────

DO $$
DECLARE tbl text;
BEGIN
  FOR tbl IN
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename IN ('profiles','action_buttons','click_events','nfc_cards','admin_audit_log')
  LOOP
    EXECUTE format(
      'REVOKE TRUNCATE, REFERENCES, TRIGGER ON public.%I FROM anon, authenticated',
      tbl
    );
  END LOOP;
END;
$$;


-- ─── 11. PG_CRON (requiere pg_cron habilitado en dashboard) ───

SELECT cron.schedule(
  'create-next-click-events-partition',
  '0 0 28 * *',
  'SELECT create_next_click_events_partition()'
);

SELECT cron.schedule(
  'drop-old-click-events-partitions',
  '0 1 1 * *',
  'SELECT drop_old_click_events_partitions()'
);


-- ─── FIN ───────────────────────────────────────────────────────
-- Después de ejecutar este script:
--   1. Auth → Settings → habilitar "Confirm email" y "Leaked password protection"
--   2. Actualizar .env con las nuevas SUPABASE_URL, ANON_KEY y SERVICE_ROLE_KEY
