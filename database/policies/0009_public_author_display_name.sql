-- 0009_public_author_display_name.sql
-- Purpose: Sprint 6 News detail page needs a real author byline
-- (cms_page_versions.created_by -> user_profiles.display_name) on the
-- public /tin-tuc/[slug] route (anon role). user_profiles has no
-- anon-read policy (correctly) and also carries internal fields
-- (account_status, last_login_at, avatar_media_id) that must stay
-- non-public — a blanket anon SELECT policy would leak those via
-- PostgREST's direct table API regardless of what app code selects.
-- A narrow SECURITY DEFINER function (same pattern as the existing
-- auth_has_permission/auth_user_organization_ids/auth_user_website_ids
-- helpers) exposes exactly one column, by id only — no enumeration,
-- no other fields. Approved by Founder 2026-08-05, applied directly to
-- mv-travel-os-dev via Supabase MCP; this file syncs git with the live DB.
create or replace function public_author_display_name(p_user_id uuid)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select display_name from user_profiles where id = p_user_id;
$$;

grant execute on function public_author_display_name(uuid) to anon;
