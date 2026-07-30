import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteChrome } from '@/components/site/site-chrome'
import { AuthPanel } from '@/components/site/auth-panel'
import { LoginForm } from '@/components/site/login-form'

export const metadata: Metadata = {
  title: 'Đăng nhập | Minh Việt Travel',
  description: 'Đăng nhập cổng khách hàng doanh nghiệp Minh Việt Travel.',
}

const BANNERS = {
  expired: { type: 'error' as const, message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.' },
  link_expired: { type: 'error' as const, message: 'Đường dẫn đã hết hạn hoặc đã được sử dụng. Vui lòng yêu cầu lại.' },
  reset_success: { type: 'success' as const, message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập.' },
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; expired?: string; error?: string; reset?: string }>
}) {
  const params = await searchParams
  const banner = params.expired
    ? BANNERS.expired
    : params.error === 'link_expired'
      ? BANNERS.link_expired
      : params.reset === 'success'
        ? BANNERS.reset_success
        : undefined

  return (
    <SiteChrome>
      <AuthPanel
        title="Đăng nhập"
        subtitle="Truy cập cổng khách hàng doanh nghiệp Minh Việt Travel."
        footer={
          <>
            Chưa có tài khoản?{' '}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Đăng ký ngay
            </Link>
          </>
        }
      >
        <LoginForm next={params.next} banner={banner} />
      </AuthPanel>
    </SiteChrome>
  )
}
