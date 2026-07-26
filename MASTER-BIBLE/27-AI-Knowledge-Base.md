\
# 27 - AI Knowledge Base

> Minh Việt Digital Platform Master Bible
> Version: 1.0.0

---

# Mục tiêu

Xây dựng AI Knowledge Base làm nguồn tri thức chuẩn cho toàn bộ Flight Platform và là nền tảng để mở rộng sang các module khác trong MV Travel OS.

---

# Nguyên tắc

- Single Source of Truth
- Có kiểm duyệt nội dung
- Có version
- Có khả năng tìm kiếm ngữ nghĩa (Semantic Search)
- Hỗ trợ RAG (Retrieval-Augmented Generation)

---

# Nguồn dữ liệu

## Nghiệp vụ

- Quy trình booking
- Quy trình xuất vé
- Quy trình hoàn/đổi
- Quy trình thanh toán

## Chính sách

- Chính sách hãng bay
- Quy định hành lý
- Điều kiện vé
- Quy định check-in

## Tri thức doanh nghiệp

- SOP nội bộ
- FAQ
- Hướng dẫn nhân viên
- Mẫu email
- Mẫu thông báo

---

# Kiến trúc

```text
Documents
    │
Data Cleaning
    │
Chunking
    │
Embedding
    │
Vector Database
    │
RAG Service
    │
LLM
```

---

# Metadata

Mỗi tài liệu cần có:

- ID
- Tiêu đề
- Danh mục
- Nguồn
- Phiên bản
- Ngày hiệu lực
- Người phê duyệt
- Trạng thái

---

# Quy trình cập nhật

1. Tiếp nhận tài liệu
2. Kiểm duyệt
3. Chuẩn hóa
4. Đánh chỉ mục
5. Sinh Embedding
6. Phát hành

---

# Bảo mật

- Phân quyền theo vai trò
- Mã hóa dữ liệu nhạy cảm
- Ghi Audit Log
- Theo dõi lịch sử thay đổi

---

# Claude Code Guidance

- Knowledge Base tách khỏi Prompt.
- Hỗ trợ nhiều nguồn dữ liệu (PDF, DOCX, HTML, CMS).
- Thiết kế API để các module khác tái sử dụng.

---

# Definition of Done

- Knowledge Repository
- Metadata đầy đủ
- Semantic Search
- RAG Ready
- Versioning
- Audit Log

---

**End of 27-AI-Knowledge-Base.md**
