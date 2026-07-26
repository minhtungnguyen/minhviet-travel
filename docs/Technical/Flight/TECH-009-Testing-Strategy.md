# TECH-009 – Testing Strategy

**Project:** Minh Việt Travel Platform  
**Module:** Flight  
**Document path:** `docs/Technical/Flight/TECH-009-Testing-Strategy.md`

---

# 1. Mục tiêu

Thiết lập chiến lược kiểm thử thống nhất cho Flight Module nhằm đảm bảo chất lượng phần mềm trước khi triển khai vào môi trường Production.

---

# 2. Phạm vi

Bao gồm:

- Unit Test
- Integration Test
- End-to-End (E2E) Test
- UI Test
- API Test
- Regression Test
- Performance Test cơ bản
- User Acceptance Test (UAT)

---

# 3. Kim tự tháp kiểm thử

```text
           E2E
      Integration
        Unit Test
```

Ưu tiên nhiều Unit Test, ít E2E nhưng bao phủ các luồng quan trọng.

---

# 4. Unit Test

Kiểm thử:

- Utility Functions
- Validation
- Formatters
- Hooks
- Zustand Stores
- Business Logic

Mục tiêu:

- Coverage ≥ 80%

---

# 5. Integration Test

Kiểm thử:

- Form + Validation
- Booking Flow
- Payment Flow (Mock)
- CMS CRUD
- API Integration (Mock)

---

# 6. End-to-End Test

Các kịch bản chính:

1. Tìm kiếm chuyến bay.
2. Xem chi tiết chuyến bay.
3. Đặt chỗ.
4. Thanh toán Mock thành công.
5. Thanh toán thất bại.
6. Tra cứu Booking.
7. Gửi yêu cầu đổi vé.
8. Gửi yêu cầu hoàn vé.
9. CRUD Banner.
10. CRUD FAQ.

---

# 7. UI Test

Kiểm tra:

- Responsive
- Loading State
- Empty State
- Error State
- Accessibility
- Keyboard Navigation

---

# 8. API Test

Kiểm tra:

- HTTP Status
- Response Schema
- Validation
- Authorization
- Rate Limit
- Error Response

---

# 9. Regression Test

Bắt buộc chạy trước mỗi lần phát hành:

- Homepage
- Search
- Booking
- Payment
- My Booking
- CMS
- SEO Landing

---

# 10. Performance Test

Kiểm tra:

- Search < 2 giây (Mock)
- Landing Page LCP
- API Response Time
- Bundle Size

---

# 11. UAT

Các nhóm tham gia:

- Booking
- Sale
- Điều hành
- Marketing
- Quản trị hệ thống

Tiêu chí:

- Đúng nghiệp vụ
- Dễ sử dụng
- Không lỗi nghiêm trọng

---

# 12. Công cụ đề xuất

- Vitest
- React Testing Library
- Playwright
- Mock Service Worker (MSW)
- Lighthouse

---

# 13. Điều kiện hoàn thành

- Unit Test Coverage ≥ 80%
- Luồng chính có E2E Test
- API có Integration Test
- Không còn lỗi Blocker hoặc Critical
- Báo cáo kiểm thử được lưu cùng mỗi lần phát hành
