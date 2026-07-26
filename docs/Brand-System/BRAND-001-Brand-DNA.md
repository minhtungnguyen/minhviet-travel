# BRAND-001 — Brand DNA

**Project:** Minh Việt Travel Platform
**Layer:** Emotional Brand Design System
**Version:** 1.0.0
**Áp dụng cho:** Toàn bộ module hiện có và tương lai — Flight, Hotel, Cruise, Tour, Visa, Insurance, MICE, Ticket, AI Assistant.

---

## 0. Vị trí của tài liệu này trong hệ thống

Trước BRAND-001, đã tồn tại ba tầng tài liệu thiết kế/thương hiệu riêng biệt trong repo, không tầng nào bao phủ đủ những gì cần cho một hệ thống đa module:

| Tầng | Phạm vi | Trạng thái |
|---|---|---|
| `MV_Operating_System/brand-strategy/` (Volume 01 Brand Strategy + AI Brand Constitution) | Chiến lược thương hiệu, giọng nói, quản trị AI — cấp **toàn Minh Việt Group** (Travel, MIVIGO, Booking, Checkin) | Đang hiệu lực, **không được mâu thuẫn** |
| `MV_Operating_System/docs/volume-01-design-dna/` | Triết lý thiết kế UI cho riêng Travel Platform — tự nhận là "constitution" nhưng tự khai chưa chốt giá trị cụ thể (hex, scale, ms) | Đang hiệu lực cho phần triết lý; phần giá trị cụ thể được **BRAND-003/004/005 kế thừa và chốt lại** |
| `design-system/` (root) | Lớp token/component thế hệ sau, **chưa được dùng ở bất kỳ route nào** | Roadmap Phase 2 (chưa được duyệt) — không áp dụng ngay |

**BRAND-001 → BRAND-010 (tài liệu này) là tầng tổng hợp và là nguồn chuẩn cho mọi quyết định cảm xúc/thị giác theo từng module**, xây trên nền hai tầng đầu, không thay thế chúng:

- **Không được mâu thuẫn** với `brand-strategy/` — đặc biệt Tone of Voice (Ch.11), 12 Non-negotiables (Ch.13), và AI Brand Constitution (Ch.15, 16 điều khoản + khung rủi ro Level 1–4). BRAND-010 kế thừa trực tiếp từ đây.
- **Kế thừa triết lý** từ `volume-01-design-dna/01,02,03-*.md` (Editorial not promotional, Guided not crowded, Restraint Rules...) — các nguyên tắc này vẫn đúng, BRAND-002 mở rộng chúng theo từng module thay vì thay thế.
- **Chốt lại giá trị cụ thể** (hex màu, kích thước type, thời lượng animation) theo **token đã triển khai thật trong `app/globals.css`** — vì Volume 01 tự nhận giá trị của nó chưa chốt, còn `design-system/` tự nhận chưa được dùng ở đâu. Dùng cái đã chạy thật trên production làm nguồn chuẩn, không dùng cái chưa ai kiểm chứng.
- Khi ba nguồn xung đột (ví dụ ba palette xanh khác nhau), **BRAND-003 → BRAND-009 (tài liệu này) là quyết định cuối cùng** cho mọi việc xây UI mới từ bây giờ.

---

## 1. Minh Việt là gì?

**Lời hứa thương hiệu** (giữ nguyên từ `brand-strategy/VOLUME_01_BRAND_STRATEGY.md`, không diễn giải lại):

> *"Mỗi hành trình đều được thiết kế và vận hành bằng sự tận tâm, chuyên nghiệp và công nghệ để khách hàng luôn an tâm trước, trong và sau chuyến đi."*

Minh Việt không phải một marketplace tự phục vụ (self-serve marketplace) nơi khách tự bơi giữa hàng nghìn lựa chọn và tự chịu rủi ro. Minh Việt là **một tổ chức vận hành du lịch có con người thật đứng sau mỗi giao dịch** — công nghệ (bao gồm AI) là công cụ để người tư vấn làm việc nhanh và chính xác hơn, không phải để thay thế người tư vấn.

**Kiến trúc thương hiệu** (giữ nguyên từ `MASTER-BIBLE/03-Brand-DNA.md`):

```text
Minh Việt Digital Platform
│
├── Minh Việt Travel      ← platform này
├── Minh Việt Booking
├── MIVIGO
├── Checkin Platform
└── MV Travel OS
```

Các thương hiệu con có biểu đạt thị giác riêng nhưng không được vi phạm giá trị cấp Group hay AI Constitution — quy tắc đã ghi tại `brand-strategy/CLAUDE.md`.

---

## 2. Khách hàng cảm thấy gì?

Từ `volume-01-design-dna/01-brand-emotion.md`, đúc kết lại thành 5 cảm xúc nền tảng — **mọi cảm xúc theo module ở BRAND-002 đều là biến thể của 5 cảm xúc này, không phải cảm xúc mới**:

| Cảm xúc | Được tạo ra bởi | Bị phá vỡ bởi |
|---|---|---|
| **Tin cậy** (ưu tiên cao nhất) | Thông tin chính xác, giá minh bạch, ảnh thật, số liệu có trích nguồn | Đếm ngược giả, khan hiếm giả, ảnh stock rẻ tiền, số liệu không nguồn gốc |
| **Tự tin điềm tĩnh** | Luồng thao tác rõ ràng, không dồn ép quyết định | CTA giật gân, popup chặn đường, quá nhiều lựa chọn cùng lúc |
| **Năng lực cao cấp** (premium competence) | Chi tiết hoàn thiện, hiệu năng nhanh, không lỗi vặt | Giao diện vá víu, load chậm, text tràn/lệch |
| **Ấm áp con người** | Ngôn ngữ như người tư vấn thật nói, có hotline thật, có địa chỉ thật | Ngôn ngữ máy móc, chatbot vô hồn, không có đường liên hệ người thật |
| **Công nghệ hiện đại** | AI hỗ trợ ra quyết định, tự động hoá minh bạch (luôn nói rõ đây là AI) | AI giả vờ là người, AI tự ý thực hiện giao dịch, hiệu ứng "tương lai" phô trương |

**Test nhanh cho mọi màn hình mới** (từ `01-brand-emotion.md`, giữ nguyên vì đã đủ sắc bén):

1. Cảm xúc chủ đạo của màn hình này là gì?
2. Cảm xúc đó có đúng với thời điểm hành trình của khách không?
3. Màn hình có toát ra cảm giác rẻ tiền, hỗn loạn, hay đáng ngờ không?
4. Đây có thực sự là một tổ chức vận hành thật, hay chỉ là một template được lắp ráp?
5. Công nghệ đang giúp khách hay đang chỉ để trang trí?
6. Khách có biết chính xác bước tiếp theo là gì không?

---

## 3. Khác biệt với đối thủ — không copy

Đây không phải "chúng tôi tốt hơn X". Đây là **lý do vì sao thiết kế của Minh Việt phải trông khác X**, cụ thể theo từng đối thủ:

### Traveloka
Super-app Đông Nam Á, vận hành theo mô hình gamification: điểm thưởng, mini-game, banner khuyến mãi xoay vòng liên tục, badge giảm giá đỏ rực khắp màn hình. Cảm xúc mục tiêu của Traveloka là **kích thích** (excitement), không phải tin cậy.
→ **Minh Việt không dùng gamification.** Không điểm thưởng nhấp nháy, không banner xoay vòng tự động, không badge đỏ tràn lan. Một trang chỉ có tối đa một khối khuyến mãi, không cạnh tranh sự chú ý với nội dung chính.

### BestPrice.vn
OTA Việt Nam định vị bằng "giá rẻ nhất" — toàn bộ UI xoay quanh so sánh giá, gạch giá cũ, đếm ngược deal. Niềm tin đến từ **cảm giác hời**, không phải từ năng lực vận hành.
→ **Minh Việt không định vị bằng giá rẻ.** Không dùng "giá sốc", "rẻ nhất", "deal khủng" (danh sách từ cấm đã có ở `brand-strategy` Phụ lục B). Giá luôn minh bạch nhưng không phải điểm bán chính — điểm bán chính là được đồng hành bởi người có chuyên môn.

### Booking.com
Marketplace toàn cầu, hàng triệu lựa chọn, thuật toán trung tính không có tính cách — độ tin cậy đến từ **số lượng review**, không phải từ một thương hiệu có bản sắc. Trải nghiệm lạnh, hiệu quả nhưng vô danh.
→ **Minh Việt có bản sắc rõ và có con người thật đứng sau.** Mọi luồng quan trọng (đặt đoàn, MICE, hành trình phức tạp) đều dẫn tới một người tư vấn thật, có tên, có hotline — không kết thúc bằng thuật toán.

### Agoda
UI dày đặc thông tin, đếm ngược liên tục ("Chỉ còn 2 phòng!"), badge chồng badge, tối ưu cho tốc độ chuyển đổi bằng áp lực tâm lý.
→ **Minh Việt cấm khan hiếm giả** (đã ghi rõ ở `02-design-philosophy.md`: cấm artificial scarcity, fabricated urgency). Nếu một chuyến bay/tour thật sự sắp hết chỗ, nói đúng số liệu thật — không đếm ngược trang trí.

### Klook
Marketplace trải nghiệm/hoạt động, thẩm mỹ trẻ trung kiểu mạng xã hội, badge giảm giá dày đặc, nội dung phong cách TikTok.
→ **Minh Việt phục vụ cả khách cá nhân lẫn doanh nghiệp (MICE)** — thẩm mỹ phải đủ nghiêm túc để một giám đốc mua chương trình sự kiện cho công ty vẫn thấy đáng tin, không chỉ đủ vui để một khách trẻ đặt vé công viên.

**Tóm lại điểm khác biệt cốt lõi**: các đối thủ trên đều là marketplace tối ưu cho *chuyển đổi tức thời qua áp lực tâm lý và số lượng lựa chọn*. Minh Việt tối ưu cho *niềm tin qua sự rõ ràng và có người thật chịu trách nhiệm* — chậm hơn một nhịp nhưng bền hơn.

---

## 4. Brand Personality & Archetype

**Archetype chính:** The Guide (Người dẫn đường). **Archetype phụ:** The Sage (Người cố vấn).

Ẩn dụ con người (giữ nguyên từ `brand-strategy`): *một người điềm tĩnh, hiểu biết, lịch thiệp, luôn chuẩn bị kỹ, lắng nghe cẩn thận, nói chính xác, và nhận trách nhiệm.* Cảm giác khách hàng nên có: *"Có người này đồng hành thì mình yên tâm."*

| Thuộc tính | Ý nghĩa khi thiết kế |
|---|---|
| Đáng tin cậy | Không hứa những gì không chắc chắn; mọi con số đều có nguồn |
| Chuyên nghiệp | Layout có trật tự, không có yếu tố thừa |
| Am hiểu | Nội dung đúng ngữ cảnh khách đang cần, không nói chung chung |
| Thông minh | Công nghệ/AI hỗ trợ âm thầm, không phô trương |
| Tinh tế | Khoảng trắng, độ tương phản, chi tiết hoàn thiện — không ồn ào |
| Đồng hành | Luôn có lối ra tới người thật (hotline, tư vấn viên) ở mọi bước quan trọng |

**KHÔNG phải:**
- Người bán rong đường phố (không mặc cả, không hô giá)
- Chợ phiếu giảm giá (không phải coupon marketplace)
- Thương hiệu sang trọng trống rỗng (không sang trọng chỉ để trưng, phải có giá trị thật đứng sau)
- Chatbot vì công nghệ (AI phải phục vụ mục đích thật, không phải để "có AI cho oách")
- Bản sao OTA chung chung (không lặp lại UI Traveloka/Agoda/Klook)

---

## 5. Non-negotiables (không được vi phạm dù bất kỳ module nào)

Kế thừa trực tiếp từ `brand-strategy` Ch.13 và `02-design-philosophy.md`, rút gọn thành checklist áp dụng khi thiết kế:

1. Con người quan trọng hơn doanh thu, doanh thu đến từ niềm tin — không thiết kế nào được đánh đổi niềm tin lấy tỷ lệ chuyển đổi ngắn hạn.
2. Một nguồn sự thật — không hiển thị hai con số khác nhau cho cùng một dữ kiện ở hai nơi.
3. Không tự động hoá những quyết định cần phán đoán con người (xem BRAND-010 §Khung rủi ro AI).
4. Không đếm ngược giả, không khan hiếm giả, không review giả, không giải thưởng bịa.
5. Không có màn hình nào tồn tại mà không trả lời được câu hỏi "khách hàng làm gì tiếp theo?".
6. Riêng tư theo thiết kế (privacy by design) — không thu thập nhiều hơn mức cần.

---

## 6. Checklist áp dụng BRAND-001

- [ ] Thiết kế/nội dung mới có đúng Lời hứa thương hiệu không?
- [ ] Có tạo đúng 1 trong 5 cảm xúc nền tảng, đúng ngữ cảnh không?
- [ ] Có tránh được mọi pattern của Traveloka/BestPrice/Booking.com/Agoda/Klook đã liệt kê ở §3 không?
- [ ] Có vi phạm Non-negotiable nào ở §5 không?
- [ ] Nếu có AI tham gia — đã đọc BRAND-010 và AI Brand Constitution chưa?

---

## Revision History

| Version | Notes |
|---|---|
| 1.0.0 | Khởi tạo — tổng hợp từ MASTER-BIBLE, Volume 01 Design DNA, Brand Strategy, đối chiếu với token đã triển khai thật |

**End of BRAND-001-Brand-DNA.md**
