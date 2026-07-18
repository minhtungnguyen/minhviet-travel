import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteChrome } from '@/components/site/site-chrome'
import { AuthPanel } from '@/components/site/auth-panel'
import { LoginForm } from '@/components/site/login-form'

export const metadata: Metadata = {
  title: 'Đăng nhập | Minh Việt Travel',
  description: 'Đăng nhập cổng khách hàng doanh nghiệp Minh Việt Travel.',
}

export default function LoginPage() {
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
        <LoginForm />
      </AuthPanel>
    </SiteChrome>
  )
}
