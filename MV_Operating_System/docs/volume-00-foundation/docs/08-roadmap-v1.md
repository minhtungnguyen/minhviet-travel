# 08 — Roadmap V1

## Mục tiêu

Go-live sớm với phạm vi P0. Không chia theo tài liệu; chia theo phần mềm chạy được.

## Sprint 0 — Audit và ổn định nền móng

Đầu ra:

- Kiểm tra code hiện tại.
- Chốt environment.
- Chốt schema hiện có.
- Chốt auth.
- Lập backlog lỗi.
- Tạo migration baseline.
- Xác nhận deploy preview hoạt động.

## Sprint 1 — CMS sản phẩm

Đầu ra:

- Tour CRUD.
- Destination CRUD.
- Media upload.
- Publish workflow.
- Public listing và detail lấy dữ liệu thật.

## Sprint 2 — Lead và CRM

Đầu ra:

- Form công khai.
- Lead creation.
- Lead list/detail.
- Assignment.
- Status.
- Notes và activity log.
- Thông báo lead mới.

## Sprint 3 — Booking Request

Đầu ra:

- Form yêu cầu booking.
- Liên kết lead.
- Quy trình trạng thái.
- Dữ liệu hành khách cơ bản.
- Theo dõi cọc cơ bản.

## Sprint 4 — AI Import

Đầu ra:

- Upload.
- Extract.
- Structured output.
- Validation.
- Human review.
- Save draft.
- Audit log.

## Sprint 5 — Hoàn thiện website và đo lường

Đầu ra:

- Homepage.
- Search/filter cơ bản.
- SEO.
- Analytics events.
- UTM attribution.
- Performance.
- Responsive QA.
- Accessibility cơ bản.

## Sprint 6 — Go-live hardening

Đầu ra:

- Security review.
- RLS review.
- Backup.
- Error monitoring.
- Production seed/config.
- Content QA.
- Redirect.
- Domain.
- Runbook.
- Rollback plan.

## Cổng kiểm soát

Chỉ chuyển Sprint khi:

- Chức năng chạy trên preview.
- Không có lỗi typecheck.
- Không có lỗi lint nghiêm trọng.
- Acceptance criteria đạt.
- Dữ liệu test có thể tạo, sửa, xóa hoặc lưu trữ đúng quy trình.
