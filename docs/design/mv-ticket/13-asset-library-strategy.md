# MV Ticket — Asset Library Strategy

**Quyết định đã chốt (D3):** Không hoàn thiện Hero/Card bằng ảnh placeholder. Tài liệu này định nghĩa **ảnh/video lấy từ đâu, theo lộ trình nào**, để "không placeholder" là một quy trình có thể thực thi được, không phải một câu cấm suông.
**Đọc trước:** `07-photography-guideline.md` (tiêu chuẩn chọn ảnh), tiền lệ `docs/Handover/Combo/COMBO-MEDIA-REQUIREMENTS.md` (chiến lược asset đã áp dụng thành công cho Combo — tài liệu này **mô phỏng lại đúng mô hình đó**, không phát minh quy trình mới).

---

## 1. Phân biệt 3 khái niệm — đây là chìa khoá để "không placeholder" nhưng vẫn build được đúng tiến độ

| Loại | Định nghĩa | Được phép dùng để nghiệm thu UI? |
|---|---|---|
| **Placeholder** | Ảnh sai nội dung (landscape/kiến trúc thay vì hành động), dùng tạm không ghi chú, không có kế hoạch thay thế, không đúng `07-photography-guideline.md` | **Không, tuyệt đối cấm** — đây chính xác là lỗi hiện tại (`attraction-ticket-hero.tsx` dùng ảnh Hạ Long Bay tĩnh) |
| **Demo Asset** | Ảnh/video **stock đã cấp phép hợp lệ** (Pexels/Mixkit/Pixabay/Unsplash tương đương), **đúng nội dung theo shot-list `07-photography-guideline.md` §3** (có hành động, có con người, đúng category), được ghi rõ nguồn/giấy phép trong 1 tài liệu tập trung, tham chiếu từ đúng 1 seed file (không hardcode rải rác trong component) | **Có** — đây là mô hình đã dùng thành công cho Combo (`COMBO-MEDIA-REQUIREMENTS.md`) |
| **Production Asset** | Ảnh/video thật của Minh Việt hoặc do venue/đối tác (Sun World, VinWonders...) cung cấp | Mục tiêu cuối cùng, thay thế Demo Asset theo lộ trình — không bắt buộc phải có 100% trước khi ra mắt |

**Kết luận vận hành:** "Không hoàn thiện bằng placeholder" **không có nghĩa là chặn tiến độ chờ ảnh thật 100% Production** — nó có nghĩa là mọi ảnh dùng để nghiệm thu phải tối thiểu đạt chuẩn **Demo Asset** (đúng nội dung, có giấy phép, có tài liệu, có kế hoạch thay thế), không được là ảnh sai nội dung dùng tạm không ghi chú gì. Đây chính là cách Combo đã giải quyết đúng bài toán này trước đó.

---

## 2. Lộ trình 2 giai đoạn

### Giai đoạn 1 — Demo Asset (dùng để build & nghiệm thu UI, thực hiện ở Implementation Plan Phase 2)

- Nguồn: Pexels/Mixkit (License miễn phí thương mại, không cần ghi công — đúng nguồn đã dùng cho Combo).
- Tiêu chí chọn: đúng shot-list persona ở `07-photography-guideline.md` §3 (Show/Theme Park/Water Park/Safari/Gia đình/Couple) — **không chọn ảnh chỉ vì "đúng chủ đề chung chung"**, phải khớp đúng loại hành động/cảm xúc theo từng category cụ thể.
- Mỗi ảnh dùng phải **khác file** giữa các vị trí (Hero ≠ Card ≠ Destination Tile ≠ Venue Tile) — đúng nguyên tắc "không lặp ảnh giữa các section" đã áp dụng cho Combo, tránh cảm giác nghèo nàn nội dung.
- Toàn bộ Demo Asset tập hợp trong 1 file `docs/Handover/Ticket/TICKET-MEDIA-REQUIREMENTS.md` (tạo ở Implementation Plan, không tạo ở Design Bible — xem template §4 dưới) — mọi component đọc path từ seed (`lib/attraction-ticket/*` hoặc tương đương), không hardcode path ảnh trong component.

### Giai đoạn 2 — Production Asset (thay thế dần, không chặn go-live)

- Ưu tiên xin ảnh/video sạch (không watermark/logo nền tảng khác) trực tiếp từ venue/đối tác lớn trước (Sun World, VinWonders — nơi có sẵn thư viện marketing chuyên nghiệp), vì đây là cách nhanh nhất có ảnh thật chất lượng cao mà không cần tự sản xuất.
- Với venue nhỏ hơn không có sẵn thư viện ảnh: cân nhắc chụp/quay thực địa theo đúng shot-list — quyết định ngân sách/lịch trình nằm ngoài phạm vi Design Bible.
- Thay thế theo thứ tự ưu tiên: Hero trang chủ trước (điểm chạm cao nhất) → ảnh card của venue `is_featured` → phần còn lại.
- Việc thay 1 Demo Asset bằng Production Asset là **thao tác 1 dòng trong seed file**, không phải sửa component — đúng kiến trúc đã kiểm chứng ở Combo (`combo-data-seed.ts`).

---

## 3. Vấn đề kỹ thuật cần giải quyết trước Giai đoạn 1 — Gallery chưa có chỗ lưu nhiều ảnh

Theo migration đã áp dụng thật (`database/migrations/0017_attraction_ticket_images.sql`), `attraction_venues`/`attraction_products` hiện chỉ có **1 cặp `image_url`/`image_alt` mỗi bảng** (không phải `media_assets` liên kết nhiều-nhiều như tài liệu `docs/mv-ticket/05-ui-ux-specification.md` từng giả định ban đầu). Điều này đủ cho **Card** (1 ảnh) nhưng **không đủ cho Gallery ở Product Detail** (`03-product-detail-and-checkout-concept.md` §1.4 yêu cầu nhiều ảnh, đếm "1/8").

**Đây là khoảng trống kỹ thuật mới phát hiện, cần xử lý ở Implementation Plan Phase 1C** (không phải quyết định lại ở đây) — 2 hướng khả thi, cùng phong cách với quyết định 0017 (file tĩnh, không phải `media_assets` storage-backed vì đây là nội dung biên tập/seed, không phải upload người dùng):
- (a) Bảng nhỏ `attraction_product_images` (product_id, image_url, image_alt, sort_order) — chuẩn quan hệ, hỗ trợ sắp xếp thứ tự gallery rõ ràng.
- (b) Cột `jsonb`/`text[]` `gallery_images` thêm vào `attraction_products` — đơn giản hơn, đúng tinh thần `highlights jsonb` đã dùng ở `attraction_venue_translations`.

Xem `14-implementation-plan.md` Phase 1C để chốt (a)/(b) cùng lúc với category migration (D2), tránh chạy nhiều migration nhỏ lẻ tẻ liên tiếp không cần thiết.

---

## 4. Template `TICKET-MEDIA-REQUIREMENTS.md` (tạo thật ở Implementation Plan, không tạo ở đây)

Khi Implementation Plan Phase 2 bắt đầu, tài liệu asset thật phải theo đúng khuôn đã kiểm chứng ở Combo:

```markdown
# Ticket Module — Media Requirements

## Production Assets (real Minh Việt/venue-owned, no action needed)
| Path | Used for |

## Demo Assets (licensed stock — for this build only)
### Hero
| Path | Source | License | Used for |
### Product Card (theo category)
| Path | Photo ID | Category | Sản phẩm |
### Destination Tile
| Path | Photo ID | Điểm đến |
### Venue/Brand Tile
| Path | Logo/Ảnh | Venue |
### Gallery (Product Detail — tối thiểu 4–6 ảnh/sản phẩm nổi bật)
| Path | Photo ID | Sản phẩm | Vị trí trong gallery |
```

Mỗi dòng phải ghi rõ nguồn + license (đúng chuẩn Combo), và không ảnh nào bị lặp lại giữa Hero/Card/Gallery của cùng 1 sản phẩm.

---

## 5. Checklist trước khi merge bất kỳ PR nào có ảnh Hero/Card

- [ ] Ảnh có mặt trong `TICKET-MEDIA-REQUIREMENTS.md`, ghi rõ nguồn/license.
- [ ] Ảnh đúng shot-list persona (`07-photography-guideline.md` §3), không phải landscape/kiến trúc không người.
- [ ] Component đọc path từ seed, không hardcode path ảnh trực tiếp.
- [ ] Không trùng ảnh giữa 2 vị trí khác nhau trong cùng 1 trang.
- [ ] Alt text mô tả hành động cụ thể (đúng `07-photography-guideline.md` §7).
- [ ] Nếu đây vẫn là Demo Asset (chưa phải Production), không có gì trong PR khiến người xem UI hiểu nhầm đây đã là ảnh thật của Minh Việt (không tự ý thêm watermark/logo Minh Việt lên ảnh stock).

---

*Tài liệu tiếp theo: `14-implementation-plan.md` — kế hoạch build cụ thể, bắt đầu từ đây.*
