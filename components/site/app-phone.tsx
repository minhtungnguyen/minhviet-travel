import { MapPin, CalendarDays, Users, Search } from 'lucide-react'
import { Logo } from '@/components/mv/logo'

/** Stylized phone mockup echoing the mobile app experience. */
export function AppPhone() {
  return (
    <div className="relative h-[420px] w-[210px] rounded-[2.2rem] border-[6px] border-navy bg-deep p-2.5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/10">
      {/* Notch */}
      <div className="absolute left-1/2 top-2 z-10 h-4 w-20 -translate-x-1/2 rounded-full bg-navy" />
      <div className="relative h-full w-full overflow-hidden rounded-[1.7rem] bg-gradient-to-b from-navy via-deep to-deep">
        {/* App header */}
        <div className="flex items-center justify-center pt-6 pb-3">
          <Logo height={22} onDark />
        </div>
        {/* Headline */}
        <div className="px-4 text-center">
          <p className="font-display text-sm font-bold text-white">Kiến tạo hành trình</p>
          <p className="font-script text-lg leading-tight text-gradient-sky">Kết nối giá trị</p>
        </div>
        {/* Mini search */}
        <div className="mx-3 mt-3 rounded-xl border border-white/10 bg-white/5 p-2">
          <div className="mb-1.5 flex gap-1 text-[8px] font-semibold">
            <span className="rounded bg-sky/20 px-1.5 py-0.5 text-sky">TOUR</span>
            <span className="px-1.5 py-0.5 text-white/50">MICE</span>
            <span className="px-1.5 py-0.5 text-white/50">DỊCH VỤ</span>
          </div>
          {[
            { icon: MapPin, t: 'Bạn muốn đi đâu?' },
            { icon: CalendarDays, t: 'Ngày đi - Ngày về' },
            { icon: Users, t: 'Số lượng khách' },
          ].map((f, i) => {
            const Icon = f.icon
            return (
              <div
                key={i}
                className="mb-1.5 flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1.5"
              >
                <Icon className="size-3 text-sky" />
                <span className="text-[9px] text-white/60">{f.t}</span>
              </div>
            )
          })}
          <div className="mt-1 flex items-center justify-center gap-1 rounded-md bg-gradient-to-b from-accent to-royal py-1.5 text-[9px] font-bold text-white">
            <Search className="size-3" />
            Tìm kiếm
          </div>
        </div>
        {/* Mini stats */}
        <div className="mx-3 mt-3 grid grid-cols-3 gap-1.5">
          {[
            { v: '15+', l: 'Năm KN' },
            { v: '200K+', l: 'Khách hàng' },
            { v: '24/7', l: 'Hỗ trợ' },
          ].map((s) => (
            <div
              key={s.l}
              className="rounded-lg border border-white/10 bg-white/5 py-2 text-center"
            >
              <p className="text-xs font-bold text-sky">{s.v}</p>
              <p className="text-[7px] uppercase tracking-wide text-white/50">{s.l}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
