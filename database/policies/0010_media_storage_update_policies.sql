-- 0010_media_storage_update_policies.sql
-- Purpose: fix "Replace file" in the Media admin (components/admin/media-asset-card.tsx
-- handleReplaceFile) — it re-uploads to the SAME storage path with `upsert: true`,
-- which Supabase Storage executes as an UPDATE on `storage.objects`. The
-- original `media_library_storage_policies` migration (applied 2026-07-30,
-- not tracked in this repo) only granted INSERT/SELECT/DELETE, so every
-- replace attempt fails with 403 "new row violates row-level security
-- policy". Mirrors the existing staff_upload_media_* INSERT policies.

create policy "staff_update_media_public" on storage.objects
  for update to authenticated
  using (bucket_id = 'media-public' and auth_has_permission('media.asset.upload'))
  with check (bucket_id = 'media-public' and auth_has_permission('media.asset.upload'));

create policy "staff_update_media_private" on storage.objects
  for update to authenticated
  using (bucket_id = 'media-private' and auth_has_permission('media.asset.upload'))
  with check (bucket_id = 'media-private' and auth_has_permission('media.asset.upload'));
