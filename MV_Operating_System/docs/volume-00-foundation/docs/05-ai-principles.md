# 05 — AI Principles

## AI được triển khai trong V1

### AI Import Tour

Input:

- PDF.
- DOCX.
- Văn bản dán trực tiếp.

Output:

- Bản nháp sản phẩm có cấu trúc.
- Cảnh báo trường thiếu.
- Mức độ tin cậy.
- Nội dung rút gọn.
- Hashtag gợi ý.

### AI Content Assistant

Được phép:

- Rút gọn chương trình.
- Chuẩn hóa văn phong.
- Sinh meta title và meta description.
- Gợi ý FAQ.
- Gợi ý bài đăng mạng xã hội.

Tất cả nội dung phải ở trạng thái nháp trước khi xuất bản.

### AI Sales Assistant

Được phép:

- Tóm tắt lead.
- Gợi ý câu hỏi cần hỏi khách.
- Gợi ý sản phẩm phù hợp dựa trên dữ liệu đã duyệt.
- Gợi ý bước chăm sóc tiếp theo.

## AI không được phép

- Tự xác nhận booking.
- Tự xuất vé.
- Tự thay đổi giá.
- Tự sửa dữ liệu production không có review.
- Tự cam kết chỗ.
- Tự cam kết visa.
- Tự gửi báo giá cuối cùng không có người duyệt.
- Tự công bố thông tin nhà cung cấp.
- Bịa dữ liệu không có trong hệ thống.

## Quy trình AI Import

```text
UPLOAD
→ EXTRACT
→ NORMALIZE
→ VALIDATE
→ HUMAN REVIEW
→ APPROVE
→ PUBLISH
```

## Trường dữ liệu tour tối thiểu cần trích xuất

- Tên tour.
- Điểm đến.
- Thời lượng.
- Lịch khởi hành.
- Phương tiện.
- Giá.
- Lịch trình theo ngày.
- Bao gồm.
- Không bao gồm.
- Phụ thu.
- Chính sách trẻ em.
- Điều kiện thanh toán.
- Điều kiện hủy.
- Visa.
- Lưu ý.
- Thông tin file nguồn.

## Audit AI

Mỗi lần AI xử lý phải lưu:

- Người yêu cầu.
- Thời điểm.
- Model hoặc provider.
- Input reference.
- Output.
- Trạng thái.
- Người phê duyệt.
- Phiên bản sau chỉnh sửa.
