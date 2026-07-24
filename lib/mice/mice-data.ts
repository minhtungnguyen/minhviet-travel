import type { MiceLandingContent } from '@/types/mice'

const NOW = '2026-07-25T00:00:00.000Z'

/**
 * Mock repository data for /mice — the CMS-ready seam described in
 * `types/mice.ts`. Structure only (definition → objectives → 4 solutions
 * → benefits → process → capability → CTA) is informed by how MICE
 * explainer pages conventionally organize this material; every sentence,
 * number and example below is Minh Việt's own, written for Minh Việt's
 * positioning ("Thiết kế trải nghiệm doanh nghiệp từ mục tiêu đến vận
 * hành") — nothing here is copied from any reference site.
 *
 * The "300+ chương trình MICE" figure used elsewhere in the app
 * (`lib/cms/content/homepage.seed.ts`, `enterpriseMice.proofStat`) is
 * deliberately NOT reused on this page — see
 * MICE_LANDING_PAGE_SPEC_AND_IMPLEMENTATION.md, "Remaining backend/CMS
 * tasks", for why it needs verification before it propagates further.
 */
export const miceLandingContentSeed: MiceLandingContent = {
  seo: {
    title: 'MICE là gì? Giải pháp tổ chức MICE trọn gói | Minh Việt Travel',
    description:
      'Tìm hiểu MICE là gì và cách Minh Việt Travel thiết kế hội nghị, incentive trip, company trip, team building, gala dinner và sự kiện doanh nghiệp theo mục tiêu, ngân sách và quy mô thực tế.',
    canonicalPath: '/mice',
    ogImage: '/enterprise-mice.webp',
  },

  hero: {
    eyebrow: 'Enterprise Experience & MICE',
    headline: 'Không chỉ tổ chức sự kiện.\nMinh Việt thiết kế trải nghiệm doanh nghiệp.',
    supportingCopy:
      'Từ hội nghị, hội thảo, incentive trip, company trip, team building đến gala dinner — mỗi chương trình được xây dựng theo mục tiêu, quy mô, ngân sách và văn hóa riêng của doanh nghiệp.',
    primaryCta: { label: 'Thiết kế chương trình MICE', href: '#mice-form' },
    secondaryCta: { label: 'Khám phá quy trình', href: '#quy-trinh-mice' },
    image: {
      src: '/enterprise-mice.webp',
      alt: 'Sự kiện gala dinner doanh nghiệp do Minh Việt Travel thiết kế và vận hành',
      width: 1920,
      height: 1080,
    },
  },

  objectives: [
    { id: 'obj-gan-ket', slug: 'gan-ket-doi-ngu', title: 'Gắn kết đội ngũ', description: 'Tăng gắn kết nội bộ qua trải nghiệm chung ngoài môi trường công việc thường ngày.', relatedHref: '#event', order: 1, isActive: true, locale: 'vi', createdAt: NOW, updatedAt: NOW },
    { id: 'obj-vinh-danh', slug: 'vinh-danh-khen-thuong', title: 'Vinh danh và khen thưởng', description: 'Ghi nhận thành tích cá nhân và tập thể bằng một chương trình xứng đáng.', relatedHref: '#incentive', order: 2, isActive: true, locale: 'vi', createdAt: NOW, updatedAt: NOW },
    { id: 'obj-hoi-nghi', slug: 'hoi-nghi-chien-luoc', title: 'Hội nghị chiến lược', description: 'Tổ chức không gian và hậu cần cho các quyết định quan trọng của tổ chức.', relatedHref: '#meeting', order: 3, isActive: true, locale: 'vi', createdAt: NOW, updatedAt: NOW },
    { id: 'obj-hoi-thao', slug: 'hoi-thao-chuyen-mon', title: 'Hội thảo chuyên môn', description: 'Truyền tải kiến thức chuyên ngành trong không gian phù hợp quy mô người tham dự.', relatedHref: '#conference', order: 4, isActive: true, locale: 'vi', createdAt: NOW, updatedAt: NOW },
    { id: 'obj-tri-an', slug: 'tri-an-khach-hang', title: 'Tri ân khách hàng', description: 'Củng cố quan hệ với khách hàng và đối tác qua một chương trình được đầu tư đúng mức.', relatedHref: '#event', order: 5, isActive: true, locale: 'vi', createdAt: NOW, updatedAt: NOW },
    { id: 'obj-ra-mat', slug: 'ra-mat-san-pham', title: 'Ra mắt sản phẩm', description: 'Tạo khoảnh khắc đáng nhớ để giới thiệu sản phẩm hoặc dịch vụ mới ra thị trường.', relatedHref: '#event', order: 6, isActive: true, locale: 'vi', createdAt: NOW, updatedAt: NOW },
    { id: 'obj-dao-tao', slug: 'dao-tao-phat-trien', title: 'Đào tạo và phát triển', description: 'Kết hợp nội dung đào tạo với không gian tập trung, tách biệt khỏi công việc thường nhật.', relatedHref: '#conference', order: 7, isActive: true, locale: 'vi', createdAt: NOW, updatedAt: NOW },
    { id: 'obj-doi-tac', slug: 'ket-noi-doi-tac', title: 'Kết nối đối tác', description: 'Xây dựng và củng cố quan hệ hợp tác qua các chương trình gặp gỡ trực tiếp.', relatedHref: '#meeting', order: 8, isActive: true, locale: 'vi', createdAt: NOW, updatedAt: NOW },
    { id: 'obj-van-hoa', slug: 'xay-dung-van-hoa', title: 'Xây dựng văn hóa doanh nghiệp', description: 'Củng cố giá trị và bản sắc tổ chức qua trải nghiệm tập thể có chủ đích.', relatedHref: '/tour-thiet-ke', order: 9, isActive: true, locale: 'vi', createdAt: NOW, updatedAt: NOW },
    { id: 'obj-thuong-nien', slug: 'su-kien-thuong-nien', title: 'Tổ chức sự kiện thường niên', description: 'Duy trì một chương trình định kỳ chuyên nghiệp, nhất quán qua từng năm.', relatedHref: '#incentive', order: 10, isActive: true, locale: 'vi', createdAt: NOW, updatedAt: NOW },
  ],

  solutions: [
    {
      id: 'sol-meeting', slug: 'meeting', type: 'meeting', termEn: 'Meeting', displayName: 'Hội họp và kết nối công việc',
      title: 'Hội họp và kết nối công việc', subtitle: 'Meeting',
      objective: 'Tạo không gian và hậu cần phù hợp cho các cuộc họp cần sự tập trung và hiệu quả ra quyết định.',
      audienceFit: 'Ban lãnh đạo, phòng ban, đối tác cần một cuộc họp trang trọng ngoài văn phòng.',
      applications: ['Họp chiến lược', 'Kick-off', 'Hội nghị khách hàng', 'Họp đối tác', 'Họp hiệp hội'],
      typicalComponents: ['Phòng hội nghị', 'Âm thanh', 'Ánh sáng', 'Phiên dịch', 'Điều phối viên'],
      ctaLabel: 'Yêu cầu tư vấn',
      coverImage: '/brand-signing.webp', coverImageAlt: 'Buổi họp và ký kết hợp tác giữa doanh nghiệp và đối tác',
      order: 1, isActive: true, locale: 'vi', createdAt: NOW, updatedAt: NOW,
    },
    {
      id: 'sol-incentive', slug: 'incentive', type: 'incentive', termEn: 'Incentive', displayName: 'Du lịch khen thưởng và khích lệ',
      title: 'Du lịch khen thưởng và khích lệ', subtitle: 'Incentive',
      objective: 'Dùng trải nghiệm du lịch như một hình thức ghi nhận, tạo động lực làm việc cho đội ngũ.',
      audienceFit: 'Doanh nghiệp muốn khen thưởng nhân sự, đại lý hoặc đối tác xuất sắc.',
      applications: ['Company Trip', 'Incentive Trip', 'Chương trình vinh danh', 'Nghỉ dưỡng nhân sự', 'Tri ân đại lý'],
      typicalComponents: ['Điểm đến', 'Vé máy bay', 'Khách sạn / Resort', 'Team Building', 'Media'],
      ctaLabel: 'Yêu cầu tư vấn',
      coverImage: '/images/hero/ha-long-bay.jpg', coverImageAlt: 'Đoàn khách doanh nghiệp trải nghiệm du thuyền vịnh Hạ Long',
      order: 2, isActive: true, locale: 'vi', createdAt: NOW, updatedAt: NOW,
    },
    {
      id: 'sol-conference', slug: 'conference', type: 'conference', termEn: 'Conference / Convention', displayName: 'Hội nghị và hội thảo chuyên đề',
      title: 'Hội nghị và hội thảo chuyên đề', subtitle: 'Conference / Convention',
      objective: 'Tổ chức chương trình quy mô lớn hơn, nhiều nội dung chuyên môn và người tham dự hơn một cuộc họp thông thường.',
      audienceFit: 'Tổ chức, hiệp hội ngành cần truyền tải nội dung chuyên môn tới nhiều người tham dự.',
      applications: ['Hội nghị thường niên', 'Hội thảo ngành', 'Diễn đàn doanh nghiệp', 'Chương trình đào tạo', 'Hội nghị quốc tế'],
      typicalComponents: ['Sân khấu', 'LED', 'Backdrop', 'MC', 'Báo cáo nghiệm thu'],
      ctaLabel: 'Yêu cầu tư vấn',
      coverImage: '/brand-leadership.webp', coverImageAlt: 'Diễn giả trình bày tại một hội nghị doanh nghiệp',
      order: 3, isActive: true, locale: 'vi', createdAt: NOW, updatedAt: NOW,
    },
    {
      id: 'sol-event', slug: 'event', type: 'event', termEn: 'Event / Exhibition', displayName: 'Sự kiện, triển lãm và trải nghiệm thương hiệu',
      title: 'Sự kiện, triển lãm và trải nghiệm thương hiệu', subtitle: 'Event / Exhibition',
      objective: 'Tạo một khoảnh khắc thương hiệu đáng nhớ — nơi cảm xúc và trải nghiệm là trọng tâm.',
      audienceFit: 'Doanh nghiệp cần ra mắt sản phẩm, tri ân khách hàng hoặc tổ chức sự kiện nội bộ có dấu ấn riêng.',
      applications: ['Ra mắt sản phẩm', 'Triển lãm', 'Gala Dinner', 'Lễ kỷ niệm', 'Family Day', 'Sự kiện nội bộ'],
      typicalComponents: ['Sân khấu', 'Nghệ sĩ', 'Gala Dinner', 'Livestream', 'Photobooth'],
      ctaLabel: 'Yêu cầu tư vấn',
      coverImage: '/editorial-mice.webp', coverImageAlt: 'Gala dinner doanh nghiệp với sân khấu và tiệc tối trang trọng',
      order: 4, isActive: true, locale: 'vi', createdAt: NOW, updatedAt: NOW,
    },
  ],

  benefitCategories: [
    {
      id: 'benefit-nguoi', title: 'Con người',
      benefits: [
        { id: 'b1', label: 'Tăng gắn kết' },
        { id: 'b2', label: 'Tạo động lực' },
        { id: 'b3', label: 'Ghi nhận thành tích' },
        { id: 'b4', label: 'Tái tạo năng lượng' },
      ],
    },
    {
      id: 'benefit-kinhdoanh', title: 'Kinh doanh',
      benefits: [
        { id: 'b5', label: 'Kết nối đối tác' },
        { id: 'b6', label: 'Thúc đẩy hợp tác' },
        { id: 'b7', label: 'Nâng hiệu quả hội họp' },
        { id: 'b8', label: 'Hỗ trợ ra mắt sản phẩm' },
      ],
    },
    {
      id: 'benefit-thuonghieu', title: 'Thương hiệu',
      benefits: [
        { id: 'b9', label: 'Truyền tải thông điệp' },
        { id: 'b10', label: 'Nâng trải nghiệm khách hàng' },
        { id: 'b11', label: 'Củng cố văn hóa doanh nghiệp' },
        { id: 'b12', label: 'Tạo nội dung truyền thông' },
      ],
    },
    {
      id: 'benefit-vanhanh', title: 'Vận hành',
      benefits: [
        { id: 'b13', label: 'Một đầu mối' },
        { id: 'b14', label: 'Kiểm soát ngân sách' },
        { id: 'b15', label: 'Đồng bộ nhà cung cấp' },
        { id: 'b16', label: 'Giảm rủi ro tổ chức' },
      ],
    },
  ],

  process: [
    { id: 'p1', order: 1, title: 'Tiếp nhận nhu cầu', description: 'Lắng nghe mục tiêu, đối tượng, quy mô và mong muốn ban đầu của doanh nghiệp.', outputs: ['Thông tin mục tiêu', 'Quy mô đoàn dự kiến', 'Ngân sách sơ bộ'] },
    { id: 'p2', order: 2, title: 'Xác định mục tiêu và ngân sách', description: 'Thống nhất trọng tâm chương trình và khung ngân sách khả thi trước khi đi vào ý tưởng.', outputs: ['Mục tiêu ưu tiên', 'Khung ngân sách', 'Tiêu chí thành công'] },
    { id: 'p3', order: 3, title: 'Xây dựng concept', description: 'Phác thảo ý tưởng chủ đề và trải nghiệm phù hợp với mục tiêu đã thống nhất.', outputs: ['Chủ đề', 'Thông điệp', 'Phong cách', 'Kịch bản trải nghiệm'] },
    { id: 'p4', order: 4, title: 'Thiết kế chương trình và báo giá', description: 'Hoàn thiện lịch trình chi tiết cùng báo giá minh bạch theo từng hạng mục.', outputs: ['Lịch trình chi tiết', 'Báo giá theo hạng mục'] },
    { id: 'p5', order: 5, title: 'Điều phối và vận hành', description: 'Triển khai thực tế với một đầu mối điều phối tại chỗ xuyên suốt chương trình.', outputs: ['Timeline vận hành', 'Đầu mối điều phối tại chỗ'] },
    { id: 'p6', order: 6, title: 'Nghiệm thu và báo cáo', description: 'Đánh giá kết quả cùng doanh nghiệp và tổng kết bằng báo cáo sau chương trình.', outputs: ['Biên bản nghiệm thu', 'Báo cáo tổng kết chương trình'] },
  ],

  componentGroups: [
    { id: 'grp-travel', label: 'Travel', items: ['Điểm đến', 'Vé máy bay', 'Xe đưa đón', 'Khách sạn / Resort', 'Bảo hiểm'] },
    { id: 'grp-production', label: 'Event Production', items: ['Phòng hội nghị', 'Sân khấu', 'Âm thanh', 'Ánh sáng', 'LED', 'Backdrop'] },
    { id: 'grp-experience', label: 'Experience', items: ['MC', 'Nghệ sĩ', 'Team Building', 'Gala Dinner', 'Tiệc', 'Workshop', 'CSR'] },
    { id: 'grp-media', label: 'Media', items: ['Media', 'Livestream', 'Drone', 'Photobooth'] },
    { id: 'grp-ops', label: 'Operations', items: ['Quà tặng', 'Phiên dịch', 'Điều phối viên', 'Báo cáo nghiệm thu'] },
  ],

  programIdeas: [
    {
      id: 'idea-halong', slug: 'company-trip-ha-long', title: 'Company Trip Hạ Long', subtitle: 'Gắn kết và vinh danh',
      programType: 'Incentive / Company Trip', objective: 'Gắn kết và vinh danh', durationLabel: '3N2Đ',
      keyComponents: ['Du thuyền vịnh Hạ Long', 'Team Building trên biển', 'Gala Dinner ngoài trời'],
      coverImage: '/images/hero/ha-long-bay.jpg', coverImageAlt: 'Company Trip trên du thuyền vịnh Hạ Long',
      order: 1, isActive: true, locale: 'vi', createdAt: NOW, updatedAt: NOW,
    },
    {
      id: 'idea-danang', slug: 'mice-da-nang', title: 'MICE Đà Nẵng', subtitle: 'Hội nghị kết hợp nghỉ dưỡng',
      programType: 'Conference / Meeting', objective: 'Hội nghị kết hợp nghỉ dưỡng', durationLabel: '4N3Đ',
      keyComponents: ['Trung tâm hội nghị 5 sao', 'Hoạt động ngoại khóa', 'Gala tổng kết'],
      coverImage: '/images/hero/ninh-binh.jpg', coverImageAlt: 'Phong cảnh miền Trung phù hợp cho hội nghị kết hợp nghỉ dưỡng',
      order: 2, isActive: true, locale: 'vi', createdAt: NOW, updatedAt: NOW,
    },
    {
      id: 'idea-nhatrang', slug: 'kick-off-nha-trang', title: 'Kick-off Nha Trang', subtitle: 'Khởi động mục tiêu mới',
      programType: 'Meeting / Kick-off', objective: 'Khởi động mục tiêu mới', durationLabel: '3N2Đ',
      keyComponents: ['Phòng họp chiến lược', 'Hoạt động truyền cảm hứng', 'Tiệc khởi động'],
      coverImage: '/dest-vietnam.webp', coverImageAlt: 'Bờ biển Việt Nam phù hợp tổ chức chương trình kick-off',
      order: 3, isActive: true, locale: 'vi', createdAt: NOW, updatedAt: NOW,
    },
    {
      id: 'idea-phuquoc', slug: 'gala-dinner-phu-quoc', title: 'Gala Dinner Phú Quốc', subtitle: 'Tri ân và tôn vinh',
      programType: 'Event / Gala', objective: 'Tri ân và tôn vinh', durationLabel: '3N2Đ',
      keyComponents: ['Đêm tiệc chủ đề riêng', 'Sân khấu và ánh sáng', 'Chương trình nghệ thuật'],
      coverImage: '/enterprise-mice.webp', coverImageAlt: 'Gala dinner tri ân và tôn vinh dành cho doanh nghiệp',
      order: 4, isActive: true, locale: 'vi', createdAt: NOW, updatedAt: NOW,
    },
    {
      id: 'idea-japan', slug: 'incentive-nhat-ban', title: 'Incentive Nhật Bản', subtitle: 'Trải nghiệm và khen thưởng',
      programType: 'Incentive quốc tế', objective: 'Trải nghiệm và khen thưởng', durationLabel: '5N4Đ',
      keyComponents: ['Hành trình văn hóa Nhật Bản', 'Dịch vụ cao cấp xuyên suốt', 'Vinh danh nhân sự xuất sắc'],
      coverImage: '/dest-japan.webp', coverImageAlt: 'Hành trình incentive Nhật Bản dành cho nhân sự xuất sắc',
      order: 5, isActive: true, locale: 'vi', createdAt: NOW, updatedAt: NOW,
    },
    {
      id: 'idea-catba', slug: 'team-building-cat-ba', title: 'Team Building Cát Bà', subtitle: 'Kết nối đội ngũ',
      programType: 'Team Building', objective: 'Kết nối đội ngũ', durationLabel: '2N1Đ',
      keyComponents: ['Thử thách đồng đội trên đảo', 'BBQ bãi biển', 'Không gian gắn kết tự nhiên'],
      coverImage: '/brand-group.webp', coverImageAlt: 'Team building gắn kết đội ngũ ngoài trời',
      order: 6, isActive: true, locale: 'vi', createdAt: NOW, updatedAt: NOW,
    },
  ],

  caseStudies: [
    {
      id: 'case-01', slug: 'du-an-minh-hoa-company-trip', title: 'Company Trip gắn kết đội ngũ sau tái cấu trúc',
      isAnonymized: true, industry: 'Sản xuất công nghiệp', groupSize: '150–200 khách',
      objective: 'Gắn kết đội ngũ và tái tạo tinh thần làm việc sau giai đoạn tái cấu trúc nội bộ.',
      solution: 'Company Trip 3 ngày 2 đêm kết hợp Team Building bãi biển và Gala Dinner theo chủ đề riêng.',
      componentsDelivered: ['Khách sạn 4 sao', 'Team Building bãi biển', 'Gala Dinner chủ đề', 'MC dẫn chương trình', 'Xe đưa đón trọn tuyến'],
      disclaimer: 'Dự án minh họa theo mô hình triển khai thực tế — thông tin doanh nghiệp được ẩn danh theo yêu cầu bảo mật.',
      coverImage: '/brand-group.webp', coverImageAlt: 'Đoàn khách doanh nghiệp tham gia team building bãi biển',
      gallery: [
        { src: '/brand-group.webp', alt: 'Team building bãi biển', width: 1200, height: 900 },
        { src: '/enterprise-mice.webp', alt: 'Gala dinner tổng kết chương trình', width: 1200, height: 900 },
        { src: '/editorial-mice.webp', alt: 'Không gian tiệc tối doanh nghiệp', width: 1200, height: 900 },
      ],
      order: 1, isActive: true, locale: 'vi', createdAt: NOW, updatedAt: NOW,
    },
  ],

  mediaItems: [
    { id: 'media-01', slug: 'gala-dinner-doanh-nghiep', title: 'Cảm xúc Gala Dinner doanh nghiệp', kind: 'video', coverImage: '/editorial-mice.webp', coverImageAlt: 'Khoảnh khắc gala dinner doanh nghiệp', order: 1, isActive: true, locale: 'vi', createdAt: NOW, updatedAt: NOW },
    { id: 'media-02', slug: 'team-building-gan-ket', title: 'Team Building gắn kết đội ngũ', kind: 'video', coverImage: '/brand-group.webp', coverImageAlt: 'Khoảnh khắc team building gắn kết đội ngũ', order: 2, isActive: true, locale: 'vi', createdAt: NOW, updatedAt: NOW },
    { id: 'media-03', slug: 'hoi-nghi-doi-tac', title: 'Hội nghị và kết nối đối tác', kind: 'video', coverImage: '/brand-signing.webp', coverImageAlt: 'Khoảnh khắc hội nghị kết nối đối tác', order: 3, isActive: true, locale: 'vi', createdAt: NOW, updatedAt: NOW },
  ],

  verifiedStats: [],

  capabilityPoints: [
    { id: 'cap-1', title: 'Một đầu mối điều phối', description: 'Một chuyên viên đồng hành xuyên suốt chương trình, không bàn giao giữa chừng.' },
    { id: 'cap-2', title: 'Quy trình rõ ràng', description: 'Sáu bước minh bạch, mỗi bước có đầu ra cụ thể để doanh nghiệp theo dõi.' },
    { id: 'cap-3', title: 'Mạng lưới nhà cung cấp', description: 'Hệ thống khách sạn, vận chuyển, sản xuất sự kiện đã được thẩm định.' },
    { id: 'cap-4', title: 'Kiểm soát chi phí', description: 'Báo giá minh bạch theo hạng mục, không phát sinh ẩn.' },
    { id: 'cap-5', title: 'Quản lý timeline', description: 'Lịch trình vận hành chi tiết, giám sát tiến độ từng hạng mục.' },
    { id: 'cap-6', title: 'Xử lý thay đổi', description: 'Phương án dự phòng cho thay đổi thời tiết, số lượng khách hoặc yêu cầu phát sinh.' },
    { id: 'cap-7', title: 'Hỗ trợ tại hiện trường', description: 'Đội ngũ điều phối có mặt trực tiếp trong suốt chương trình.' },
    { id: 'cap-8', title: 'Báo cáo nghiệm thu', description: 'Tổng kết kết quả và chi phí thực tế sau khi chương trình kết thúc.' },
    { id: 'cap-9', title: 'Chăm sóc sau chương trình', description: 'Tiếp nhận phản hồi và hỗ trợ các phát sinh sau khi đoàn kết thúc hành trình.' },
  ],

  faqs: [
    { id: 'faq-1', slug: 'mice-la-gi', title: 'MICE là gì?', question: 'MICE là gì?', answer: 'MICE là viết tắt của Meetings, Incentives, Conferences/Conventions và Exhibitions/Events — mô hình kết hợp hoạt động doanh nghiệp với du lịch, lưu trú, hội họp, sự kiện, khen thưởng và trải nghiệm tập thể.', order: 1, isActive: true, locale: 'vi', createdAt: NOW, updatedAt: NOW },
    { id: 'faq-2', slug: 'mice-khac-tour-doanh-nghiep', title: 'MICE khác tour doanh nghiệp thông thường như thế nào?', question: 'MICE khác tour doanh nghiệp thông thường như thế nào?', answer: 'Tour doanh nghiệp thường chỉ gồm di chuyển và lưu trú. MICE tích hợp thêm mục tiêu công việc cụ thể — hội họp, đào tạo, khen thưởng hoặc sự kiện thương hiệu — nên đòi hỏi thiết kế chương trình và hậu cần chuyên sâu hơn.', order: 2, isActive: true, locale: 'vi', createdAt: NOW, updatedAt: NOW },
    { id: 'faq-3', slug: 'can-cung-cap-thong-tin-gi', title: 'Doanh nghiệp cần cung cấp những thông tin gì?', question: 'Doanh nghiệp cần cung cấp những thông tin gì?', answer: 'Mục tiêu chương trình, số lượng khách dự kiến, thời gian, ngân sách tham khảo và địa điểm mong muốn (nếu có). Càng nhiều thông tin, đề xuất đầu tiên càng sát với nhu cầu thực tế.', order: 3, isActive: true, locale: 'vi', createdAt: NOW, updatedAt: NOW },
    { id: 'faq-4', slug: 'ho-tro-ngan-sach', title: 'Minh Việt có hỗ trợ xây dựng ngân sách không?', question: 'Minh Việt có hỗ trợ xây dựng ngân sách không?', answer: 'Có. Đội ngũ tư vấn đề xuất phương án ở nhiều mức ngân sách khác nhau, giải thích rõ từng hạng mục để doanh nghiệp dễ dàng trình duyệt nội bộ.', order: 4, isActive: true, locale: 'vi', createdAt: NOW, updatedAt: NOW },
    { id: 'faq-5', slug: 'quy-mo-to-chuc', title: 'Có thể tổ chức chương trình bao nhiêu người?', question: 'Có thể tổ chức chương trình bao nhiêu người?', answer: 'Từ nhóm vài chục người đến đoàn quy mô lớn cho hội nghị và sự kiện doanh nghiệp — quy mô cụ thể được xác nhận sau khi khảo sát địa điểm và mục tiêu chương trình.', order: 5, isActive: true, locale: 'vi', createdAt: NOW, updatedAt: NOW },
    { id: 'faq-6', slug: 'ket-hop-hoi-nghi-teambuilding-gala', title: 'Có thể kết hợp hội nghị, team building và gala không?', question: 'Có thể kết hợp hội nghị, team building và gala không?', answer: 'Có. Đây là mô hình phổ biến nhất — kết hợp nhiều cấu phần trong cùng một chương trình để tối ưu thời gian và ngân sách của đoàn.', order: 6, isActive: true, locale: 'vi', createdAt: NOW, updatedAt: NOW },
    { id: 'faq-7', slug: 'ho-tro-san-khau-am-thanh-media', title: 'Minh Việt có hỗ trợ sân khấu, âm thanh và media không?', question: 'Minh Việt có hỗ trợ sân khấu, âm thanh và media không?', answer: 'Có. Đây là các hạng mục Event Production và Media được tích hợp trực tiếp vào chương trình, không cần đặt tách lẻ với đơn vị khác.', order: 7, isActive: true, locale: 'vi', createdAt: NOW, updatedAt: NOW },
    { id: 'faq-8', slug: 'thoi-gian-chuan-bi', title: 'Thời gian chuẩn bị chương trình bao lâu?', question: 'Thời gian chuẩn bị chương trình bao lâu?', answer: 'Tùy quy mô và độ phức tạp, chương trình sơ bộ thường có trong vài ngày làm việc. Chương trình lớn hoặc yêu cầu đặc biệt cần thêm thời gian khảo sát và chuẩn bị.', order: 8, isActive: true, locale: 'vi', createdAt: NOW, updatedAt: NOW },
    { id: 'faq-9', slug: 'thay-doi-sau-bao-gia', title: 'Có thể thay đổi chương trình sau báo giá không?', question: 'Có thể thay đổi chương trình sau báo giá không?', answer: 'Có. Chương trình được điều chỉnh trong bước "Thiết kế chương trình và báo giá" cho đến khi doanh nghiệp xác nhận phương án cuối cùng.', order: 9, isActive: true, locale: 'vi', createdAt: NOW, updatedAt: NOW },
    { id: 'faq-10', slug: 'ho-tro-trong-va-sau-su-kien', title: 'Minh Việt hỗ trợ trong và sau sự kiện như thế nào?', question: 'Minh Việt hỗ trợ trong và sau sự kiện như thế nào?', answer: 'Đội ngũ điều phối có mặt tại hiện trường xuyên suốt chương trình, xử lý phát sinh trực tiếp, và gửi báo cáo nghiệm thu cùng hỗ trợ chăm sóc sau khi chương trình kết thúc.', order: 10, isActive: true, locale: 'vi', createdAt: NOW, updatedAt: NOW },
  ],

  finalCta: {
    headline: 'Mỗi chương trình bắt đầu từ một mục tiêu rõ ràng.',
    description: 'Chia sẻ mục tiêu, quy mô, thời gian và ngân sách dự kiến. Đội ngũ Minh Việt sẽ đề xuất concept và phương án tổ chức phù hợp.',
    primaryCta: { label: 'Gửi yêu cầu MICE', href: '#mice-form' },
    secondaryCta: { label: 'Liên hệ chuyên gia', href: 'tel:0934368132' },
  },
}
