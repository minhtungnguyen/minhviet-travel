# 03 — Database Design

Theo đúng convention `database/migrations/0001`–`0013` (xem `00-current-state-audit.md` §2): `uuid` PK mặc định `gen_random_uuid()`, `created_at`/`updated_at`/`deleted_at timestamptz` (soft-delete), trigger `set_updated_at()` có sẵn, tái dùng enum `entity_status` đã có, mọi bảng nội dung công khai có `website_id uuid not null references websites(id)`, RLS bật cho mọi bảng mới (không có ngoại lệ).

**Migration file đề xuất:** `database/migrations/0016_attraction_ticket_module.sql` + `database/policies/0004_attraction_ticket_policies.sql`. Không đổi bất kỳ file `0001`–`0015` nào đã deploy.

---

## 1. Tái dùng nguyên trạng (không tạo bảng mới)

| Khái niệm trong brief | Bảng có sẵn | Ghi chú |
|---|---|---|
| `Destination` | `destinations` + `destination_translations` | Đã có `destination_type` enum bao gồm `'ATTRACTION'` làm leaf node dưới `DESTINATION` |
| Product category | `product_types` | Đã seed sẵn giá trị `ATTRACTION_TICKET` |
| Ảnh | `media_assets`/`media_folders` | Gallery sản phẩm, ảnh khu vui chơi |
| SEO | `seo_metadata` (polymorphic `entity_type`/`entity_id`) | Gắn cho `attraction_products` |
| Đa tenant | `organizations`→`brands`→`websites` | Mọi bảng mới có `website_id` |
| RBAC | `roles`/`permissions`/`role_permissions` | Thêm permission key mới (§6), không đổi cấu trúc bảng |
| Audit | `audit_logs`/`audit_log_changes` | Gọi `recordAuditLog` có sẵn cho mọi mutation booking |

## 2. Bảng mới

### 2.1. `attraction_venues` — thực thể "Attraction" (khu vui chơi)

```sql
create table attraction_venues (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references websites(id),
  destination_id uuid not null references destinations(id),   -- vị trí địa lý, tái dùng cây destinations
  slug text not null,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  status entity_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (website_id, lower(slug))
);
```

**Vì sao không dùng thẳng `destinations` làm "Attraction"?** `destinations` không có field marketing (highlights, policy, hướng dẫn sử dụng...) và không tách được vai trò "điểm đến du lịch chung" (dùng chung nhiều module: Combo, Tour...) khỏi "khu vui chơi bán vé" (chỉ riêng module này). `attraction_venues` tham chiếu `destination_id` để **định vị**, không nhân bản cây địa lý.

### 2.2. `attraction_venue_translations`

```sql
create table attraction_venue_translations (
  id uuid primary key default gen_random_uuid(),
  attraction_venue_id uuid not null references attraction_venues(id) on delete cascade,
  locale text not null references languages(code),
  name text not null,
  summary text,
  description text,
  usage_guide text,
  policy text,
  highlights jsonb not null default '[]',   -- string[] ngắn, không phải bảng riêng (tránh overengineering)
  unique (attraction_venue_id, locale)
);
```

### 2.3. `attraction_provider_refs` — Dữ liệu B (Provider Reference)

```sql
create table attraction_provider_refs (
  id uuid primary key default gen_random_uuid(),
  attraction_venue_id uuid references attraction_venues(id) on delete cascade,
  attraction_product_id uuid references attraction_products(id) on delete cascade,   -- 1 trong 2 FK có giá trị, không cả 2 (check constraint)
  provider_code text not null default 'ONEINVENTORY',   -- chừa chỗ cho provider khác sau này, KHÔNG xây routing trong V1
  provider_venue_id text,
  provider_product_id text,
  provider_variant_id text,
  last_synced_at timestamptz,
  raw_snapshot jsonb,   -- response gốc đã qua schema validation, phục vụ debug — KHÔNG chứa secret
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (num_nonnulls(attraction_venue_id, attraction_product_id) = 1)
);
```

### 2.4. `attraction_products` — TicketProduct (sản phẩm vé bán trên site)

```sql
create table attraction_products (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references websites(id),
  attraction_venue_id uuid not null references attraction_venues(id),
  product_type_id uuid not null references product_types(id),   -- = ATTRACTION_TICKET
  slug text not null,
  price_from numeric(12,0),   -- snapshot hiển thị nhanh (list/card) — giá thật luôn re-fetch tại detail/checkout
  currency text not null default 'VND',
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  status entity_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (website_id, lower(slug))
);
```

### 2.5. `attraction_product_translations`

```sql
create table attraction_product_translations (
  id uuid primary key default gen_random_uuid(),
  attraction_product_id uuid not null references attraction_products(id) on delete cascade,
  locale text not null references languages(code),
  title text not null,
  summary text,
  description text,
  cancellation_policy text,
  meta_title text,
  meta_description text,
  unique (attraction_product_id, locale)
);
```

### 2.6. `attraction_faqs`, `attraction_cross_sells`

```sql
create table attraction_faqs (
  id uuid primary key default gen_random_uuid(),
  attraction_product_id uuid not null references attraction_products(id) on delete cascade,
  locale text not null references languages(code),
  question text not null,
  answer text not null,
  sort_order integer not null default 0
);

create table attraction_cross_sells (
  id uuid primary key default gen_random_uuid(),
  attraction_product_id uuid not null references attraction_products(id) on delete cascade,
  related_url text not null,   -- link nội bộ Minh Việt (Combo/Tour/Hotel...), không phải FK cứng vì cross-module
  label text not null,
  sort_order integer not null default 0
);
```

> **Open question:** module `faq`/`faq_categories` đã tồn tại sẵn (website-scoped) — cần xác nhận có polymorphic attach theo entity cụ thể hay không trước khi quyết định tái dùng thay vì tạo `attraction_faqs` riêng. Xem `09-open-questions.md`.

### 2.7. `attraction_orders` — Booking (domain Booking/Order đầu tiên toàn hệ thống)

```sql
create type attraction_order_status as enum (
  'INITIATED', 'PENDING_PAYMENT', 'CONFIRMED', 'FAILED', 'CANCELLED', 'VOUCHER_ISSUED'
);

create table attraction_orders (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references websites(id),
  order_code text not null,                         -- mã đơn Minh Việt, hiển thị cho khách
  idempotency_key uuid not null,                     -- chống double-click/double-submit
  provider_code text not null default 'ONEINVENTORY',
  provider_order_id text,                            -- null cho tới khi tạo đơn thành công ở OneInventory
  status attraction_order_status not null default 'INITIATED',
  payment_status text,                                -- theo giá trị OneAPI trả (chưa xác định — xem 09)
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  note text,
  currency text not null default 'VND',
  total_amount numeric(12,0) not null,
  request_snapshot jsonb,       -- payload đã gửi, ĐÃ loại bỏ dữ liệu nhạy cảm (không thẻ, không secret)
  response_reference jsonb,     -- response OneInventory đã qua schema validation
  created_by uuid references user_profiles(id),   -- null nếu guest checkout
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (website_id, order_code),
  unique (idempotency_key)
);
```

### 2.8. `attraction_order_items` — BookingItem

```sql
create table attraction_order_items (
  id uuid primary key default gen_random_uuid(),
  attraction_order_id uuid not null references attraction_orders(id) on delete cascade,
  attraction_product_id uuid not null references attraction_products(id),
  provider_variant_id text not null,
  usage_date date not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,0) not null,
  ticket_holder_name text,     -- nếu provider yêu cầu tên người dùng vé — nullable, tuỳ variant
  created_at timestamptz not null default now()
);
```

### 2.9. `attraction_vouchers`

```sql
create table attraction_vouchers (
  id uuid primary key default gen_random_uuid(),
  attraction_order_id uuid not null references attraction_orders(id) on delete cascade,
  provider_voucher_id text not null,
  download_url text,          -- URL từ OneInventory — cân nhắc proxy qua route nội bộ thay vì lộ thẳng (xem 09)
  hash_code text,              -- OneAPI đã bổ sung hashCode để xác thực truy cập vé (v1.1, ghi trong changelog PDF)
  issued_at timestamptz,
  created_at timestamptz not null default now(),
  unique (attraction_order_id, provider_voucher_id)
);
```

### 2.10. `attraction_content_overrides` — Dữ liệu A (Content Override tổng hợp)

Thay vì rải các cột marketing khắp `attraction_products`/`attraction_venues` (đã đủ ở §2.2/§2.5 cho phần lõi), bảng này dành cho các override **có vòng đời publish riêng** (Draft/Published/Archived, preview trước khi publish — brief §X):

```sql
create table attraction_content_overrides (
  id uuid primary key default gen_random_uuid(),
  attraction_product_id uuid not null references attraction_products(id) on delete cascade,
  lifecycle_status cms_lifecycle_status not null default 'DRAFT',   -- tái dùng enum CMS đã có
  payload jsonb not null,       -- toàn bộ nội dung biên tập ở dạng version snapshot
  published_at timestamptz,
  created_by uuid references user_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

> Quyết định thiết kế: **không** bắt buộc dùng bảng này ngay ở V1 nếu §2.5 (`attraction_product_translations`) đã đủ cho nhu cầu biên tập đơn giản (không cần workflow duyệt nhiều bước). Đây là bảng **tuỳ chọn**, thêm nếu Product Owner xác nhận cần luồng Draft→Review→Publish thật cho nội dung vé (khác Combo/MICE hiện chỉ có seed tĩnh, không có workflow). Xem `09-open-questions.md`.

### 2.11. `attraction_sync_logs`

```sql
create table attraction_sync_logs (
  id uuid primary key default gen_random_uuid(),
  sync_type text not null,     -- 'VENUE' | 'PRODUCT' | 'AVAILABILITY' | 'MANUAL'
  status text not null,        -- 'SUCCESS' | 'FAILED'
  attraction_venue_id uuid references attraction_venues(id),
  attraction_product_id uuid references attraction_products(id),
  error_message text,
  triggered_by uuid references user_profiles(id),
  created_at timestamptz not null default now()
);
```

### 2.12. `attraction_api_error_logs` — brief §X yêu cầu riêng "API error logs" cho CMS

```sql
create table attraction_api_error_logs (
  id uuid primary key default gen_random_uuid(),
  correlation_id uuid not null,
  endpoint text not null,
  http_status integer,
  error_code text,
  error_message text,
  attraction_order_id uuid references attraction_orders(id),
  created_at timestamptz not null default now()
);
```

## 3. Không có bảng "Availability" riêng, không có `Customer` riêng — lý do

- **Availability**: theo §VII brief ("không import toàn bộ dữ liệu động định kỳ nếu chưa cần"), khả dụng luôn hỏi trực tiếp OneInventory tại thời điểm cần, không lưu bảng riêng ở V1. Nếu sau này cần cache ngắn hạn cho performance, thêm bảng `attraction_availability_cache` với TTL rõ ràng — **không thêm trong V1** (đúng nguyên tắc không overengineering).
- **Customer**: V1 là guest checkout (xem `01-product-scope.md`), thông tin khách lưu trực tiếp trên `attraction_orders` (customer_name/phone/email) thay vì bảng `customers` riêng — tránh một bảng chỉ có 3 cột dùng 1 lần. Nếu sau này cần tài khoản khách hàng thật (không phải V1), tách bảng lúc đó.

## 4. RLS Policy (tóm tắt, chi tiết ở migration thật)

- `attraction_venues`, `attraction_products` (+ translations): đọc công khai nếu `status = 'ACTIVE'` **và** không `deleted_at`, giống pattern `cms_pages` public policy; ghi cần permission `attraction_ticket.product.write` + `requireWebsiteAccess`.
- `attraction_orders`, `attraction_order_items`, `attraction_vouchers`: **không có policy đọc công khai** — khách xem đơn của mình qua route nội bộ có xác thực bằng `order_code` + email/hashCode (khớp yêu cầu brief "không công khai identifier nhạy cảm trong URL" + tài liệu OneAPI đã bổ sung email/hashCode để xác thực truy cập, v1.1). Admin đọc qua `resolveActor()` + permission `attraction_ticket.booking.read`.
- `attraction_sync_logs`, `attraction_api_error_logs`: chỉ đọc được bởi staff có permission `attraction_ticket.sync.read` — không public.

## 5. Permission keys mới cần thêm vào bảng `permissions` (seed, không đổi cấu trúc bảng)

```
attraction_ticket.venue.write
attraction_ticket.product.write
attraction_ticket.content.publish
attraction_ticket.booking.read
attraction_ticket.booking.cancel
attraction_ticket.sync.trigger
attraction_ticket.sync.read
```

Gán vào role hiện có (`SUPER_ADMIN`, `ADMIN` full; `BOOKING`/`OPERATION` role có sẵn phù hợp cho `booking.read`/`booking.cancel`) — theo đúng permission catalog dotted-key convention đã dùng (`cms.page.publish`...).
