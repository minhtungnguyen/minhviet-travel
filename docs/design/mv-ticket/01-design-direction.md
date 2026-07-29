# MV Ticket — Design Direction

**Vai trò áp dụng:** Creative Director · Product Director · Senior UX Researcher · Principal UI Designer · Senior Frontend Engineer.
**Trạng thái:** Đề xuất, chờ phê duyệt. **Không viết code trong tài liệu này và các tài liệu con.**
**Đọc trước:** `docs/design/mv-ticket-ui-research.md`, `MASTER-BIBLE/VOLUME-13-VISUAL-EMOTION-SYSTEM/13.1–13.3`, `docs/mv-ticket/00-current-state-audit.md`, `03-database-design.md`.

---

## 1. Vấn đề gốc, nói thẳng

UI hiện tại của `/ve-vui-choi` (`AttractionTicketHero`, `AttractionProductCard`) dùng đúng công thức của Tour/Combo: ảnh phong cảnh tĩnh (Vịnh Hạ Long) + overlay navy tối + headline serif-display + eyebrow mảnh + card "ảnh - tiêu đề - mô tả - giá từ - link mảnh". Đây **không phải lỗi kỹ thuật** — code sạch, đúng convention. Đây là lỗi **định vị cảm xúc**: một khách mua vé cáp treo Sun World không cần được "truyền cảm hứng" như một khách đang cân nhắc tour Hạ Long 3 ngày 2 đêm. Họ cần biết: có vé không, bao nhiêu tiền, bấm đâu để mua.

Volume 13 Emotion System đã dự liệu đúng việc này từ trước khi module được code (`13.2-EMOTION-DNA.md`: Vé vui chơi = **Excitement**, không phải Trust/Calm của nền tảng). Vấn đề không phải là thiếu tài liệu — là tài liệu Phase 0 (`docs/mv-ticket/05-ui-ux-specification.md`) đã đề xuất tái dùng "DNA giống ComboCard"/pattern `combo-hero.tsx`, và trong lúc build, "tái dùng pattern" đã trượt thành "tái dùng cảm xúc" — đúng cái bẫy mà Traveloka Xperience từng rơi vào (xem research §3).

---

## 2. Khách hàng đang nghĩ gì khi mua vé vui chơi

Không phải: *"Công ty nào sẽ chăm sóc chuyến đi của tôi?"* (mindset Tour/MICE).
Mà là 7 câu hỏi theo đúng thứ tự não bộ xử lý, trong khoảng 8–10 giây trước khi rời trang nếu không có câu trả lời:

1. **Có vé không?** (tồn tại đúng sản phẩm tôi cần)
2. **Giá bao nhiêu?** (số cụ thể, không phải "liên hệ")
3. **Có ưu đãi/giảm giá không?**
4. **Dùng được ngày nào tôi cần?**
5. **Mua/nhận vé mất bao lâu?** (điện tử? cần in không? QR dùng ngay được không?)
6. **Có đáng tin không?** (đủ tin nhanh — không cần đọc nhiều)
7. **Bấm đâu để mua?**

Không có câu hỏi nào trong 7 câu này là *"lịch trình chi tiết ra sao"*, *"công ty tổ chức lâu năm chưa"*, *"có gì đặc biệt về văn hoá điểm đến"*. Đó là câu hỏi của khách Tour. Mọi quyết định thiết kế dưới đây bám theo đúng 7 câu hỏi này, theo đúng thứ tự.

**Test bắt buộc cho mọi màn hình/component từ đây trở đi:**
> "Component này trả lời được câu hỏi nào trong 7 câu trên? Nếu không câu nào — loại bỏ hoặc chuyển xuống cuối trang."

---

## 3. Emotion — khoá lại, không thương lượng

| | MV nền tảng (Volume 01) | **MV Ticket (module này)** |
|---|---|---|
| Chủ đạo | Trust, Calm confidence | **Excitement, Energy** |
| Phụ | Premium competence | **Discovery, Instant booking, Family** |
| Nhịp đọc | Chậm, biên tập, thuyết phục dần | **Nhanh, quét mắt, quyết định trong giây lát** |
| Cấm | Cheap, Chaotic, Outdated, Artificial, Cold (Volume 01 §7 — vẫn áp dụng nguyên vẹn) | *(kế thừa nguyên, không đổi)* |

Việc đổi cảm xúc **không có nghĩa được phép vi phạm các anti-pattern đã cấm ở Volume 01 §7** (cheap/chaotic/artificial vẫn cấm tuyệt đối). "Sôi động" và "rẻ tiền" là hai thứ khác nhau — đúng như user đã phân biệt "Wow" khác "Đẹp". Ranh giới cụ thể:

- Sôi động = ảnh/video có chuyển động thật, màu accent rõ ràng có chủ đích, card mật độ cao nhưng có lưới đều, badge có dữ liệu thật.
- Rẻ tiền (cấm) = vàng tràn lan, giá gạch chéo không có `original_price` thật, đếm ngược không có tồn kho thật, chữ hoa toàn bộ, quá nhiều màu tranh nhau.

**Không dùng:** Luxury, Resort, Silent, cảnh quan flycam tĩnh, overlay đen phủ kín, câu văn dài kiểu tư vấn viên.
**Dùng:** Con người thật (ưu tiên gia đình/trẻ em), chuyển động, roller coaster/cáp treo/show diễn/water park/safari đang *diễn ra* — không phải kiến trúc trống.

---

## 4. Moodboard (mô tả — không có ảnh thật trong tài liệu Phase 0)

Vì repo hiện **chưa có ảnh/video hành động thật** nào cho module này (khác Combo đã có `COMBO-MEDIA-REQUIREMENTS.md` với nguồn ảnh cụ thể — xem `docs/Handover/Combo/`), moodboard ở giai đoạn này là **bản mô tả định hướng để đội hình ảnh/biên tập đi tìm/chụp đúng thứ**, không phải bộ ảnh đã chọn.

**5 loại khung hình bắt buộc phải có trong kho ảnh trước khi build hero thật:**
1. Trẻ em/gia đình đang cười, đang trong hành động (không nhìn thẳng camera tạo dáng — đúng nguyên tắc "tránh cliché" đã áp dụng cho Combo).
2. Chuyển động tốc độ (roller coaster, water slide) — có thể là ảnh chụp tốc độ cao (motion blur nhẹ) hoặc video ngắn.
3. Cáp treo/view từ trên cao đang di chuyển — khác ảnh flycam tĩnh vì có yếu tố "đang đi", có cabin/người trong khung.
4. Show diễn/pháo hoa — ánh sáng rực, đám đông thật (không phải sân khấu trống).
5. Safari/thú/tương tác — khoảnh khắc thật, không dàn dựng.

**Cấm trong moodboard:** ảnh kiến trúc/toàn cảnh không người, ảnh flycam hoàng hôn, ảnh người mẫu tạo dáng nhìn thẳng camera, stock ảnh văn phòng/công sở lồng vào ("gia đình bàn bạc kế hoạch" kiểu ảnh tư vấn tài chính).

**Bảng màu cảm xúc — ĐÃ CHỐT (xem `04-design-system.md` §1):** nền vẫn trắng/sáng theo nguyên tắc Layer 1 Brand Color; **Primary = Minh Việt Blue** (nguyên hệ Navy/Journey Blue/Sky Cyan đã có, không phải màu mới) dùng cho điều hướng/category/trạng thái chọn; **Accent = Festival Orange**, dành riêng cho CTA/giá/badge — tín hiệu "tiền, hành động mua". **Không dùng Purple** — quyết định đã chốt, loại khỏi toàn bộ hệ thống module này. Navy vẫn giữ vai trò text/heading/footer như toàn hệ thống, **không đổi vai trò Navy** dù đổi emotion.

---

## 5. Information Architecture

### 5.1 Sơ đồ trang (giữ nguyên route đã có trong `05-ui-ux-specification.md`, chỉ đổi nội dung/cấu trúc bên trong)

```
/ve-vui-choi                              Trang chủ module (Marketplace Home)
/ve-vui-choi/tat-ca                       Listing tổng — filter/sort/search
/ve-vui-choi/[destinationSlug]            Listing theo điểm đến (SEO-friendly)
/ve-vui-choi/[destinationSlug]/[slug]     Trang sản phẩm (Product Detail)
/ve-vui-choi/dat-ve/[bookingId]           Checkout (nếu tách route — quyết định ở Phase build)
/ve-vui-choi/ket-qua/[orderCode]          Kết quả đặt vé / voucher (đã có route, giữ nguyên)
/ve-vui-choi/dat-doan                     Corporate Booking entry point (D4 — IA có route, form
                                           chưa build đầy đủ ở V1, xem §5.4 và 14-implementation-plan.md)
```

### 5.1.1 Corporate Booking — chừa đường mở (D4, đã chốt)

Route `/ve-vui-choi/dat-doan` được **giữ chỗ trong IA từ đầu**, không phải thêm sau — vì `05-brand-psychology.md` §8 đã xác nhận nhóm Doanh nghiệp không đi theo luồng self-service chính, cần lối rẽ riêng ngay từ điều hướng, không phải sau khi họ đã lạc vào luồng chọn vé cá nhân rồi mới nhận ra không phù hợp. V1 chỉ cần:
- 1 CTA phụ, nhỏ, đặt ở Header phụ hoặc Footer của trang chủ module ("Đặt vé đoàn/Doanh nghiệp") — không cạnh tranh vị trí với CTA "Mua vé" của khách lẻ.
- Route `/ve-vui-choi/dat-doan` render 1 form liên hệ, **tái dùng nguyên `LeadForm`/`ConsultationTabs`** đã có (`components/homepage/lead-form.tsx`, `components/homepage/consultation-tabs.tsx` — đúng pattern đã dùng cho Combo/MICE `combo-consultation-form.tsx`/`mice-consultation-form.tsx`), không xây form/luồng mới.
- Không cần: báo giá tự động theo số lượng, luồng duyệt nội bộ, xuất hoá đơn VAT tự động — các phần này là Phase sau, ngoài phạm vi V1 (đúng như user đã xác nhận "Không cần build hết V1").

### 5.2 Điều hướng chính (nav trong module — khác Tour ở chỗ theo **loại hình trải nghiệm**, không theo vùng miền)

Marketplace phải cho khách lọc theo **họ đang muốn loại vui chơi gì**, không chỉ theo địa lý:

```
Tất cả · Công viên nước · Cáp treo · Show diễn · Safari & Thú · Vui chơi trong nhà · Gia đình & Trẻ em
```

**Khoảng trống schema — ĐÃ CHỐT (D2):** `database/migrations/0016_attraction_ticket_module.sql`/`0017_attraction_ticket_images.sql` hiện **không có bảng category** — `product_types` chỉ có 1 giá trị `ATTRACTION_TICKET` dùng chung toàn module, không phân loại được "Công viên nước" và "Cáp treo". Quyết định cuối: **bảng riêng `attraction_categories` + join `attraction_product_categories`** (phương án (a) trong 2 lựa chọn đã đề xuất trước đó) — **không dùng tag/jsonb**. Migration mới cho bảng này nằm ở `14-implementation-plan.md` Phase 1B, đánh số tiếp sau `0017` (không sửa `0016`/`0017` đã tồn tại).

### 5.3 Cây nội dung trang sản phẩm (thay hoàn toàn "Ngày 1/2/3")

```
Gallery (ảnh/video)
→ Tên vé + Venue + Điểm đến + Giá từ (luôn cùng 1 màn hình đầu, không cuộn mới thấy giá)
→ Vé bán chạy/đã bán bao nhiêu (CHỈ khi có dữ liệu thật — hiện chưa có, xem §7 dưới)
→ Benefits / Included (bullet ngắn — không phải đoạn văn)
→ Chọn loại vé → Chọn ngày → Chọn số lượng → Tổng tiền → Nút mua
→ Cách sử dụng vé (usage_guide — trường đã có trong schema)
→ Chính sách huỷ/đổi (cancellation_policy — trường đã có)
→ Vị trí (map, nếu có toạ độ)
→ FAQ (chỉ hiện khi có FAQ thật)
→ Sản phẩm liên quan (attraction_cross_sells — đã có bảng)
```

Không có mục nào tên "Lịch trình", "Ngày 1", "Điểm dừng chân". Toàn bộ nội dung map trực tiếp vào các trường đã tồn tại trong schema thật (`highlights`, `usage_guide`, `policy`, `cancellation_policy`) — không cần thêm bảng mới cho phần nội dung.

---

## 6. User Journey (mobile-first — 80% khách trên điện thoại theo brief)

```
1. VÀO (Google/social/link) ──► Homepage hoặc thẳng Product Detail (SEO landing)
                                     │
2. QUÉT (3–5 giây) ──────────────────┤ Card trả lời được giá + tên + ảnh ngay không cần chạm
                                     │
3. LỌC (nếu vào Homepage) ──────────┤ Chạm 1 chip loại hình (Công viên nước...) → Listing lọc sẵn
                                     │
4. SO SÁNH (Listing) ────────────────┤ Lướt dọc, không cần mở từng trang mới biết giá/rating
                                     │
5. QUYẾT ĐỊNH (Product Detail) ──────┤ Gallery lướt nhanh → Benefits liếc 3 dòng → thấy Chọn vé ngay
                                     │  không cuộn qua block editorial dài mới tới nút mua
                                     │
6. MUA (Chọn ngày/SL → Checkout) ────┤ Tổng giá CỐ ĐỊNH từ bước chọn vé, không phí ẩn lộ ra ở bước cuối
                                     │  (bài học trực tiếp từ anti-pattern Ticketmaster — research §7)
                                     │
7. NHẬN (Kết quả/Voucher/QR) ────────┤ QR/voucher là màn hình được thiết kế kỹ ngang PDP,
                                     │  không phải "trang xác nhận" xuề xoà
                                     ▼
8. DÙNG NGAY (offline, tại cổng vào) ─ usage_guide hiển thị lại được dễ dàng từ voucher/email
```

Khác biệt cốt lõi với journey Tour hiện tại: không có bước "tư vấn/liên hệ" ở giữa — toàn bộ từ bước 1 đến bước 7 phải tự-phục-vụ (self-service) được, vì đúng emotion "Instant booking" đã khoá ở §3. Nút CTA "Đặt vé" (không phải "Liên hệ tư vấn") xuất hiện lặp lại ở mọi vị trí cuộn trên Product Detail, đúng bài học từ Universal Destinations (research §6).

---

## 7. Kỷ luật dữ liệu thật — không đổi dù đổi emotion

Đổi từ "Trust/Calm" sang "Excitement" **không được phép nới lỏng** nguyên tắc trung thực dữ liệu đã áp dụng nhất quán cho Combo và toàn hệ thống (Volume 01 §3.1, §7 — cấm urgency giả, giá giả, testimonial giả). Áp dụng cụ thể cho Ticket theo đúng những gì schema thật hiện có/chưa có (`03-database-design.md`):

| Tín hiệu muốn hiển thị | Có dữ liệu thật trong schema hiện tại? | Quyết định |
|---|---|---|
| Rating sao / số đánh giá | **Không** — không có bảng review nào | **Ẩn hoàn toàn** cho tới khi có nguồn thật, đúng như `05-ui-ux-specification.md` §4 đã ghi |
| Badge giảm giá % | Có `price_from`, **không có `original_price`** | Không hiển thị badge % cho tới khi thêm field/nguồn giá gốc thật |
| "Đã bán X vé" | Không có bảng thống kê bán hàng public | Không hiển thị số bán giả; nếu cần nổi bật sản phẩm, dùng `is_featured`/`sort_order` với nhãn trung thực "Được đề xuất", không phải "Bán chạy nhất" |
| Đếm ngược Flash Sale | Không có cơ chế campaign/thời hạn trong schema V1 | Không dùng đếm ngược ở V1; nếu có campaign thật sau này, cần trường `discount_ends_at` thật trước khi thiết kế UI đếm ngược |
| Còn bao nhiêu chỗ/vé | Availability hỏi trực tiếp OneInventory real-time (§3 database doc), không cache | Chỉ hiển thị nếu API trả về số lượng thật tại thời điểm xem — không suy đoán |

Đây chính là ranh giới giữa "Sôi động" và "Rẻ tiền/giả tạo" đã nêu ở §3 — module này được phép *trông* sôi động hơn hẳn phần còn lại của site, nhưng không được phép *nói dối* nhiều hơn.

---

## 8. Việc tiếp theo

- `02-homepage-and-listing-concept.md` — Homepage marketplace, Category concept, Card concept (wireframe mô tả).
- `03-product-detail-and-checkout-concept.md` — Product Detail, Checkout, Booking result (wireframe mô tả).
- `04-design-system.md` — Color, Typography, Spacing, Animation, Responsive.

**Không bắt đầu code cho tới khi cả 4 tài liệu (gồm tài liệu này) được phê duyệt rõ ràng.**
