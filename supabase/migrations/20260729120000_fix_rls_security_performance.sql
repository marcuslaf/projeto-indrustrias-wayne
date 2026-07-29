-- ============================================
-- Migration: Fix RLS, Security, Performance
-- ============================================

-- 1. FIX: updated_at trigger function + triggers
CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS set_resources_updated_at ON public.resources;
DROP TRIGGER IF EXISTS set_service_orders_updated_at ON public.service_orders;

CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION private.set_updated_at();

CREATE TRIGGER set_resources_updated_at
    BEFORE UPDATE ON public.resources
    FOR EACH ROW
    EXECUTE FUNCTION private.set_updated_at();

CREATE TRIGGER set_service_orders_updated_at
    BEFORE UPDATE ON public.service_orders
    FOR EACH ROW
    EXECUTE FUNCTION private.set_updated_at();

-- 2. FIX: Remove overly permissive RLS policies and recreate properly

DROP POLICY IF EXISTS "Sistema pode inserir access logs" ON public.access_logs;
DROP POLICY IF EXISTS "Todos podem ver access logs" ON public.access_logs;
DROP POLICY IF EXISTS "system can insert audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Usuarios autenticados podem criar ordens" ON public.service_orders;
DROP POLICY IF EXISTS "Gerente e admin podem atualizar ordens" ON public.service_orders;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios perfis" ON public.profiles;

CREATE POLICY "access_logs_insert_policy" ON public.access_logs
    FOR INSERT TO authenticated
    WITH CHECK (
        (select auth.uid()) IS NOT NULL
        AND user_id = (select auth.uid())
    );

CREATE POLICY "access_logs_select_policy" ON public.access_logs
    FOR SELECT TO authenticated
    USING (
        (select role::text from public.profiles where id = (select auth.uid())) IN ('admin_seguranca', 'gerente')
    );

CREATE POLICY "audit_logs_insert_policy" ON public.audit_logs
    FOR INSERT TO authenticated
    WITH CHECK (
        (select auth.uid()) IS NOT NULL
        AND user_id = (select auth.uid())
    );

DROP POLICY IF EXISTS "admins can read audit_logs" ON public.audit_logs;
CREATE POLICY "audit_logs_select_policy" ON public.audit_logs
    FOR SELECT TO authenticated
    USING (
        (select role::text from public.profiles where id = (select auth.uid())) = 'admin_seguranca'
    );

CREATE POLICY "service_orders_insert_policy" ON public.service_orders
    FOR INSERT TO authenticated
    WITH CHECK ((select auth.uid()) IS NOT NULL);

CREATE POLICY "service_orders_update_policy" ON public.service_orders
    FOR UPDATE TO authenticated
    USING (
        (select role::text from public.profiles where id = (select auth.uid())) IN ('admin_seguranca', 'gerente')
    )
    WITH CHECK (
        (select role::text from public.profiles where id = (select auth.uid())) IN ('admin_seguranca', 'gerente')
    );

CREATE POLICY "profiles_select_self_policy" ON public.profiles
    FOR SELECT TO authenticated
    USING ((select auth.uid()) = id);

-- 3. FIX: Revoke EXECUTE on SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_resource_audit() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_delete_user(user_id uuid) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.delete_old_logs(days integer) FROM public, anon;

-- 4. FIX: Add missing indexes on foreign keys
CREATE INDEX IF NOT EXISTS idx_resources_created_by ON public.resources (created_by);
CREATE INDEX IF NOT EXISTS idx_service_orders_assigned_to ON public.service_orders (assigned_to);
CREATE INDEX IF NOT EXISTS idx_service_orders_created_by ON public.service_orders (created_by);
CREATE INDEX IF NOT EXISTS idx_access_logs_area ON public.access_logs (access_area);
CREATE INDEX IF NOT EXISTS idx_maintenance_history_resource_id ON public.maintenance_history (resource_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_access_time ON public.access_logs (access_time);

-- 5. FIX: Fix handle_new_user search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, username, role, nome, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1)),
        COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'funcionario'),
        COALESCE(NEW.raw_user_meta_data ->> 'nome', split_part(NEW.email, '@', 1)),
        NEW.email
    );
    RETURN NEW;
END;
$$;

-- 6. FIX: Fix get_user_role search_path
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
    select role::text from public.profiles where id = (select auth.uid())
$$;
