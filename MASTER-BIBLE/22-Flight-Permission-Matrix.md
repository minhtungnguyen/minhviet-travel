\
# 22 - Flight Permission Matrix

> Minh Việt Digital Platform Master Bible
> Version: 1.0.0

---

# Mục tiêu

Định nghĩa ma trận phân quyền (Permission Matrix) cho Flight Platform nhằm đảm bảo mọi người dùng chỉ được thực hiện các hành động phù hợp với vai trò của mình.

---

# Nguyên tắc

- Least Privilege (quyền tối thiểu)
- Role-Based Access Control (RBAC)
- Mọi thao tác quan trọng phải được ghi Audit Log
- Không kiểm tra quyền chỉ ở Frontend, Backend là lớp quyết định cuối cùng

---

# Vai trò hệ thống

| Vai trò | Mô tả |
|---------|-------|
| Super Admin | Toàn quyền hệ thống |
| Admin | Quản trị vận hành |
| Booking | Xử lý booking và xuất vé |
| Accountant | Thanh toán, hóa đơn |
| Customer Service | Hỗ trợ khách hàng |
| Sales | Tiếp nhận và chăm sóc khách |
| Viewer | Chỉ xem dữ liệu |

---

# Permission Matrix

| Chức năng | Super Admin | Admin | Booking | Accountant | CSKH | Sales | Viewer |
|-----------|:-----------:|:-----:|:-------:|:-----------:|:----:|:-----:|:------:|
| Dashboard | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Flight Requests | ✔ | ✔ | ✔ | ○ | ✔ | ✔ | ✔ |
| Booking | ✔ | ✔ | ✔ | ○ | ○ | ○ | ✔ |
| Xuất vé | ✔ | ✔ | ✔ | ✖ | ✖ | ✖ | ✖ |
| Thanh toán | ✔ | ✔ | ○ | ✔ | ✖ | ✖ | ✖ |
| Báo cáo | ✔ | ✔ | ✔ | ✔ | ○ | ○ | ✔ |
| Quản trị người dùng | ✔ | ✔ | ✖ | ✖ | ✖ | ✖ | ✖ |
| Cấu hình hệ thống | ✔ | ✔ | ✖ | ✖ | ✖ | ✖ | ✖ |

Chú thích:

- ✔ Toàn quyền
- ○ Quyền hạn chế
- ✖ Không có quyền

---

# Quy tắc phân quyền

- Quyền được kiểm tra theo Role và Permission.
- Có thể mở rộng sang Permission theo từng hành động (Create, Read, Update, Delete).
- Hỗ trợ phân quyền theo Module trong tương lai.

---

# Audit

Lưu lại:

- Người thực hiện
- Vai trò
- Thời gian
- Hành động
- Đối tượng tác động
- IP và thiết bị (nếu có)

---

# Claude Code Guidance

- RBAC triển khai ở Middleware/Guard.
- Không hard-code quyền trong UI.
- Sử dụng enum và permission constants để dễ mở rộng.

---

# Definition of Done

- Ma trận quyền hoàn chỉnh
- RBAC hoạt động
- Audit Log tích hợp
- Có khả năng mở rộng Permission theo Module

---

**End of 22-Flight-Permission-Matrix.md**
