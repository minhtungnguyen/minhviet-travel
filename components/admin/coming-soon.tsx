import { Construction } from 'lucide-react'

export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">{title}</h1>
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card py-20 text-center">
        <Construction className="size-10 text-muted-foreground" />
        <h2 className="font-display text-lg font-semibold text-foreground">Sắp triển khai</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Module này chưa được xây dựng trong sprint hiện tại — chưa có dữ liệu thật để hiển thị.
        </p>
      </div>
    </div>
  )
}
