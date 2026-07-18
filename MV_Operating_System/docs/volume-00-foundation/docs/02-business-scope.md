# 02 — Business Scope

## Nhóm sản phẩm được hỗ trợ

1. Tour trong nước.
2. Tour quốc tế.
3. Tour đoàn doanh nghiệp.
4. MICE, hội nghị, hội thảo.
5. Team building và gala dinner.
6. Khách sạn và resort.
7. Du thuyền.
8. Vé vui chơi và trải nghiệm.
9. Vé máy bay dưới dạng yêu cầu tư vấn.
10. Thuê xe.
11. Visa.
12. Bảo hiểm du lịch.

## Mô hình giao dịch V1

Khách hàng không tự động hoàn tất toàn bộ giao dịch.

Luồng chuẩn:

```text
Khách xem sản phẩm
→ Gửi yêu cầu
→ CRM tạo lead
→ Nhân viên kiểm tra
→ Tư vấn và báo giá
→ Xác nhận dịch vụ
→ Ghi nhận booking
→ Theo dõi thanh toán
→ Chăm sóc trước, trong và sau chuyến đi
```

## Kênh tạo lead

- Form website.
- Nút gọi điện.
- Zalo.
- Chat.
- Landing page.
- Nhập thủ công bởi nhân viên.
- Import từ danh sách có kiểm soát.
- Chiến dịch marketing có UTM.

## Trạng thái lead chuẩn

```text
NEW
CONTACTED
QUALIFIED
QUOTED
NEGOTIATING
BOOKED
LOST
INVALID
```

## Trạng thái booking request

```text
DRAFT
SUBMITTED
CHECKING
AVAILABLE
PENDING_DEPOSIT
CONFIRMED
CANCELLED
COMPLETED
```

## Nguyên tắc nhà cung cấp

- Không hiển thị nhà cung cấp trên frontend nếu không có phê duyệt.
- Dữ liệu nhà cung cấp chỉ dùng nội bộ.
- Giá nhập, điều khoản và thông tin liên hệ là dữ liệu nhạy cảm.
- Mọi thay đổi giá phải có người cập nhật và thời điểm hiệu lực.

## Phạm vi dữ liệu tài chính V1

Được phép:

- Giá bán.
- Giá từ.
- Phụ thu.
- Tiền cọc dự kiến.
- Trạng thái thanh toán.
- Số tiền đã thu và còn lại ở mức booking.

Chưa triển khai:

- Sổ cái.
- Hạch toán kế toán.
- Công nợ đầy đủ.
- Xuất hóa đơn điện tử tự động.
