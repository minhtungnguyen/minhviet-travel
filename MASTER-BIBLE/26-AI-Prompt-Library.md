\
# 26 - AI Prompt Library

> Minh Việt Digital Platform Master Bible
> Version: 1.0.0

---

# Mục tiêu

Xây dựng thư viện Prompt chuẩn dùng chung cho toàn bộ Flight Platform nhằm đảm bảo AI phản hồi nhất quán, đúng nghiệp vụ và dễ bảo trì.

---

# Kiến trúc Prompt

```text
User
   │
Prompt Router
   │
───────────────
Sales Prompt
Booking Prompt
Support Prompt
Management Prompt
Admin Prompt
───────────────
LLM
```

---

# Nhóm Prompt

## 1. Sales Assistant

Mục tiêu:

- Tư vấn chuyến bay
- So sánh giá
- Gợi ý hành trình
- Upsell dịch vụ

---

## 2. Booking Assistant

- Kiểm tra dữ liệu
- Tóm tắt booking
- Soạn email xác nhận
- Kiểm tra điều kiện vé

---

## 3. Customer Support

- Tra cứu booking
- Hướng dẫn check-in
- Chính sách hoàn/đổi
- FAQ

---

## 4. Manager Assistant

- Phân tích doanh thu
- Phân tích KPI
- Cảnh báo bất thường
- Đề xuất cải tiến

---

## 5. Admin Assistant

- Giải thích lỗi
- Hỗ trợ CMS
- Hướng dẫn quy trình
- Kiểm tra cấu hình

---

# Prompt Template

Mỗi Prompt gồm:

- Role
- Goal
- Context
- Input
- Constraints
- Output Format
- Examples

---

# Guardrails

AI phải:

- Không tự tạo chính sách.
- Không tự xác nhận giao dịch.
- Trả lời dựa trên Knowledge Base.
- Báo rõ khi thiếu dữ liệu.

---

# Versioning

Ví dụ:

- Prompt v1.0
- Prompt v1.1
- Prompt v2.0

Lưu lịch sử thay đổi.

---

# Claude Code Guidance

- Prompt lưu trong thư mục riêng.
- Có metadata.
- Hỗ trợ đa ngôn ngữ.
- Có khả năng A/B Testing.

---

# Definition of Done

- Prompt Library hoàn chỉnh
- Template chuẩn
- Versioning
- Guardrails
- Metadata

---

**End of 26-AI-Prompt-Library.md**
