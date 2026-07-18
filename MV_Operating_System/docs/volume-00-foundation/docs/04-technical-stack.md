# 04 — Technical Stack

## Kiến trúc V1

Sử dụng modular monolith trong một repository Next.js. Không tách microservice ở V1.

```text
Next.js Application
├── Public Website
├── Admin CMS
├── CRM
├── Booking
├── AI Import
├── Server Actions / Route Handlers
└── Shared Domain Services
        ↓
Supabase PostgreSQL + Auth + Storage
```

## Công nghệ bắt buộc

### Frontend

- Next.js App Router.
- TypeScript strict mode.
- Tailwind CSS.
- shadcn/ui.
- React Hook Form.
- Zod.

### Backend

- Next.js Route Handlers hoặc Server Actions.
- Service layer tách khỏi UI.
- Supabase client phía server.
- PostgreSQL functions chỉ dùng khi thực sự cần.

### Database

- Supabase PostgreSQL.
- UUID primary key.
- `created_at`, `updated_at`.
- Soft delete cho dữ liệu nghiệp vụ quan trọng khi phù hợp.
- Row Level Security.
- Migration được lưu trong Git.

### Auth và phân quyền

Vai trò tối thiểu:

```text
SUPER_ADMIN
ADMIN
MANAGER
SALES
BOOKING
OPERATION
MARKETING
VIEWER
```

Phân quyền phải kiểm tra ở server, không chỉ ẩn nút ở giao diện.

### Storage

Supabase Storage cho:

- Ảnh sản phẩm.
- Tài liệu chương trình.
- File import.
- Media CMS.

### Deployment

- GitHub làm nguồn code chính.
- Vercel cho production và preview.
- Supabase project riêng cho production.
- Environment variables không commit.
- Preview deployment không dùng database production nếu có thể tránh.

## Cấu trúc code khuyến nghị

```text
src/
├── app/
│   ├── (public)/
│   ├── admin/
│   ├── api/
│   └── auth/
├── components/
├── features/
│   ├── tours/
│   ├── crm/
│   ├── bookings/
│   ├── cms/
│   └── ai-import/
├── lib/
├── services/
├── schemas/
├── types/
└── config/
```

## Quy tắc tích hợp bên ngoài

Mọi tích hợp phải đi qua adapter riêng. Không gọi trực tiếp API bên thứ ba từ component.
