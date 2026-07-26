# Brand-System — Emotional Brand Design System

**Project:** Minh Việt Travel Platform
**Version:** 1.0.0

---

Tầng tiêu chuẩn thiết kế cảm xúc chung cho toàn bộ Minh Việt Travel Platform — mọi module (hiện có và tương lai) đều phải tuân thủ khi có bất kỳ thay đổi UI/UX nào.

## Đọc theo thứ tự

1. **BRAND-001-Brand-DNA.md** — Minh Việt là gì, khách hàng cảm thấy gì, khác biệt với Traveloka/BestPrice/Booking.com/Agoda/Klook, vị trí của bộ tài liệu này so với các tài liệu thiết kế/thương hiệu đã có trước.
2. **BRAND-002-Emotional-Design-System.md** — Ma trận cảm xúc chi tiết cho 9 module: Flight, Hotel, Cruise, Tour, Visa, Insurance, MICE, Ticket, AI Assistant.
3. **BRAND-003-Color-System.md** — Toàn bộ token màu đã triển khai thật, quy tắc tỷ lệ, quy tắc Gold, accent theo module.
4. **BRAND-004-Typography.md** — Font, type scale, quy tắc dùng.
5. **BRAND-005-Motion-Language.md** — Token thời lượng/easing thật, bảng ngữ cảnh (hover/loading/success/error/booking/payment...).
6. **BRAND-006-Photography.md** — Composition/lighting/tone/emotion theo từng module.
7. **BRAND-007-Illustration.md** — Khi nào được/không được dùng minh hoạ, phong cách.
8. **BRAND-008-Iconography.md** — Lucide, size, style, ngoại lệ.
9. **BRAND-009-Component-Personality.md** — Ranh giới giữa kiến trúc component bất biến và cá tính theo module.
10. **BRAND-010-AI-Personality.md** — Giọng nói AI theo module, ràng buộc chặt bởi AI Brand Constitution.

## Nguyên tắc cốt lõi (nhắc lại, áp dụng xuyên suốt cả 10 file)

**Không đổi theo module:** Logo, Typography chính, Grid, Component Architecture.
**Chỉ đổi theo module:** Accent, Gradient, Hero, Photography, Illustration, Motion, Micro-interaction.

## Quan hệ với tài liệu đã có trước

Bộ tài liệu này **không thay thế** `MV_Operating_System/brand-strategy/` (chiến lược/giọng nói/quản trị AI cấp Group) hay triết lý của `MV_Operating_System/docs/volume-01-design-dna/` — nó **tổng hợp, cụ thể hoá theo module, và chốt lại giá trị cụ thể** (hex, ms, px) dựa trên token đã triển khai thật trong `app/globals.css`, vì ba nguồn tài liệu thiết kế cũ từng đưa ra ba bộ giá trị khác nhau chưa được thống nhất. Chi tiết đầy đủ về quyết định này nằm ở BRAND-001 §0.

Khi có xung đột giữa tài liệu này và bất kỳ tài liệu thiết kế nào khác (trừ `brand-strategy/` — luôn ưu tiên tuyệt đối) — **BRAND-001 → BRAND-010 là quyết định cuối cùng** cho mọi công việc thiết kế/frontend mới kể từ phiên bản 1.0.0.

**End of README.md**
