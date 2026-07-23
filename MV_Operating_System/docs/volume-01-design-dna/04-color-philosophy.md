# 04 - Color Philosophy

# Purpose

Màu sắc chỉ phục vụ nhận diện và điều hướng, không dùng để lấp đầy giao diện.

## Color Ratio

Surface: 85%

Sky Blue Accent (interactive): 10%

Navy (text/headings/footer bg): 5%

Gold: reserved exclusively for star-rating icons, effectively 0% of layout area

## Surface

- White (dominant — the canvas, not off-white or gray, per Sprint 2 direction)
- Light Gray (secondary surface only)

## Brand

Sky Blue — primary interactive color, sampled from the logo mark

HEX: #35A9E0 (`--accent` / `--sky` token)

Royal Blue — hover/pressed state for the above

HEX: #195DAA (`--royal` token)

Navy — text, headings, footer background only, never a button fill

HEX: #0B1F3A (`--primary` / `--navy` token)

Gold — legacy accent, now restricted (see Rules)

HEX: #C7A86B

## Rules

- Nền trắng là mặc định cho mọi surface, không dùng nền tối/off-white trừ hero (xem dưới).
- Mọi nút (CTA), hover state, link active state dùng Sky Blue — không dùng Navy đặc làm nền nút mặc định.
- Navy chỉ dùng cho text tĩnh, heading, và nền Footer.
- Gold **chỉ** được dùng cho icon sao đánh giá (star rating) — không dùng cho badge, CTA, eyebrow, hay bất kỳ chỗ nào khác. Đây là ngoại lệ duy nhất, theo quy ước UI toàn cầu (Google/Booking/Airbnb).
- Hero là nền video/ảnh thật (flycam), không phải màu phẳng — overlay tối chỉ đủ để chữ đọc được, không phủ kín như các surface khác.
- Không dùng gradient nếu không có mục đích rõ ràng.

## Forbidden

- Hero nền vàng.
- Card nền vàng.
- Footer vàng.
- Button vàng đặc (kể cả trên trang không phải homepage — không mở rộng thêm cách dùng vàng).
- Ảnh/video minh hoạ do AI render — banner và ảnh minh hoạ phải là ảnh/video thật.

## Claude Code Rules

Every page should look like a premium SaaS product rather than a traditional travel agency website.

## Acceptance Checklist

- [ ] White first (85%+ surface)
- [ ] Sky Blue là màu tương tác duy nhất (nút, hover, link)
- [ ] Navy chỉ ở text/heading/footer bg, không ở nút
- [ ] Gold chỉ xuất hiện ở sao đánh giá
