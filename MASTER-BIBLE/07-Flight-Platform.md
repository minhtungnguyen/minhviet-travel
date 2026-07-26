\
# 07 - Flight Platform

> Minh Việt Digital Platform Master Bible  
> Version: 1.0.0

---

# Mục tiêu

Flight Platform là nền tảng bán vé máy bay thuộc hệ sinh thái Minh Việt Digital Platform.

Mục tiêu không chỉ là bán vé mà còn quản lý toàn bộ vòng đời của một đơn hàng vé máy bay, từ tìm kiếm đến chăm sóc sau bán.

---

# Phạm vi

- Chuyến bay nội địa
- Chuyến bay quốc tế
- Đặt giữ chỗ
- Quản lý booking
- Thanh toán
- Xuất vé
- Hoàn / Đổi vé
- Báo cáo
- CRM

---

# Vai trò người dùng

## Khách hàng

- Tìm chuyến bay
- Gửi yêu cầu đặt vé
- Thanh toán
- Theo dõi đơn hàng

## Booking

- Kiểm tra yêu cầu
- Giữ chỗ
- Xác nhận giá
- Xuất vé
- Hỗ trợ đổi/hoàn

## Kế toán

- Đối soát thanh toán
- Công nợ
- Hóa đơn

## Quản trị

- Quản lý hãng bay
- Quản lý sân bay
- Chính sách
- Báo cáo

---

# Business Flow

```text
Tìm chuyến
      │
      ▼
Chọn hành trình
      │
      ▼
Gửi yêu cầu
      │
      ▼
Booking xác nhận
      │
      ▼
Thanh toán
      │
      ▼
Xuất vé
      │
      ▼
CSKH sau bán
```

---

# Core Entities

- Airline
- Airport
- FlightRoute
- FlightRequest
- Booking
- Passenger
- Ticket
- Payment
- Invoice

---

# AI Features

- Gợi ý chuyến bay phù hợp
- Giải thích điều kiện vé
- So sánh lựa chọn
- Hỗ trợ CSKH
- Phân loại lead
- Dự đoán nhu cầu

---

# KPI

- Thời gian phản hồi yêu cầu < 10 phút
- Thời gian xử lý booking < 30 phút
- Giảm thao tác thủ công
- Tăng tỷ lệ chuyển đổi

---

# Definition of Done

- Có UI
- Có API
- Có Database
- Có Logging
- Có Permission
- Có Audit
- Có Test

---

# Claude Code Guidance

Ưu tiên kiến trúc module.

Không gắn chặt logic vào nhà cung cấp API.

Tạo Adapter Layer để có thể thay đổi hoặc bổ sung nhà cung cấp mà không ảnh hưởng Business Logic.

---

# Revision History

| Version | Notes |
|----------|-------|
|1.0.0|Initial release|

**End of 07-Flight-Platform.md**
