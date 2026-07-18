# 11 - Component Principles

# Purpose
Mọi component phải tạo cảm giác thống nhất trên toàn bộ hệ sinh thái.

## Design Philosophy
- Component phục vụ tác vụ.
- Có thể tái sử dụng.
- Có trạng thái rõ ràng.

## Required States
- Default
- Hover
- Focus
- Active
- Disabled
- Loading
- Error
- Success

## Component Rules
### Button
- 1 Primary
- 1 Secondary
- 1 Ghost
- Không quá nhiều biến thể.

### Card
- Radius 16px
- Padding nhất quán
- Shadow nhẹ

### Form
- Label luôn hiển thị
- Thông báo lỗi ngay dưới field
- Không chỉ dùng màu để báo lỗi

## Claude Code Rules
Không tạo component mới nếu component hiện có chỉ cần mở rộng.

## Acceptance
- [ ] Reusable
- [ ] Accessible
- [ ] Responsive
