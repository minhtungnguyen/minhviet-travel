# BRAND-002 — Emotional Design System

**Project:** Minh Việt Travel Platform
**Layer:** Emotional Brand Design System
**Version:** 1.0.0
**Đọc trước:** BRAND-001-Brand-DNA.md

---

## 0. Nguyên tắc chủ đạo

> Chúng ta không thiết kế 9 giao diện khác nhau cho 9 module. Chúng ta thiết kế **1 hệ thống có 9 sắc thái cảm xúc**.

Điều này nghĩa là (nhắc lại từ nguyên tắc cuối MASTER PROMPT, ràng buộc cho toàn bộ tài liệu này):

**Không đổi theo module:** Logo, Typography chính (BRAND-004), Grid/Layout, Component Architecture, 8 trạng thái bắt buộc của component (BRAND-009), Non-negotiables (BRAND-001 §5).

**Đổi theo module:** Accent color (trong giới hạn palette đã định nghĩa ở BRAND-003), Gradient hướng/tông, Hero treatment, Photography direction, Illustration khi dùng, Motion timing/curve trong giới hạn đã định nghĩa ở BRAND-005, Micro-interaction, Icon accent.

Nếu một sự khác biệt được đề xuất mà không nằm trong danh sách "đổi theo module" ở trên — đó là một lỗi thiết kế, không phải một biến thể hợp lệ.

---

## 1. Emotion Journey (áp dụng cho mọi module)

Kế thừa nguyên vẹn từ `MASTER-BIBLE/04-Emotion-Design.md` — đây là khung cảm xúc xuyên suốt một phiên truy cập, không đổi theo module:

```text
Quan tâm → Tin tưởng → Mong muốn → Quyết định → An tâm → Hài lòng → Sẵn sàng giới thiệu
```

Mỗi module dưới đây định nghĩa **cách module đó thể hiện chuỗi cảm xúc này bằng ngôn ngữ thị giác của riêng nó**, không phải một chuỗi cảm xúc khác.

---

## 2. Ma trận cảm xúc theo module

Mỗi module có: **Cảm xúc chính** (3–5 từ khoá), **Motion**, **Micro-interaction**, **Animation đặc trưng**, **Hero**, **Photography**, **Icon**, **Gradient**, và **Đừng làm gì** (anti-pattern riêng của module đó, ngoài các anti-pattern chung ở BRAND-001 §3).

---

### ✈️ FLIGHT

**Cảm xúc:** Nhanh · Tin cậy · Hiện đại · Thông minh · Linh hoạt (động)

| Khía cạnh | Quy định |
|---|---|
| **Motion** | Nhanh nhất hệ thống — dùng tier `fast` (160ms, BRAND-005). Chuyển động có hướng ngang (trái↔phải), mô phỏng hành trình bay, không mô phỏng nảy/lơ lửng. |
| **Micro-interaction** | Nút đổi chiều điểm đi/đến xoay 180° tức thời (đã triển khai: `flight-search-box.tsx`). Bộ đếm hành khách phản hồi ngay khi bấm, không debounce giả. Kết quả lọc/sắp xếp cập nhật tức thời, không hiện loading giả cho việc vốn dĩ tức thời. |
| **Animation đặc trưng** | Đường bay (flight path) có thể vẽ dần khi load kết quả tìm kiếm — dùng **một lần**, không lặp vô hạn. Không dùng hoạt ảnh "máy bay bay ngang màn hình" lặp lại — đây là cliché OTA giá rẻ. |
| **Hero** | Góc nhìn hành trình thật: cửa sổ máy bay, đường băng, phòng chờ hiện đại, cánh máy bay khi cất/hạ cánh. Không dùng "máy bay giữa trời xanh không mây" (cliché đã cấm ở Volume 01). |
| **Photography** | Ánh sáng tự nhiên, có chuyển động ngầm (motion blur nhẹ chấp nhận được), tông xanh dương-trắng. Xem BRAND-006 §Flight. |
| **Icon** | Line icon mảnh, có hướng rõ (mũi tên, cánh cách điệu tối giản). `PlaneTakeoff`/`PlaneLanding` (Lucide) là chuẩn đã dùng. |
| **Gradient** | `mv-deep-navy → mv-journey-blue → mv-sky-cyan` (đã triển khai: `.bg-gradient-mv-hero`). |
| **Đừng làm gì** | Đừng làm chậm nhịp trang bằng animation trang trí — tốc độ *là* cảm xúc của module này. Đừng dùng đồng hồ đếm ngược giá vé. |

---

### 🏨 HOTEL

**Cảm xúc:** Thư giãn · Resort · Sang trọng nhẹ nhàng · Yên bình

| Khía cạnh | Quy định |
|---|---|
| **Motion** | Chậm hơn Flight rõ rệt — dùng tier `slow` (360ms). Fade là chuyển động chủ đạo, hạn chế slide ngang gấp gáp. |
| **Micro-interaction** | Gallery ảnh chuyển bằng crossfade mượt, không slide giật. Rating hiển thị tĩnh, không đếm số chạy (đếm số chỉ dùng cho thống kê minh bạch có nguồn, xem `CountUp` trong Trust Strip — không dùng cho rating cảm tính). |
| **Animation đặc trưng** | Ken Burns nhẹ trên ảnh hero (đã có sẵn `.animate-kenburns` — zoom rất chậm, 20s) tạo cảm giác "đang ở đó", không phải chuyển động gây chú ý. |
| **Hero** | Không gian phòng/resort thật, có ánh sáng buổi sáng hoặc golden hour nhẹ, khung hình rộng, không cắt cúp gấp gáp. |
| **Photography** | Ấm hơn Flight — tông kem/trắng ấm, ít xanh dương hơn. Xem BRAND-006 §Hotel. |
| **Icon** | Bo góc mềm hơn Flight, hình khối tròn trịa (giường, hồ bơi, spa, chìa khoá phòng). |
| **Gradient** | `mv-deep-navy → paper/sand` (ấm) thay vì thuần xanh dương — khác biệt rõ với Flight để không bị nhầm hai module. |
| **Đừng làm gì** | Đừng dùng nhịp độ nhanh của Flight ở đây — cảm giác vội vàng phá vỡ "thư giãn". Đừng dùng ảnh phòng khách sạn kiểu catalogue vô hồn (thiếu ánh sáng tự nhiên, canh góc đối xứng máy móc). |

---

### 🚢 CRUISE

**Cảm xúc:** Đại dương · Đẳng cấp · Sang trọng · Golden Hour

| Khía cạnh | Quy định |
|---|---|
| **Motion** | Chậm nhất hệ thống — 360–450ms (mở rộng tier `slow`, xem BRAND-005 §ngoại lệ Cruise), easing mô phỏng sóng biển (ease-out êm, không có góc cua gấp). |
| **Micro-interaction** | Card nâng nhẹ khi hover kèm đổ bóng sâu hơn — dùng `.luxury-ring` (đã có sẵn trong `globals.css`), token duy nhất trong hệ thống dành riêng cho cảm giác luxury vật lý (ánh sáng viền + bóng lan toả). |
| **Animation đặc trưng** | Không có hoạt ảnh "vui" nào — sự sang trọng thể hiện qua độ mượt, không qua số lượng hiệu ứng. |
| **Hero** | Full-bleed ảnh/video du thuyền + đường chân trời biển, **bắt buộc golden hour hoặc ánh sáng hoàng hôn/bình minh** — cấm ánh sáng giữa trưa phẳng lì. |
| **Photography** | Xem BRAND-006 §Cruise — tông vàng-cam-xanh navy, có địa bình tuyến (horizon line) làm điểm neo thị giác. |
| **Icon** | Cùng hệ line icon nhưng độ dày nét mảnh hơn 1 bậc — cảm giác tinh xảo hơn. |
| **Gradient** | `mv-deep-navy → gold-soft` — **module duy nhất ngoài MICE được phép dùng vàng vượt quy tắc "chỉ dùng cho icon sao đánh giá"** (xem ngoại lệ tại BRAND-003 §Gold). Giới hạn: chỉ ở dải gradient nền/overlay, không dùng vàng cho nút CTA hay text. |
| **Đừng làm gì** | Đừng dùng ánh sáng ban ngày phẳng cho hero. Đừng lạm dụng vàng ngoài gradient nền — một CTA màu vàng lập tức phá vỡ toàn bộ quy tắc màu hệ thống. |

---

### 🗺️ TOUR

**Cảm xúc:** Khám phá · Adventure · Văn hoá · Bản địa (Local)

| Khía cạnh | Quy định |
|---|---|
| **Motion** | Nhịp trung bình (240ms), **dùng `.reveal`/`.reveal-left`/`.reveal-right` theo scroll nhiều nhất hệ thống** (đã có sẵn trong `globals.css`) — vì Tour có nội dung dạng hành trình dài (itinerary), motion-on-scroll giúp kể chuyện theo nhịp đọc. |
| **Micro-interaction** | Lịch trình (itinerary) từng ngày mở/đóng dạng accordion. Card điểm đến có hiệu ứng zoom ảnh nhẹ khi hover (`.img-zoom`, đã có sẵn). |
| **Animation đặc trưng** | Reveal có hướng khác nhau theo vị trí trong layout (trái/phải/scale) để tạo nhịp điệu khi cuộn — đây là module duy nhất dùng đa dạng hướng reveal, vì nội dung dài nhất. |
| **Hero** | **Ưu tiên con người thật đang trải nghiệm**, không phải phong cảnh trống — khác biệt rõ với Hotel/Cruise (không gian) và Flight (phương tiện). |
| **Photography** | Xem BRAND-006 §Tour — có yếu tố văn hoá địa phương thật (ẩm thực, kiến trúc, con người), không dàn dựng. |
| **Icon** | Icon địa danh/hoạt động (bản đồ, la bàn, máy ảnh) — duy nhất module được phép có icon mang tính "hành trình" cụ thể hơn abstract. |
| **Gradient** | Không cố định một gradient — **đổi theo điểm đến** (destination accent, xem BRAND-003 §Destination Accent), miễn nằm trong palette đã duyệt. |
| **Đừng làm gì** | Đừng dùng ảnh phong cảnh không có con người làm hero chính — Tour bán trải nghiệm, không bán địa lý. Đừng để accordion lịch trình mở sẵn toàn bộ — phá vỡ "guided not crowded". |

---

### 🛂 VISA

**Cảm xúc:** Chuyên nghiệp (Professional) · Quốc tế · Đáng tin cậy

| Khía cạnh | Quy định |
|---|---|
| **Motion** | Tối giản nhất hệ thống — chỉ hover/focus ở tier `fast` (160ms), gần như tĩnh. Cảm giác "chuyên nghiệp" đến từ sự rõ ràng, không phải từ chuyển động. |
| **Micro-interaction** | Progress stepper hồ sơ rõ từng bước (đã nộp / đang xử lý / cần bổ sung / hoàn tất). Checklist giấy tờ tick tức thời khi khách xác nhận đã chuẩn bị. |
| **Animation đặc trưng** | Không có animation trang trí. Duy nhất animation có ý nghĩa nghiệp vụ (đổi trạng thái hồ sơ) mới được dùng. |
| **Hero** | Không cần ảnh lớn cảm xúc — ưu tiên bố cục dạng form/document rõ ràng. Nếu có ảnh, dùng ảnh cửa khẩu/hộ chiếu thật, nghiêm túc, không dàn dựng vui vẻ. |
| **Photography** | Xem BRAND-006 §Visa — tối giản, ít người, ánh sáng trung tính (không golden hour, không ấm). |
| **Icon** | Outline nghiêm ngặt, **không dùng icon "vui"** (không máy bay bay lượn, không icon mặt cười). Icon hộ chiếu, con dấu, tài liệu, đồng hồ (thời gian xử lý). |
| **Gradient** | `mv-deep-navy` đơn sắc hoặc gần như không dùng gradient — không cần accent màu vui vì đây là tác vụ hành chính. |
| **Đừng làm gì** | Đừng mang cảm xúc "hào hứng khám phá" của Tour vào đây — Visa là thủ tục, cảm xúc đúng là sự an tâm nhờ rõ ràng, không phải sự háo hức. |

---

### 🛡️ INSURANCE

**Cảm xúc:** Bảo vệ (Protection) · Bình an · An toàn

| Khía cạnh | Quy định |
|---|---|
| **Motion** | Chậm, êm, không giật — tier `slow` (360ms) cho các chuyển tiếp chính. Cảm giác "được bảo vệ", không phải "được chào bán". |
| **Micro-interaction** | Hoạt ảnh khiên/dấu tích khi xác nhận mua bảo hiểm — **nhẹ, không "ăn mừng" quá mức** (khác Booking Success của Flight/Tour, xem BRAND-005). |
| **Animation đặc trưng** | Không dùng hoạt ảnh gây lo lắng (không mô phỏng tai nạn/rủi ro để bán hàng — vi phạm Non-negotiable "không thao túng cảm xúc tiêu cực"). |
| **Hero** | Gia đình/cá nhân thật trong khoảnh khắc an toàn, bình thường (sân bay, xe, khách sạn) — **không dùng ảnh bệnh viện, tai nạn, hay hình ảnh gây sợ hãi để bán hàng**. |
| **Photography** | Xem BRAND-006 §Insurance — ánh sáng dịu, tông xanh nhạt (`mv-mist-blue`), cảm giác "mọi thứ ổn". |
| **Icon** | Khiên, dấu tích, ô dù — line icon, không filled, không màu đỏ cảnh báo trừ khi thực sự là trạng thái lỗi. |
| **Gradient** | `mv-mist-blue` rất nhẹ, gần trắng — tông dịu nhất hệ thống. |
| **Đừng làm gì** | Đừng bán bảo hiểm bằng nỗi sợ. Đừng dùng đồng hồ đếm ngược "ưu đãi sắp hết hạn" cho sản phẩm bảo vệ — mâu thuẫn trực tiếp với cảm xúc "bình an". |

---

### 🏢 MICE (Sự kiện & Doanh nghiệp)

**Cảm xúc:** Đẳng cấp (Prestige) · Năng lực tổ chức · Chuyên nghiệp

| Khía cạnh | Quy định |
|---|---|
| **Motion** | Chuẩn mực, tier `normal` (240ms), không phô trương — gần Visa nhưng có thêm chuyển động cho data visualization (timeline dự án, dashboard báo giá). |
| **Micro-interaction** | Timeline sự kiện mở rộng theo mốc thời gian. Báo giá cập nhật rõ ràng theo từng lựa chọn dịch vụ thêm/bớt — khách luôn thấy tổng thay đổi ngay, không có "giá ẩn". |
| **Animation đặc trưng** | Data-driven — biểu đồ/timeline dựng hình một lần khi vào viewport, không lặp lại. |
| **Hero** | Ảnh đoàn/hội nghị/sự kiện doanh nghiệp **thật**, không dùng ảnh "bắt tay" cliché stock. Ưu tiên khung cảnh quy mô (hội trường, gala, teambuilding) hơn cận cảnh một người. |
| **Photography** | Xem BRAND-006 §MICE — Navy + Trắng chiếm ưu thế thị giác, giống `13-enterprise-experience.md`. |
| **Icon** | Nghiêm túc, hình khối văn phòng/sự kiện (lịch, địa điểm, số lượng người, ngân sách). |
| **Gradient** | `mv-deep-navy → mv-mice-gold` (đã có token riêng `--mv-mice-gold` trong `globals.css`) — **module thứ hai (cùng Cruise) được phép dùng vàng mở rộng**, vì đây vốn đã là ngoại lệ được ghi nhận trong code hiện tại (comment "MICE section" cạnh token). |
| **Đừng làm gì** | Đừng dùng thẩm mỹ vui tươi của Ticket/Tour ở đây — người mua MICE là người ra quyết định ngân sách doanh nghiệp, cần cảm giác nghiêm túc tương đương một B2B SaaS. |

---

### 🎟️ TICKET (Vé vui chơi / điểm tham quan)

**Cảm xúc:** Nhanh · Vui vẻ (có kiểm soát) · Tiện lợi

| Khía cạnh | Quy định |
|---|---|
| **Motion** | Nhanh như Flight (tier `fast`, 160–200ms) nhưng **"vui" hơn về hướng** — cho phép nảy nhẹ trong giới hạn đã định nghĩa ở BRAND-005 (không vi phạm quy tắc "no bounce" của hệ thống chính, chỉ nhanh và nhẹ nhàng hơn). |
| **Micro-interaction** | Vé/QR hiển thị tức thời sau khi chọn ngày. Bộ chọn ngày trực quan dạng lịch, không dropdown ẩn. |
| **Animation đặc trưng** | Card lật nhẹ hoặc pop nhẹ khi thêm vào giỏ — nhẹ nhàng, không "ăn mừng" ồn ào như game. |
| **Hero** | Ảnh trải nghiệm vui chơi thật (công viên, điểm tham quan, hoạt động) — năng động hơn Tour nhưng vẫn là ảnh thật, không minh hoạ hoạt hình. |
| **Photography** | Xem BRAND-006 §Ticket — sáng, tương phản cao hơn các module khác, nhiều màu sắc tự nhiên của địa điểm (không chỉnh màu giả). |
| **Icon** | Vé, QR, đồng hồ, ghim địa điểm — filled nhẹ được cho phép ở module này (ngoại lệ duy nhất với quy tắc outline mặc định, xem BRAND-008). |
| **Gradient** | `mv-sky-cyan` sáng hơn, ít navy hơn Flight — cảm giác "ngày nắng", nhẹ nhàng hơn nghiêm túc. |
| **Đừng làm gì** | Đừng để "vui vẻ" biến thành lòe loẹt kiểu Klook — vẫn phải giữ tối đa 1 màu nổi bật/màn hình theo Volume 01. |

---

### 🤖 AI ASSISTANT

**Cảm xúc:** Định hướng (Guidance) · Tò mò (Curiosity) · Thông minh nhưng khiêm tốn

| Khía cạnh | Quy định |
|---|---|
| **Motion** | Xuất hiện mượt — fade + slide nhẹ (tier `normal`, 240ms). Trạng thái "đang phân tích" luôn hiển thị rõ ràng (typing indicator/skeleton), không bao giờ im lặng xử lý. |
| **Micro-interaction** | Text xuất hiện dạng streaming (mô phỏng đang soạn), không hiện toàn bộ câu trả lời tức thời cho nội dung dài — giúp khách cảm nhận "đang suy nghĩ" một cách trung thực (không phải giả lập chờ vô nghĩa). |
| **Animation đặc trưng** | Gradient nền rất nhẹ có thể "thở" (animate chậm, biên độ nhỏ) khi AI đang xử lý — dùng `.animate-gradient` đã có sẵn nhưng **giảm biên độ/tốc độ** so với dùng cho marketing banner. |
| **Hero** | **Không có hero ảnh lớn.** AI xuất hiện dạng panel/chat/gợi ý nội tuyến (inline), không chiếm màn hình như một trang đích. |
| **Photography** | Không dùng ảnh người/mascot đại diện AI. |
| **Icon** | Sparkle tối giản (`Sparkles` — Lucide), kích thước nhỏ. **Không dùng icon robot/mặt người** — trực tiếp thực thi quy tắc "AI must not appear as robot mascot" từ `12-ai-experience.md` và AI Brand Constitution. |
| **Gradient** | `mv-journey-blue → mv-sky-cyan`, biên độ rất nhẹ, không chiếm diện tích lớn. |
| **Đừng làm gì** | Đừng nhân hoá AI bằng hình ảnh/mascot. Đừng để hiệu ứng "công nghệ" (particle, glow mạnh, hiệu ứng tương lai) lấn át nội dung câu trả lời — xem `02-design-philosophy.md`: "Intelligent not futuristic". Xem đầy đủ ràng buộc hành vi tại BRAND-010. |

---

## 3. Bảng tổng hợp nhanh (tham chiếu chéo)

| Module | Nhịp Motion | Gradient chính | Ngoại lệ Gold? | Hero là gì |
|---|---|---|---|---|
| Flight | Fast (160ms) | Navy → Journey Blue → Sky Cyan | Không | Cửa sổ/đường băng |
| Hotel | Slow (360ms) | Navy → ấm (paper/sand) | Không | Không gian phòng/resort |
| Cruise | Slowest (360–450ms) | Navy → Gold-soft | **Có** (nền/overlay) | Du thuyền + horizon, golden hour |
| Tour | Normal (240ms), nhiều reveal | Theo điểm đến | Không | Con người đang trải nghiệm |
| Visa | Gần tĩnh (160ms hover only) | Navy đơn sắc | Không | Không cần hero lớn |
| Insurance | Slow (360ms) | Mist Blue nhạt | Không | Gia đình/cá nhân an toàn |
| MICE | Normal (240ms) | Navy → MICE Gold | **Có** | Hội nghị/đoàn doanh nghiệp thật |
| Ticket | Fast (160–200ms) | Sky Cyan sáng | Không | Trải nghiệm vui chơi thật |
| AI Assistant | Normal (240ms) | Journey Blue → Sky Cyan, nhẹ | Không | Không có hero — dạng panel |

---

## Revision History

| Version | Notes |
|---|---|
| 1.0.0 | Khởi tạo — ma trận cảm xúc đầy đủ 9 module |

**End of BRAND-002-Emotional-Design-System.md**
