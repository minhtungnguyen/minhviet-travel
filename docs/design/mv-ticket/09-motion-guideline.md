# MV Ticket — Motion Guideline (Conversion-Driven)

**Nguyên tắc cốt lõi:** Animation phải giúp Conversion. Không làm animation chỉ để đẹp.
**Cách áp dụng nguyên tắc này:** mọi hiệu ứng chuyển động dưới đây được viết theo khuôn **Vấn đề chuyển đổi → Cơ chế chuyển động → Thông số kỹ thuật → Vì sao KHÔNG làm nhiều hơn thế**. Nếu một hiệu ứng không giải quyết được vấn đề chuyển đổi cụ thể nào, nó không thuộc tài liệu này — thuộc `12-design-rules.md` mục cấm.
**Kế thừa, không thay thế:** thông số thời lượng (Hover 150–250ms, Fade 200–300ms, Modal 250–350ms, Page transition <500ms) và danh sách cấm chung (flash liên tục, bounce quá mạnh, zoom lớn, hiệu ứng gây chóng mặt) đã khoá ở `13.6-MOTION-DNA-V1.md` và nhắc lại ở `04-design-system.md` §4 — **không đổi ở tài liệu này**, chỉ cụ thể hoá theo từng tương tác.

---

## 1. Card Hover / Tap

- **Vấn đề chuyển đổi:** Khách lướt nhanh qua nhiều card (marketplace density) — nếu card không phản hồi rõ khi tương tác, khách không chắc card có bấm được không, đặc biệt trên mobile khi "hover" thực chất là tap.
- **Cơ chế:** Nâng nhẹ 4–8px + shadow mềm hơn (đã đúng trong code hiện tại — giữ nguyên, không viết lại), ảnh zoom nhẹ (scale 1.03–1.05) bên trong khung cắt cố định (đã có `group-hover:scale-105` trong `AttractionProductCard` — giữ nguyên).
- **Thông số:** 200–250ms, ease-out.
- **Vì sao không làm nhiều hơn:** Thêm hiệu ứng xoay/nghiêng (tilt) 3D hoặc đổi màu nền toàn card khi hover sẽ làm chậm tốc độ lướt mắt qua nhiều card — ngược với mục tiêu chuyển đổi của 1 dải marketplace là *lướt nhanh, dừng đúng chỗ*, không phải *dừng lại chiêm ngưỡng từng card*.

## 2. Search / Autocomplete

- **Vấn đề chuyển đổi:** Khách gõ điểm đến/từ khoá — nếu không có phản hồi tức thì, họ nghi ngờ ô tìm kiếm có hoạt động không và có thể rời bỏ trước khi thấy gợi ý.
- **Cơ chế:** Danh sách gợi ý xuất hiện bằng fade + dịch chuyển dọc rất nhẹ (4–8px), không phải bung ra đột ngột; mỗi gợi ý xuất hiện gần như tức thì sau khi gõ (debounce ngắn ~150–200ms để tránh giật khi gõ nhanh, không phải để "tạo hiệu ứng chờ").
- **Thông số:** Fade 150–200ms (nhanh hơn khung Fade chuẩn 200–300ms một chút vì đây là phản hồi gõ phím, cần cảm giác tức thì hơn fade nội dung thông thường).
- **Vì sao không làm nhiều hơn:** Loading spinner hiển thị trước khi có gợi ý (nếu autocomplete chậm) tạo cảm giác chờ đợi — ưu tiên kỹ thuật là làm autocomplete nhanh thật, không phải che giấu độ trễ bằng animation đẹp.

## 3. Category Chip Switch

- **Vấn đề chuyển đổi:** Khách chạm 1 chip category — nếu listing đổi nội dung đột ngột (jump cut), họ mất định hướng đang xem gì.
- **Cơ chế:** Chip active đổi màu nền tức thì (150–200ms, đúng `08-iconography.md` §5); grid card bên dưới fade-out ngắn + fade-in nội dung mới (không phải slide ngang kiểu chuyển trang, vì đây vẫn là cùng 1 trang, chỉ lọc lại).
- **Thông số:** 200ms.
- **Vì sao không làm nhiều hơn:** Slide/transition trang đầy đủ giữa các category tạo cảm giác "đang chuyển trang mới", làm khách nghĩ họ rời khỏi ngữ cảnh đang lướt — ngược với emotion "Discovery" liền mạch đã khoá ở `06-design-emotion-map.md` §2.3.

## 4. Booking Panel — Chọn loại vé / ngày / số lượng

- **Vấn đề chuyển đổi:** Đây là bước "Clarity" (`06-design-emotion-map.md` §2.5) — bất kỳ độ trễ hoặc thiếu phản hồi nào ở bước tính tiền đều trực tiếp làm giảm niềm tin và tăng tỷ lệ rời bỏ ngay trước khi mua.
- **Cơ chế:**
  - Nút +/- số lượng: phản hồi tức thì (0 delay animation, chỉ có state đổi ngay), số lượng đổi có thể có hiệu ứng "nảy số" cực ngắn (scale 1 → 1.1 → 1, dưới 150ms) để xác nhận thao tác đã được ghi nhận.
  - Tổng tiền: hiệu ứng đếm số (count-up/count-down) khi thay đổi, **dưới 300ms**, dùng easing dứt khoát (ease-out nhanh), không dùng easing "trôi" chậm rãi — tổng tiền cần cảm giác *phản hồi ngay*, không phải *diễn hoạt mượt mà*.
  - Chọn ngày trên date picker: ngày được chọn có viền/nền đổi tức thì, ngày không khả dụng không có hiệu ứng (đã disable, không cần thu hút chú ý thêm).
- **Vì sao không làm nhiều hơn:** Đây là bước duy nhất trong toàn hành trình mà "ít animation hơn" đúng hơn "nhiều animation hơn" — khách cần tính toán tài chính, không cần được giải trí (nhắc lại nguyên tắc đã nêu ở `06-design-emotion-map.md` §2.5).

## 5. Sticky Bottom CTA (mobile)

- **Vấn đề chuyển đổi:** Thanh CTA dính đáy là con đường chính tới chuyển đổi trên mobile (80% khách) — nếu xuất hiện/biến mất giật cục, hoặc che nội dung đang đọc, gây khó chịu đủ để khách thoát.
- **Cơ chế:** Trượt lên từ dưới (translateY) khi khách cuộn qua khỏi khối "Chọn vé" trong Product Detail, trượt xuống ẩn khi cuộn ngược lên trên khối đó. Không xuất hiện đột ngột (opacity 0→1 tức thì) — luôn có transform mượt.
- **Thông số:** 200–250ms, ease-out.
- **Vì sao không làm nhiều hơn:** Thanh CTA không được có hiệu ứng "rung/nhấp nháy" để thu hút chú ý định kỳ — đây là dark pattern tạo cảm giác ép buộc, vi phạm ranh giới "sôi động ≠ phô trương" đã khoá ở `01-design-direction.md` §3.

## 6. Checkout

- **Vấn đề chuyển đổi:** Đây là bước "Trust" (`06-design-emotion-map.md` §2.6) — animation dư thừa ở đây trực tiếp mâu thuẫn với mục tiêu cảm xúc của màn hình.
- **Cơ chế:** Giảm animation xuống mức tối thiểu — chỉ giữ transition chuẩn cho input focus (viền đổi màu, 150ms) và trạng thái loading khi submit (spinner đơn giản trong nút, không phải overlay toàn màn hình phức tạp).
- **Vì sao không làm nhiều hơn:** Đã nêu rõ ở `06-design-emotion-map.md` §2.6 — mọi cơ chế tạo Excitement ở các bước trước (màu rực, hiệu ứng nảy) phải **giảm hẳn** ở đây, không phải vì quy tắc chung "ít động là an toàn" mà vì mục tiêu cảm xúc cụ thể của đúng màn hình này khác các màn hình khác.

## 7. Voucher / Booking Success

- **Vấn đề chuyển đổi:** Đây không phải bước "chuyển đổi" nữa (giao dịch đã hoàn tất) — vấn đề ở đây là **giữ chân/hài lòng** (retention), khoảnh khắc quyết định khách có quay lại mua lần sau hay không.
- **Cơ chế:** Icon trạng thái thành công scale-in nhẹ (như đã nêu ở `08-iconography.md` §5, dưới 300ms) + QR code fade-in ngay sau, không đồng thời (tạo nhịp: xác nhận trước, "phần thưởng" QR sau).
- **Thông số:** Tổng chuỗi hiệu ứng không vượt 500–600ms (đúng khung Page Transition <500ms cộng thêm phần fade QR ngắn) — khách không phải chờ xem hết animation mới thấy QR/nút tải, các phần tử quan trọng phải khả dụng gần như ngay lập tức dù animation chưa kết thúc hoàn toàn.
- **Vì sao không làm nhiều hơn:** Đây là nơi dễ bị lạm dụng nhất (confetti, pháo hoa animation) — đã cấm rõ ở `01-design-direction.md` §3 và `06-design-emotion-map.md` §2.7. Lý do kỹ thuật cụ thể: animation trang trí nặng có thể che hoặc làm chậm quyền truy cập vào QR code — đúng lúc khách đang đứng tại cổng vào cần mở vé ngay, hiệu năng ở màn hình này quan trọng hơn thẩm mỹ.

---

## 8. Bảng tổng hợp thời lượng theo tương tác (tất cả nằm trong khung `13.6-MOTION-DNA-V1.md` đã khoá)

| Tương tác | Thời lượng | Easing |
|---|---|---|
| Card hover | 200–250ms | ease-out |
| Autocomplete xuất hiện | 150–200ms | ease-out |
| Category chip switch | 150–200ms | ease |
| Số lượng +/- (nảy số) | <150ms | ease-out mạnh |
| Tổng tiền count-up | <300ms | ease-out |
| Sticky CTA trượt | 200–250ms | ease-out |
| Input focus (checkout) | 150ms | ease |
| Voucher icon scale-in | <300ms | spring nhẹ (không bounce mạnh) |
| Voucher QR fade-in | 200–300ms, trễ sau icon | ease-out |

---

## 9. Reduced motion

Toàn bộ hiệu ứng ở trên phải có phương án tắt/giảm khi `prefers-reduced-motion` bật — tái dùng nguyên hook `useReducedMotionSafe` đã có sẵn trong code (đã dùng đúng trong `attraction-ticket-hero.tsx`), không viết logic mới. Khi giảm chuyển động: giữ nguyên mọi thay đổi trạng thái (màu, nội dung), chỉ bỏ phần transform/transition — không bỏ luôn phản hồi (vd: tổng tiền vẫn phải đổi số ngay, chỉ là không có hiệu ứng đếm).

---

## 10. Cấm tuyệt đối (bổ sung riêng cho Ticket)

- Confetti/pháo hoa animation trang trí ở bất kỳ đâu ngoài mô tả trong ảnh/video thật (đã nêu ở `07-photography-guideline.md`) — chuyển động rực rỡ nằm ở nội dung hình ảnh, không phải hiệu ứng UI giả lập chồng thêm.
- Auto-play carousel tự động cuộn không do khách điều khiển ở dải sản phẩm trang chủ — dải cuộn ngang phải do khách vuốt/bấm, không tự chạy (auto-scroll làm khách mất vị trí đang xem, giảm chuyển đổi thay vì tăng).
- Loading skeleton "giả" hiển thị lâu hơn thời gian tải thật để "trông có vẻ đang xử lý" — vi phạm trực tiếp kỷ luật trung thực đã khoá ở `01-design-direction.md` §7 áp dụng sang cả animation, không chỉ dữ liệu.
- Hiệu ứng rung/lắc (shake) trên nút CTA để thu hút chú ý — dark pattern, không dùng.

---

*Tài liệu tiếp theo: `10-conversion-design.md` — tài liệu quan trọng nhất, kiểm tra từng section có thực sự phục vụ chuyển đổi hay không.*
