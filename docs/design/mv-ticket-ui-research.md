# MV Ticket — UI/UX Research

**Phạm vi:** Nghiên cứu-only. Không có code, component hay wireframe thật nào được tạo trong tài liệu này — chỉ phân tích để làm nền cho `docs/design/mv-ticket/`.
**Đối tượng nghiên cứu:** Klook, KKday, Traveloka Xperience, GetYourGuide, Disney Experience (My Disney Experience), Universal Destinations, Ticketmaster, Eventbrite, Airbnb Experience, Fever.
**Không sao chép UI của bất kỳ nền tảng nào** — tài liệu này chỉ rút ra nguyên tắc, không rút ra bố cục để nhân bản.

---

## 0. Vì sao phải nghiên cứu nhóm này, không phải nhóm Tour/OTA du lịch nghỉ dưỡng

"Vé vui chơi" (attraction ticket) là **hàng hóa rời rạc, mua ngay, dùng trong ngày** — giống vé xem phim, vé concert, vé công viên hơn là một chuyến đi nhiều ngày cần tư vấn. Nhóm 10 nền tảng trên được chọn vì cùng bán đúng loại hàng này: vé/hoạt động đơn lẻ, quyết định mua nhanh, giá là yếu tố quyết định hàng đầu. Website Tour/Resort/Cruise giải quyết bài toán khác (tin tưởng một hành trình dài, nhiều ngày, nhiều rủi ro) — dùng chúng làm cảm hứng cho vé vui chơi là nguyên nhân gốc của vấn đề hiện tại (xem `docs/design/mv-ticket/01-design-direction.md` §1).

---

## 1. Klook

### Điểm mạnh
- **Marketplace density có kiểm soát**: trang chủ là lưới nhiều dải nội dung (Flash Sale, theo điểm đến, theo chủ đề) nhưng mỗi dải chỉ 1 hàng ngang scroll — mật độ cao mà không rối vì mỗi khối có ranh giới rõ (tiêu đề dải + "Xem tất cả").
- **Flash Sale là cơ chế thật, có khung giờ cố định** (theo nghiên cứu 2026: khung 21h hàng đêm) — tạo nhịp quay lại (habit loop) mà không cần giả mạo, vì thời điểm là thật và lặp lại được.
- **Card tối giản nhưng đủ quyết định**: ảnh — tên — rating (số + sao) — giá — badge giảm giá %. Không cần mở chi tiết mới biết "có đáng mua không".
- **Giá luôn hiển thị ở dạng số cụ thể**, không dùng "liên hệ" — kể cả khi là "giá từ".

### Điểm yếu
- Khi nhồi quá nhiều dải flash-sale/voucher cùng lúc, trang chủ có thể tạo cảm giác quảng cáo dồn dập, đặc biệt trên mobile khi lướt nhanh qua nhiều banner khuyến mãi chồng nhau.
- Bộ lọc trên listing có thể quá nhiều tiêu chí (loại vé, giờ, ngôn ngữ hướng dẫn viên...) khiến người dùng ngại chạm vào filter trên mobile.

### Điều nên học
- Cấu trúc trang chủ dạng **rack/carousel theo chủ đề**, không phải hero đơn + vài section như landing page.
- Card **luôn có rating + số lượng đánh giá** cạnh giá — đây là tín hiệu quyết định mua số 1 sau giá.
- Badge giảm giá chỉ xuất hiện khi có `original_price` thật để so sánh — không có badge mồ côi.

### Điều không nên học
- Không sao chép mật độ banner khuyến mãi dày đặc — MV Ticket phải trung thực (không giá gạch giả, không đếm ngược không có cơ sở — đúng nguyên tắc đã áp dụng cho Combo).
- Không rập khuôn màu cam/đỏ thương hiệu Klook.

---

## 2. KKday

### Điểm mạnh
- **Phân nhóm theo "occasion" rõ ràng hơn Klook**: nhóm nội dung theo dịp/nhu cầu (gia đình, cặp đôi, phiêu lưu) thay vì chỉ theo điểm đến — giúp người chưa có điểm đến cụ thể trong đầu vẫn tìm được sản phẩm.
- **Trang danh mục (category) có ảnh minh họa lớn, không chỉ là danh sách text** — category trông như một "cửa hàng" riêng, không phải bộ lọc khô khan.
- Giá cạnh tranh trực tiếp với Klook trên cùng sản phẩm — layout card đặt "giá từ" ở vị trí nổi bật ngang hàng tên sản phẩm, không chìm ở cuối.

### Điểm yếu
- Nhận diện thương hiệu giữa các section không thật nhất quán — một số section vay mượn phong cách banner của đối tác/nhà cung cấp, làm loãng hệ màu chủ đạo.
- Trang sản phẩm đôi khi dài quá mức cần thiết do nhồi nội dung marketing (câu chuyện, editorial) trước khi tới phần chọn vé — kéo dài khoảng cách tới CTA.

### Điều nên học
- Category = một trang landing nhỏ có ảnh + mô tả cảm xúc ngắn, không phải chỉ list card.
- Đặt giá ngang hàng thị giác với tên sản phẩm trên card, không phải yếu tố phụ.

### Điều không nên học
- Không để nội dung editorial/storytelling chen giữa người dùng và nút chọn vé — với vé vui chơi, storytelling phải ngắn và nằm *sau* phần đặt vé, không phải trước.

---

## 3. Traveloka Xperience

### Điểm mạnh
- Traveloka vốn là app "tất cả trong một" (vé máy bay, khách sạn...) nên Xperience phải **tự tách bạch rõ ràng bằng UI** để người dùng không nhầm sang luồng đặt vé máy bay/khách sạn — bài học trực tiếp cho MV: nếu Vé vui chơi vẫn dùng chung ngôn ngữ UI với Flight/Combo, người dùng sẽ nhầm y như Xperience từng gặp.
- Luồng đặt vé rất ngắn: chọn hoạt động → chọn ngày → chọn loại vé/số lượng → thanh toán. Không có bước "xem lịch trình" hay "chọn gói" phức tạp.

### Điểm yếu
- Case study công khai (Traveloka Xperience Product Improvement, dhea.works) ghi nhận: sản phẩm ra mắt 2019 từng có **tỷ lệ Visit-to-Issuance thấp** vì người dùng bối rối về "sản phẩm này dùng để làm gì" — điều hướng ban đầu không phân biệt rõ Xperience với Tour. Đây là bằng chứng thực tế cho đúng lỗi mà MV Ticket đang mắc: khi vé hoạt động trông giống tour, tỷ lệ chuyển đổi giảm và tăng chi phí CSKH do khách hỏi lại.
- Bộ lọc/điều hướng ban đầu quá tổng quát, không đủ để người dùng tự tin bấm "Tìm vé".

### Điều nên học
- **Tách bạch bằng UI, không chỉ bằng tên gọi.** Đổi tên "Tour" thành "Vé vui chơi" mà giữ nguyên UI Tour chính là lỗi Xperience từng mắc và đã phải sửa.
- Luồng đặt vé phẳng, ít bước, không có khái niệm "lịch trình nhiều ngày".

### Điều không nên học
- Không lặp lại giai đoạn điều hướng mơ hồ ban đầu — ngay từ đầu, category/filter phải cụ thể theo loại hình (Công viên nước, Cáp treo, Show diễn...) chứ không chỉ theo điểm đến.

---

## 4. GetYourGuide

### Điểm mạnh
- **Trust signal định lượng thay vì định tính**: "Được đặt hơn X lần", số lượng đánh giá thật hiển thị cạnh sao — không dùng tính từ ("rất tốt", "được yêu thích") mà dùng số.
- **"Reserve now, pay later" / free cancellation badge** xuất hiện ngay trên card, giảm rào cản quyết định trước khi vào trang chi tiết.
- Trang chi tiết có cấu trúc rất rõ: Highlights (bullet ngắn) → Included/Not included → Chọn ngày/giờ → Chọn số lượng → Đánh giá → FAQ. Không có timeline ngày 1/ngày 2.
- Ảnh sản phẩm ưu tiên ảnh có người thật đang trải nghiệm, không phải ảnh kiến trúc/phong cảnh trống.

### Điểm yếu
- Vì là marketplace bên thứ ba lớn, đôi khi hiển thị quá nhiều lựa chọn tương tự nhau cho cùng một điểm tham quan (nhiều nhà cung cấp bán cùng vé) gây rối lựa chọn ("paradox of choice").
- Free-cancellation badge dùng tràn lan trên mọi sản phẩm có thể làm giảm giá trị tín hiệu này.

### Điều nên học
- Cấu trúc trang chi tiết **Highlights → Included → Chọn ngày/giờ/số lượng → CTA → Review → FAQ** là khuôn mẫu chuẩn cho vé hoạt động — đúng tinh thần user đã yêu cầu (Gallery, Benefits, Ticket Options, Choose Date, Choose Quantity, Book Now, FAQ...).
- Trust signal bằng số liệu thật (số lượt đặt, số đánh giá) — nhưng MV chỉ được dùng nếu có dữ liệu thật (xem `09-open-questions.md` — hiện MV Ticket **chưa có nguồn rating nào**, phải ẩn cho tới khi có).

### Điều không nên học
- Không hiển thị nhiều biến thể trùng lặp gây rối — MV Ticket chỉ có 1 nguồn (OneInventory), không có vấn đề đa nhà cung cấp, nên phải tận dụng lợi thế "rõ ràng, không rối" thay vì bắt chước độ phức tạp không cần thiết của marketplace đa bên.

---

## 5. Disney Experience (My Disney Experience)

### Điểm mạnh
- Không phải một trang bán vé đơn thuần — là một **hệ điều hành cho cả chuyến đi** (mua vé, đặt Genie+, xem giờ chờ, bản đồ, đặt nhà hàng) — cho thấy vé vui chơi có thể là điểm khởi đầu của một hành trình dùng sản phẩm liên tục, không kết thúc ở lúc thanh toán.
- Cảm xúc hình ảnh nhất quán: màu sắc rực rỡ, nhân vật, pháo hoa, family — không một khung hình nào trông "trang trọng/im lặng".
- Cá nhân hóa theo thời gian thực (giờ chờ, lịch trình) tạo cảm giác "công cụ hữu ích", không chỉ là nơi thanh toán.

### Điểm yếu
- Theo đánh giá UX công khai (UX Booth — "Experience at the Expense of Usability"), độ phức tạp tính năng (Genie+, Lightning Lane, MaxPass cũ...) từng vượt quá khả năng tiếp nhận của người dùng phổ thông — quá nhiều khái niệm mới cùng lúc.
- Nhiều thao tác (đặt Fastpass/Genie+, xem bản đồ) vẫn cần thao tác thủ công lặp lại, không tự động hoá đủ để giảm tải nhận thức.

### Điều nên học
- **Emotion phải nhất quán xuyên suốt mọi điểm chạm**, không chỉ ở hero — từ ảnh, màu, đến microcopy đều phải "vui" cùng một tông.
- Vé không phải điểm kết thúc — trạng thái sau khi mua (voucher, QR, hướng dẫn sử dụng) cũng phải được thiết kế kỹ như trang bán.

### Điều không nên học
- Không thêm tầng khái niệm mới (gói dịch vụ chồng gói dịch vụ) khi MV Ticket V1 chỉ cần: chọn vé → chọn ngày → mua → nhận QR. Giữ đơn giản, không học độ phức tạp tính năng của Disney.

---

## 6. Universal Destinations

### Điểm mạnh
- Hero và trang chủ dùng ảnh/video **hành động thật** (roller coaster đang chạy, khách đang hét/cười) thay vì ảnh tĩnh kiến trúc công viên — đúng tinh thần "Wow" mà user yêu cầu, khác hẳn ảnh phong cảnh tĩnh của hero Tour hiện tại của MV.
- Vé được phân theo **use-case rõ ràng** (1-Park, 2-Park, Multi-day, Express Pass) với bảng so sánh trực quan, không phải đoạn văn dài giải thích.
- CTA "Get Tickets" xuất hiện lặp lại nhất quán ở mọi vị trí cuộn trang, không chỉ 1 lần ở đầu.

### Điểm yếu
- Bảng so sánh nhiều loại vé (park option × số ngày × Express hay không) có thể tạo ma trận lựa chọn phức tạp nếu không có gợi ý mặc định ("phổ biến nhất").
- Trên mobile, bảng so sánh nhiều cột dễ phải scroll ngang — trải nghiệm kém hơn desktop.

### Điều nên học
- Hero dùng **chuyển động/hành động thật** (không phải cảnh tĩnh) để tạo cảm giác "Wow" tức thì.
- Luôn có 1 lựa chọn được đánh dấu "phổ biến nhất/khuyến nghị" khi có nhiều loại vé, giảm gánh nặng quyết định.

### Điều không nên học
- Không tạo bảng so sánh nhiều cột phức tạp cho mobile — nếu MV Ticket có nhiều loại vé, ưu tiên dạng thẻ chọn dọc (radio-card) thay vì bảng ma trận ngang.

---

## 7. Ticketmaster

### Điểm mạnh
- **Sơ đồ chỗ ngồi trực quan** (khi áp dụng) và hiển thị giá theo khu vực ngay trên sơ đồ — biến một quyết định trừu tượng thành trực quan.
- Luồng "giữ chỗ có đếm giờ" khi vào checkout — tạo cảm giác khẩn cấp *có cơ sở thật* (ghế thật sự bị giữ, không phải giả).

### Điểm yếu
- Đây là ví dụ **kinh điển bị chỉ trích công khai** về UX checkout: nhiều bước, phí ẩn xuất hiện muộn (service fee chỉ lộ ra gần cuối), và cơ chế đếm giờ gây lo âu nếu không đủ minh bạch — nhiều bài phân tích UX (Medium, "Ticketmaster's checkout experience") dùng chính Ticketmaster làm ví dụ về anti-pattern cần tránh.
- Countdown timer, nếu áp dụng sai chỗ (không có cơ sở giữ chỗ thật), tạo urgency giả — vi phạm trực tiếp nguyên tắc "Trust" đã có trong `MV_Operating_System` Design DNA hiện hành (§3.1 — cấm "countdown timers without a real operational basis").

### Điều nên học
- Giữ chỗ có đếm giờ **chỉ khi thật sự giữ chỗ** (ví dụ khi số lượng vé loại đó thực sự giới hạn và hệ thống thật sự khoá số lượng đó lại).

### Điều không nên học — quan trọng nhất trong toàn bộ nghiên cứu
- **Tuyệt đối không hiển thị phí ẩn muộn.** Tổng giá phải cố định và hiển thị đầy đủ ngay từ bước chọn vé, không "hé lộ dần" phí dịch vụ ở bước cuối — đây là anti-pattern bị chỉ trích nhiều nhất trong ngành vé và đối lập trực tiếp với cam kết "giá minh bạch không phụ phí ẩn" đã có sẵn trong copy hero hiện tại của MV Ticket.
- Không thêm countdown giả để tạo áp lực mua khi không có cơ sở tồn kho thật.

---

## 8. Eventbrite

### Điểm mạnh
- Form tạo/chọn loại vé rất linh hoạt (nhiều mức giá, early-bird, nhóm) nhưng hiển thị cho người mua dưới dạng **danh sách thẻ dọc đơn giản** — độ phức tạp backend không lộ ra frontend.
- Trang sự kiện có khối "About this event" ngắn gọn, ảnh/video càng lên đầu càng tốt, không có văn bản dài chặn trước CTA.

### Điểm yếu
- Vì phục vụ organizer tự thiết lập, nhiều trang sự kiện có chất lượng ảnh/copy không đồng đều — thiếu một "biên tập viên trung tâm" để đảm bảo chuẩn hình ảnh.
- Trải nghiệm sau khi mua (vé điện tử, thêm vào ví) đôi khi lẫn giữa email và app, không tập trung.

### Điều nên học
- Danh sách loại vé dạng **thẻ chọn dọc, mỗi thẻ = 1 loại vé + giá + mô tả ngắn**, không dùng dropdown ẩn thông tin.
- "About" ngắn, ảnh/video lên trước — đúng tinh thần "Gallery trước, chữ dài sau" mà user yêu cầu.

### Điều không nên học
- Không để chất lượng ảnh/nội dung không đồng đều giữa các sản phẩm — MV Ticket chỉ có 1 nguồn biên tập (không phải organizer tự do), nên phải giữ chuẩn ảnh/copy nhất quán 100%, đây là lợi thế cần tận dụng chứ không đánh đổi.

---

## 9. Airbnb Experience

### Điểm mạnh
- **Card kể một câu chuyện cảm xúc trong 1 dòng phụ đề** ("Host bởi người địa phương", "Hoạt động độc đáo") thay vì chỉ liệt kê thông số — tạo khác biệt so với card OTA thuần giá/rating.
- Layout ảnh lớn, bo góc mềm, khoảng trắng rộng quanh card — cảm giác "editorial nhẹ" nhưng vẫn rõ giá/CTA.
- Trust qua lớp lang: review + host profile + response rate, không dồn hết vào 1 con số.

### Điểm yếu
- Vì tập trung "trải nghiệm độc đáo, số lượng ít", Airbnb Experience **không tối ưu cho mua nhanh số lượng lớn** (vé công viên, cáp treo) — model 1 host/1 hoạt động nhỏ không phù hợp trực tiếp để copy cho vé công viên/show diễn quy mô lớn của MV.

### Điều nên học
- Một dòng phụ đề cảm xúc ngắn trên card (không chỉ thông số) giúp sản phẩm có "giọng nói", có thể áp dụng có chọn lọc cho nhóm "Trải nghiệm gia đình"/"Show diễn" của MV.
- Khoảng trắng quanh card không nên hy sinh vì nhồi thêm badge.

### Điều không nên học
- Không copy mô hình "độc bản, số lượng giới hạn" cho sản phẩm là vé công viên/cáp treo có tồn kho lớn — sai bản chất hàng hóa.

---

## 10. Fever

### Điểm mạnh
- **Photography rực rỡ, bão hòa màu cao, có chuyển động** (video ngắn autoplay trong card) — tạo cảm giác "sự kiện đang diễn ra ngay bây giờ", rất khác ảnh tĩnh phong cảnh.
- Trang chủ tổ chức theo "Đang diễn ra tại [thành phố bạn]" — bản địa hóa theo vị trí thực, tăng cảm giác liên quan/khẩn cấp thật.
- Card có badge cảm xúc ngắn ("Sắp hết vé", "Mới") thay vì chỉ badge giảm giá — đa dạng hoá lý do khiến người dùng dừng lại nhìn card.

### Điểm yếu
- Badge cảm xúc ("Sắp hết vé") nếu không gắn với tồn kho thật dễ bị nhận ra là chiêu trò khi dùng lặp lại trên quá nhiều sản phẩm cùng lúc.
- Mật độ màu sắc/chuyển động cao có thể mệt mắt nếu dùng cho toàn bộ trang thay vì chỉ khu vực khám phá.

### Điều nên học
- Badge trạng thái đa dạng hơn chỉ "giảm giá %" — nhưng **mọi badge phải có dữ liệu thật đứng sau** (đúng nguyên tắc MV đã áp dụng cho Combo: không đếm ngược giả, không lượt đặt giả).
- Bản địa hóa theo điểm đến gần người dùng là một cách tạo "instant relevance" hợp lệ, không phải urgency giả.

### Điều không nên học
- Không lạm dụng badge cảm xúc trên diện rộng khi MV Ticket chưa có nguồn dữ liệu tồn kho theo thời gian thực cho mọi sản phẩm (theo `00-current-state-audit.md`, dữ liệu "bán chạy" hiện chưa đo được thật ở nhiều sản phẩm) — chỉ dùng badge khi có dữ liệu, ẩn hoàn toàn khi không có, không thay bằng badge trang trí.

---

## 11. Bảng tổng hợp — điều nên học xuyên suốt cả 10 nền tảng

| Chủ đề | Điều nên học (đồng thuận ≥ 3 nền tảng) | Nguồn |
|---|---|---|
| Trang chủ | Marketplace dạng nhiều dải ngang theo chủ đề, không phải hero + vài section tĩnh | Klook, KKday, Fever |
| Card | Ảnh — Tên — Rating/Trust số liệu thật — Giá nổi bật — CTA ngắn | Klook, GetYourGuide, KKday |
| Trang chi tiết | Gallery/video trước, Highlights ngắn, chọn ngày/số lượng gần đầu, review/FAQ sau | GetYourGuide, Eventbrite, Universal |
| Nhiều loại vé | Thẻ chọn dọc + đánh dấu "phổ biến nhất", tránh bảng ma trận trên mobile | Universal, Eventbrite |
| Giá | Tổng giá cố định, không phí ẩn lộ muộn | Ticketmaster (phản ví dụ), GetYourGuide |
| Hero | Hành động/con người thật, có chuyển động, không phong cảnh tĩnh | Universal, Fever, Disney |
| Trust | Số liệu thật (lượt đặt/đánh giá) thay tính từ; ẩn hoàn toàn nếu chưa có dữ liệu | GetYourGuide, Fever, Airbnb |
| Sau khi mua | Voucher/QR/hướng dẫn sử dụng thiết kế kỹ như trang bán, không phải màn hình phụ | Disney, Eventbrite |

## 12. Điều tuyệt đối không nên học (anti-pattern xác nhận từ nghiên cứu)

1. **Phí ẩn lộ muộn trong checkout** (Ticketmaster) — đối lập trực tiếp với cam kết "giá minh bạch" đã có.
2. **Urgency/badge không có cơ sở tồn kho thật** (rủi ro chung của Fever/Ticketmaster nếu áp dụng sai) — MV đã có tiền lệ đúng ở Combo (không đếm ngược giả, không lượt đặt giả) — Ticket phải giữ nguyên kỷ luật này dù đổi tông cảm xúc.
3. **Bảng so sánh vé dạng ma trận nhiều cột trên mobile** (Universal) — dùng thẻ dọc thay vì bảng ngang.
4. **Điều hướng mơ hồ không phân biệt được với sản phẩm du lịch khác** (bài học trực tiếp từ Traveloka Xperience 2019–2020) — đúng là lỗi hiện tại của MV Ticket.
5. **Storytelling/editorial dài chắn trước CTA** (một phần của KKday) — với vé vui chơi, cảm xúc phải được ảnh/video truyền tải nhanh, không phải đoạn văn dài.

---

## 13. Design DNA đề xuất cho Minh Việt — "Vé vui chơi"

Đề xuất này **kế thừa và cụ thể hoá** `MASTER-BIBLE/VOLUME-13-VISUAL-EMOTION-SYSTEM/13.2-EMOTION-DNA.md`, vốn đã định nghĩa sẵn:

> Vé vui chơi — Emotion: **Excitement** — Cảm giác: Sôi động — Accent: Purple + Orange — Hero: Gia đình, trẻ em, trò chơi.

**Ghi nhận một xung đột tài liệu cần chốt** (giống hệt loại xung đột đã ghi nhận và xử lý ở audit Combo): `13.2-EMOTION-DNA.md` ghi accent "Purple + Orange" nhưng `13.3-COLOR-AND-ACCENT-SYSTEM.md` (Layer 2) chỉ ghi "Festival Orange" cho Tickets, không nhắc Purple. `docs/mv-ticket/05-ui-ux-specification.md` (Phase 0, viết trước brief này) đã chủ động không chốt hex, để "lúc code mới chốt cùng thiết kế UI thật". Tài liệu này **đề xuất chốt**: Festival Orange là accent chính (CTA/giá/badge — theo đúng Layer 2 §13.3, nguồn được xem là chuẩn hơn vì có "Quy tắc sử dụng" chi tiết đi kèm), Purple là accent phụ có kiểm soát (dùng cho phân loại category/tag: "Show diễn", "Gia đình" — không dùng cho CTA chính, để không có 2 màu cùng tranh vai trò kêu gọi hành động). Giá trị hex cụ thể chốt ở giai đoạn thiết kế màu (`docs/design/mv-ticket/04-design-system.md`), không phải ở tài liệu nghiên cứu này.

**Design DNA:**

| Trục | Vé vui chơi | Tương phản trực tiếp với DNA nền tảng (Volume 01) |
|---|---|---|
| Cảm xúc chủ đạo | Excitement / Sôi động / Vui | Trust / Calm confidence |
| Cảm xúc phụ | Discovery, Instant gratification, Family | Premium competence |
| Nhịp trang chủ | Marketplace nhiều dải ngang | Landing page biên tập tuyến tính |
| Ảnh hero | Hành động thật, chuyển động, con người/trẻ em | Cảnh quan tĩnh, flycam |
| Card | Bán hàng — rating, badge, giá nổi bật | Editorial — ảnh + tiêu đề + mô tả |
| Copy | Ngắn, trực tiếp, động từ mệnh lệnh ("Đặt ngay", "Xem vé") | Câu dài, giọng tư vấn |
| Layout chi tiết sản phẩm | Gallery → Benefits → Chọn vé → Mua → Review/FAQ | Timeline "Ngày 1/2/3" |

Đây **không phải là phá vỡ Design DNA nền tảng của Minh Việt** — mà là áp dụng đúng cơ chế đã có sẵn trong chính hệ thống: `01-brand-emotion.md` §4 ("Emotional Priority by Product Area" — mỗi khu vực sản phẩm có cảm xúc chủ đạo riêng) và Volume 13 toàn bộ (mỗi module có Emotion DNA riêng, brand nền tảng — Navy/logo/footer — giữ nguyên). Ticket là module có độ lệch xa nhất so với "Trust/Calm" gốc trong toàn hệ thống — đúng như Volume 13 đã dự liệu từ trước khi module này được code.

---

## Sources

- [Klook Promo Codes 2026: Latest Deals and Offers — Klook Travel Blog](https://www.klook.com/en-HK/blog/klook-promo-code/)
- [KKday vs Klook: Which Platform Gives Travelers Better Value?](https://www.thetraveler.org/kkday-vs-klook-which-platform-gives-travelers-better-value/)
- [Finding The Perfect Things-To-Do: Traveloka Xperience Product Improvement](https://www.dhea.works/works/traveloka-xperience-product-improvement)
- [Traveloka and the Golden Rules of Interface Design — UX Evaluation](https://medium.com/@glnkresna/traveloka-and-the-golden-rules-of-interface-design-ux-evaluation-4ba4540d4112)
- [My Disney Experience App — ThemeParkHipster](https://www.themeparkhipster.com/my-disney-experience-app/)
- [Experience at the Expense of Usability: 5 UX Lessons from Disney World — UX Booth](https://uxbooth.com/articles/experience-at-the-expense-of-usability-5-ux-lessons-from-disney-world/)
- [Ticketmaster's checkout experience — Medium](https://medium.com/@sanbansal110/ticketmasters-shopping-cart-experience-12326c46fc32)
- [Design a Ticket Booking Site Like Ticketmaster — Hello Interview](https://www.hellointerview.com/learn/system-design/problem-breakdowns/ticketmaster)
- [Eventbrite's Ticketing UX — Medium](https://medium.com/ux-school/eventbrites-ticketing-ux-a6ec4b2f2402)
- [Airbnb design system — palette, typography & tokens](https://open-design.ai/plugins/design-system-airbnb/)

---

*Tài liệu tiếp theo: `docs/design/mv-ticket/01-design-direction.md` — mindset khách hàng, emotion lock-in, IA, user journey.*
