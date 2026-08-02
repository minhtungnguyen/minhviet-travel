-- 0022_media_asset_checksum.sql
-- Purpose: Sprint 5B round 2, Founder decision — "Replace file" must
-- update Checksum alongside file size/mime type/dimensions. No checksum
-- column exists on media_assets today. Additive only: one nullable text
-- column, no DROP, no DELETE, no default value (existing rows stay null
-- until next replaced/re-uploaded — there is no original file bytes left
-- to retroactively hash from just the DB row).
--
-- SHA-256 hex digest, computed client-side (Web Crypto SubtleCrypto,
-- browser-side — the file never round-trips through a server function
-- just to be hashed) at upload/replace time, written by the same
-- updateAssetAction call that already updates file_size_bytes/mime_type/
-- width/height for a replace.

alter table media_assets add column checksum text;

comment on column media_assets.checksum is
  'SHA-256 hex digest of the file content, computed client-side at upload/replace time. Null for assets uploaded before this column existed.';
