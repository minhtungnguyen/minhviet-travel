\
# 12 - Flight AI Architecture

> Minh Việt Digital Platform Master Bible  
> Version: 1.0.0

---

# Mục tiêu

Xây dựng lớp AI cho Flight Platform nhằm hỗ trợ khách hàng, nhân viên booking và nhà quản trị, đồng thời không thay thế các bước nghiệp vụ bắt buộc.

---

# Vai trò AI

AI hoạt động như một **AI Flight Assistant**.

Không tự ý:

- Xuất vé
- Thu tiền
- Hoàn tiền
- Xác nhận booking

Các thao tác trên phải do người có thẩm quyền hoặc quy trình được phê duyệt thực hiện.

---

# AI Capabilities

## AI Sales

- Gợi ý chuyến bay
- So sánh phương án
- Giải thích hạng vé
- Giải thích hành lý
- Gợi ý thời gian bay

---

## AI Booking Assistant

- Tóm tắt yêu cầu khách
- Kiểm tra dữ liệu thiếu
- Nhắc nhân viên các bước cần thực hiện
- Sinh email xác nhận

---

## AI Customer Care

- Tra cứu trạng thái booking
- Trả lời câu hỏi thường gặp
- Hướng dẫn đổi / hoàn vé
- Hướng dẫn check-in

---

## AI Management

- Phân tích doanh thu
- Phân tích nguồn khách
- Cảnh báo booking bất thường
- Gợi ý tối ưu vận hành

---

# AI Knowledge Base

Nguồn dữ liệu AI gồm:

- Chính sách hãng bay
- Quy định hành lý
- Quy định hoàn / đổi
- FAQ
- Quy trình nội bộ
- Cẩm nang nhân viên

---

# Guardrails

AI phải:

- Trả lời dựa trên dữ liệu hiện có.
- Nêu rõ khi không đủ thông tin.
- Ghi log các phiên tư vấn quan trọng.
- Không tự suy diễn chính sách.

---

# Integration

```text
User
  │
  ▼
AI Gateway
  │
  ├── Knowledge Base
  ├── CRM
  ├── Flight Service
  ├── CMS
  └── Analytics
```

---

# Claude Code Guidance

Thiết kế AI theo kiến trúc Service.

Không gắn AI trực tiếp vào UI hoặc Business Logic.

Mọi khả năng AI phải có thể bật/tắt bằng cấu hình.

---

# KPI

- Giảm thời gian xử lý yêu cầu.
- Tăng tỷ lệ chuyển đổi.
- Giảm câu hỏi lặp lại.
- Tăng mức độ hài lòng của khách hàng.

---

# Definition of Done

- AI Service độc lập.
- Có Prompt Template.
- Có Logging.
- Có Guardrails.
- Có khả năng thay đổi mô hình AI.

---

**End of 12-Flight-AI.md**
