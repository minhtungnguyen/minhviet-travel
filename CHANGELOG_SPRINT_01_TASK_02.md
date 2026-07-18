# Sprint 1 – Task 02: Homepage UI Redesign — Minh Việt Travel 2026

**Ngày:** 2026-07-18
**Phạm vi:** Chỉ Homepage (`/`) — Header, Navigation, Hero, khối dịch vụ, Tour Card (dùng chung trên Homepage), Footer. Không chạm CMS, Tour Detail, Booking, CRM, AI Import, database.
**Tài liệu đã đọc trước khi làm:** `CLAUDE.md` (root Volume 00), `PROJECT_AUDIT.md`, `docs/volume-00-foundation/`, `docs/volume-01-design-dna/`, `CHANGELOG_SPRINT_01.md`.

---

## 1. Vấn đề UI ban đầu (Giai đoạn 1 — Visual Audit)

Audit trực tiếp bằng browser automation (desktop 1440px + mobile 390px) trên bản build production trước khi sửa. Vì môi trường sandbox giới hạn màn hình vật lý ~1280×672 và `resize_window` không có tác dụng thật (đã kiểm chứng bằng `window.screen.availWidth/Height`), việc giả lập từng breakpoint được thực hiện qua một `<iframe>` có `width`/`height` cố định (iframe luôn có viewport CSS riêng độc lập với cửa sổ ngoài, nên `window.innerWidth` bên trong đúng bằng giá trị đặt ra — kỹ thuật đã xác minh bằng `contentWindow.innerWidth` trước khi dùng để audit).

Phát hiện:

1. **[Bug — nghiêm trọng]** Nút CTA phụ trong Hero ("Xem gợi ý AI" / CTA thứ 2) **vô hình** — chữ trắng trên nền trắng. Nguyên nhân: `Button` variant `outline` có `bg-background` (trắng) cứng trong `components/ui/button.tsx`; className override tại `sections/hero-section.tsx` chỉ đổi `border`/`text`, không đổi được `bg-background` do thứ tự merge class. Xác nhận bằng ảnh chụp — xem `before-1440-hero-broken-button.jpg`.
2. **[Bug — nghiêm trọng]** Mobile navigation drawer **vỡ layout**: chỉ có thanh Logo/Close hiển thị đúng; ngay bên dưới, danh sách link + nút Đăng nhập/Đăng ký đè lên nội dung Hero phía sau (nền trong suốt, không che phủ). Tái hiện được 2 lần độc lập, xác nhận là lỗi thật của code, không phải nhiễu từ công cụ test. Xem `before-390-mobile-nav-broken.jpg`.
3. **[Redesign]** Khối "Một đầu mối, trọn vẹn hành trình" (CoreServicesSection) là **lưới icon 6 ô đồng nhất** — đúng mẫu "lưới icon cũ kỹ" mà bài yêu cầu tránh: không có tiêu điểm, không phân cấp thị giác. Xem `before-1440-core-services-old-grid.jpg`.
4. **[Ổn]** Hero (nền navy + ảnh biên tập + gold accent), Tour Card/JourneyCard (ảnh thật, badge availability trung thực, không giá gạch ngang), TrustStrip, EnterpriseMice, AIAdvisor, Destinations, BrandCenter, FinalCta: đã đúng tinh thần Design DNA từ Sprint 1 — giữ nguyên cấu trúc, không viết lại từ đầu.
5. **[Nội dung]** Địa chỉ và dòng vận hành ở Footer là dữ liệu cũ, cần cập nhật theo yêu cầu nghiệp vụ mới.

---

## 2. Định hướng thiết kế đã áp dụng

- **Không xây lại từ đầu những gì đã đúng.** Homepage sau Sprint 1 đã có nền tảng tốt (CMS-seam, ảnh thật, số liệu có nguồn, AI advisor trung thực) — giữ nguyên toàn bộ các section đó, chỉ sửa nơi thực sự có vấn đề (bug hoặc bố cục "lưới icon cũ kỹ").
- **Phân cấp qua bố cục, không qua dữ liệu mới.** CoreServicesSection vẫn lấy đúng dữ liệu từ CMS seam hiện có (`icon`, `title`, `href` — không có field ảnh/mô tả) — không sửa `lib/cms/*`. Phân cấp được tạo bằng cách tách 1 dịch vụ đầu tiên thành tile lớn (nền navy, icon lớn, mũi tên) và 5 dịch vụ còn lại thành hàng tile nhỏ, gọn — tạo một tiêu điểm rõ ràng thay vì 6 ô đều nhau.
- **Sửa bug bằng cách hoàn thiện pattern có sẵn, không phát minh mới.** `MVButton` (`components/mv/mv-button.tsx`) đã có sẵn variant `outline-light` cho nút trên nền tối; `Button` (shadcn-style, dùng trên Homepage) thì chưa có — thêm đúng variant tương tự vào `components/ui/button.tsx` thay vì tạo hệ thống mới.
- **Mobile drawer: củng cố thay vì đoán nguyên nhân.** Đổi từ `absolute + h-full` lồng trong `fixed` sang hai lớp `fixed` độc lập (`h-dvh`) — không phụ thuộc vào việc ancestor có resolve chiều cao đúng hay không.
- **Tour Card:** giữ nguyên cấu trúc dữ liệu/hierarchy đã đúng (ảnh → tên → ngày/điểm đi → giá → CTA), chỉ tăng cỡ chữ tiêu đề và khoảng đệm để cảm giác cao cấp hơn, không thêm màu trạng thái mới.
- **Footer:** cập nhật đúng địa chỉ và câu vận hành theo yêu cầu, không đổi cấu trúc/số lượng link (đã đủ gọn từ trước).

---

## 3. File đã sửa

| File | Thay đổi |
|---|---|
| `components/ui/button.tsx` | Thêm variant `outline-light` (border/text trắng, không `bg-background`) — sửa tận gốc nguyên nhân nút vô hình, tái dùng được cho mọi nút outline trên nền tối sau này |
| `sections/hero-section.tsx` | Đổi CTA phụ sang `variant="outline-light"`, bỏ className override thủ công |
| `components/site/site-header.tsx` | Viết lại mobile drawer: 2 lớp `fixed` độc lập thay vì `absolute` lồng trong `fixed`; giảm nhẹ chiều cao logo trong drawer |
| `sections/core-services-section.tsx` | Viết lại bố cục: 1 tile lớn (dịch vụ đầu tiên) + hàng 5 tile nhỏ, thay cho lưới 6 ô đồng nhất. Vẫn dùng đúng `coreServices.services` từ CMS seam, không thêm field dữ liệu |
| `components/homepage/journey-card.tsx` | Tăng padding (`p-5`→`p-6`), tăng cỡ tiêu đề (`text-lg`→`text-xl font-bold`), giãn khoảng cách nội bộ — không đổi dữ liệu/hierarchy |
| `components/site/site-footer.tsx` | Cập nhật địa chỉ: "Tầng 3, Tòa nhà VCCI Duyên Hải Bắc Bộ, Số 464 Lạch Tray, Gia Viên, Hải Phòng"; đổi dòng cuối thành "Được vận hành và phát triển bởi Minh Việt Travel." |

**Không đụng:** `lib/cms/*`, `lib/site-data.ts`, `app/tour/[slug]/*`, mọi trang ngoài Homepage, `TourCard` cũ (`components/site/tour-card.tsx`, dùng riêng cho `/tours`), `design-system/`.

## 4. Component đã tạo/chỉnh sửa

- **Chỉnh sửa (không tạo mới):** `Button` (thêm 1 variant), `SiteHeader` (mobile drawer), `CoreServicesSection` (viết lại bố cục), `JourneyCard` (polish), `SiteFooter` (nội dung).
- **Không tạo component mới nào** — đúng yêu cầu "không tự tạo thêm framework hoặc Design System mới trái với Volume 01"; mọi thay đổi tận dụng component/token đã có (`Button`, `Badge`, `SectionHeading`, `Reveal`, `MVButton`, semantic color tokens `primary`/`secondary`/`gold`).

## 5. Kiểm tra responsive (Giai đoạn 3)

Kỹ thuật: iframe với `width`/`height` cố định theo từng breakpoint (xem giải thích ở mục 1), cộng với `transform: scale()` trên iframe để vừa khung hình chụp mà không đổi viewport CSS bên trong.

- **Kiểm tra tự động toàn trang:** so `document.documentElement.scrollWidth` với `clientWidth` tại cả 4 breakpoint bắt buộc — **không phát hiện horizontal overflow ở bất kỳ breakpoint nào**:

  | Breakpoint | scrollWidth | clientWidth | Overflow |
  |---|---|---|---|
  | 1440px | 1426 | 1426 | Không |
  | 1280px | 1266 | 1266 | Không |
  | 768px | 754 | 754 | Không |
  | 390px | 376 | 376 | Không |

- **1440px:** Hero (CTA phụ hiện chữ đúng), CoreServices (bố cục mới), Footer (địa chỉ mới) — đã chụp ảnh, xem mục 6.
- **1280px:** Hero hiển thị đầy đủ, cả 2 CTA rõ chữ, không tràn ngang.
- **768px:** Header chuyển sang hamburger đúng breakpoint, headline xuống dòng gọn (2 dòng thay vì 3), không vỡ layout.
- **390px:** Hero xếp dọc sạch; **mobile nav drawer mở ra đúng** — panel trắng đục, danh sách link đầy đủ (Tour, Sự kiện & MICE, Dịch vụ, Khách sạn, Du thuyền, Vé máy bay, Vé vui chơi, Visa, Ưu đãi), cuộn xuống thấy nút Đăng nhập/Đăng ký không bị đè/lem — xác nhận bug đã hết.
- **Section rhythm / alignment / crop ảnh:** không phát hiện vấn đề mới phát sinh từ các thay đổi (chỉ 6 file trên bị sửa, phạm vi thay đổi hẹp và có chủ đích).

## 6. Ảnh chụp trước/sau

Lưu tại `homepage-redesign/` trong scratchpad phiên làm việc:

**Trước (before):**
- `before-1440-hero-broken-button.jpg` — CTA phụ vô hình
- `before-1440-core-services-old-grid.jpg` — lưới icon 6 ô cũ
- `before-390-mobile-nav-broken.jpg` — mobile drawer vỡ layout

**Sau (after):**
- `after-1440-hero.jpg` — Hero, CTA phụ hiện chữ đúng
- `after-1440-core-services.jpg` — bố cục 1 tile lớn + 5 tile nhỏ
- `after-1440-footer-top.jpg` — Footer với địa chỉ mới
- `after-1280-hero.jpg`, `after-768-hero.jpg`, `after-390-hero.jpg` — Hero ở 3 breakpoint còn lại
- `after-390-mobile-nav-fixed.jpg`, `after-390-mobile-nav-scrolled.jpg` — mobile drawer hoạt động đúng, cuộn được tới nút Đăng nhập/Đăng ký

## 7. Kết quả lint

```
npx eslint .
```
→ **0 lỗi, 0 cảnh báo.**

## 8. Kết quả typecheck

```
npx tsc --noEmit
```
→ **Sạch, không lỗi.**

## 9. Kết quả build

```
npx next build
```
→ **Thành công.** Toàn bộ 22 route build tĩnh bình thường, bao gồm 6 trang `/tour/[slug]` (SSG) — xác nhận thay đổi Homepage không ảnh hưởng Tour Detail.

## 10. Vấn đề còn tồn đọng

- **EnterpriseMiceSection** chưa được viết lại sâu — nội dung/bố cục hiện tại (ảnh nền tối + badge + differentiators + số liệu có nguồn + CTA) đã tương đối phù hợp Design DNA nên không động vào để giữ đúng nguyên tắc "không sửa những phần không cần sửa"; có thể cân nhắc tinh chỉnh thêm ở một task riêng nếu cần.
- **Footer vẫn còn một số link trỏ tới trang chưa tồn tại** (`/careers`, `/brand/leadership`, `/brand/news`, `/faq`, `/policy/*`, `/services`) — đây là vấn đề kiến trúc thông tin đã được ghi nhận từ Sprint 1 (`CHANGELOG_SPRINT_01.md`), không thuộc phạm vi "redesign UI" của task này nên không xoá/thêm trang.
- **Không thể dùng `resize_window` thật** trong môi trường này (đã kiểm chứng màn hình vật lý chỉ ~1280×672) — toàn bộ QA 4 breakpoint dựa trên kỹ thuật iframe nêu ở mục 5, không phải resize cửa sổ trình duyệt thật. Khuyến nghị QA thủ công thêm trên thiết bị thật trước khi go-live.
- Chưa kiểm tra tương tác chi tiết của mega menu (hover trên desktop) và AI Advisor form ở từng breakpoint sau khi redesign — các phần này không bị đụng tới trong task này nên rủi ro thấp, nhưng chưa được chụp ảnh xác nhận riêng.
