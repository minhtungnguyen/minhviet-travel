import type { BenefitLimitValue, BenefitRow } from '@/types/insurance'

/**
 * Benefit table transcribed verbatim from
 * docs/insurance/Tờ rơi du lịch quốc tế DBV.pdf (pages 3–4), "BẢNG
 * QUYỀN LỢI BẢO HIỂM USD/VND". `code` matches the source's own "TT/NO"
 * numbering so this file can be diffed against the PDF directly; a few
 * sub-rows the PDF nests without its own number (e.g. the hotel daily
 * limit under row 3, the per-6-hour payout under row 13) get a synthetic
 * `code` (`3.2-daily`, `13-daily`, ...) so nothing real gets silently
 * dropped.
 *
 * TODO: Replace with CMS Provider — this file is the seam a real
 * DBV benefit-feed integration (or CMS-managed benefit table) replaces;
 * nothing outside `lib/insurance/insurance-repository.ts` should ever
 * import it directly.
 */

function amount(usd: number, vnd: number): BenefitLimitValue {
  return { kind: 'amount', value: { usd, vnd } }
}

const INCLUDED: BenefitLimitValue = { kind: 'included' }
const NOT_APPLICABLE: BenefitLimitValue = { kind: 'not_applicable' }

const MEDICAL = 'Chi phí y tế & điều trị'
const HOSPITAL_AND_REPATRIATION = 'Hỗ trợ thân nhân & hồi hương'
const TRIP_DISRUPTION = 'Hủy/hoãn/gián đoạn chuyến đi'
const BAGGAGE_AND_PROPERTY = 'Hành lý & tài sản'
const OTHER_BENEFITS = 'Golf & dịch vụ khác'
const ASSISTANCE_247 = 'Trợ giúp 24/7'

export const insuranceBenefitTableSeed: BenefitRow[] = [
  {
    code: '1',
    category: MEDICAL,
    label: 'Chi phí y tế ở nước ngoài',
    limits: { A: amount(50_000, 1_000_000_000), B: amount(70_000, 1_500_000_000), C: amount(100_000, 2_000_000_000) },
  },
  {
    code: '1.1',
    parentCode: '1',
    category: MEDICAL,
    label: 'Chi phí điều trị nội trú',
    limits: { A: amount(50_000, 1_000_000_000), B: amount(70_000, 1_500_000_000), C: amount(100_000, 2_000_000_000) },
  },
  {
    code: '1.2',
    parentCode: '1',
    category: MEDICAL,
    label: 'Chi phí điều trị ngoại trú',
    limits: { A: amount(2_500, 50_000_000), B: amount(3_500, 75_000_000), C: amount(5_000, 100_000_000) },
  },
  {
    code: '1.3',
    parentCode: '1',
    category: MEDICAL,
    label: 'Chi phí liên quan đến thai sản',
    limits: { A: amount(5_000, 100_000_000), B: amount(7_000, 150_000_000), C: amount(10_000, 200_000_000) },
  },
  {
    code: '1.4',
    parentCode: '1',
    category: MEDICAL,
    label: 'Chi phí y tế điều trị Covid-19',
    limits: { A: amount(25_000, 500_000_000), B: amount(35_000, 750_000_000), C: amount(50_000, 1_000_000_000) },
  },
  {
    code: '2',
    category: MEDICAL,
    label: 'Chi phí điều trị tiếp theo',
    limits: { A: amount(8_000, 160_000_000), B: amount(10_000, 200_000_000), C: amount(12_000, 240_000_000) },
  },
  {
    code: '3',
    category: HOSPITAL_AND_REPATRIATION,
    label: 'Chi phí cho thân nhân đi thăm',
    limits: { A: amount(3_500, 70_000_000), B: amount(5_000, 100_000_000), C: amount(7_000, 140_000_000) },
  },
  {
    code: '3.1',
    parentCode: '3',
    category: HOSPITAL_AND_REPATRIATION,
    label: 'Chi phí thăm bệnh ở nước ngoài',
    limits: { A: amount(3_500, 70_000_000), B: amount(5_000, 100_000_000), C: amount(7_000, 140_000_000) },
  },
  {
    code: '3.2',
    parentCode: '3',
    category: HOSPITAL_AND_REPATRIATION,
    label: 'Chi phí ăn ở bổ sung',
    limits: { A: amount(3_500, 70_000_000), B: amount(5_000, 100_000_000), C: amount(7_000, 140_000_000) },
  },
  {
    code: '3.2-daily',
    parentCode: '3.2',
    category: HOSPITAL_AND_REPATRIATION,
    label: 'Giới hạn mỗi ngày (24 giờ) ở khách sạn',
    limits: { A: amount(175, 3_500_000), B: amount(250, 5_000_000), C: amount(350, 7_000_000) },
  },
  {
    code: '3.3',
    parentCode: '3',
    category: HOSPITAL_AND_REPATRIATION,
    label: 'Chi phí thăm viếng thu xếp tang lễ ở nước ngoài',
    limits: { A: INCLUDED, B: INCLUDED, C: INCLUDED },
  },
  {
    code: '4',
    category: HOSPITAL_AND_REPATRIATION,
    label: 'Đưa trẻ em hồi hương',
    limits: { A: amount(3_500, 70_000_000), B: amount(5_000, 100_000_000), C: amount(7_000, 140_000_000) },
  },
  {
    code: '5',
    category: HOSPITAL_AND_REPATRIATION,
    label: 'Tử vong hoặc thương tật vĩnh viễn do tai nạn',
    limits: { A: amount(50_000, 1_000_000_000), B: amount(70_000, 1_500_000_000), C: amount(100_000, 2_000_000_000) },
  },
  {
    code: '6',
    category: HOSPITAL_AND_REPATRIATION,
    label: 'Vận chuyển y tế khẩn cấp',
    limits: { A: amount(50_000, 1_000_000_000), B: amount(70_000, 1_500_000_000), C: amount(100_000, 2_000_000_000) },
  },
  {
    code: '7',
    category: HOSPITAL_AND_REPATRIATION,
    label: 'Hồi hương',
    limits: { A: amount(50_000, 1_000_000_000), B: amount(70_000, 1_500_000_000), C: amount(100_000, 2_000_000_000) },
  },
  {
    code: '8',
    category: HOSPITAL_AND_REPATRIATION,
    label: 'Vận chuyển hài cốt/mai táng',
    limits: { A: amount(10_000, 200_000_000), B: amount(15_000, 300_000_000), C: amount(20_000, 400_000_000) },
  },
  {
    code: '9',
    category: HOSPITAL_AND_REPATRIATION,
    label: 'Trách nhiệm cá nhân',
    limits: { A: amount(50_000, 1_000_000_000), B: amount(70_000, 1_500_000_000), C: amount(100_000, 2_000_000_000) },
  },
  {
    code: '10',
    category: TRIP_DISRUPTION,
    label: 'Hủy/hoãn chuyến đi hay mất tiền đặt cọc',
    limits: { A: amount(4_500, 90_000_000), B: amount(6_000, 120_000_000), C: amount(9_000, 180_000_000) },
  },
  {
    code: '11',
    category: TRIP_DISRUPTION,
    label: 'Cắt ngắn chuyến đi',
    limits: { A: amount(4_500, 90_000_000), B: amount(6_000, 120_000_000), C: amount(9_000, 180_000_000) },
  },
  {
    code: '12',
    category: TRIP_DISRUPTION,
    label: 'Gián đoạn chuyến đi',
    limits: { A: amount(1_500, 30_000_000), B: amount(2_000, 40_000_000), C: amount(3_000, 60_000_000) },
  },
  {
    code: '13',
    category: TRIP_DISRUPTION,
    label: 'Chuyến đi bị trì hoãn',
    limits: { A: amount(400, 8_000_000), B: amount(550, 11_000_000), C: amount(800, 16_000_000) },
  },
  {
    code: '13-daily',
    parentCode: '13',
    category: TRIP_DISRUPTION,
    label: 'Thanh toán cho mỗi 6 giờ liên tục phương tiện vận chuyển công cộng ở nước ngoài khởi hành chậm',
    limits: { A: amount(80, 1_600_000), B: amount(100, 2_000_000), C: amount(120, 2_400_000) },
  },
  {
    code: '14',
    category: TRIP_DISRUPTION,
    label: 'Lỡ nối chuyến',
    limits: { A: amount(200, 4_000_000), B: amount(200, 4_000_000), C: amount(200, 4_000_000) },
  },
  {
    code: '14-daily',
    parentCode: '14',
    category: TRIP_DISRUPTION,
    label: 'Thanh toán cho mỗi 6 giờ liên tục lỡ nối chuyến bay ở nước ngoài',
    limits: { A: amount(100, 2_000_000), B: amount(100, 2_000_000), C: amount(100, 2_000_000) },
  },
  {
    code: '15',
    category: BAGGAGE_AND_PROPERTY,
    label: 'Hành lý đến chậm',
    limits: { A: amount(400, 8_000_000), B: amount(550, 11_000_000), C: amount(800, 16_000_000) },
  },
  {
    code: '15.1',
    parentCode: '15',
    category: BAGGAGE_AND_PROPERTY,
    label: 'Thanh toán chi phí mua các vật dụng thiết yếu khi hành lý đến chậm',
    limits: { A: amount(400, 8_000_000), B: amount(550, 11_000_000), C: amount(800, 16_000_000) },
  },
  {
    code: '15.2',
    parentCode: '15',
    category: BAGGAGE_AND_PROPERTY,
    label: 'Thanh toán cho mỗi 8 giờ liên tục hành lý đến chậm khi ở nước ngoài',
    limits: { A: amount(80, 1_600_000), B: amount(100, 2_000_000), C: amount(120, 2_400_000) },
  },
  {
    code: '16',
    category: BAGGAGE_AND_PROPERTY,
    label: 'Mất tiền cá nhân',
    limits: { A: amount(80, 1_600_000), B: amount(160, 3_200_000), C: amount(240, 4_800_000) },
  },
  {
    code: '17',
    category: BAGGAGE_AND_PROPERTY,
    label: 'Mất giấy tờ thông hành',
    limits: { A: amount(1_500, 30_000_000), B: amount(2_000, 40_000_000), C: amount(3_000, 60_000_000) },
  },
  {
    code: '17-daily',
    parentCode: '17',
    category: BAGGAGE_AND_PROPERTY,
    label: 'Giới hạn chi phí đi lại và ăn ở mỗi ngày',
    limits: { A: amount(150, 3_000_000), B: amount(200, 4_000_000), C: amount(300, 6_000_000) },
  },
  {
    code: '18',
    category: BAGGAGE_AND_PROPERTY,
    label: 'Thiệt hại hành lý và tư trang',
    limits: { A: amount(1_000, 20_000_000), B: amount(1_500, 30_000_000), C: amount(2_500, 50_000_000) },
  },
  {
    code: '18.1',
    parentCode: '18',
    category: BAGGAGE_AND_PROPERTY,
    label: 'Giới hạn mỗi vật dụng',
    limits: { A: amount(250, 5_000_000), B: amount(250, 5_000_000), C: amount(250, 5_000_000) },
  },
  {
    code: '18.1-pair',
    parentCode: '18.1',
    category: BAGGAGE_AND_PROPERTY,
    label: 'Giới hạn mỗi cặp/bộ',
    limits: { A: amount(500, 10_000_000), B: amount(500, 10_000_000), C: amount(500, 10_000_000) },
  },
  {
    code: '18.1-laptop',
    parentCode: '18.1',
    category: BAGGAGE_AND_PROPERTY,
    label: 'Giới hạn cho máy tính xách tay',
    limits: { A: amount(1_000, 20_000_000), B: amount(1_000, 20_000_000), C: amount(1_000, 20_000_000) },
  },
  {
    code: '18.1-golf',
    parentCode: '18.1',
    category: BAGGAGE_AND_PROPERTY,
    label: 'Giới hạn cho thiết bị đánh gôn (bao gồm gậy và túi đựng dụng cụ)',
    limits: { A: NOT_APPLICABLE, B: amount(1_000, 20_000_000), C: amount(1_000, 20_000_000) },
  },
  {
    code: '18.2',
    parentCode: '18',
    category: BAGGAGE_AND_PROPERTY,
    label: 'Mua hàng khẩn cấp do hành lý bị mất cắp hoặc thất lạc vĩnh viễn',
    limits: { A: amount(80, 1_600_000), B: amount(160, 3_200_000), C: amount(240, 4_800_000) },
  },
  {
    code: '19',
    category: BAGGAGE_AND_PROPERTY,
    label: 'Phương tiện đi thuê',
    limits: { A: amount(400, 8_000_000), B: amount(550, 11_000_000), C: amount(800, 16_000_000) },
  },
  {
    code: '20',
    category: BAGGAGE_AND_PROPERTY,
    label: 'Bảo vệ tư gia',
    limits: { A: amount(1_000, 20_000_000), B: amount(1_500, 30_000_000), C: amount(2_500, 50_000_000) },
  },
  {
    code: '21',
    category: OTHER_BENEFITS,
    label: 'Ưu đãi dành cho khách chơi gôn',
    limits: { A: NOT_APPLICABLE, B: amount(450, 9_000_000), C: amount(900, 18_000_000) },
  },
  {
    code: '21.1',
    parentCode: '21',
    category: OTHER_BENEFITS,
    label: 'Cú đánh "Hole in One"',
    limits: { A: NOT_APPLICABLE, B: amount(100, 2_000_000), C: amount(200, 4_000_000) },
  },
  {
    code: '21.2',
    parentCode: '21',
    category: OTHER_BENEFITS,
    label: 'Phí thuê sân gôn',
    limits: { A: NOT_APPLICABLE, B: amount(350, 7_000_000), C: amount(700, 14_000_000) },
  },
  {
    code: '22',
    category: OTHER_BENEFITS,
    label: 'Dịch vụ khách sạn bị gián đoạn hay hủy bỏ',
    limits: { A: amount(150, 3_000_000), B: amount(150, 3_000_000), C: amount(150, 3_000_000) },
  },
  {
    code: '22-daily',
    parentCode: '22',
    category: OTHER_BENEFITS,
    label: 'Thanh toán cho mỗi 24 giờ liên tục dịch vụ khách sạn bị gián đoạn/hủy bỏ vì đình công hoặc bạo động',
    limits: { A: amount(80, 1_600_000), B: amount(80, 1_600_000), C: amount(80, 1_600_000) },
  },
  {
    code: '23',
    category: OTHER_BENEFITS,
    label: 'Bảo hiểm trong trường hợp bị không tặc',
    limits: { A: amount(400, 8_000_000), B: amount(550, 11_000_000), C: amount(800, 16_000_000) },
  },
  {
    code: '23-daily',
    parentCode: '23',
    category: OTHER_BENEFITS,
    label: 'Thanh toán cho mỗi 12 giờ liên tục máy bay bị không tặc khống chế',
    limits: { A: amount(80, 1_600_000), B: amount(80, 1_600_000), C: amount(80, 1_600_000) },
  },
  {
    code: '24',
    category: ASSISTANCE_247,
    label: 'Trợ giúp y tế',
    limits: { A: INCLUDED, B: INCLUDED, C: INCLUDED },
  },
  {
    code: '25',
    category: ASSISTANCE_247,
    label: 'Trợ giúp chuyến đi 24h',
    limits: { A: INCLUDED, B: INCLUDED, C: INCLUDED },
  },
  {
    code: '26',
    category: ASSISTANCE_247,
    label: 'Dịch vụ cứu trợ toàn cầu',
    limits: { A: INCLUDED, B: INCLUDED, C: INCLUDED },
  },
]
