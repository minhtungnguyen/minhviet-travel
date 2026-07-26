\
# 06 - Information Architecture

> Minh Việt Digital Platform Master Bible  
> Version: 1.0.0

---

# Mục tiêu

Information Architecture (IA) định nghĩa cách tổ chức toàn bộ dữ liệu, chức năng và luồng điều hướng của hệ sinh thái Minh Việt Digital Platform.

IA là nền móng cho:

- UI/UX
- Database
- API
- CMS
- SEO
- Mobile App

---

# Kiến trúc tổng thể

```text
                    MV Travel OS
                         │
 ┌──────────────┬───────────────┬──────────────┐
 │              │               │              │
 CMS           CRM          AI Services     Identity
 │              │               │              │
 ├──────────────┴───────┬───────┴──────────────┤
 │                      │                      │
 Flight              Hotel                 Tour
 │                      │                      │
 Cruise             Tickets              MIVIGO
```

---

# Domain Structure

## Core Platform

- Authentication
- Authorization
- User
- Organization
- Media
- Notification
- Settings
- Audit Log

## Business Modules

- Flight
- Hotel
- Cruise
- Tour
- Visa
- Insurance
- Attraction Tickets
- Transportation

## Operation Modules

- CMS
- CRM
- ERP
- Finance
- Reports
- AI Assistant

---

# Navigation Principles

1. Điều hướng tối đa 3 cấp.
2. Người dùng luôn biết mình đang ở đâu.
3. Mọi module có Dashboard riêng.
4. Tìm kiếm xuất hiện ở mọi khu vực quản trị.

---

# CMS Mapping

Mọi module đều phải hỗ trợ:

- Danh mục
- Nội dung
- SEO
- Hình ảnh
- File
- Tag
- Trạng thái
- Lịch sử chỉnh sửa

---

# URL Principles

Ví dụ:

```text
/flights
/flights/domestic
/flights/international

/hotels
/hotels/cat-ba

/tours
/tours/japan
```

URL:

- Ngắn
- Có nghĩa
- Thân thiện SEO
- Không thay đổi nếu không thật cần thiết

---

# Metadata Standard

Mỗi thực thể phải có tối thiểu:

- id
- slug
- title
- summary
- content
- status
- created_at
- updated_at
- published_at
- created_by
- updated_by

---

# AI Requirements

AI phải có khả năng truy cập dữ liệu theo Domain thay vì truy cập trực tiếp từng bảng.

Không được để AI phụ thuộc vào cấu trúc cơ sở dữ liệu vật lý.

---

# Claude Code Guidance

Trước khi tạo bất kỳ module nào:

1. Xác định Domain.
2. Thiết kế Entity.
3. Thiết kế Navigation.
4. Thiết kế API.
5. Sau đó mới viết giao diện.

---

# Revision History

| Version | Notes |
|----------|-------|
|1.0.0|Initial release|

**End of 06-Information-Architecture.md**
