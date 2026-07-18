# 06 — Development Rules

## Quy tắc bắt buộc

1. Không hardcode dữ liệu sản phẩm.
2. Không viết truy vấn database trực tiếp trong component UI.
3. Không tin dữ liệu từ client.
4. Không bỏ qua server-side authorization.
5. Không sửa schema thủ công trên production mà không có migration.
6. Không log mật khẩu, token, dữ liệu nhạy cảm.
7. Không dùng `any` nếu có thể định nghĩa kiểu.
8. Không tạo component dùng một lần nếu có thể giữ markup đơn giản tại trang.
9. Không trừu tượng hóa quá sớm.
10. Không thêm thư viện mới nếu thư viện hiện có giải quyết được.

## Validation

Mọi input phải được kiểm tra bằng Zod:

- Form công khai.
- Admin form.
- Query params.
- API payload.
- AI structured output.

## Error handling

Mọi chức năng phải có:

- Lỗi thân thiện cho người dùng.
- Log kỹ thuật cho quản trị.
- Không lộ stack trace ở production.
- Retry có kiểm soát với tác vụ nền.

## Security

- RLS cho bảng có dữ liệu người dùng hoặc nội bộ.
- Rate limit cho form công khai.
- CAPTCHA hoặc cơ chế chống spam khi cần.
- Sanitization cho rich text.
- Signed URL cho file riêng tư.
- Audit log cho thay đổi quan trọng.
- Principle of least privilege.

## Performance

- Dùng Server Components mặc định.
- Chỉ dùng Client Components khi cần tương tác.
- Tối ưu ảnh.
- Pagination cho danh sách lớn.
- Không tải toàn bộ dữ liệu CRM cùng lúc.
- Cache nội dung công khai phù hợp.
- Revalidate sau khi xuất bản.

## Git

Nhánh khuyến nghị:

```text
main
develop
feature/*
fix/*
```

Commit phải mô tả được thay đổi. Không commit secret và file build.

## Claude Code Action

Trước khi code:

1. Đọc tài liệu liên quan.
2. Viết kế hoạch ngắn.
3. Liệt kê file sẽ thay đổi.
4. Thực thi.
5. Chạy lint, typecheck và test liên quan.
6. Báo cáo kết quả và lỗi còn lại.
