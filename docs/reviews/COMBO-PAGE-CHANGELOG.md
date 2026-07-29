# COMBO PAGE — CHANGELOG (Volume 13 Audit Fixes)

Ghi theo mẫu `13.11-DESIGN-EVOLUTION-LOG-V1.md` §3.

---

## Entry 1

**Phiên bản:** v1.1 (bản vá sau audit — cải tiến nhỏ, không phải Design System v2)
**Ngày cập nhật:** 2026-07-27
**Trang/module:** Combo (`/combo`, `/combo/tat-ca`)
**Người thực hiện:** Claude Code
**Người phê duyệt:** Chưa (chờ review)
**Trạng thái review:** Chờ review

**Nội dung thay đổi:**

1. **[P1]** Sửa số liệu sai: `stat` của điểm đến "Sa Pa" trong Destination Explorer đổi từ "2 hành trình Combo" → "1 hành trình Combo" để khớp số Combo thực sự `published` (Combo còn lại thuộc Sa Pa đang ở trạng thái `draft`, không hiển thị công khai).
2. **[P2]** Đổi nền `ComboConsultationForm` từ `bg-mv-deep-navy` (phẳng) sang `bg-gradient-mv-consultation` (token có sẵn, đúng mục đích "Section CTA tư vấn" theo BRAND-003 §8) — tránh 2 section navy phẳng liền kề nhau tạo thành một khối tối quá dài.
3. **[P2]** Bổ sung Combo Emotion Layer có kiểm soát theo Volume 13 §13.2/13.3 (Sunset Orange/Sand Beige), dùng đúng khuôn mẫu ngoại lệ additive-token đã có cho Cruise/MICE Gold:
   - Thêm 3 token mới vào `app/globals.css`: `--mv-combo-sunset` (#d97a3f), `--mv-combo-sunset-light` (#f4a86b), `--mv-combo-sand` (#f5e9d8), đăng ký trong khối `@theme inline` để sinh utility class.
   - `combo-hero.tsx`: icon `BadgeCheck` trong dải trust-signal đổi từ `text-mv-sky-cyan` → `text-mv-combo-sunset-light`.
   - `combo-visual-tile.tsx`: thêm viền cam nhạt khi hover (`border-2 border-transparent hover:border-mv-combo-sunset`) cho tile Category/Destination. *(Lưu ý kỹ thuật: ban đầu thử bằng `ring` utility nhưng bị `.shadow-soft` — utility box-shadow tự viết tay của repo — ghi đè vì cả hai cùng set trực tiếp thuộc tính `box-shadow`; đổi sang `border` vì đây là thuộc tính CSS riêng, không xung đột.)*
   - `combo-category-section.tsx`: nền section đổi từ `bg-mv-ice-blue/40` (xanh mát) → `bg-mv-combo-sand/40` (be ấm).

**Lý do:**

- P1: đây là lỗi dữ liệu — số liệu hiển thị không khớp với những gì người dùng thấy thực tế khi lọc theo điểm đến, vi phạm nguyên tắc "không tự tạo dữ liệu nghiệp vụ giả" của brief.
- P2 (gradient token): tránh lặp lại đúng anti-pattern "khối tối quá dài" mà `site-footer.tsx` đã từng ghi nhận và sửa cho khối Newsletter/Footer trước đó.
- P2 (Combo Emotion Layer): Volume 13 §13.2 định nghĩa rõ Combo = "Vacation", Accent = Sunset Orange, nhưng code trước audit dùng nguyên palette Journey Blue/Sky Cyan của Flight, khiến Combo không có bản sắc cảm xúc riêng. Bổ sung có kiểm soát (chỉ icon/hover/nền-1-section, không đổi CTA/Header/Logo) để tuân thủ đồng thời Volume 13 và nguyên tắc "70% Brand Foundation / 30% Emotion Layer" mà không phá kiến trúc màu hệ thống.

**Ảnh hưởng:**

- Chỉ các file trong `components/combo/*`, `lib/combo/combo-data-seed.ts`, và phần bổ sung (không sửa) trong `app/globals.css` (thêm token mới, không đổi token cũ).
- Không đụng Header/Footer/nav, không đụng `mv-button.tsx`, không đụng component dùng chung nào khác ngoài việc dùng token mới trong phạm vi Combo.
- Không đổi business logic, API, schema, hay routing.

**Ghi chú:**

- Đã verify: `pnpm typecheck` ✅, `pnpm lint` ✅, `pnpm test` ✅ (137/137), `pnpm build` ✅ (`/combo` vẫn Static, `/combo/tat-ca` vẫn Dynamic).
- Đã verify bằng trình duyệt (Playwright/Chrome DevTools MCP) trên `pnpm build && pnpm start`, viewport 1440×900: hero hiển thị icon trust-signal màu cam đúng; section "Chọn theo nhu cầu" hiển thị nền be ấm đúng; section form tư vấn hiển thị gradient navy→brand-blue rõ rệt khác với banner CTA navy phẳng phía trên. Riêng trạng thái hover viền cam của `ComboVisualTile` xác nhận đúng ở tầng CSS (rule tồn tại, specificity thắng đúng theo tính toán cascade) nhưng chưa chụp được ảnh hover ổn định do cùng hiện tượng race condition giữa thao tác chuột tự động và thời điểm chụp ảnh đã được ghi nhận trước đó ở `COMBO-LANDING-HANDOVER.md` §6 — không phải lỗi code.
- Console: không có lỗi/warning liên quan Combo trong quá trình verify.
