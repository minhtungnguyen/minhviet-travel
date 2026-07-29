# MV Ticket — Implementation Plan (Product/UI)

**Trạng thái (cập nhật 2026-07-28, xem `16-checkpoint-reconciliation-2026-07-28.md`):** Bước 1–7 ở §3 **đã code xong** — token, 3 card canonical, Hero+Search+Category Chips, Homepage assembly đầy đủ, Listing/Category page, sticky booking panel desktop, radio loại vé ẩn khi chỉ có 1 loại, `galleryImages` đã plumb xuyên suốt domain/schema/repository + `AttractionGallery` component đã build và wire vào Product Detail (`pnpm typecheck`/`lint`/`test` 158/158/`build` đều pass). Bước 8 đã audit — `app/ve-vui-choi/ket-qua/[orderCode]/page.tsx` đã khớp tinh thần checkout 1 trang, không cần restyle. Bước 9 (Corporate entry) **đã xong** — `attraction-final-cta.tsx` repurpose sang `/ve-vui-choi/dat-doan`, route mới dùng lại `LeadForm`/`ConsultationTabs` nguyên bản. Bước 10 (responsive 6 breakpoint) **còn lại, chưa browser-verify** sau Sprint UI. Migration `0018`/`0019` đã apply thật lên `mv-travel-os-dev`. Ghi chú follow-up: dữ liệu demo hiện tại (`0007_attraction_ticket_demo.sql`) chưa seed `gallery_images` cho sản phẩm nào — `AttractionGallery` sẽ không hiển thị (đúng thiết kế, fallback về ảnh đơn) cho tới khi có seed gallery thật.
**Phạm vi loại trừ tường minh (theo yêu cầu trực tiếp):** **Không AI** (không gợi ý cá nhân hoá bằng AI, không chatbot, không AI planner) và **không animation phức tạp** (chỉ dùng đúng thông số tối giản đã khoá ở `09-motion-guideline.md` — hover/fade/count-up cơ bản, không thêm hiệu ứng trang trí). Ưu tiên số 1: tạo ra một marketplace vé vui chơi **bán được hàng thật**, không phải một demo trình diễn hiệu ứng.
**Quan hệ với tài liệu backend:** `docs/mv-ticket/06-implementation-plan.md` (Phase 0–7, do đội backend/Phase 0 lập trước Design Bible) vẫn là kế hoạch chủ cho domain Booking/Order/OneInventory. Tài liệu này **không thay thế** kế hoạch đó — nó cụ thể hoá phần UI/Product (chủ yếu nằm trong "Phase 2 — Premium UI" của kế hoạch backend) theo đúng Design Bible, và bổ sung 2 migration mới mà kế hoạch backend chưa liệt kê (category, gallery).

---

## 0. Phát hiện quan trọng trước khi lập kế hoạch — module này KHÔNG phải blank slate

Trước khi viết phase, đã đọc trực tiếp toàn bộ `components/attraction-ticket/*.tsx` hiện có. Kết luận: **đây không phải một bộ khung trống chờ code** — `AttractionBookingPanel` đã gọi thật `/api/v1/attraction-tickets/availability` và `/api/v1/attraction-tickets/bookings`, có idempotency key, error mapping thân thiện, sold-out state, mobile sticky bar. Đây là redesign trên nền một luồng đặt vé **đã chạy được**, không phải xây từ số 0. Hệ quả trực tiếp:

- **Không viết lại logic đặt vé đã đúng** — chỉ restyle/tái cấu trúc trình bày theo Design Bible. Rủi ro lớn nhất của giai đoạn này là vô tình phá vỡ luồng gọi API đang hoạt động khi "làm lại cho đẹp".
- Kế hoạch dưới đây phân biệt rõ 3 loại thay đổi cho mỗi component: **RESTYLE** (giữ nguyên logic, đổi giao diện), **RESTRUCTURE** (đổi vị trí/bố cục trong cây trang, logic giữ nguyên), **NEW** (chưa tồn tại, viết mới).

---

## 1. Kiểm kê component hiện có → hành động cụ thể

| File hiện có | Vai trò hiện tại | Hành động | Ghi chú |
|---|---|---|---|
| `attraction-ticket-hero.tsx` | Hero 85vh, ảnh Hạ Long tĩnh, search box nhỏ dưới headline | **RESTRUCTURE + RESTYLE** | Giảm còn ~60vh (D8), đổi bố cục để Search là trọng tâm (không phải headline), đổi ảnh nền theo `13-asset-library-strategy.md` (Demo Asset đúng shot-list, không phải Hạ Long Bay) |
| `attraction-ticket-search-box.tsx` | 1 field điểm đến + submit | **GIỮ NGUYÊN LOGIC, RESTYLE kích thước** | Đã đúng tinh thần tối giản (`01` §group). Chỉ cần phóng to/đổi vị trí để làm trọng tâm Hero theo D8 — không thêm field |
| `attraction-product-card.tsx` | Ảnh 4:3, "Giá từ" nhỏ, link "Xem vé →" | **RESTYLE toàn diện** | Đây là **Product Card** (Card #1 trong D10) — áp dụng bảng §3.1/3.2 của `02-homepage-and-listing-concept.md`: giá lớn hơn, CTA rõ hơn, badge/rating có điều kiện |
| `attraction-visual-tile.tsx` | Tile ảnh lớn + gradient + caption, dùng chung cho tile | **GIỮ, mở rộng dùng chung** | Đã đúng DNA cho **Destination Tile** (Card #2). Dùng lại nguyên component này cho **Venue/Brand Tile** (Card #3) — chỉ khác data truyền vào, không tạo component mới (đúng D10 "không loại thứ 4") |
| `attraction-destination-section.tsx` | Dải destination, **đã có sẵn `productCount` trong type và đã render "N vé đang bán"** | **RESTYLE nhỏ** | D7 (số trải nghiệm) **đã được implement từ trước** — chỉ cần xác nhận copy "N vé đang bán" có giữ nguyên hay đổi thành "N trải nghiệm" cho đúng giọng điệu Design Bible (khuyến nghị: giữ "vé đang bán", cụ thể hơn "trải nghiệm" và đã đúng tinh thần D7) |
| `attraction-featured-section.tsx` | Dải "Vé nổi bật" dùng `AttractionProductCard` | **GIỮ cấu trúc, RESTYLE theo card mới** | Đã đúng vai trò dải "Được đề xuất hôm nay" ở `02` §1.2. Đổi nhãn "Vé nổi bật" → xác nhận đúng nhãn trung thực (không phải "Bán chạy nhất" — hiện tại "được chọn nhiều nhất" cần xác minh có dữ liệu thật đứng sau không, nếu không có, đổi thành "Được đề xuất") |
| `attraction-why-section.tsx` | 4 icon, đã khá gọn | **GIỮ gần như nguyên** | Đã đúng tinh thần "rút gọn tối đa" (`10-conversion-design.md` §2) — không cần viết lại, chỉ kiểm tra màu icon dùng đúng token mới (`--mv-journey-blue`, không đổi) |
| `attraction-final-cta.tsx` | Banner "Chưa tìm thấy vé phù hợp? → Liên hệ tư vấn" (`/contact`) | **REPURPOSE** | Đây chính xác là section "1 CTA tư vấn cuối trang" mà `02-homepage-and-listing-concept.md` §1.1 đã xác định là sai hướng cho khách lẻ. Thay vì xoá, **tái sử dụng cho Corporate Booking (D4)**: đổi href → `/ve-vui-choi/dat-doan`, đổi copy sang hướng nhóm/doanh nghiệp. Tận dụng đúng `bg-gradient-mv-consultation` đã có — không cần section mới |
| `attraction-booking-panel.tsx` | Radio-card loại vé, date, +/- số lượng, tổng tiền, form liên hệ, submit — đã gọi API thật | **RESTYLE + 2 chỉnh sửa nhỏ** | (1) Ẩn radio loại vé nếu `variantOptions.length === 1` (rule G.54 — hiện chưa có check này); (2) Desktop: chuyển từ layout inline sang sticky panel bên phải (hiện tại không sticky). Logic gọi API/idempotency/error mapping **giữ nguyên 100%** |
| `attraction-faq-section.tsx` | Chưa đọc chi tiết, theo tên đúng vai trò FAQ có điều kiện | **Xác nhận RESTYLE nhẹ** | Kiểm tra đã ẩn đúng khi rỗng theo `05-ui-ux-specification.md` §10 — nếu đã đúng, không cần đổi logic |
| `attraction-order-lookup-form.tsx` | Tra cứu đơn hàng, ngoài phạm vi Design Bible (không phải luồng marketplace/booking chính) | **KHÔNG ĐỘNG VÀO** | Chức năng độc lập, không nằm trong 12 tài liệu Design Bible |

### 1.1 Component MỚI cần viết (chưa tồn tại)

| Component mới | Vai trò | Vì sao cần mới (không tái dùng được) |
|---|---|---|
| `attraction-category-chips.tsx` | Quick Category Chips (`02` §1.2), dùng ở Homepage + làm filter ở Listing | Chưa có tương đương — dải chip cuộn ngang với icon (`08-iconography.md` §3) |
| `attraction-category-section.tsx` | Dải sản phẩm theo category ("Công viên nước & Cáp treo"...) | Tái dùng `AttractionProductCard`, nhưng khối/data-fetching theo category là mới (phụ thuộc migration Phase 1B) |
| `attraction-brand-section.tsx` | Dải "Thương hiệu/Khu vui chơi nổi bật" — **BẮT BUỘC (D6)** | Tái dùng `AttractionVisualTile` (như Destination Tile) nhưng cần section wrapper mới với data từ `attraction_venues.is_featured` |
| `attraction-gallery.tsx` | Gallery nhiều ảnh ở Product Detail | Chưa tồn tại — phụ thuộc migration Phase 1C (gallery images) |
| `app/ve-vui-choi/dat-doan/page.tsx` | Corporate Booking entry point (D4) | Route mới, tái dùng `LeadForm`/`ConsultationTabs` có sẵn — không viết form mới |

---

## 2. Migration mới cần thêm (trước khi UI category/gallery có dữ liệu thật)

Đánh số tiếp theo `0017_attraction_ticket_images.sql` đã có — **không sửa `0016`/`0017`**.

### Phase 1B — `0018_attraction_ticket_categories.sql` (D2)

- `attraction_categories` (id, website_id, slug, sort_order, icon_key — text ngắn map sang tên icon Lucide theo `08-iconography.md` §3) + `attraction_category_translations` (name).
- `attraction_product_categories` (attraction_product_id, attraction_category_id) — join thuần, không có cột thừa.
- Seed 6–7 category theo danh sách đã chốt ở `01-design-direction.md` §5.2: Công viên nước, Cáp treo, Show diễn, Safari & Thú, Vui chơi trong nhà, Gia đình & Trẻ em.
- RLS: đọc công khai nếu category thuộc website hiện tại (không có trạng thái publish riêng — category là taxonomy tĩnh, không phải content có vòng đời).

### Phase 1C — Gallery ảnh nhiều tấm (quyết định (a)/(b) ở `13-asset-library-strategy.md` §3)

Đề xuất chốt tại đây (đơn giản hơn, nhất quán với `highlights jsonb` đã dùng): thêm cột `gallery_images jsonb not null default '[]'` vào `attraction_product_translations` hoặc `attraction_products` (quyết định cụ thể: đặt ở `attraction_products` vì ảnh không đổi theo locale, khác `highlights` vốn là nội dung dịch) — mỗi phần tử `{url, alt, sortOrder}`. Không tạo bảng riêng — khối lượng dữ liệu nhỏ (tối đa ~8 ảnh/sản phẩm), không cần join.

---

## 3. Thứ tự build — Mobile First tuyệt đối (D9)

Không có bước nào build song song desktop+mobile. Mỗi bước dưới đây: **thiết kế/code mobile trước → browser-verify mobile (360/390px) → mới mở rộng breakpoint lớn hơn (768/1024/1280/1440px)**.

### Bước 1 — Design System foundation
- Thêm token `--mv-ticket-orange`/`--mv-ticket-orange-light` vào `app/globals.css` (additive, theo `04-design-system.md` §1.2).
- Xác nhận không còn token `--mv-ticket-purple*` nào sót lại trong bất kỳ nhánh nào khác.

### Bước 2 — 3 Card canonical (D10) — làm trước vì mọi section khác phụ thuộc vào đây
1. `AttractionProductCard` — restyle theo `02` §3.1/3.2 (mobile 1 cột trước).
2. `AttractionVisualTile` — xác nhận dùng chung được cho cả Destination Tile và Venue/Brand Tile chỉ bằng props khác nhau; nếu cần, thêm 1 prop `variant?: 'destination' | 'brand'` cho khác biệt nhỏ (vd. tỷ lệ ảnh vuông hơn cho brand) — không tách file mới nếu chỉ khác 1–2 thuộc tính thị giác.

### Bước 3 — Hero + Search (D8)
- Restructure `attraction-ticket-hero.tsx`: ~60vh, Search làm trọng tâm bố cục.
- Ảnh nền: Demo Asset đầu tiên cần có (ưu tiên cao nhất trong `13-asset-library-strategy.md` §2).

### Bước 4 — Category Chips (mới)
- `attraction-category-chips.tsx` — chờ Phase 1B (migration category) có dữ liệu thật; có thể code UI trước với dữ liệu tạm từ fixture nội bộ (không phải mock hiển thị cho khách — chỉ dùng trong dev), nhưng **không merge/nghiệm thu tính năng này tới khi có category thật**.

### Bước 5 — Homepage assembly (Marketplace)
Ghép theo đúng thứ tự đã khoá ở `02-homepage-and-listing-concept.md` §1.2, dùng lại các section đã restyle: Hero+Search → Category Chips → Được đề xuất (`attraction-featured-section.tsx`) → Theo điểm đến (`attraction-destination-section.tsx`) → Theo category (mới, sau Phase 1B) → **Thương hiệu nổi bật — bắt buộc** (`attraction-brand-section.tsx`, mới) → Vì sao mua ở đây (`attraction-why-section.tsx`, giữ) → FAQ (giữ, có điều kiện).

### Bước 6 — Listing/Category page
- Filter ngang, grid 2 cột mobile → tái dùng `AttractionProductCard`.

### Bước 7 — Product Detail
- Gallery (chờ Phase 1C) → Benefits → **Booking Panel restyle** (sticky desktop, ẩn radio khi 1 loại vé) → usage_guide/cancellation_policy → map → FAQ → cross-sell.
- Đây là bước rủi ro cao nhất về mặt hồi quy (regression) vì đụng vào `AttractionBookingPanel` đang gọi API thật — bắt buộc test lại toàn bộ luồng đặt vé (availability check, submit, idempotency, sold-out, error state) sau khi restyle, không chỉ kiểm tra giao diện.

### Bước 8 — Checkout/Voucher/Result
- Theo `03-product-detail-and-checkout-concept.md` §2–3 — xác nhận route hiện tại (`app/ve-vui-choi/ket-qua/[orderCode]/page.tsx` đã tồn tại) có cần restructure hay chỉ restyle; cần đọc file này trước khi ước lượng — **chưa đọc trong phiên lập kế hoạch này, việc đầu tiên khi bắt đầu Bước 8**.

### Bước 9 — Corporate Booking entry point (D4)
- `attraction-final-cta.tsx` → repurpose (xem §1).
- `app/ve-vui-choi/dat-doan/page.tsx` → mới, tái dùng `LeadForm`/`ConsultationTabs`.

### Bước 10 — Responsive mở rộng + browser-verify toàn bộ 6 breakpoint
- 360/390/768/1024/1280/1440px theo `04-design-system.md` §5 — mỗi bước 1–9 ở trên chỉ coi là xong khi qua được bước này, không phải khi code xong trên 1 kích thước màn hình.

---

## 4. Definition of Done — áp dụng cho mọi component ở trên

Một component/section chỉ được coi là hoàn thành khi:

1. Qua checklist `04-design-system.md` §6.
2. Trả lời được câu hỏi Conversion (`10-conversion-design.md` §1) nếu là 1 section mới.
3. Có Emotion chủ đạo xác định rõ (`06-design-emotion-map.md` §4) nếu là 1 màn hình/khối lớn.
4. Không vi phạm bất kỳ luật nào trong `12-design-rules.md` (100 + 10 addendum).
5. Nếu là component đã có logic hoạt động thật (booking panel, search box) — **luồng chức năng cũ chạy đúng như trước khi restyle**, xác nhận bằng test thủ công lại đúng luồng gọi API, không chỉ nhìn giao diện.

---

## 5. Ngoài phạm vi (xác nhận lại, không đưa vào bất kỳ bước nào ở trên)

- AI recommendation/chatbot/AI planner dưới mọi hình thức.
- Animation ngoài thông số đã khoá ở `09-motion-guideline.md` (không thêm hiệu ứng "cho đẹp").
- Wishlist (D5).
- Flash Sale/Trending/Best Seller thật, Recommendation cá nhân hoá thật (`11-marketplace-strategy.md` §1 — thiếu nền tảng dữ liệu).
- Luồng đặt đoàn đầy đủ (báo giá tự động, duyệt nội bộ, VAT) — chỉ entry point (D4).
- Đổi bất kỳ file dùng chung ngoài module (`site-header.tsx`, `site-footer.tsx`, `mv-button.tsx`...) — mọi thay đổi nằm trong `components/attraction-ticket/**`, `app/ve-vui-choi/**`, `lib/attraction-ticket/**`, và migration mới `0018+`.

---

*Đây là tài liệu cuối cùng của Design Bible v1.0. Sau khi xác nhận, bước tiếp theo là thực thi Bước 1 ở §3 — bắt đầu bằng code thật.*
