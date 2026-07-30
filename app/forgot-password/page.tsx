import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteChrome } from '@/components/site/site-chrome'
import { AuthPanel } from '@/components/site/auth-panel'
import { ForgotPasswordForm } from '@/components/site/forgot-password-form'

export const metadata: Metadata = {
  title: 'Quên mật khẩu | Minh Việt Travel',
  description: 'Đặt lại mật khẩu cổng khách hàng doanh nghiệp Minh Việt Travel.',
}

export default function ForgotPasswordPage() {
  return (
    <SiteChrome>
      <AuthPanel
        title="Quên mật khẩu"
        subtitle="Nhập email đã đăng ký, chúng tôi sẽ gửi đường dẫn đặt lại mật khẩu."
        footer={
          <>
            Đã nhớ mật khẩu?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Quay lại đăng nhập
            </Link>
          </>
        }
      >
        <ForgotPasswordForm />
      </AuthPanel>
    </SiteChrome>
  )
}
