# UI MASTER REVIEW — Minh Việt Travel Homepage
### Pre-Go-Live Review · Creative Director / Senior UX / Frontend Architect / CRO / Premium Brand Designer lens
Chuẩn đối chiếu: Apple · Airbnb · Stripe · Notion · Four Seasons · Aman, và bộ **Volume 01 — Design DNA** nội bộ (`MV_Operating_System/docs/volume-01-design-dna/`).

**Phạm vi thực tế của Homepage** (khác một chút so với danh sách section mẫu trong yêu cầu — đây là cấu trúc thật trong `app/page.tsx`):

01 Header → 02 Hero → 03 Trust Strip (gộp 3 module cũ) → 04 Core Services (Bespoke + Ready‑made) → 05 Enterprise & MICE → 06 Featured Journeys (Tour Ghép Quốc Tế) → 07 Destinations → 08 Brand Center → 09 Final CTA (Dual‑Path form) → 10 Footer.

Không có section "Hotel" / "Cruise" độc lập — hai dịch vụ này nằm trong cụm icon "Ready‑made" của Core Services. Có một `ai-advisor-section.tsx` tồn tại trong code nhưng **không được import vào `page.tsx`** — tức AI hiện không có mặt ở đâu trên Homepage dù Hero đang tuyên bố "hỗ trợ bởi AI" (xem mục Trust bên dưới).

Phương pháp: đọc toàn bộ source (`sections/*`, `components/site/*`, `components/homepage/*`), chạy `next dev`, chụp ảnh Desktop (1280px), Tablet (820px) và Mobile (390px, qua iframe cô lập viewport thật — môi trường sandbox không cho resize cửa sổ Chrome thật nên dùng kỹ thuật này để có breakpoint chính xác), đối chiếu từng dòng CSS/token với 16 chương Volume 01.

---

## 1. Điểm tổng Homepage: **81/100** — CONDITIONAL PASS

Nền tảng thiết kế đã ở mức cao hơn hẳn một website du lịch OTA thông thường: video thật (không stock/AI), trích nguồn cho từng số liệu, label tình trạng chỗ trung thực (không đếm ngược giả), JSON‑LD schema đầy đủ, motion có kiểm soát (`prefers-reduced-motion`), hệ màu Sky Blue/Navy kỷ luật ở ~95% bề mặt. Đây là một homepage **gần đạt chuẩn go-live**, không phải một bản nháp.

Nhưng có 3 lỗi cụ thể, nhìn thấy bằng mắt thường, đủ nghiêm trọng để một reviewer ở chuẩn Stripe/Apple từ chối ngay: (1) Header vi phạm trực tiếp quy tắc màu Gold đã viết thành văn bản cấm, (2) form CTA cuối trang hiển thị giá trị kỹ thuật thô `group-tours` thay vì nhãn tiếng Việt — bug hiển thị ngay trên form thu lead chính, (3) card MICE — section ưu tiên #1 theo tài liệu — bị nhồi quá nhiều lớp nội dung trên một ảnh nền, phá vỡ nguyên tắc "editorial, không nhồi nhét".

## 2. Điểm từng Section

| # | Section | Điểm /100 | Nhận định 1 dòng |
|---|---|---|---|
| 01 | Header | 68 | Cấu trúc tốt, nhưng cao quá mức và rò rỉ màu Gold bị cấm |
| 02 | Hero | 92 | Gần như mẫu mực — video thật, 1 CTA chính rõ, có trích nguồn |
| 03 | Trust Strip | 82 | Gộp tốt, nhưng hơi "đóng khung" thay vì thở |
| 04 | Core Services | 90 | Ý tưởng 2 cụm (Bespoke/Ready‑made) là điểm sáng nhất trang |
| 05 | Enterprise & MICE | 74 | Ảnh & vị trí ưu tiên đúng, nhưng nội dung bị nhồi trên ảnh |
| 06 | Featured Journeys | 88 | Trung thực, có filter, card đã thoát khỏi khuôn OTA |
| 07 | Destinations | 86 | Sạch, đúng pattern rail, hơi mỏng nội dung |
| 08 | Brand Center | 84 | Bố cục editorial bất đối xứng tốt, ảnh thật |
| 09 | Final CTA (Dual‑Path) | 70 | Ý tưởng phân luồng B2B/B2C tốt, nhưng có bug hiển thị |
| 10 | Footer | 88 | Đầy đủ, xác thực; vài liên kết mạng xã hội placeholder |

---

## 3. P0 — Phải sửa trước Go‑Live

1. **Header dùng màu Gold ngoài phạm vi cho phép** (`components/site/site-header.tsx` dòng ~74‑85: hai dấu gạch, hai dấu thoi, chữ "MICE" đều `bg-gold`/`text-gold`). Volume 01 §04 nói rõ: *"Gold chỉ được dùng cho icon sao đánh giá — không dùng cho badge, CTA, eyebrow, hay bất kỳ chỗ nào khác."* Đây là dòng đầu tiên khách thấy trên mọi trang, mọi lúc scroll (header fixed). Cần đổi cụm "TOUR THIẾT KẾ TRỌN GÓI · MICE · TOUR GHÉP QUỐC TẾ" sang Navy/Sky Blue.
2. **Select "Nhu cầu quan tâm" trong form CTA cuối trang hiển thị giá trị thô `group-tours` thay vì nhãn "Tour đoàn"** (đã chụp ảnh xác nhận trên cả Desktop/Tablet/Mobile — `components/homepage/lead-form.tsx` dòng 71‑82, `Select.Value` của Base UI không resolve label). Đây là form thu lead quan trọng nhất trang — khách hàng doanh nghiệp nhìn thấy code leak ngay khi mở dropdown mặc định.
3. **Card Enterprise & MICE nhồi quá nhiều lớp nội dung lên một ảnh** (`sections/enterprise-mice-section.tsx`): badge + H2 + mô tả + trích dẫn "story" + chuỗi quy trình viết hoa + số liệu + CTA — 7 khối văn bản chồng trên một tấm ảnh, tại mọi kích thước màn hình (không chỉ mobile). Đây là section được tài liệu xác nhận "ưu tiên #1" (Volume 01 Ch.8) nên chất lượng thị giác của nó phải cao nhất trang, hiện đang thấp nhất.
4. **Mega menu chỉ mở bằng `onMouseEnter`/`onMouseLeave`, không có `onFocus`** (`site-header.tsx` dòng 124‑148) — người dùng bàn phím tab qua nav sẽ không mở được mega menu, vi phạm trực tiếp `15-accessibility.md`: *"Keyboard-first navigation."*

## 4. P1

5. Khoảng trắng giữa Core Services và Enterprise & MICE bị **cộng dồn kép** (cả hai section đều dùng `section-py-md` không có border chung), tạo một dải trắng rộng bất thường so với thang 96‑120px trong `06-spacing-dna.md`.
6. Icon mạng xã hội trong Footer (`site-footer.tsx` dòng 68‑79) dùng `href="#"` (link chết) và **cùng một `aria-label="Mạng xã hội Minh Việt"` cho cả 3 icon** (Facebook/YouTube/LinkedIn không phân biệt được với screen reader).
7. Bán kính bo góc (`radius`) không đồng nhất: card Journey/Destination dùng `rounded-2xl` (16px, đúng chuẩn `11-component-principles.md`), nhưng card MICE/Brand Center dùng `rounded-3xl` (24px) — hai hệ bán kính cùng tồn tại trên một trang.
8. Hero copy tuyên bố **"hỗ trợ bởi AI"** nhưng không có bất kỳ điểm chạm AI nào trên Homepage (`ai-advisor-section.tsx` tồn tại trong code nhưng không được gắn vào `page.tsx`). Theo `02-design-philosophy.md` §4.5 và `01-brand-emotion.md` §7 ("Artificial" anti‑pattern), một lời hứa không được thể hiện là rủi ro lòng tin, dù nhỏ.
9. Header cố định chiếm một phần đáng kể chiều cao khung hình (3 tầng: utility bar + logo lớn 90px + nav) ở mọi vị trí cuộn — nên rút gọn khi `scrolled` mạnh hơn mức hiện tại (hiện chỉ giảm logo từ 90→78px, utility bar không ẩn).

## 5. P2

10. Nav item "ƯU ĐÃI" tô màu đỏ (`text-destructive`) — tạo cảm giác khuyến mãi/urgency nhẹ giữa một hệ nav trung tính, nên cân nhắc đổi sang trạng thái nhấn bằng weight/underline thay vì màu cảnh báo.
11. Destinations rail hiện chỉ có 4 thẻ (Nhật/Hàn/Âu/Mỹ) — với layout rail có mũi tên điều hướng, 4 thẻ hơi mỏng, cảm giác "rail" hơi thừa cho một hàng gần như luôn vừa khung hình.
12. Trust Strip gộp 4 khối (headline, segment pills, stat grid, logo grid) bằng đường kẻ mảnh liên tiếp thay vì khoảng trắng — đúng nội dung nhưng hơi "đóng khung" so với tinh thần "khoảng trắng là thành phần thiết kế" của `06-spacing-dna.md`.
13. `VerifiedStat` ở Hero đếm số từ 0 lên khi vào viewport — hiệu ứng đẹp nhưng cần xác nhận không lặp lại (re-trigger) khi user scroll qua lại nhiều lần, tránh cảm giác "trò chơi" thay vì dữ liệu nghiêm túc.

---

## 6. Những điều rất đẹp — KEEP

- **Hero Video Rotator**: 3 cảnh flycam thật (Hạ Long, Sa Pa, Ninh Bình), có `alt` mô tả tử tế, tự tắt khi `prefers-reduced-motion`, không tự phát có tiếng. Đây là cách một trang cao cấp nên dùng video.
- **`VerifiedStat`**: mọi con số đều có "Nguồn: ... · 2026" đi kèm — đúng tinh thần "Trust được tạo bằng bằng chứng vận hành thật", hiếm thấy ở website du lịch Việt Nam.
- **Core Services — 2 cụm Bespoke/Ready‑made**: thay vì một lưới 6 ô như OTA, trang tách rõ "thiết kế theo yêu cầu" (2 thẻ Navy lớn) và "có sẵn" (5 thẻ nhỏ) — phản ánh đúng mô hình kinh doanh, là điểm khác biệt hoá mạnh nhất trang.
- **JourneyCard**: nhãn tình trạng chỗ thật ("Còn nhận khách"/"Sắp hết chỗ"), giá ghi rõ "Giá tham khảo" — không có countdown giả, không có badge giảm giá gạch chéo giăng khắp nơi.
- **JSON‑LD đầy đủ**: `TravelAgency` + `ItemList`/`TouristTrip`/`Offer` cho từng hành trình nổi bật — nền SEO kỹ thuật tốt hơn phần lớn website cùng ngành.
- **Brand Center**: bố cục 1 story lớn + danh sách nhỏ, ảnh người thật/sự kiện thật, đúng tinh thần "editorial, không quảng cáo".
- **Mobile header**: ở dưới breakpoint `lg`, header tự rút về logo + hamburger — đây là thiết kế mobile *chủ đích*, không phải bản desktop bị nén (đạt tiêu chí Rejection Trigger F của `BATCH_01_ACCEPTANCE_CHECKLIST.md`).
- **Footer**: địa chỉ, số điện thoại, email thật; 3 cột liên kết đầy đủ chính sách/điều khoản — đúng chuẩn "enterprise-ready".

## 7. Những điều nên bỏ hoàn toàn — REMOVE

- Toàn bộ màu **Gold** trong utility bar của Header (dấu gạch, dấu thoi, chữ "MICE") — thay bằng Navy/Sky Blue hoặc bỏ hẳn cụm trang trí này.
- Khối "story" (trích dẫn) + chuỗi quy trình viết hoa trong card MICE trên Homepage — hai khối này thuộc về trang `/mice` chi tiết, không cần lặp lại trên card teaser ở Homepage.
- `href="#"` placeholder trên 3 icon mạng xã hội ở Footer — hoặc gắn link thật, hoặc ẩn khối này cho tới khi có link thật (link chết làm giảm uy tín ngay cú click đầu tiên).
- File `sections/ai-advisor-section.tsx` nếu không có kế hoạch dùng trong sprint tới — code chết nên dọn để tránh nhầm lẫn "đã có AI trên Homepage".

## 8. Motion / Animation đề xuất

| Section | Đề xuất | Lý do |
|---|---|---|
| Hero | **Giữ nguyên** crossfade video 1000ms + reduced‑motion fallback | Đã đúng chuẩn `10-motion.md` |
| Trust Strip / Core Services / Brand Center | **Giữ** `Reveal` (fade + slide nhẹ) hiện có | Tinh tế, không lạm dụng |
| Enterprise MICE stat (`297+`) | **Giữ** counter, nhưng chỉ chạy 1 lần/session (không re-trigger mỗi lần cuộn qua) | Tránh cảm giác "gimmick" |
| Header khi scroll | **KHÔNG NÊN DÙNG** thêm hiệu ứng ẩn/hiện phức tạp — thay vào đó nên **giảm chiều cao** (ẩn utility bar sau 80px scroll) bằng transition đơn giản 200ms | Vấn đề ở đây là layout, không phải motion — thêm motion sẽ che vấn đề gốc |
| Destinations rail | **KHÔNG NÊN DÙNG** parallax — snap-scroll hiện tại đã đủ mượt và dễ đoán | Parallax trên rail ngang dễ gây say scroll trên mobile |
| CTA buttons toàn trang | **Giữ** hover translate nhẹ hiện có, không cần thêm glow/scale mạnh hơn | Đã đủ tinh tế theo `10-motion.md` |

## 9. Cải thiện Premium Feeling

- Giảm chiều cao Header cố định (đặc biệt utility bar) — hiện tại "thuế" chiều cao màn hình liên tục là chi phí premium‑feeling lớn nhất của trang, vì nó nuốt whitespace mà `06-spacing-dna.md` coi là thành phần thiết kế.
- Giãn nội dung card MICE ra khỏi lớp ảnh — tách phần số liệu + CTA thành dải riêng bên dưới ảnh (như cách Trust Strip đang làm), thay vì chồng chữ lên ảnh.
- Thống nhất một bán kính bo góc duy nhất (khuyến nghị 16px theo `11-component-principles.md`) cho mọi card lớn, thay vì đang có cả 16px và 24px.
- Photography đã đạt chuẩn "thật, không cliché" — nên nhân rộng tỉ lệ ảnh full‑bleed (như MICE, Brand Center featured) sang Destinations để tăng cảm giác biên tập cao cấp.

## 10. Cải thiện Conversion

- Sửa bug hiển thị `group-tours` trong dropdown — đây là điểm chạm cuối cùng trước khi khách gửi lead, một dropdown lỗi ở đây có thể khiến khách nghi ngờ độ hoàn thiện của cả nền tảng.
- CTA "Yêu cầu thiết kế chương trình" trong card MICE hiện nằm dưới 5+ khối nội dung — nên đưa CTA lên gần headline hơn hoặc giữ cố định trong viewport của card để không bị yêu cầu cuộn nhiều mới thấy được, đặc biệt trên mobile.
- Thêm liên kết chéo rõ ràng hơn từ Featured Journeys / Destinations trở lại form Final CTA (hiện chỉ có anchor `#lead-form` ở trạng thái rỗng bộ lọc) — tăng đường dẫn tới điểm chuyển đổi từ giữa trang, không chỉ cuối trang.

## 11. Cải thiện Trust

- Đóng khoảng cách giữa lời hứa "hỗ trợ bởi AI" ở Hero và thực tế Homepage chưa có điểm chạm AI nào — hoặc bổ sung một khối AI nhỏ, minh bạch (đúng tinh thần `12-ai-experience.md`), hoặc điều chỉnh lại copy Hero cho khớp thực tế hiện tại.
- Gắn link thật cho social icon ở Footer — link chết làm giảm độ tin cậy của phần "Liên hệ 24/7" ngay bên cạnh.
- Tiếp tục pattern `VerifiedStat` (đã rất tốt) sang cả những con số khác nếu có trong tương lai (vd. review score trên JourneyCard hiện có `reviewScore`/`reviewCount` — cân nhắc trích nguồn tương tự nếu số liệu này là thật).

## 12. Cải thiện Brand Identity

- Loại bỏ hoàn toàn Gold khỏi Header — đây là điểm nhận diện đầu tiên và bị lặp lại ở MỌI trang (component dùng chung), nên mức độ ưu tiên cao hơn một lỗi cục bộ trên Homepage.
- Cân nhắc rút gọn cụm "TOUR THIẾT KẾ TRỌN GÓI · MICE · TOUR GHÉP QUỐC TẾ" trong utility bar — đây là 3 câu định vị được nhồi vào một dòng 40px, khó đọc ở độ rộng `xl` trở xuống trước khi bị ẩn hẳn dưới `lg`; nội dung định vị này đã được truyền tải tốt hơn nhiều lần ở Hero headline và Core Services.
- Card Bespoke (Navy) trong Core Services là ứng viên tốt nhất để trở thành "chữ ký thị giác" (signature pattern) của thương hiệu — nên cân nhắc tái sử dụng motif icon‑chip‑trên‑nền‑Navy này ở các trang con (MICE, Tours) để tạo tính hệ thống xuyên suốt.

## 13. 10 việc nên làm ngay trước khi bắt đầu Backend

1. Xoá màu Gold khỏi `site-header.tsx` (utility bar) — thay Navy/Sky Blue.
2. Sửa bug `Select` hiển thị `group-tours` thay vì nhãn tiếng Việt trong `lead-form.tsx`.
3. Tái cấu trúc nội dung card `enterprise-mice-section.tsx` — bớt số lớp chữ chồng trên ảnh, tách số liệu/CTA ra khỏi vùng ảnh.
4. Thêm `onFocus`/hỗ trợ bàn phím cho mega menu trong `site-header.tsx`.
5. Kiểm tra & bỏ padding kép giữa Core Services và Enterprise & MICE.
6. Gắn `aria-label` riêng cho từng icon mạng xã hội ở Footer, và gắn link thật (hoặc ẩn tạm).
7. Thống nhất bán kính bo góc (16px) cho toàn bộ card lớn trên Homepage.
8. Quyết định số phận `ai-advisor-section.tsx`: gắn vào trang hoặc xoá khỏi codebase — không để "mồ côi".
9. Giảm chiều cao Header khi scroll (ẩn/thu utility bar sau ngưỡng cuộn) để trả lại whitespace cho nội dung.
10. Chạy lại `16-design-review-checklist.md` cho từng section sau khi sửa 9 mục trên, trước khi coi Homepage là "Done".

---

## Kết luận

**Chưa nên chuyển sang Backend** — nhưng khoảng cách còn lại rất ngắn và cụ thể, không phải một vấn đề nền tảng.

Lý do: 3/4 mục P0 (Gold trong Header, bug `group-tours`, mật độ nội dung card MICE) đều là những thứ một reviewer ở chuẩn Stripe/Airbnb sẽ nhìn thấy trong 30 giây đầu tiên và từ chối duyệt ngay — chúng nằm ở đúng những nơi tài liệu nội bộ (Volume 01) đã viết thành luật rõ ràng nhất (màu sắc) và đúng section được chính tài liệu đó xác định là ưu tiên #1 (MICE). Phần còn lại của trang — Hero, Core Services, Featured Journeys, Brand Center, Footer — đã đạt chất lượng đủ tốt để làm chuẩn tham chiếu cho các trang con sắp tới.

Danh sách "10 việc nên làm ngay" ở Mục 13 là toàn bộ phạm vi cần đóng trước khi Go‑Live; không có mục nào trong đó đòi hỏi thiết kế lại từ đầu.
