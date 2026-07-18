# 03 — Product Principles

## 1. CMS-first

Không hardcode nội dung kinh doanh quan trọng trong component. Tour, bài viết, banner, điểm đến, FAQ, chính sách và thông tin liên hệ phải quản trị được.

## 2. CRM-by-default

Mọi hành động có giá trị bán hàng phải tạo hoặc cập nhật lead, bao gồm:

- Gửi form.
- Yêu cầu báo giá.
- Yêu cầu booking.
- Để lại số điện thoại.
- Tải chương trình.
- Bấm CTA có định danh khi người dùng đã cung cấp thông tin.

## 3. Human-in-the-loop

Nhân viên là người xác nhận cuối cùng đối với:

- Giá cuối.
- Tình trạng chỗ.
- Booking.
- Vé.
- Visa.
- Điều khoản thanh toán.
- Nội dung do AI tạo trước khi xuất bản.

## 4. Single source of truth

Mỗi loại dữ liệu chỉ có một nguồn chính:

- Sản phẩm: bảng sản phẩm tương ứng.
- Lead: CRM.
- Booking: booking records.
- Nhân viên: auth profile.
- Nội dung website: CMS.
- Cấu hình công ty: settings.

## 5. Reusable data

Dữ liệu phải dùng lại được trên:

- Website.
- Landing page.
- CRM.
- AI tư vấn.
- Nội dung mạng xã hội.
- Báo cáo.

## 6. Mobile-first

Toàn bộ frontend công khai phải tối ưu cho điện thoại trước, đặc biệt:

- CTA.
- Form.
- Bộ lọc.
- Trang chi tiết.
- Nút Zalo và gọi điện.
- Tốc độ tải.

## 7. Publish workflow

Nội dung và sản phẩm phải có:

```text
DRAFT → REVIEW → PUBLISHED → ARCHIVED
```

## 8. Measurable conversion

Mọi CTA quan trọng phải có event tracking và source attribution.

## 9. No dead-end page

Mọi trang bán hàng phải có ít nhất một hành động tiếp theo rõ ràng:

- Gửi yêu cầu.
- Gọi điện.
- Chat Zalo.
- Xem sản phẩm liên quan.
- Đăng ký nhận tư vấn.

## 10. V1 simplicity

Không xây tính năng phức tạp khi quy trình thủ công có kiểm soát vẫn đáp ứng được giai đoạn go-live.
