-- 0001_core_master_data.sql
-- Idempotent: every insert upserts on its natural key with
-- `do update set ... = excluded...` (not `do nothing`) so `returning id`
-- always yields a row, whether this is the first run or the hundredth —
-- required because later statements in this file reference the ids
-- returned by earlier ones via CTEs.

-- Languages (master-prompt §19: prepare for vi/en/zh/ko/ja; §21 seed
-- explicitly asks for vi + en active — the other three are seeded
-- present-but-inactive so the localization pattern (destination_translations
-- etc.) can be exercised in tests without implying they're live).
insert into languages (code, name, native_name, status) values
  ('vi', 'Vietnamese', 'Tiếng Việt', 'ACTIVE'),
  ('en', 'English', 'English', 'ACTIVE'),
  ('zh', 'Chinese', '中文', 'INACTIVE'),
  ('ko', 'Korean', '한국어', 'INACTIVE'),
  ('ja', 'Japanese', '日本語', 'INACTIVE')
on conflict (code) do update set name = excluded.name, native_name = excluded.native_name;

insert into currencies (code, name, symbol, decimal_digits, status) values
  ('VND', 'Vietnamese Dong', '₫', 0, 'ACTIVE'),
  ('USD', 'US Dollar', '$', 2, 'INACTIVE')
on conflict (code) do update set name = excluded.name;

insert into countries (code, name, native_name, region, default_currency_code, status) values
  ('VN', 'Vietnam', 'Việt Nam', 'Southeast Asia', 'VND', 'ACTIVE')
on conflict (code) do update set name = excluded.name;

-- Provinces referenced by the seeded destinations below.
insert into provinces (country_code, name, code, status) values
  ('VN', 'Hà Nội', 'HN', 'ACTIVE'),
  ('VN', 'Hải Phòng', 'HP', 'ACTIVE'),
  ('VN', 'Quảng Ninh', 'QN', 'ACTIVE')
on conflict (country_code, code) do update set name = excluded.name;

-- Destinations: Vietnam (COUNTRY) -> Hà Nội / Hải Phòng / Quảng Ninh
-- (PROVINCE_CITY) -> Hạ Long / Cát Bà (DESTINATION), per master-prompt §21.
-- `destinations` has no natural key of its own (it's a self-referencing
-- tree), so this block upserts by the one thing that IS unique —
-- destination_translations.slug per locale — via an explicit existence
-- check rather than ON CONFLICT, which keeps re-running this file safe.
do $$
declare
  v_vn_id uuid;
  v_hanoi_id uuid;
  v_haiphong_id uuid;
  v_quangninh_id uuid;
  v_halong_id uuid;
  v_catba_id uuid;
begin
  select id into v_vn_id from destinations where destination_type = 'COUNTRY' and country_code = 'VN' limit 1;
  if v_vn_id is null then
    insert into destinations (destination_type, country_code, status) values ('COUNTRY', 'VN', 'ACTIVE')
    returning id into v_vn_id;
    insert into destination_translations (destination_id, locale, name, slug) values
      (v_vn_id, 'vi', 'Việt Nam', 'viet-nam'),
      (v_vn_id, 'en', 'Vietnam', 'vietnam');
  end if;

  select id into v_hanoi_id from destination_translations where locale = 'vi' and slug = 'ha-noi';
  if v_hanoi_id is null then
    insert into destinations (parent_destination_id, destination_type, country_code, status)
    values (v_vn_id, 'PROVINCE_CITY', 'VN', 'ACTIVE') returning id into v_hanoi_id;
    insert into destination_translations (destination_id, locale, name, slug) values
      (v_hanoi_id, 'vi', 'Hà Nội', 'ha-noi'),
      (v_hanoi_id, 'en', 'Hanoi', 'hanoi');
  end if;

  select id into v_haiphong_id from destination_translations where locale = 'vi' and slug = 'hai-phong';
  if v_haiphong_id is null then
    insert into destinations (parent_destination_id, destination_type, country_code, status)
    values (v_vn_id, 'PROVINCE_CITY', 'VN', 'ACTIVE') returning id into v_haiphong_id;
    insert into destination_translations (destination_id, locale, name, slug) values
      (v_haiphong_id, 'vi', 'Hải Phòng', 'hai-phong'),
      (v_haiphong_id, 'en', 'Hai Phong', 'hai-phong-en');
  end if;

  select id into v_quangninh_id from destination_translations where locale = 'vi' and slug = 'quang-ninh';
  if v_quangninh_id is null then
    insert into destinations (parent_destination_id, destination_type, country_code, status)
    values (v_vn_id, 'PROVINCE_CITY', 'VN', 'ACTIVE') returning id into v_quangninh_id;
    insert into destination_translations (destination_id, locale, name, slug) values
      (v_quangninh_id, 'vi', 'Quảng Ninh', 'quang-ninh'),
      (v_quangninh_id, 'en', 'Quang Ninh', 'quang-ninh-en');
  end if;

  select id into v_halong_id from destination_translations where locale = 'vi' and slug = 'ha-long';
  if v_halong_id is null then
    insert into destinations (parent_destination_id, destination_type, country_code, is_featured, status)
    values (v_quangninh_id, 'DESTINATION', 'VN', true, 'ACTIVE') returning id into v_halong_id;
    insert into destination_translations (destination_id, locale, name, slug) values
      (v_halong_id, 'vi', 'Vịnh Hạ Long', 'ha-long'),
      (v_halong_id, 'en', 'Ha Long Bay', 'ha-long-bay');
  end if;

  select id into v_catba_id from destination_translations where locale = 'vi' and slug = 'cat-ba';
  if v_catba_id is null then
    insert into destinations (parent_destination_id, destination_type, country_code, is_featured, status)
    values (v_haiphong_id, 'DESTINATION', 'VN', true, 'ACTIVE') returning id into v_catba_id;
    insert into destination_translations (destination_id, locale, name, slug) values
      (v_catba_id, 'vi', 'Cát Bà', 'cat-ba'),
      (v_catba_id, 'en', 'Cat Ba', 'cat-ba-en');
  end if;
end $$;

-- Product types (master-prompt §8.5 full fixed list).
insert into product_types (code, name, status) values
  ('TOUR', 'Tour', 'ACTIVE'),
  ('HOTEL', 'Hotel', 'ACTIVE'),
  ('RESORT', 'Resort', 'ACTIVE'),
  ('HOMESTAY', 'Homestay', 'ACTIVE'),
  ('CRUISE', 'Cruise', 'ACTIVE'),
  ('FLIGHT', 'Flight', 'ACTIVE'),
  ('ATTRACTION_TICKET', 'Attraction Ticket', 'ACTIVE'),
  ('EXPERIENCE', 'Experience', 'ACTIVE'),
  ('COMBO', 'Combo', 'ACTIVE'),
  ('TRANSFER', 'Transfer', 'ACTIVE'),
  ('CAR_RENTAL', 'Car Rental', 'ACTIVE'),
  ('VISA', 'Visa', 'ACTIVE'),
  ('INSURANCE', 'Insurance', 'ACTIVE'),
  ('MICE', 'MICE', 'ACTIVE'),
  ('EVENT', 'Event', 'ACTIVE'),
  ('GUIDE_SERVICE', 'Guide Service', 'ACTIVE'),
  ('OTHER', 'Other', 'ACTIVE')
on conflict (code) do update set name = excluded.name;

-- supplier_types was deferred in Sprint 1A.2 (no Supplier domain exists
-- yet) — its seed rows return with that table's own migration.

insert into customer_types (code, name, status) values
  ('INDIVIDUAL', 'Individual', 'ACTIVE'),
  ('CORPORATE', 'Corporate', 'ACTIVE'),
  ('AGENCY', 'Travel Agency', 'ACTIVE'),
  ('GOVERNMENT', 'Government / Public Sector', 'ACTIVE')
on conflict (code) do update set name = excluded.name;
