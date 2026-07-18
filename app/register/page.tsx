import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteChrome } from '@/components/site/site-chrome'
import { AuthPanel } from '@/components/site/auth-panel'
import { RegisterForm } from '@/components/site/register-form'

export const metadata: Metadata = {
  title: 'Đăng ký | Minh Việt Travel',
  description: 'Đăng ký cổng khách hàng doanh nghiệp Minh Việt Travel.',
}

export default function RegisterPage() {
  return (
    <SiteChrome>
      <AuthPanel
        title="Đăng ký"
        subtitle="Tạo tài khoản để quản lý hành trình và yêu cầu tư vấn doanh nghiệp."
        footer={
          <>
            Đã có tài khoản?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Đăng nhập
            </Link>
          </>
        }
      >
        <RegisterForm />
      </AuthPanel>
    </SiteChrome>
  )
}
