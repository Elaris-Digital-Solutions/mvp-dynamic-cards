-- Audit log de acciones administrativas (ítem amarillo #21)
-- Solo el service_role puede INSERT; admins autenticados pueden SELECT.
-- Aplicar en Supabase > SQL Editor.

CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id   uuid        NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  action     text        NOT NULL,   -- update_status | update_expiration | update_role | process_nfc | toggle_nfc | delete_nfc
  target_id  text,                   -- userId o NFC card id afectado
  payload    jsonb,                  -- datos relevantes del cambio
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Admins pueden leer el log; nadie puede escribir/borrar vía RLS (solo service_role)
CREATE POLICY "app_audit_log_select_admin"
  ON public.admin_audit_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- Índice para consultas por admin o por acción reciente
CREATE INDEX IF NOT EXISTS idx_audit_log_admin_id    ON public.admin_audit_log (admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at  ON public.admin_audit_log (created_at DESC);
