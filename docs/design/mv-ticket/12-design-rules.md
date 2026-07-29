# MV Ticket — 100 Design Rules

Danh sách này tổng hợp và cụ thể hoá toàn bộ `01`–`11` thành các luật ngắn, kiểm tra được, dùng làm checklist cuối cùng trước khi bất kỳ màn hình nào được coi là "đạt". Mỗi luật là một câu lệnh — vi phạm 1 luật là đủ để yêu cầu sửa trước khi duyệt.

---

## A. Nhận diện & Chống Tour-hoá (1–10)

1. Không dùng Hero của Tour (ảnh phong cảnh tĩnh + overlay tối phủ kín + headline dài).
2. Không dùng Card của Tour (ảnh — mô tả dài — "Giá từ" nhỏ — link mảnh).
3. Không dùng Product Detail của Tour (timeline, "Ngày 1/Ngày 2/Ngày 3", lịch trình).
4. Không dùng giọng văn tư vấn viên ("Hãy để chúng tôi đồng hành cùng bạn...") ở bất kỳ đâu trong module này.
5. Không đặt block "Vì sao chọn Minh Việt" lên trên Gallery/dải sản phẩm ở bất kỳ trang nào.
6. Mọi màn hình phải trả lời được 1 trong 7 câu hỏi mindset khách vé vui chơi (`01-design-direction.md` §2) — nếu không, xoá.
7. Không copy nguyên bố cục/spacing rhythm của `combo-hero.tsx`/`combo-card.tsx` cho module này.
8. Trước khi duyệt bất kỳ màn hình nào, phải tự hỏi: "Người xem có nói đây là website Tour không?" — nếu có, thất bại.
9. Emotion chủ đạo toàn module là Excitement/Energy — không phải Trust/Calm của nền tảng (`01-design-direction.md` §3).
10. "Sôi động" khác "Rẻ tiền" — ranh giới là dữ liệu thật đứng sau mọi tín hiệu thị giác (badge, số liệu, urgency).

## B. Hero (11–18)

11. Hero không dùng ảnh phong cảnh/kiến trúc không người (`07-photography-guideline.md` §1).
12. Hero phải có con người/hành động thật, ưu tiên chuyển động.
13. Hero chiều cao thấp hơn hero Tour/Combo hiện tại (~40–45vh mobile, không chiếm trọn màn hình đầu).
14. Overlay trên hero chỉ đủ để chữ đọc được, không phủ kín khung hình.
15. Headline hero ngắn, có động từ hành động, không phải câu văn hoa mỹ.
16. Search box trong hero tối giản (điểm đến + ngày), không thêm field không cần thiết.
17. Hero không nghiệm thu với ảnh placeholder — chỉ nghiệm thu với ảnh/video đạt chuẩn shot-list thật.
18. Trust badge trong hero chỉ nêu cam kết có thể kiểm chứng được (vé điện tử, giá minh bạch) — không cam kết chưa xác nhận.

## C. Card (19–28)

19. Card không phải editorial — card phải "nhìn như đang shopping".
20. Giá là yếu tố thị giác mạnh nhất trên card sau ảnh — không nhỏ hơn tiêu đề sản phẩm.
21. Card luôn có ít nhất 1 badge có dữ liệu thật, hoặc không có badge nào — không có badge trang trí vô căn cứ.
22. Rating chỉ hiển thị khi có dữ liệu thật; ẩn hoàn toàn (không icon sao rỗng) nếu chưa có.
23. Card phải tự trả lời được "có vé/giá bao nhiêu" mà không cần bấm vào.
24. Mô tả trên card tối đa 1 dòng meta — không đoạn văn dài.
25. CTA trên card dùng động từ hành động ("Chọn vé"), không dùng link mảnh thụ động.
26. Toàn bộ diện tích card là target bấm được, không chỉ vùng ảnh hoặc chỉ nút CTA.
27. Hover card: nâng nhẹ 4–8px + shadow mềm — không đổi màu nền toàn card, không tilt 3D.
28. Card destination tile (điểm đến) và card sản phẩm (vé) không dùng chung 1 khuôn — vai trò khác nhau, không trộn lẫn.

## D. Homepage / Marketplace Structure (29–36)

29. Homepage là marketplace nhiều dải ngang, không phải landing page tuyến tính.
30. Mỗi dải phải qua được khung kiểm tra 5 câu hỏi ở `10-conversion-design.md` §1 trước khi tồn tại.
31. Không có 2 dải liên tiếp phục vụ cùng 1 giai đoạn phễu theo cùng 1 cách.
32. Category chip phải xuất hiện gần đầu trang, cuộn ngang, không chôn giữa trang.
33. Không tự động cuộn (auto-play carousel) bất kỳ dải sản phẩm nào — khách phải tự điều khiển.
34. Dải trống (0 sản phẩm) phải ẩn hoàn toàn, không hiển thị section rỗng hoặc skeleton vĩnh viễn.
35. Thứ tự dải trên trang phải tỷ lệ thuận với sức mạnh chuyển đổi, không theo thói quen bố cục cũ (`10-conversion-design.md` §4).
36. "Xem tất cả" phải có ở mọi dải có nhiều hơn số card hiển thị mặc định.

## E. Category / Listing (37–42)

37. Category page có ảnh banner + 1 dòng mô tả cảm xúc ngắn — không phải chỉ list card trần trụi.
38. Filter nằm ngang (dropdown/sheet chạm), không dùng sidebar dọc cố định.
39. Không dùng bảng so sánh nhiều cột dạng ma trận trên mobile — dùng thẻ chọn dọc.
40. Empty state khi filter không ra kết quả phải gợi ý bước tiếp theo, không chỉ báo "không có kết quả".
41. Grid card responsive đúng chuẩn: 2 cột mobile, 3–4 cột desktop.
42. Sort/filter thay đổi kết quả phải phản hồi ngay, không yêu cầu bấm "Áp dụng" thêm 1 bước thừa trừ khi filter phức tạp cần xác nhận.

## F. Product Detail (43–52)

43. Gallery lên đầu trang, trước mọi văn bản.
44. Ảnh đầu tiên trong gallery là hành động, không phải ảnh venue/kiến trúc.
45. Giá xuất hiện cùng màn hình đầu tiên với ảnh — không cuộn mới thấy giá.
46. Không có mục "Lịch trình"/"Ngày 1/2/3" dưới bất kỳ tên gọi nào.
47. Benefits/Included trình bày dạng bullet ngắn, không đoạn văn dài.
48. Khối "Chọn vé" là trọng tâm trang — không phải phụ lục cuối trang.
49. Cách sử dụng vé (usage_guide) và chính sách huỷ (cancellation_policy) hiển thị rõ ràng, dễ tìm — thứ tự ưu tiên theo persona nếu áp dụng được (`05-brand-psychology.md` §9).
50. Đánh giá/rating chỉ hiển thị khi có nguồn dữ liệu thật.
51. FAQ chỉ hiển thị khi có FAQ thật; JSON-LD FAQPage chỉ render khi FAQ thật sự hiển thị.
52. Sản phẩm liên quan dùng đúng bảng `attraction_cross_sells` đã có, không hardcode danh sách.

## G. Ticket Selection / Booking Panel (53–60)

53. Loại vé hiển thị dạng thẻ chọn dọc (tên + giá cùng hàng) — không dùng dropdown ẩn giá.
54. Nếu chỉ có 1 loại vé, ẩn hẳn bước chọn loại vé — không hiển thị lựa chọn giả.
55. Ngày không khả dụng phải disable trực quan trên date picker, không để khách chọn xong mới báo lỗi.
56. Tổng tiền cập nhật ngay khi đổi số lượng/loại vé — không có độ trễ hoặc bước "tính lại".
57. Desktop: booking panel sticky bên phải. Mobile: thanh CTA dính đáy màn hình.
58. Thanh CTA dính đáy không được che `MobileCTA`/cookie banner toàn site.
59. Với nhóm Show, ngày/suất diễn cụ thể phải nổi bật ngang hàng giá — không chỉ "ngày sử dụng" chung chung.
60. Với nhóm Gia đình, tiêu chí giá trẻ em (tuổi/chiều cao) phải nêu ngay trong tên lựa chọn, không chôn trong policy.

## H. Checkout (61–68)

61. Tổng giá ở checkout phải khớp 100% với giá đã thấy ở Product Detail — không có phí ẩn lộ ra muộn.
62. Nếu có phí phát sinh thật từ provider, phí đó phải cộng và hiển thị từ bước chọn vé, không phải ở bước cuối.
63. Checkout là 1 trang, không chia nhiều bước/wizard nhiều màn hình.
64. Tóm tắt đơn hàng (ảnh nhỏ + tên vé + ngày + số lượng) luôn hiển thị trong suốt checkout.
65. Không dùng đếm ngược giả nếu không có cơ sở giữ chỗ thật.
66. Emotion tại checkout là Trust/Calm — giảm accent màu rực, giảm animation so với các bước trước.
67. Loading/pending khi chờ xác nhận phải có animation có ý nghĩa, không phải spinner câm.
68. Trạng thái đơn hàng hiển thị đúng thực tế (Pending/Failed hiển thị đúng, không lạc quan hoá).

## I. Voucher / Booking Result (69–74)

69. Màn hình voucher được thiết kế kỹ ngang Product Detail — không phải màn hình xác nhận xuề xoà.
70. QR code là tâm điểm màn hình khi trạng thái là VOUCHER_ISSUED — lớn, rõ, không bị animation che.
71. Không hiển thị `provider_order_id` trực tiếp trong URL công khai.
72. Hotline hỗ trợ luôn hiển thị, ở mọi trạng thái đơn hàng (kể cả Pending/Failed).
73. Cách sử dụng vé tại cổng được lặp lại ở màn hình voucher, không chỉ ở Product Detail.
74. Trạng thái Pending/Processing dùng polling ngắn tự động cập nhật, không bắt khách tự bấm refresh.

## J. Copywriting (75–80)

75. CTA dùng động từ mệnh lệnh ngắn ("Mua vé", "Chọn vé") — không dùng "Liên hệ tư vấn" cho luồng tự phục vụ.
76. Không dùng câu văn dài kiểu tư vấn viên ở bất kỳ microcopy nào trong luồng mua.
77. Không viết hoa toàn bộ (ALL CAPS) cho đoạn văn dài.
78. Copy trust badge chỉ nêu điều có thể kiểm chứng — không cam kết mơ hồ ("chất lượng hàng đầu", "tốt nhất thị trường").
79. Nhãn dải "Được đề xuất" dùng khi dữ liệu là thủ công (`is_featured`) — không tự nhận "Bán chạy nhất" nếu không đo được lượt bán thật.
80. Copy cho nhóm Doanh nghiệp tách biệt giọng điệu (chuyên nghiệp, quy trình rõ) khỏi giọng "sôi động" của luồng khách lẻ.

## K. Color (81–86)

81. Festival Orange là accent duy nhất, dùng riêng cho CTA/giá/badge (tín hiệu mua). Không dùng Purple ở bất kỳ đâu (đã chốt D1). Category chip dùng Minh Việt Blue, không dùng Orange.
82. Không dùng vàng cho bất kỳ mục đích nào ngoài icon sao đánh giá.
83. Header/Footer/Logo giữ nguyên Navy toàn hệ thống — không đổi màu theo emotion module.
84. Mọi token màu mới là additive vào `globals.css` — không sửa/xoá token nền tảng đang chạy.
85. Badge trạng thái tồn kho tái dùng token `--mv-limited-*` đã có — không phát minh cặp màu mới trùng chức năng.
86. Emotion Accent không dùng cho background toàn trang hoặc body text.

## L. Typography (87–90)

87. Không thêm font mới — giữ nguyên `font-display`/`font-sans` đã có.
88. Giá trên card/PDP có cỡ chữ ngang hoặc lớn hơn tiêu đề sản phẩm.
89. Body/mô tả trên card giới hạn 2 dòng (`line-clamp-2`).
90. Văn bản chính sách (usage_guide/cancellation_policy) giữ line-height rộng, dễ đọc như phần còn lại hệ thống — không "sôi động hoá" văn bản pháp lý.

## M. Motion (91–94)

91. Mọi animation phải trả lời được "giúp conversion thế nào" — không animation chỉ để đẹp.
92. Card hover 200–250ms ease-out; chọn vé/tổng tiền phản hồi dưới 300ms; checkout giảm animation xuống tối thiểu.
93. Không dùng confetti/pháo hoa UI trang trí — chuyển động rực rỡ nằm ở ảnh/video thật, không phải hiệu ứng giả lập.
94. Mọi animation tôn trọng `prefers-reduced-motion` qua hook `useReducedMotionSafe` có sẵn.

## N. Photography (95–97)

95. Không dùng ảnh landscape-first cho hero/card/ảnh đại diện gallery.
96. Ảnh đại diện phải có ít nhất 1 khuôn mặt với cảm xúc rõ, hoặc chuyển động rõ.
97. Không dùng ảnh người mẫu tạo dáng nhìn thẳng camera kiểu quảng cáo tài chính/bảo hiểm.

## O. Kỷ luật dữ liệu — luật tổng (98–100)

98. Mọi badge/rating/số liệu/urgency hiển thị phải có dữ liệu thật đứng sau — không có ngoại lệ dù mục đích là tăng "sôi động".
99. Khi dữ liệu thật chưa tồn tại, phương án đúng là **ẩn**, không phải thay bằng nội dung tĩnh/giả để lấp chỗ trống.
100. Trước khi bất kỳ màn hình nào được code, phải xác định được đúng 1 Emotion chủ đạo (`06-design-emotion-map.md` §4) và trả lời được câu hỏi Conversion (`10-conversion-design.md` §1) — thiếu 1 trong 2, chưa đủ điều kiện chuyển sang implementation.

---

## P. Addendum — Quyết định đã chốt sau khi Design Bible được duyệt (101–110)

101. Không dùng Purple ở bất kỳ đâu trong module này — chỉ Minh Việt Blue (primary) + Festival Orange (accent duy nhất) (D1).
102. Category dùng bảng riêng `attraction_categories`, không dùng tag/jsonb (D2).
103. Không hoàn thiện Hero/Card bằng ảnh placeholder ở bất kỳ giai đoạn nghiệm thu nào — theo lộ trình `13-asset-library-strategy.md` (D3).
104. Information Architecture phải có route `/ve-vui-choi/dat-doan` cho khách Doanh nghiệp ngay từ đầu, dù form/luồng đầy đủ chưa build ở V1 (D4).
105. Không build Wishlist dưới bất kỳ hình thức nào (kể cả rút gọn client-side) ở lần triển khai này (D5).
106. Section "Thương hiệu/Khu vui chơi nổi bật" là bắt buộc trên Homepage, không phải section có điều kiện (D6).
107. Destination Tile luôn hiển thị số trải nghiệm (đếm `attraction_products` published qua venue), không chỉ ảnh + tên (D7).
108. Hero cao ~60vh, Search box là trọng tâm bố cục của Hero — không phải headline (D8).
109. Mọi phase implementation thiết kế/build mobile trước, mở rộng desktop sau — không song song 2 chiều (D9).
110. Toàn module chỉ dùng đúng 3 loại card (Product Card, Destination Tile, Venue/Brand Tile) — không tạo loại thứ 4 (D10).

---

*Đây là tài liệu cuối cùng trong bộ 12 tài liệu con gốc. Xem `DESIGN-BIBLE-v1.0.md` (thư mục `docs/design/`) để có bản tổng hợp trình duyệt, và `13-asset-library-strategy.md`/`14-implementation-plan.md` cho bước tiếp theo.*
