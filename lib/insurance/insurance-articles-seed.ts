import type { InsuranceArticle } from '@/types/insurance'

/**
 * Real, editorially-authored articles for /insurance/kien-thuc — genuine
 * travel-insurance advice (how to pick a plan, claim process, visa
 * requirements, etc.), not fabricated DBV numbers/claims. Anything that
 * cites a specific DBV figure (fee floor, coverage limit, zones, family
 * formula, hotline, legal basis) is cross-checked against
 * docs/insurance/Tờ rơi du lịch quốc tế DBV.pdf. Anything general-industry
 * (typical exclusions, how far ahead to buy) is framed as general
 * guidance, not asserted as DBV's specific policy wording — readers are
 * pointed to the real policy document / DBV hotline for exact terms.
 *
 * Images reuse existing real Minh Việt photography (no dedicated
 * insurance-specific photography sourced yet) — same "reuse, don't
 * fabricate" discipline as the rest of the seed.
 *
 * TODO: Replace with CMS Provider — see insurance-repository.ts.
 */
export const insuranceArticlesSeed: InsuranceArticle[] = [
  {
    id: 'article-choosing-a-plan',
    slug: 'cach-chon-goi-bao-hiem-du-lich-quoc-te',
    title: 'Cách chọn gói bảo hiểm du lịch quốc tế phù hợp: A, B hay C?',
    excerpt: 'DBV có 3 gói bảo hiểm du lịch quốc tế A, B, C với mức phí và quyền lợi khác nhau. Bài viết giúp bạn chọn đúng gói theo hành trình và ngân sách.',
    image: { src: '/images/combo/trip-planning.jpg', alt: 'Chuẩn bị lịch trình và giấy tờ trước chuyến đi', width: 1600, height: 1000 },
    publishedAt: '2026-06-02',
    href: '/insurance/kien-thuc/cach-chon-goi-bao-hiem-du-lich-quoc-te',
    order: 1,
    isActive: true,
    metaTitle: 'Cách chọn gói bảo hiểm du lịch quốc tế A, B, C phù hợp | Minh Việt Travel',
    metaDescription: 'So sánh 3 gói bảo hiểm du lịch quốc tế DBV (A, B, C) và cách chọn gói phù hợp với hành trình, ngân sách và nhu cầu bảo vệ của bạn.',
    body: [
      'Bảo hiểm du lịch quốc tế DBV được thiết kế thành 3 gói A, B và C, khác nhau ở mức trách nhiệm tối đa cho từng quyền lợi (chi phí y tế, hủy chuyến, hành lý...) và theo đó là mức phí. Việc chọn đúng gói không chỉ giúp tiết kiệm chi phí mà còn đảm bảo bạn có đủ mức bảo vệ cần thiết cho chuyến đi cụ thể.',
      'Gói A phù hợp với các chuyến đi ngắn ngày, chi phí hợp lý, thường được chọn cho các chuyến công tác hoặc du lịch trong khu vực Đông Nam Á/Châu Á với ngân sách tiết kiệm. Đây là mức bảo vệ cơ bản nhưng vẫn bao gồm đầy đủ các quyền lợi chính: chi phí y tế, vận chuyển y tế khẩn cấp, hồi hương và hỗ trợ khẩn cấp 24/7.',
      'Gói B là lựa chọn cân bằng nhất, phù hợp với phần lớn các chuyến du lịch gia đình hoặc công tác, đặc biệt là các chuyến đi dài ngày hơn hoặc phạm vi địa lý rộng hơn (toàn cầu). Mức trách nhiệm các quyền lợi chính đều cao hơn gói A đáng kể, trong khi mức phí tăng thêm không quá lớn.',
      'Gói C có mức quyền lợi cao nhất trong 3 gói, phù hợp với người thường xuyên đi công tác quốc tế, các chuyến đi toàn cầu dài ngày, hoặc những ai muốn mức bảo vệ tối đa cho các rủi ro như chi phí y tế lớn, hủy/hoãn chuyến, mất mát tài sản giá trị cao.',
      'Ngoài việc chọn gói, phạm vi địa lý (Đông Nam Á / Châu Á-Úc-New Zealand / Toàn cầu) và thời gian chuyến đi cũng ảnh hưởng trực tiếp đến mức phí. Cách nhanh nhất để so sánh là dùng Form tính phí ngay trên trang Bảo hiểm du lịch của Minh Việt Travel — chỉ cần nhập điểm đến, ngày đi và số người, hệ thống sẽ tính phí theo đúng bảng giá DBV cho cả 3 gói để bạn so sánh.',
      'Nếu vẫn phân vân, hãy liên hệ đội ngũ tư vấn của Minh Việt Travel — chúng tôi sẽ giúp bạn đối chiếu nhu cầu thực tế (điểm đến, thời gian, số người đi cùng) với quyền lợi từng gói để chọn phương án phù hợp nhất, không cần mua thừa những quyền lợi không cần thiết.',
    ],
  },
  {
    id: 'article-schengen-visa',
    slug: 'bao-hiem-du-lich-xin-visa-schengen',
    title: 'Bảo hiểm du lịch có bắt buộc khi xin visa Schengen không?',
    excerpt: 'Khối Schengen yêu cầu bảo hiểm du lịch còn hiệu lực khi nộp hồ sơ xin visa. Tìm hiểu yêu cầu cụ thể và cách chuẩn bị chứng nhận bảo hiểm hợp lệ.',
    image: { src: '/images/combo/airplane-window.jpg', alt: 'Nhìn ra cửa sổ máy bay trong chuyến bay quốc tế', width: 1600, height: 1000 },
    publishedAt: '2026-06-09',
    href: '/insurance/kien-thuc/bao-hiem-du-lich-xin-visa-schengen',
    order: 2,
    isActive: true,
    metaTitle: 'Bảo hiểm du lịch xin visa Schengen: yêu cầu và lưu ý | Minh Việt Travel',
    metaDescription: 'Visa Schengen yêu cầu bảo hiểm du lịch quốc tế còn hiệu lực trong suốt chuyến đi. Hướng dẫn chuẩn bị chứng nhận bảo hiểm hợp lệ cho hồ sơ visa.',
    body: [
      'Khối Schengen (bao gồm phần lớn các nước Châu Âu) yêu cầu người xin visa ngắn hạn phải có bảo hiểm du lịch với mức trách nhiệm tối thiểu 30.000 EUR, có hiệu lực trong suốt thời gian lưu trú và áp dụng cho toàn bộ khối Schengen. Đây là một trong những giấy tờ bắt buộc trong hồ sơ xin visa, dù không phải yếu tố duy nhất quyết định việc đậu/rớt visa.',
      'Bảo hiểm du lịch quốc tế DBV với phạm vi địa lý "Toàn cầu" đáp ứng yêu cầu này — quyền lợi chi phí y tế ở nước ngoài của cả 3 gói A, B, C đều vượt mức tối thiểu 30.000 EUR mà khối Schengen yêu cầu. Khi mua bảo hiểm qua Minh Việt Travel, bạn sẽ nhận được giấy chứng nhận bảo hiểm (Insurance Certificate) bằng tiếng Anh — đây chính là giấy tờ cần nộp kèm hồ sơ visa.',
      'Một lưu ý quan trọng: thời hạn bảo hiểm trên chứng nhận phải khớp chính xác với thời gian chuyến đi bạn khai trong hồ sơ visa (ngày đi, ngày về). Nếu lịch trình thay đổi sau khi đã mua bảo hiểm, bạn cần điều chỉnh lại thời hạn hợp đồng để tránh sai lệch giữa hồ sơ visa và chứng nhận bảo hiểm.',
      'Ngoài Schengen, nhiều quốc gia khác (một số nước Châu Á, Trung Đông) cũng có yêu cầu tương tự dù mức tối thiểu có thể khác. Trước khi mua bảo hiểm, tốt nhất bạn nên kiểm tra yêu cầu cụ thể của Đại sứ quán/Lãnh sự quán nơi bạn nộp hồ sơ, hoặc trao đổi với đội ngũ tư vấn visa của Minh Việt Travel để được hướng dẫn mức bảo hiểm phù hợp.',
    ],
  },
  {
    id: 'article-claim-process',
    slug: 'thu-tuc-yeu-cau-boi-thuong-bao-hiem-du-lich',
    title: 'Hướng dẫn thủ tục yêu cầu bồi thường bảo hiểm du lịch khi ở nước ngoài',
    excerpt: 'Gặp sự cố y tế, mất hành lý hay hủy chuyến khi đang ở nước ngoài? Đây là các bước cần làm ngay để yêu cầu bồi thường bảo hiểm du lịch đúng quy trình.',
    image: { src: '/images/combo/hotel-reception.jpg', alt: 'Quầy lễ tân khách sạn', width: 1600, height: 1000 },
    publishedAt: '2026-06-16',
    href: '/insurance/kien-thuc/thu-tuc-yeu-cau-boi-thuong-bao-hiem-du-lich',
    order: 3,
    isActive: true,
    metaTitle: 'Thủ tục yêu cầu bồi thường bảo hiểm du lịch khi ở nước ngoài | Minh Việt Travel',
    metaDescription: 'Các bước cần làm ngay khi gặp sự cố y tế, mất hành lý hoặc hủy chuyến ở nước ngoài để yêu cầu bồi thường bảo hiểm du lịch đúng quy trình, đủ hồ sơ.',
    body: [
      'Sự cố ở nước ngoài thường xảy ra bất ngờ, nhưng cách bạn xử lý ngay từ đầu quyết định rất nhiều đến việc yêu cầu bồi thường sau này có thuận lợi hay không. Nguyên tắc quan trọng nhất: giữ lại mọi giấy tờ, hóa đơn gốc liên quan đến sự cố — đây là bằng chứng bắt buộc cho hồ sơ bồi thường.',
      'Bước 1 — Liên hệ ngay tổng đài hỗ trợ khẩn cấp. Với bảo hiểm DBV, gọi tổng đài CSKH 1900 96 96 90 (hoặc số hotline hỗ trợ khẩn cấp quốc tế ghi trên chứng nhận bảo hiểm) để được hướng dẫn xử lý ngay tại chỗ, đặc biệt với các trường hợp y tế cần nhập viện hoặc vận chuyển y tế khẩn cấp.',
      'Bước 2 — Thu thập đầy đủ giấy tờ liên quan. Tùy loại sự cố, hồ sơ thường cần: hóa đơn/biên lai chi phí gốc (viện phí, thuốc, sửa chữa...), hồ sơ bệnh án hoặc giấy xác nhận của bác sĩ, biên bản của cơ quan chức năng (công an với trường hợp mất cắp, hãng hàng không với trường hợp hành lý thất lạc/chuyến bay bị hoãn), vé máy bay, hộ chiếu và bản sao hợp đồng bảo hiểm.',
      'Bước 3 — Thông báo sự việc trong thời gian sớm nhất có thể, tốt nhất là ngay khi sự cố xảy ra hoặc trong vòng vài ngày sau đó, thay vì đợi đến khi kết thúc chuyến đi. Việc thông báo sớm giúp công ty bảo hiểm hỗ trợ kịp thời và tránh vướng mắc về thời hạn thông báo sự kiện bảo hiểm.',
      'Bước 4 — Sau khi về nước, hoàn thiện hồ sơ yêu cầu bồi thường đầy đủ và gửi cho DBV (trực tiếp hoặc qua Minh Việt Travel nếu bạn mua bảo hiểm qua chúng tôi — đội ngũ Minh Việt sẽ hỗ trợ bạn trong quá trình nộp hồ sơ). Thời gian xử lý và các điều khoản chi tiết áp dụng theo đúng hợp đồng bảo hiểm bạn đã ký — nếu có bất kỳ câu hỏi nào về hồ sơ, hãy liên hệ trực tiếp DBV hoặc Minh Việt Travel để được hướng dẫn chính xác cho trường hợp của bạn.',
    ],
  },
  {
    id: 'article-covid-coverage',
    slug: 'bao-hiem-du-lich-chi-tra-dieu-tri-covid-19',
    title: 'Bảo hiểm du lịch quốc tế DBV có chi trả chi phí điều trị Covid-19 không?',
    excerpt: 'Nhiều người còn băn khoăn liệu bảo hiểm du lịch có bảo vệ trước rủi ro Covid-19 hay không. Đây là quyền lợi cụ thể trong chương trình bảo hiểm DBV.',
    image: { src: '/images/combo/resort-breakfast.jpg', alt: 'Bữa sáng tại khu nghỉ dưỡng', width: 1600, height: 1000 },
    publishedAt: '2026-06-23',
    href: '/insurance/kien-thuc/bao-hiem-du-lich-chi-tra-dieu-tri-covid-19',
    order: 4,
    isActive: true,
    metaTitle: 'Bảo hiểm du lịch DBV có chi trả điều trị Covid-19 không? | Minh Việt Travel',
    metaDescription: 'Bảo hiểm du lịch quốc tế DBV có quyền lợi riêng cho chi phí y tế điều trị Covid-19 ở nước ngoài — mức trách nhiệm cụ thể theo từng gói A, B, C.',
    body: [
      'Có. Chương trình bảo hiểm du lịch quốc tế DBV có quyền lợi riêng cho "Chi phí y tế điều trị Covid-19" (mục 1.4 trong bảng quyền lợi bảo hiểm), tách biệt với quyền lợi chi phí y tế nội trú/ngoại trú thông thường. Đây là điểm nhiều khách hàng quan tâm khi cân nhắc mua bảo hiểm cho các chuyến đi quốc tế.',
      'Mức trách nhiệm tối đa cho quyền lợi này khác nhau theo từng gói: Gói A 25.000 USD (500.000.000đ), Gói B 35.000 USD (750.000.000đ), Gói C 50.000 USD (1.000.000.000đ). Đây là mức bảo vệ đáng kể nếu không may bạn cần điều trị Covid-19 tại bệnh viện nước ngoài, nơi chi phí y tế thường cao hơn nhiều so với Việt Nam.',
      'Cũng như các quyền lợi y tế khác, để được chi trả bạn cần giữ đầy đủ hồ sơ bệnh án, kết quả xét nghiệm, hóa đơn viện phí gốc và thông báo cho DBV (qua tổng đài CSKH 1900 96 96 90) càng sớm càng tốt khi phát sinh chi phí điều trị.',
      'Nếu chuyến đi của bạn tới khu vực có yêu cầu riêng về bảo hiểm y tế liên quan dịch bệnh (một số quốc gia từng áp dụng trong giai đoạn dịch), chứng nhận bảo hiểm DBV có ghi rõ quyền lợi Covid-19 sẽ là căn cứ hợp lệ để bạn xuất trình khi cần.',
    ],
  },
  {
    id: 'article-family-premium',
    slug: 'bao-hiem-du-lich-cho-gia-dinh',
    title: 'Mua bảo hiểm du lịch cho cả gia đình: cách tính phí và lưu ý',
    excerpt: 'Đi du lịch cả nhà, tính phí bảo hiểm thế nào cho tiết kiệm? Công thức tính phí gia đình của DBV và những lưu ý khi mua bảo hiểm cho cả bố mẹ và con cái.',
    image: { src: '/images/combo/gia-dinh.jpg', alt: 'Gia đình chuẩn bị hành lý cho chuyến đi', width: 1600, height: 1000 },
    publishedAt: '2026-06-30',
    href: '/insurance/kien-thuc/bao-hiem-du-lich-cho-gia-dinh',
    order: 5,
    isActive: true,
    metaTitle: 'Cách tính phí bảo hiểm du lịch cho gia đình | Minh Việt Travel',
    metaDescription: 'Công thức tính phí bảo hiểm du lịch quốc tế DBV cho cả gia đình và các lưu ý quan trọng khi mua bảo hiểm cho bố mẹ và con cái đi cùng.',
    body: [
      'Khi cả gia đình cùng đi du lịch, DBV áp dụng công thức tính phí riêng cho gói gia đình, giúp tiết kiệm hơn so với việc mua riêng lẻ từng người: Phí bảo hiểm (gia đình) = Phí bảo hiểm (cá nhân) × (Số người trong gia đình − 1).',
      'Ví dụ, nếu phí cá nhân cho một chuyến đi cụ thể là 500.000đ và gia đình có 4 người (bố, mẹ, 2 con), phí bảo hiểm gia đình sẽ là 500.000đ × (4 − 1) = 1.500.000đ cho cả 4 người — tiết kiệm hơn đáng kể so với mua 4 phí cá nhân riêng lẻ (2.000.000đ).',
      'Lưu ý quan trọng: gói gia đình chỉ áp dụng cho các thành viên là bố, mẹ và các con hợp pháp — không áp dụng cho ông bà, họ hàng, bạn bè hay đồng nghiệp đi cùng. Nếu nhóm đi cùng không phải là gia đình theo định nghĩa này, mỗi người cần mua bảo hiểm cá nhân riêng.',
      'Với trẻ em dưới 10 tuổi, DBV yêu cầu phải có một người trưởng thành đi kèm và được bảo hiểm trong cùng một hợp đồng — đây cũng là lý do gói gia đình luôn tính theo hợp đồng chung, không tách lẻ.',
      'Khi mua bảo hiểm gia đình qua Minh Việt Travel, bạn chỉ cần cung cấp thông tin của tất cả thành viên cùng một lần trong Form tính phí — hệ thống sẽ tự động tính phí theo đúng công thức trên cho gói bạn chọn, không cần tính tay hay lo tính sai.',
    ],
  },
  {
    id: 'article-exclusions',
    slug: 'truong-hop-bao-hiem-du-lich-khong-chi-tra',
    title: 'Những trường hợp bảo hiểm du lịch thường không chi trả — cần biết trước khi mua',
    excerpt: 'Không phải mọi rủi ro đều được bảo hiểm du lịch chi trả. Tìm hiểu các loại trừ phổ biến trong ngành bảo hiểm du lịch để tránh hiểu nhầm khi yêu cầu bồi thường.',
    image: { src: '/images/combo/hotel-room.jpg', alt: 'Phòng khách sạn trong chuyến du lịch', width: 1600, height: 1000 },
    publishedAt: '2026-07-07',
    href: '/insurance/kien-thuc/truong-hop-bao-hiem-du-lich-khong-chi-tra',
    order: 6,
    isActive: true,
    metaTitle: 'Các trường hợp bảo hiểm du lịch thường không chi trả | Minh Việt Travel',
    metaDescription: 'Tìm hiểu các loại trừ trách nhiệm phổ biến trong bảo hiểm du lịch quốc tế để hiểu rõ phạm vi bảo vệ trước khi mua và khi yêu cầu bồi thường.',
    body: [
      'Giống như mọi sản phẩm bảo hiểm khác, bảo hiểm du lịch quốc tế có những điều khoản loại trừ trách nhiệm — tức các trường hợp công ty bảo hiểm không chi trả. Hiểu rõ các loại trừ phổ biến giúp bạn tránh hiểu nhầm và biết chính xác phạm vi bảo vệ của mình.',
      'Một số loại trừ phổ biến trong ngành bảo hiểm du lịch nói chung (không riêng DBV) thường bao gồm: bệnh lý có sẵn từ trước khi mua bảo hiểm (trừ khi được khai báo và chấp thuận riêng), các hành vi vi phạm pháp luật, tham gia các môn thể thao mạo hiểm không được khai báo, say rượu bia/sử dụng chất kích thích, hoặc đi đến các khu vực đang có cảnh báo/khuyến cáo không nên đến từ cơ quan chức năng.',
      'Với các quyền lợi cụ thể như hủy/hoãn chuyến đi, thông thường lý do hủy chuyến cần thuộc danh mục được bảo hiểm chấp nhận (ốm đau, tai nạn, sự cố bất khả kháng...) chứ không phải đơn thuần đổi ý không muốn đi nữa.',
      'Đây là những nguyên tắc chung của ngành bảo hiểm du lịch — điều khoản loại trừ chính xác của chương trình bảo hiểm DBV được quy định chi tiết trong hợp đồng/quy tắc bảo hiểm chính thức (Quyết định số 106/QĐ/2008-VNI/BHCN và các điều khoản bổ sung). Trước khi mua, bạn nên đọc kỹ quy tắc bảo hiểm hoặc liên hệ Minh Việt Travel/DBV để được giải đáp cụ thể cho tình huống của mình, tránh giả định theo cảm tính.',
      'Một mẹo nhỏ: khi điền Form tính phí và mua bảo hiểm, hãy khai báo trung thực các thông tin liên quan đến tình trạng sức khỏe hoặc kế hoạch chuyến đi (ví dụ có tham gia hoạt động thể thao mạo hiểm hay không) — đây là cách tốt nhất để đảm bảo quyền lợi của bạn được bảo vệ đầy đủ khi cần yêu cầu bồi thường.',
    ],
  },
]
