# MV Ticket — Conversion Design

**Đây là tài liệu quan trọng nhất trong toàn bộ Design Bible.**

**Luật duy nhất của tài liệu này:** Mọi section trên mọi trang phải trả lời được câu hỏi — *"Section này giúp tăng Conversion như thế nào?"* Nếu không có câu trả lời cụ thể, đo lường được, section đó bị xoá. Không có ngoại lệ vì "trông đẹp", "cho đủ nội dung", hay "trang khác cũng có".

---

## 1. Khung kiểm tra bắt buộc cho MỌI section (áp dụng trước khi section được phép tồn tại trong thiết kế)

Mỗi section phải trả lời đủ 5 câu hỏi sau. Thiếu 1 câu = section không đạt điều kiện.

1. **Vai trò chuyển đổi:** Section này thúc đẩy khách tới hành động nào tiếp theo? (không được trả lời "cung cấp thông tin" một cách chung chung — phải nêu hành động cụ thể: click vào card, chọn category, bấm mua...)
2. **Vị trí trong phễu:** Section này phục vụ khách đang ở giai đoạn nào (Nhận biết / Cân nhắc / Quyết định)? Một trang không nên có 2 section cùng phục vụ 1 giai đoạn theo cùng 1 cách (trùng lặp = lãng phí không gian cuộn).
3. **Bằng chứng nếu xoá:** Nếu xoá section này, điều gì thực sự mất đi? Nếu câu trả lời là "không nhiều" — xoá.
4. **Yêu cầu dữ liệu thật:** Section cần dữ liệu gì để hoạt động trung thực? Nếu dữ liệu đó chưa tồn tại trong schema (`03-database-design.md`), section phải **ẩn**, không hiển thị bằng dữ liệu giả/tĩnh vĩnh viễn (kế thừa kỷ luật `01-design-direction.md` §7).
5. **Chỉ số đo lường:** Có thể đo được hiệu quả section này bằng chỉ số nào (CTR vào section, tỷ lệ click qua card trong section, tỷ lệ cuộn qua...)? Nếu không đo được, ít nhất phải nêu rõ giả định sẽ được kiểm chứng sau khi có dữ liệu thật.

---

## 2. Áp dụng khung kiểm tra vào Homepage (đối chiếu `02-homepage-and-listing-concept.md` §1.2)

| Section | (1) Vai trò chuyển đổi | (2) Giai đoạn phễu | (3) Nếu xoá | (4) Dữ liệu cần | (5) Đo lường | Kết luận |
|---|---|---|---|---|---|---|
| Hero + Search | Chuyển "khách vãng lai" → "khách có ý định tìm kiếm cụ thể" bằng cách bắt họ nhập điểm đến/ngày | Nhận biết → Cân nhắc | Mất kênh chuyển đổi nhanh nhất cho khách đã có mục tiêu rõ ràng (vào thẳng bằng Google, gõ tên điểm đến) | Danh sách destinations có sẵn cho autocomplete (đã có bảng `destinations`) | Tỷ lệ dùng search / tổng lượt vào trang | **GIỮ** |
| Quick Category Chips | Rút ngắn đường đi cho khách chưa quyết định điểm đến cụ thể, chỉ biết loại hình muốn chơi | Nhận biết → Cân nhắc | Khách phải cuộn hết trang mới tìm ra loại hình mình muốn — tăng tỷ lệ thoát | Taxonomy category (**khoảng trống schema đã nêu ở `01-design-direction.md` §5.2**) | Tỷ lệ click chip / tổng lượt vào trang | **GIỮ — có điều kiện:** chỉ hiển thị sau khi taxonomy category được quyết định; nếu không có category thật, KHÔNG dựng chip giả trỏ vào kết quả rỗng |
| Dải "Được đề xuất hôm nay" | Cho khách chưa có ý định cụ thể một điểm bắt đầu chất lượng cao (đã được biên tập chọn lọc) | Nhận biết → Cân nhắc | Khách không có gợi ý nào nếu không tự tìm kiếm — tăng tỷ lệ rời trang tay không | `is_featured`/`sort_order` (đã có trong schema `attraction_products`) | Tỷ lệ click card trong dải này | **GIỮ** |
| Dải "Theo điểm đến nổi bật" | Phục vụ khách đã có điểm đến trong đầu (nhóm lớn nhất theo `05-brand-psychology.md` §1) đi thẳng vào đúng danh sách | Cân nhắc | Khách phải dùng search/gõ chữ thay vì chạm — tăng ma sát cho nhóm khách đông nhất | `destinations` published (đã có) | Tỷ lệ click tile / tổng lượt vào trang | **GIỮ** |
| Dải theo Category (Công viên nước & Cáp treo, Gia đình & Trẻ em...) | Phục vụ đúng insight từng persona ở `05-brand-psychology.md` — mỗi persona có lý do mua khác nhau, dải riêng giúp mỗi nhóm thấy đúng thứ liên quan nhanh hơn | Cân nhắc | Trộn toàn bộ sản phẩm vào 1 danh sách buộc khách tự lọc — tăng thời gian quyết định, tăng tỷ lệ bỏ cuộc | Taxonomy category (cùng khoảng trống đã nêu) | Tỷ lệ click card theo từng dải riêng biệt (so sánh hiệu suất dải) | **GIỮ — có điều kiện**, giống Quick Category Chips |
| Thương hiệu/Khu vui chơi nổi bật | Trust theo thương hiệu đã biết (Sun World, VinWonders) — với khách đã tin thương hiệu, đây là đường tắt tới quyết định mua nhanh hơn xem từng sản phẩm | Cân nhắc → Quyết định | Khách trung thành thương hiệu phải tự tìm bằng search — mất một lối tắt chuyển đổi cao | `attraction_venues.is_featured` (đã có) | Tỷ lệ click venue tile | **GIỮ — BẮT BUỘC** (chốt sau phê duyệt Design Bible, không còn là section tuỳ chọn dù đo lường ra sao) |
| "Vì sao mua ở Minh Việt" (rút gọn) | Xử lý nốt sự do dự cuối cùng của khách đã lướt qua nhiều sản phẩm nhưng chưa bấm mua — trấn an trước khi rời trang | Quyết định (hỗ trợ, không dẫn dắt) | Không có tác động lớn tới chuyển đổi trực tiếp, nhưng hỗ trợ giảm lo lắng ở nhóm khách thận trọng (đặc biệt nhóm Water Park lo chính sách huỷ — `05-brand-psychology.md` §4) | Nội dung tĩnh biên tập, trung thực (không cam kết chưa kiểm chứng) | Không đo trực tiếp được — giữ ngắn (3 icon) để không chiếm quá nhiều không gian cuộn so với giá trị thấp hơn các dải sản phẩm | **GIỮ, NHƯNG RÚT NGẮN TỐI ĐA** — đây là section có vai trò chuyển đổi yếu nhất trong toàn trang, chỉ tồn tại ở dạng tối giản |
| FAQ | Xử lý câu hỏi lặp lại trước khi khách phải chat/gọi — giảm rò rỉ chuyển đổi do thiếu thông tin | Quyết định | Tăng lượng liên hệ CSKH thay vì tự chuyển đổi (đúng bài học Traveloka Xperience — research §3) | `attraction_faqs` thật (đã có bảng) | Không đo trực tiếp, nhưng có thể theo dõi giảm số lượt liên hệ hỏi thông tin cơ bản | **GIỮ — có điều kiện:** chỉ hiển thị khi có FAQ thật, ẩn hoàn toàn nếu rỗng (đã đúng theo `05-ui-ux-specification.md` §10) |

**Section đã bị loại khỏi đề xuất so với tài liệu Phase 0 gốc** (và lý do, theo đúng khung kiểm tra):
- **"Ưu đãi" (section riêng)** — không qua được câu hỏi (4): chưa có dữ liệu giảm giá thật trong schema (`price_from` không có `original_price` đi kèm). Gộp vào badge trên card thay vì làm cả 1 section rỗng chờ dữ liệu.
- **"Cam kết dịch vụ" (bản đầy đủ, dạng block riêng)** — không qua được câu hỏi (1) ở quy mô 1 section riêng: vai trò chuyển đổi thực sự yếu (khách không rời trang vì thiếu "cam kết dịch vụ", họ rời vì thiếu giá/vé) → giữ nội dung nhưng nén thành dải icon ngắn, không phải section độc lập.

---

## 3. Áp dụng khung kiểm tra vào Product Detail (đối chiếu `03-product-detail-and-checkout-concept.md` §1.2)

| Section | Vai trò chuyển đổi | Kết luận |
|---|---|---|
| Gallery | Tạo Desire (`06-design-emotion-map.md` §2.4) — không có Desire thì phần "Chọn vé" phía dưới không ai buồn cuộn tới | **GIỮ, ưu tiên vị trí đầu** |
| Benefits/Included | Trả lời nhanh câu hỏi "có gì trong vé này" trước khi khách phải đọc policy dài | **GIỮ, dạng bullet ngắn** |
| Khối Chọn vé | Đây chính là cơ chế chuyển đổi — không cần biện minh, đây là mục tiêu của cả trang | **GIỮ, vị trí ưu tiên cao nhất sau Gallery** |
| Cách sử dụng vé | Giảm lo lắng hậu-mua (đặc biệt nhóm Theme Park — không xếp hàng) → có thể tăng tỷ lệ hoàn tất mua vì giảm nghi ngại "mua rồi có dùng được không" | **GIỮ** |
| Chính sách huỷ/đổi | Với nhóm Water Park, đây là yếu tố quyết định mua số 1 (`05-brand-psychology.md` §4) — không phải nội dung phụ | **GIỮ, nâng vị trí ưu tiên tuỳ category** |
| Vị trí (map) | Hỗ trợ khách xác nhận đúng địa điểm trước khi mua — vai trò chuyển đổi thấp nhưng giảm khiếu nại/hoàn vé sau mua | **GIỮ, vị trí thấp trong trang** |
| Đánh giá | Trust signal mạnh nếu có thật (research §4, §9) | **ẨN — chưa có dữ liệu thật, không qua được câu hỏi (4)** |
| FAQ | Giống Homepage — giảm rò rỉ chuyển đổi do thiếu thông tin | **GIỮ — có điều kiện, chỉ khi có dữ liệu thật** |
| Sản phẩm liên quan | Cross-sell — tăng giá trị đơn hàng hoặc giữ khách lại nếu sản phẩm hiện tại không đúng ý | **GIỮ, đã có bảng `attraction_cross_sells`** |

---

## 4. Nguyên tắc thứ tự — vị trí trong trang tỷ lệ thuận với sức mạnh chuyển đổi

Không phải section nào "đạt điều kiện" cũng xứng đáng vị trí cao. Thứ tự trên trang phải phản ánh đúng sức mạnh chuyển đổi tương đối, không phải thói quen bố cục cũ:

```
Cao nhất  ── Gallery → Giá/Chọn vé          (trực tiếp dẫn tới hành động mua)
          ── Dải sản phẩm nổi bật (Homepage) (dẫn khách vào đúng sản phẩm)
          ── Benefits/Cách dùng/Chính sách   (hỗ trợ quyết định, không dẫn dắt)
Thấp nhất ── FAQ, Vì sao chọn Minh Việt      (xử lý do dự còn sót lại, đọc bởi thiểu số)
```

Bất kỳ đề xuất nào đặt "Vì sao chọn Minh Việt" hoặc nội dung thương hiệu lên trên dải sản phẩm/Gallery đều vi phạm nguyên tắc này — đây chính xác là lỗi cấu trúc landing-page kiểu Tour (thuyết phục trước, bán sau) mà toàn bộ Design Bible đang sửa.

---

## 5. Câu hỏi kiểm tra nhanh — dùng khi có người đề xuất thêm section mới (sau này, ngoài phạm vi 4 tài liệu concept đã có)

Trước khi thêm bất kỳ section mới nào vào bất kỳ trang nào của module này trong tương lai, người đề xuất phải điền được bảng sau — nếu không điền được, section không được thêm:

```
Tên section:                    ____________________
Trang:                          ____________________
(1) Hành động chuyển đổi cụ thể: ____________________
(2) Giai đoạn phễu:              ____________________
(3) Nếu xoá, mất gì:             ____________________
(4) Dữ liệu thật cần có:         ____________________  [có / chưa có — nếu chưa có, section PHẢI ẩn cho tới khi có]
(5) Chỉ số đo lường:             ____________________
```

---

*Tài liệu tiếp theo: `11-marketplace-strategy.md` — cơ chế marketplace cụ thể (Flash Sale, Trending, Best Seller...) áp khung kiểm tra ở trên vào từng cơ chế.*
