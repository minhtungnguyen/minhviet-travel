\
# 17 - Flight Testing Strategy

> Minh Việt Digital Platform Master Bible
> Version: 1.0.0

---

# Mục tiêu

Xây dựng chiến lược kiểm thử toàn diện nhằm đảm bảo Flight Platform hoạt động ổn định, chính xác và an toàn trước khi triển khai vào môi trường Production.

---

# Nguyên tắc

- Testing là một phần của quy trình phát triển.
- Mỗi tính năng mới phải có test tương ứng.
- Ưu tiên tự động hóa kiểm thử.

---

# Testing Pyramid

```text
            E2E Tests
         Integration Tests
            Unit Tests
```

- Unit Test: nhiều nhất
- Integration Test: mức trung bình
- End-to-End Test: tập trung vào luồng nghiệp vụ chính

---

# Phạm vi kiểm thử

## Unit Test

- Business Logic
- Utility Functions
- Validation
- Pricing Rules

## Integration Test

- API ↔ Database
- API ↔ Queue
- API ↔ Provider Adapter
- Notification Service

## End-to-End Test

- Tìm kiếm chuyến bay
- Gửi yêu cầu booking
- Thanh toán
- Xuất vé
- Gửi E-ticket

---

# Phi chức năng

- Performance Test
- Load Test
- Security Test
- Accessibility Test
- Cross-browser Test

---

# Test Data

- Dữ liệu giả lập
- Không dùng dữ liệu khách hàng thật
- Seed dữ liệu tự động

---

# CI/CD

Pipeline cần thực hiện:

1. Lint
2. Type Check
3. Unit Test
4. Integration Test
5. Build
6. Deploy Staging
7. Smoke Test
8. Deploy Production

---

# Công cụ đề xuất

- Vitest / Jest
- Playwright
- Postman / Bruno
- k6 (Load Test)

---

# Claude Code Guidance

- Không merge nếu Unit Test thất bại.
- Mỗi bug cần có regression test.
- Test phải chạy được trên CI.

---

# Definition of Done

- Unit Test ≥ 80% các service cốt lõi
- Integration Test cho API chính
- E2E cho luồng đặt vé
- Smoke Test sau triển khai
- Báo cáo kết quả kiểm thử

---

**End of 17-Flight-Testing-Strategy.md**
