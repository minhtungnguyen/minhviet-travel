# 02 - Product Constitution

> Minh Việt Digital Platform Master Bible  
> Version: 1.0.0

---

# Purpose

Tài liệu này quy định các nguyên tắc bắt buộc trong quá trình thiết kế, phát triển và vận hành toàn bộ hệ sinh thái Minh Việt Digital Platform.

Mọi thành viên và AI tham gia dự án phải tuân thủ các điều khoản dưới đây.

---

# Article 01 — User First

Mọi tính năng phải giải quyết một nhu cầu thực tế của người dùng.

Không phát triển tính năng chỉ vì đối thủ có.

---

# Article 02 — Platform First

Không xây các ứng dụng rời rạc.

Mọi sản phẩm mới phải ưu tiên tái sử dụng:

- Authentication
- CMS
- CRM
- Notification
- AI Services
- Logging
- Permission

---

# Article 03 — Data First

Dữ liệu là tài sản lâu dài.

Mọi module phải:

- Có cấu trúc dữ liệu rõ ràng.
- Có khóa định danh.
- Có lịch sử thay đổi.
- Sẵn sàng phục vụ AI.

---

# Article 04 — AI Native

AI là thành phần mặc định của nền tảng.

Mỗi module mới phải trả lời được:

- AI hỗ trợ người dùng ở đâu?
- AI hỗ trợ nhân viên ở đâu?
- AI hỗ trợ quản trị ở đâu?

---

# Article 05 — Documentation First

Không triển khai chức năng lớn nếu chưa có tài liệu thiết kế.

Tối thiểu phải có:

- Business Flow
- Data Model
- API Contract
- Acceptance Criteria

---

# Article 06 — Clean Architecture

Tách rõ:

- Presentation
- Application
- Domain
- Infrastructure

Không để Business Logic nằm trong giao diện.

---

# Article 07 — Security by Design

Mọi tính năng phải xem xét:

- Authentication
- Authorization
- Audit Log
- Input Validation
- Rate Limiting
- Backup

---

# Article 08 — Quality Standard

Definition of Done:

- Hoàn thành chức năng.
- Qua kiểm thử.
- Có tài liệu.
- Có khả năng mở rộng.
- Không phát sinh lỗi nghiêm trọng.

---

# Decision Rules

Khi có nhiều phương án:

1. Ưu tiên phương án đơn giản.
2. Ưu tiên khả năng mở rộng.
3. Ưu tiên tái sử dụng.
4. Ưu tiên trải nghiệm người dùng.

---

# Checklist trước khi Merge

- [ ] Đúng yêu cầu nghiệp vụ.
- [ ] Đúng kiến trúc.
- [ ] Có tài liệu.
- [ ] Có kiểm thử.
- [ ] Không ảnh hưởng module khác.

---

# Revision History

| Version | Date | Notes |
|---------|------|-------|
|1.0.0|Initial|First Product Constitution|

---

**End of 02-Product-Constitution.md**
