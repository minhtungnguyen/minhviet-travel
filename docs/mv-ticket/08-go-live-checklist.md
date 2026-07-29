# 08 — Go-Live Checklist

Tổng hợp Definition of Done (§XVII brief) áp cho toàn module. Không mục nào được đánh dấu xong nếu chưa có bằng chứng cụ thể (không dùng "đã triển khai xong" chung chung — đúng §XVIII).

## A. Kỹ thuật cơ bản (mỗi hạng mục)

- [ ] Code chạy được (`pnpm dev` không lỗi runtime)
- [ ] `pnpm typecheck` — 0 lỗi
- [ ] `pnpm lint` — 0 lỗi nghiêm trọng
- [ ] Test tương ứng chạy và pass (`pnpm test`)
- [ ] Responsive đạt đủ 6 breakpoint (360/390/768/1024/1280/1440)
- [ ] Có loading state
- [ ] Có empty state
- [ ] Có error state
- [ ] Không hardcode secret (grep xác nhận không có `ONEINVENTORY_API_KEY`/`SECRET` dạng literal trong code)
- [ ] Không phá module cũ (`pnpm build` toàn repo pass, không route nào khác lỗi)
- [ ] Tài liệu cập nhật (file tương ứng trong `/docs/mv-ticket/` phản ánh trạng thái thật, không chỉ Phase 0)
- [ ] Có rollback note
- [ ] Có ảnh chụp/mô tả nghiệm thu UI thật (không phải mockup)
- [ ] Có checklist QA đã chạy

## B. Module V1 chỉ "xong" khi toàn bộ đều đạt

- [ ] Landing page đẹp, hoàn chỉnh, ảnh/video thật (không placeholder)
- [ ] Listing hoạt động (search/filter/sort/pagination thật, không mock khi go-live)
- [ ] Detail hoạt động (giá/loại vé thật từ OneInventory Sandbox tối thiểu)
- [ ] Chọn ngày và loại vé hoạt động, khả dụng re-check trước khi cho thanh toán
- [ ] Checkout hoạt động, chống double-submit đã kiểm chứng
- [ ] Booking Sandbox hoạt động end-to-end (tạo đơn → xác nhận thanh toán → xuất vé)
- [ ] Voucher hoạt động theo đúng API thật (không giả lập)
- [ ] CMS quản lý được nội dung (Destinations/Attractions/Products/Content Overrides/FAQ/Highlights/Cross-sell/Bookings đọc/Sync logs/API error logs)
- [ ] SEO metadata hoạt động (kiểm tra thật qua View Source/Rich Results Test, không chỉ code review)
- [ ] Mobile hoàn chỉnh (đã browser-verify thật, không chỉ responsive theo lý thuyết)
- [ ] Error handling hoàn chỉnh (đã test lỗi mạng, timeout, hết vé, hủy ngoài chính sách)
- [ ] Production checklist (mục C) hoàn tất

## C. Riêng cho chuyển Production (`ONEINVENTORY_ENV=production`)

- [ ] Có API key/secret Production thật từ ezCloud/OneInventory (không phải Sandbox key)
- [ ] Có xác nhận hợp đồng/thương mại với OneInventory cho phép bán thật (ngoài phạm vi kỹ thuật — xem `09-open-questions.md` #10)
- [ ] `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DATABASE_URL` đã cấu hình (bắt buộc cho audit log booking)
- [ ] RLS đã test với ≥1 kịch bản thật ngoài kịch bản đơn-tenant hiện có
- [ ] Rate limiting đã bật cho endpoint checkout/cancel
- [ ] Đã kiểm tra không lộ `provider_order_id`/identifier nhạy cảm qua URL công khai
- [ ] Đã kiểm tra log không chứa API key/secret/thông tin thanh toán (grep log mẫu)
- [ ] Đã có kế hoạch giám sát cơ bản: tỉ lệ booking thành công/thất bại, độ trễ gọi OneAPI, trạng thái sync gần nhất (§XV brief — không cần hệ thống phức tạp, log/query đủ dùng)
- [ ] Đã diễn tập rollback (tắt `ONEINVENTORY_ENABLED`, xác nhận trang không crash mà hiển thị trạng thái "đang chuẩn bị")

## D. Không chặn go-live (nhắc lại phạm vi ngoài V1)

Không chờ AI Planner, Dynamic Pricing, Loyalty, Affiliate, Marketplace, Multi-provider, Multi-currency, Native app — các mục này **không nằm trong tiêu chí hoàn thành V1**.
