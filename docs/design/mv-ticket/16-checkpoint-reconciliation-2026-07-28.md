# MV Ticket — Checkpoint Reconciliation (2026-07-28)

**Mục đích:** phiên trước đó (agent session) đã báo cáo lại trạng thái Sprint UI dựa trên nội dung tĩnh của `15-review-package-v1.md` mà không kiểm tra trực tiếp Supabase/code thực tế trước. Điều này tạo ra **documentation drift** — tài liệu nói "CHỜ DUYỆT, chưa apply migration" trong khi thực tế migration đã chạy và phần lớn UI đã được code từ trước. Tài liệu này ghi lại kết quả kiểm chứng trực tiếp (Supabase MCP + đọc code thật) để làm nguồn sự thật, thay thế phần "Trạng thái"/"Việc cần xác nhận" đã lỗi thời ở `15-review-package-v1.md`.

**Nguyên tắc áp dụng:** database schema hiện tại là nguồn sự thật (chủ dự án đã xác nhận). Tài liệu chỉ mô tả lại đúng những gì đã tồn tại — không rollback, không chạy lại migration, không regenerate những gì đã đúng.

---

## 1. Database — đã applied thật (kiểm tra qua Supabase MCP trên `mv-travel-os-dev`, project `otusjahkdjpxqayeeqqn`)

| Artifact | Trạng thái Supabase | Bằng chứng |
|---|---|---|
| `0018_attraction_ticket_categories` | Applied (20260727171209) | `list_migrations` |
| `0006_attraction_ticket_categories_policies` | Applied (20260727171219) | `list_migrations` — 6/6 policy đúng (`public_read_*`/`staff_write_*` cho 3 bảng) |
| `0008_attraction_ticket_categories_seed` | Applied (20260727171232) | `list_migrations` — `attraction_categories` có 6 dòng |
| `0019_attraction_ticket_gallery` | Applied (20260727171237) | `list_migrations` — cột `attraction_products.gallery_images jsonb not null default '[]'::jsonb` tồn tại |
| Permission `attraction_ticket.category.write` | Có trong bảng `permissions` | `execute_sql` |
| `shared/supabase/database.types.ts` (repo) | Khớp schema thật | grep xác nhận có `attraction_categories`/`attraction_category_translations`/`attraction_product_categories`/`gallery_images` |

`pnpm typecheck`/`pnpm lint`/`pnpm test` chạy lại sau kiểm tra: **0 lỗi / 0 lỗi / 158/158 pass** — không có drift giữa code và types.

**Database checkpoint: COMPLETED.** Không cần thao tác gì thêm ở tầng database cho category/gallery V1.

---

## 2. UI — đã code xa hơn những gì `15-review-package-v1.md` mô tả

Đọc trực tiếp `app/ve-vui-choi/page.tsx` và `components/attraction-ticket/*.tsx` (không suy diễn từ docs) cho thấy Sprint UI đã đi quá checkpoint tài liệu, tới giữa `14-implementation-plan.md` §3:

| Bước (`14-implementation-plan.md` §3) | Trạng thái thật | Bằng chứng |
|---|---|---|
| Bước 1 — Token `--mv-ticket-orange`/`-light` | ✅ Done | `app/globals.css:207-208`, đăng ký trong `@theme inline` |
| Bước 2 — 3 Card canonical | ✅ Done | `attraction-product-card.tsx` dùng `attraction-card-trust-toggle.tsx` + `attraction-category-icon.tsx`; `attraction-visual-tile.tsx` dùng chung cho Destination/Brand tile |
| Bước 3 — Hero restructure (60vh, search-centric) | ✅ Done | `attraction-ticket-hero.tsx`, nhận `categories`/`destinations`/`seasonalBanner` |
| Bước 4 — Category Chips | ✅ Done | `attraction-category-chips.tsx` — nhúng trong Hero, dữ liệu category thật từ `catalogService.listCategories()` |
| Bước 5 — Homepage assembly | ✅ Done | `app/ve-vui-choi/page.tsx`: Hero(+Search+Chips) → TrustStrip → **Brand** (`AttractionBrandSection`, D6 bắt buộc, dữ liệu `venue.isFeatured` thật) → **Category rails** (`AttractionCategorySection`, 1 dải/category có ≥1 sản phẩm thật) → Featured("Best Seller") → Destination → Why → FAQ → RelatedLinks → FinalCta |
| Bước 6 — Listing/Category page | ✅ Done | `app/ve-vui-choi/tat-ca/page.tsx`, `[destinationSlug]/page.tsx` dùng `AttractionProductCard` mới |
| Bước 7 — Product Detail | ✅ Done (2026-07-28, cùng phiên reconciliation) | Sticky booking panel desktop (`sticky top-24`); radio loại vé ẩn khi `variantOptions.length === 1` (static info row thay vì radio-card); `galleryImages` plumb xuyên suốt `domain/types.ts` → `schemas/attraction-ticket.schema.ts` → `infrastructure/attraction-ticket.repository.ts` (select `*` đã trả về, chỉ cần map + parse jsonb) → `attraction-catalog.service.ts` (không cần đổi, đi qua nguyên) → `attraction-gallery.tsx` (mới, scroll-snap + đếm 1/N, cùng pattern `onScroll`/`scrollLeft` với `supporting-inspiration-carousel.tsx`) → wire vào Product Detail, fallback về ảnh đơn khi `galleryImages` rỗng |
| Bước 8 — Checkout/Voucher/Result | ✅ Đã audit (2026-07-28) | Đọc toàn bộ `app/ve-vui-choi/ket-qua/[orderCode]/page.tsx` — đã khớp tinh thần "1 trang, không tách checkout riêng" và đủ trạng thái (INITIATED/PENDING_PAYMENT/CONFIRMED/VOUCHER_ISSUED/FAILED/CANCELLED), có tra cứu theo email, tải voucher, hotline, tiếp tục mua. Không cần restyle cho V1 |
| Bước 9 — Corporate Booking entry (D4) | ✅ Done (2026-07-28) | `attraction-final-cta.tsx` repurpose: href `/contact` → `/ve-vui-choi/dat-doan`, copy đổi hướng đoàn/doanh nghiệp. Route mới `app/ve-vui-choi/dat-doan/page.tsx` + `components/attraction-ticket/attraction-corporate-consultation-form.tsx` tái dùng nguyên `ConsultationTabs`/`LeadForm`/`submitLeadAction` (cùng pattern `combo-consultation-form.tsx`/`mice-consultation-form.tsx`), `defaultTab="organization"` |
| Bước 10 — Responsive browser-verify | ✅ Đã verify đủ 5/6 mốc (390/768/1024/1280/1440px) | `pnpm build && pnpm start` + Playwright MCP trên Homepage/Product Detail/`dat-doan` ở cả 5 breakpoint: không có horizontal overflow (`scrollWidth === clientWidth`) ở bất kỳ mốc nào, console không có lỗi mới ngoài các 404 site-wide đã biết (footer/header prefetch `/deals`/`/insurance`/`/services`/`/brand/*`/`/careers`/`/faq`/`/policy/*`/`/destinations`/`/car-rental`, `_vercel/insights`). Ở 1024px, Product Detail chuyển đúng sang layout 2 cột (`lg:grid-cols-[1fr_400px]`, sticky panel bên phải) với đủ 3 loại vé hiển thị đúng radio-card. Xác nhận qua `getComputedStyle`/`getBoundingClientRect` rằng các dải category "trông trống" trên screenshot full-page mobile thực ra có card thật `opacity:1` — cùng race condition chụp ảnh tự động đã ghi nhận ở `COMBO-LANDING-HANDOVER.md` §6, không phải bug. Mốc 360px (thay vì 390px) chưa test riêng — rủi ro thấp, cùng nhóm mobile breakpoint đã verify |

**Phát hiện phụ (không thuộc phạm vi sửa của Sprint UI ticket module):** dropdown "Nhu cầu quan tâm" trong `ConsultationTabs`/`consultation-forms.tsx` (shared component) hiển thị raw `value` ("attraction-ticket", "combo") thay vì label thân thiện ("Vé vui chơi & trải nghiệm", "Combo du lịch") — xác nhận đây là bug **có sẵn từ trước**, tái hiện giống hệt trên `/combo` (giá trị hiển thị "combo"), không phải do `attraction-corporate-consultation-form.tsx` mới gây ra. Không sửa trong phiên này vì đây là shared component ảnh hưởng nhiều landing page khác (Combo/MICE/Custom Tour) — cần xem xét riêng, ngoài phạm vi roadmap Ticket. Dữ liệu hidden input (`source`/`landingIntent`/`serviceType`/`audienceType`) submit đúng, chỉ label hiển thị bị sai — không chặn nghiệp vụ.

**Kết luận UI (sau phiên reconciliation 2026-07-28):** Bước 1–10 đã hoàn tất ở mức đủ tin cậy để coi Sprint UI cho mv-ticket là **xong** cho V1, đã qua `pnpm typecheck`/`lint`/`test` (158/158)/`build` sau mỗi thay đổi. Còn 1 gợi ý follow-up (verify thêm 768/1024/1280px) và 1 bug phụ đã phát hiện nhưng ngoài phạm vi (select label hiển thị sai ở shared ConsultationTabs).

---

## 3. Git — không có mất context giữa 2 phiên

`git reflog` trên `feature/combo-landing-page`: chỉ có các lệnh `checkout` qua lại giữa `master`/`design/flight-homepage-experience`/branch này, không có `reset --hard`/amend nào xoá commit. Toàn bộ code Sprint UI nằm ở working tree dạng untracked/modified — đúng như kỳ vọng cho một nhánh feature chưa commit, không phải dấu hiệu mất dữ liệu.

---

## 4. Quyết định kiến trúc đã chốt (không hỏi lại)

- **A — Gallery:** cột `jsonb` trên `attraction_products` (đã áp dụng đúng, không tạo bảng riêng).
- **B — Checkout:** booking panel inline trên Product Detail (đã đúng hiện trạng — không có route checkout riêng).
- **C — Wireframe:** Marketplace Hero Concept 5 + Experience Commerce Card Concept 4, thứ tự Hero → Search → Brand → Category → Best Seller → Destination → Family Picks → Cross Sell → FAQ. Đối chiếu: "Best Seller" = `AttractionFeaturedSection`; "Family Picks" = dải category "Gia đình & Trẻ em" trong `AttractionCategorySection` (data-driven, không phải section hardcode riêng — đúng tinh thần "1 danh mục = 1 dải tự động" đã chốt ở `14-implementation-plan.md`); "Cross Sell" thuộc Product Detail (bảng `attraction_cross_sells` đã có 3 dòng dữ liệu thật), không phải Homepage.
- **D — Database:** chỉ apply nếu xác nhận chưa chạy — đã xác nhận migration chạy rồi nên không đụng gì thêm ở tầng database.

---

## 5. Việc tiếp theo (Sprint UI, tiếp tục không hỏi lại A–D)

Mục 1–5 (ẩn radio 1 loại vé, plumb `galleryImages` + `AttractionGallery`, repurpose Corporate CTA, route `/ve-vui-choi/dat-doan`, audit trang kết quả) **đã hoàn tất trong cùng phiên 2026-07-28** — xem bảng cập nhật ở §2 trên.

**Còn lại duy nhất:**

6. Browser-verify responsive đầy đủ 6 breakpoint (360/390/768/1024/1280/1440px) cho Homepage, Listing, Product Detail (gallery mới), `/ve-vui-choi/dat-doan`.

**Follow-up không chặn Sprint UI** (ghi nhận, không phải việc phải làm ngay): seed demo `0007_attraction_ticket_demo.sql` chưa có `gallery_images` cho sản phẩm nào nên `AttractionGallery` mới hiện đang fallback về ảnh đơn trong demo hiện tại — cần seed thêm ảnh gallery thật khi có bộ ảnh, không cần sửa code.
