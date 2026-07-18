# Minh Việt Travel Platform — Volume 00: Foundation

## Mục tiêu

Volume 00 là tài liệu nền tảng bắt buộc phải đọc trước khi phát triển `minhviettravel.com`.

Tài liệu này khóa phạm vi V1, nguyên tắc sản phẩm, kiến trúc kỹ thuật, ranh giới AI, thứ tự triển khai và tiêu chuẩn hoàn thành. Mục tiêu là giúp Claude Code và đội phát triển bắt đầu xây dựng ngay, không mở rộng phạm vi tùy tiện.

## Kết quả cần đạt

Sau khi đọc Volume 00, đội phát triển phải hiểu rõ:

- Minh Việt Travel Platform V1 phục vụ ai.
- Những module nào phải hoàn thành trước khi go-live.
- Những module nào chưa làm trong V1.
- Công nghệ nào được sử dụng.
- Dữ liệu nào là nguồn sự thật.
- AI được phép và không được phép làm gì.
- Tiêu chuẩn để một module được coi là hoàn thành.

## Thứ tự đọc

1. `CLAUDE.md`
2. `docs/01-platform-vision.md`
3. `docs/02-business-scope.md`
4. `docs/03-product-principles.md`
5. `docs/04-technical-stack.md`
6. `docs/05-ai-principles.md`
7. `docs/06-development-rules.md`
8. `docs/07-module-map.md`
9. `docs/08-roadmap-v1.md`
10. `docs/09-definition-of-done.md`

## Phạm vi V1

V1 chỉ tập trung đưa `minhviettravel.com` vào vận hành với:

- Website bán hàng.
- CMS quản trị nội dung và sản phẩm.
- CRM quản lý lead.
- Booking Request.
- AI Import chương trình tour.
- Thông báo nội bộ.
- Phân quyền nhân sự.
- Theo dõi nguồn khách và sự kiện chuyển đổi.

## Quy tắc khóa phạm vi

Không bổ sung module mới vào Sprint hiện tại nếu module đó không trực tiếp giúp:

1. Đăng sản phẩm nhanh hơn.
2. Thu lead tốt hơn.
3. Tư vấn và theo dõi khách tốt hơn.
4. Chốt booking nhanh hơn.
5. Đo lường hiệu quả bán hàng tốt hơn.
