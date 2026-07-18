# Sprint 1 — Task 02: Tour Detail Production Ready

**Ngày:** 2026-07-18
**Phạm vi:** Chỉ trang Tour Detail (`app/tour/[slug]/page.tsx`) và nội dung/component mới được tạo riêng để phục vụ trang này.
**Không đụng tới:** Homepage, `/tours` (listing), `TourCard` (`components/site/tour-card.tsx`), `lib/cms/*`, Booking Request, AI Import, `lib/site-data.ts` (đọc nhưng không sửa).

---

## Cách tiếp cận dữ liệu

Trang Tour Detail trước đây chỉ là một stub: không có lịch trình thật (placeholder "đang được biên soạn"), không gallery, không bao gồm/không bao gồm, không chính sách, và hiển thị giá gạch ngang + số ghế giả ("Còn 8 chỗ") — xem `PROJECT_AUDIT.md` §3.2.

Vì không được sửa CMS lẫn `lib/site-data.ts` (dùng chung với `/tours`), toàn bộ nội dung mở rộng cho Tour Detail được đặt trong một file mới, tách biệt hoàn toàn:

- **`lib/tours/tour-detail-content.ts`** — gallery, lịch trình theo ngày, bao gồm/không bao gồm, `availability`/`priceType` (tái dùng đúng type `AvailabilityStatus`/`PriceType` đã có sẵn ở `types/cms.ts` — cùng từ vựng trung thực mà homepage đã dùng, thay vì kiểu "Còn X chỗ" + giá gạch ngào cũ), và chính sách thanh toán/hoàn hủy dùng chung toàn công ty. Có Zod schema validate nội dung tại thời điểm load module.
- Trang Tour Detail merge dữ liệu này với `Tour` cơ bản (id/title/country/duration/departure/price/image) từ `lib/site-data.ts` — file đó **không bị sửa**, nên `/tours` và `TourCard` tiếp tục chạy y hệt trước.

## Đã xây (theo đúng 10 yêu cầu)

1. **Bố cục theo Design DNA** — Hero → thông tin nhanh → Gallery → Lịch trình → Bao gồm/Không bao gồm → Chính sách → CTA (sidebar) → Tour liên quan. Mỗi section một tiêu điểu, nhất quán với `container-mv`, typography, spacing đã có của hệ thống — không tạo pattern trang trí mới.
2. **Timeline lịch trình rõ ràng** — `components/site/tour-detail/itinerary.tsx`, dùng `Accordion` mới (`components/ui/accordion.tsx`, dựng trên `@base-ui/react/accordion` đã có sẵn trong dependency, không thêm thư viện mới). Có ghi chú rõ "Lịch trình tham khảo — chuyên viên xác nhận theo ngày khởi hành thực tế" thay vì khẳng định cứng.
3. **Gallery ảnh** — `components/site/tour-detail/gallery.tsx`. Chỉ dùng ảnh **thật sự đúng điểm đến** đã có trong `/public` (đã xem trực tiếp từng ảnh trước khi gán) — ví dụ Tokyo ghép `tour-tokyo.webp` (núi Phú Sĩ) + `dest-japan.webp` (cổng torii Kyoto), cả hai đều là Nhật Bản thật. Với 4/6 tour chỉ có đúng 1 ảnh phù hợp trong kho asset hiện có, gallery hiển thị 1 ảnh lớn thay vì chèn ảnh không liên quan cho đủ số lượng — tuân thủ Volume 01 `08-photography.md` (ảnh phải phù hợp, không dùng filler chung chung).
4. **Bao gồm / Không bao gồm** — `components/site/tour-detail/inclusions.tsx`, nội dung theo tour quốc tế/nội địa, khớp đúng nhóm trường dữ liệu tối thiểu mà Volume 00 `05-ai-principles.md` liệt kê cho một tour.
5. **Chính sách thanh toán & hoàn hủy** — `components/site/tour-detail/policy.tsx`. Chính sách dùng chung toàn công ty (không bịa riêng cho từng tour, vì trong thực tế đây là chính sách cấp công ty).
6. **CTA đặt tour rõ ràng** — `components/site/tour-detail/booking-card.tsx`: CTA duy nhất là "Nhận tư vấn giải pháp" (điều hướng `/contact?intent=individual`) + "Gọi hotline 24/7", đúng mô hình V1 của Volume 00 §02 (khách gửi yêu cầu → nhân viên xác nhận, không tự chốt booking) — **không xây form/luồng Booking Request thật**, đúng phạm vi bị cấm của task này.
7. **Tour liên quan** — `components/site/tour-detail/related-tour-card.tsx`, component **mới**, không tái dùng `TourCard` (vốn vẫn hiển thị giá gạch ngang + badge giảm giá cho `/tours`) để việc dọn dữ liệu giả trên Tour Detail không kéo theo thay đổi hiển thị của `/tours`.
8. **SEO đầy đủ** — `generateMetadata` mở rộng: mô tả chi tiết hơn, `alternates.canonical`, `openGraph` đầy đủ (title/description/url/images/locale) — đã xác nhận `metadataBase` (thêm ở Sprint 1 Task 01) giúp `og:image` resolve thành URL tuyệt đối đúng. Thêm `TourDetailJsonLd` (hàm mới, additive) trong `components/seo/json-ld.tsx` — JSON-LD `TouristTrip` + `Offer` + `TravelAgency` provider, không đụng tới `HomepageJsonLd` hiện có. Cần 6 hằng số tổ chức mới (`ORGANIZATION_NAME`, `ORGANIZATION_LOGO`...) được thêm **additive** vào `constants/seo.ts`, giá trị lấy đúng từ `lib/cms/content/homepage.seed.ts` để không tạo ra một bản sao lệch thông tin công ty.
9. **Responsive** — Sidebar giá/CTA đổi từ `sticky top-24` (dính ở mọi kích thước màn hình) thành `lg:sticky lg:top-24` (chỉ dính từ desktop) — tránh hành vi sticky khó chịu trên khung hình dọc của điện thoại, nơi không gian đã bị chiếm bởi `MobileCTA` cố định ở đáy màn hình. Grid 2 cột co về 1 cột dưới `lg:` (giữ nguyên pattern gốc, không đổi). Gallery, Accordion, Inclusions dùng grid Tailwind co giãn (`sm:`, không phá layout khi nội dung dài).
10. **Loại bỏ dữ liệu giả** — Trên Tour Detail: bỏ giá gạch ngang (`originalPrice`)/nhãn "Giá ưu đãi", bỏ số ghế cụ thể giả ("Còn 8 chỗ"), bỏ sao đánh giá không có nguồn (`rating` không kèm số lượt đánh giá thật). Thay bằng nhãn "Giá tham khảo" + trạng thái availability (Còn nhận khách/Sắp hết chỗ/...) — cùng từ vựng trung thực mà homepage đã dùng.

## Đã xác minh

- `npx tsc --noEmit` → sạch.
- `npx eslint .` → sạch (1 warning phát sinh giữa chừng — biến Zod schema định nghĩa nhưng chưa dùng — đã sửa bằng cách dùng nó để validate `standardCancellationPolicy`).
- `npx next build` → thành công, cả 6 trang tour (`tokyo`, `korea`, `europe`, `bali`, `phuquoc`, `singapore`) prerender tĩnh (SSG qua `generateStaticParams`).
- `next start` + curl: xác nhận title/canonical/OG tags/JSON-LD `TouristTrip` render đúng; xác nhận không còn chuỗi "Còn N chỗ" hay "Giá ưu đãi" trong HTML.
- Kiểm tra trực quan qua trình duyệt (desktop 1440px): hero, gallery (2 ảnh Nhật Bản thật), accordion lịch trình (mở ngày 1 mặc định, có thể đóng/mở), bao gồm/không bao gồm, chính sách thanh toán/hoàn hủy, sidebar sticky đứng đúng vị trí cạnh nội dung, tour liên quan hiển thị 3 tour cùng khu vực với ảnh đúng — toàn bộ khớp với Design DNA (nền trắng/navy, gold chỉ ở CTA/badge/icon, không có mảng vàng lớn).
- **Giới hạn công cụ:** không resize được cửa sổ trình duyệt trong phiên này để chụp ảnh màn hình ở độ rộng điện thoại thật (lệnh resize không phản ánh vào ảnh chụp) — xác nhận responsive dựa trên rà soát code (chỉ thêm tiền tố `lg:`, không đổi cấu trúc grid gốc vốn đã hoạt động đúng trên mobile trước đó) thay vì ảnh chụp trực tiếp. Khuyến nghị QA thủ công trên thiết bị/điện thoại thật trước khi go-live.

## Còn tồn đọng (ngoài phạm vi task này)

- `/tours` (listing) và `TourCard` vẫn còn giá gạch ngào/discount/seats giả — đã cố tình không sửa, cần một task riêng.
- Ảnh gallery của tour Phú Quốc (`dest-vietnam.webp`) thực ra là ảnh Cầu Vàng, Bà Nà Hills (Đà Nẵng), không phải Phú Quốc — mismatch có từ trước (dùng làm hero image gốc của tour này), không có ảnh Phú Quốc thật nào khác trong `/public` để thay thế. Cần bổ sung ảnh thật khi có thư viện ảnh chính thức.
- Nội dung lịch trình/bao gồm-không bao gồm là nội dung biên tập minh họa (chưa qua CMS thật) — khi module CMS (Sprint khác) hoàn thành, cần trỏ `lib/tours/tour-detail-content.ts` sang nguồn dữ liệu thật thay vì seed tĩnh.
- Booking Request thật (form yêu cầu đặt tour có số khách, ngày, liên kết lead) chưa tồn tại — CTA hiện tại chỉ dẫn về `/contact` chung, đúng phạm vi bị cấm của task này nhưng vẫn là một khoảng trống nghiệp vụ cần Sprint Booking Request xử lý.
