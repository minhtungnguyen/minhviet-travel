# 09 — Definition of Done

Một module chỉ được coi là hoàn thành khi đáp ứng tất cả nhóm tiêu chí dưới đây.

## Chức năng

- Đúng yêu cầu nghiệp vụ.
- Có create/read/update/archive theo phạm vi.
- Có validation.
- Có trạng thái loading, empty, error và success.
- Không có đường dẫn chết.
- Không yêu cầu sửa code để cập nhật dữ liệu thường xuyên.

## Dữ liệu

- Có migration.
- Có type.
- Có schema validation.
- Có index phù hợp.
- Có RLS.
- Có audit cho hành động quan trọng.
- Có seed hoặc dữ liệu test.

## Bảo mật

- Kiểm tra quyền ở server.
- Không lộ dữ liệu nội bộ.
- Không lộ secret.
- Form công khai có chống spam/rate limit thích hợp.
- File riêng tư không public ngoài ý muốn.

## Giao diện

- Hoạt động trên mobile, tablet và desktop.
- Keyboard navigation cho luồng chính.
- Label form rõ ràng.
- Thông báo lỗi dễ hiểu.
- CTA chính nổi bật.
- Không vỡ layout với nội dung dài.

## Hiệu năng

- Không tải dữ liệu thừa rõ rệt.
- Hình ảnh được tối ưu.
- Danh sách lớn có pagination.
- Không có lỗi console nghiêm trọng.
- Không tạo request lặp vô hạn.

## Kiểm thử

- Typecheck pass.
- Lint pass.
- Test quan trọng pass.
- Luồng chính được kiểm thử thủ công.
- Có kiểm thử quyền truy cập.
- Có kiểm thử lỗi.

## Vận hành

- Có hướng dẫn sử dụng ngắn.
- Có log cần thiết.
- Có người sở hữu nghiệp vụ.
- Có cách rollback hoặc vô hiệu hóa.
- Có cấu hình production rõ ràng.

## Tiêu chuẩn go-live toàn nền tảng

- Website công khai hoạt động ổn định.
- CMS xuất bản được dữ liệu thật.
- Lead từ website vào CRM.
- Nhân viên xử lý được lead.
- Booking request được theo dõi.
- AI Import tạo được bản nháp.
- Phân quyền không để lộ dữ liệu nội bộ.
- Tracking nguồn khách hoạt động.
- Backup và rollback đã được xác nhận.
