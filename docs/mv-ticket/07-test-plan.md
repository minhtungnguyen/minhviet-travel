# 07 — Test Plan

## 0. Thực trạng công cụ test hiện có (quan trọng — ảnh hưởng phạm vi khả thi)

- **Vitest**, `include: ['**/*.test.ts']` — chỉ chạy `.test.ts`, **không chạy `.test.tsx`**. Không có `@testing-library`. Toàn bộ 23 test hiện có trong repo là test logic thuần (schema/mapper/service), không có test render component nào.
- **Không có E2E framework nào được cài đặt** (không Playwright config, không thư mục e2e trong repo — xác nhận trực tiếp, không suy đoán). Việc "browser-verify" trước đây dùng MCP Chrome/Playwright **thủ công**, không chạy trong CI.

**Quyết định cần chủ dự án duyệt trước Phase 6** (ghi ở `09-open-questions.md` #11): có thêm Playwright làm E2E framework thật cho riêng module này hay không — đây là thêm dependency/tooling mới cho toàn repo, không phải quyết định chỉ trong phạm vi 1 module.

## 1. Unit tests (Vitest, `.test.ts`, colocated đúng convention)

| Đối tượng | File | Case chính |
|---|---|---|
| Mapper OneInventory → domain | `integrations/attraction-ticket/mappers/one-inventory-mapper.test.ts` | Map đúng field khi response hợp lệ; ném lỗi chuẩn hoá khi response thiếu field bắt buộc |
| Request/response schema | `integrations/attraction-ticket/schemas/*.test.ts` | Từ chối payload sai kiểu; chấp nhận payload hợp lệ tối thiểu |
| Error mapping | `integrations/attraction-ticket/errors/one-inventory-error.test.ts` | Map đúng mã lỗi OneInventory → `AppError` nội bộ; không log secret |
| Pricing/tổng tiền checkout | `modules/attraction-ticket/application/attraction-booking.service.test.ts` | Tính đúng tổng theo số lượng × đơn giá; từ chối số lượng ≤ 0 |
| Booking state transition | cùng file trên | Chỉ cho phép chuyển trạng thái hợp lệ (`INITIATED→PENDING_PAYMENT→CONFIRMED/FAILED`, không cho `CONFIRMED→INITIATED`) |
| Idempotency | `modules/attraction-ticket/application/attraction-booking.service.test.ts` | Gọi `createOrder` 2 lần cùng `idempotency_key` → chỉ tạo 1 đơn |
| Repository (Supabase mock/fixture) | `modules/attraction-ticket/infrastructure/*.test.ts` | Map đúng row snake_case → domain camelCase, giống pattern `cms.service.test.ts` đã có |

## 2. Integration tests (fixtures/mocks, KHÔNG dùng Production API — đúng §XIV brief)

- `OneInventoryProvider` test với **fixture cố định** trong `integrations/attraction-ticket/fixtures/*.json` (mock HTTP layer, không gọi mạng thật kể cả Sandbox trong test tự động).
- `createOrder` → `confirmPayment` → `retrieveVoucher` full flow với response fixture mô phỏng thành công và thất bại.
- `cancelOrder` với fixture mô phỏng trong/ngoài chính sách hủy.
- Test riêng gọi **Sandbox thật** (không phải fixture) chỉ chạy **thủ công/CI riêng có gắn cờ**, không nằm trong `pnpm test` mặc định — tránh phụ thuộc mạng ngoài làm test suite không ổn định.

## 3. E2E (phụ thuộc quyết định công cụ ở §0)

Nếu được duyệt thêm Playwright, kịch bản tối thiểu theo đúng brief §XIV:
- Search → Product detail → Chọn ngày → Chọn loại vé → Checkout → Booking success
- API failure (mock Adapter trả lỗi) → hiển thị thông báo thân thiện, không crash trang
- Out-of-stock (mock trả hết vé) → CTA disable đúng, thông báo rõ ràng
- Duplicate submit (double-click nút thanh toán) → chỉ tạo 1 đơn
- Mobile flow (viewport 390px) → sticky CTA hoạt động, không che nội dung

Nếu KHÔNG được duyệt thêm Playwright trong V1: thay bằng checklist browser-verify thủ công đầy đủ (ghi lại kết quả từng viewport, đúng cách đã làm ở Combo/Flight trước đây), không bỏ qua bước kiểm chứng UI thật — chỉ khác là không tự động hoá được trong CI.

## 4. Test không được làm

- Không test tự động chạy thẳng vào Production OneInventory API.
- Không hardcode secret thật trong bất kỳ file fixture/test nào.
