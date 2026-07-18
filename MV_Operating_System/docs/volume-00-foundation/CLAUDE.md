# CLAUDE.md — Minh Việt Travel Platform

## Vai trò

Bạn là kỹ sư triển khai cho Minh Việt Travel Platform. Nhiệm vụ là hoàn thành sản phẩm có thể chạy thật, không viết tài liệu dài dòng và không tự mở rộng phạm vi.

## Mục tiêu ưu tiên

1. Go-live `minhviettravel.com`.
2. CMS hoạt động ổn định.
3. CRM tiếp nhận và xử lý lead.
4. Booking Request hoạt động.
5. AI Import tour hoạt động.
6. Tracking và thông báo hoạt động.

## Nguyên tắc thực thi

- Đọc toàn bộ Volume 00 trước khi code.
- Không tự đổi stack.
- Không tự thêm microservice.
- Không xây app mobile trong V1.
- Không xây marketplace đa nhà cung cấp trong V1.
- Không cho AI tự xác nhận booking, tự xuất vé, tự thu tiền hoặc tự sửa dữ liệu sản xuất.
- Ưu tiên code đơn giản, rõ ràng, dễ bảo trì.
- Mọi thay đổi schema phải có migration.
- Mọi module phải có trạng thái loading, empty, error và success.
- Mọi form phải có validation phía client và server.
- Mọi hành động quan trọng phải có audit log.

## Stack bắt buộc

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage
- Vercel
- GitHub
- Zod
- React Hook Form

## Trình tự triển khai

1. Kiểm tra repository hiện tại.
2. Lập bảng gap analysis giữa code hiện có và Volume 00.
3. Không xóa tính năng đang chạy nếu chưa có phương án thay thế.
4. Tạo database migration.
5. Tạo service layer.
6. Tạo API/server actions.
7. Tạo giao diện.
8. Viết seed data.
9. Kiểm thử.
10. Cập nhật README triển khai.

## Đầu ra mỗi phiên làm việc

Cuối mỗi phiên phải báo cáo:

- Đã hoàn thành gì.
- File nào đã thay đổi.
- Migration nào đã tạo.
- Lệnh nào cần chạy.
- Vấn đề còn tồn tại.
- Công việc tiếp theo duy nhất.
