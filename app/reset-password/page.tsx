import type { Metadata } from 'next'
import { SiteChrome } from '@/components/site/site-chrome'
import { AuthPanel } from '@/components/site/auth-panel'
import { ResetPasswordForm } from '@/components/site/reset-password-form'

export const metadata: Metadata = {
  title: 'Đặt lại mật khẩu | Minh Việt Travel',
  description: 'Đặt mật khẩu mới cho tài khoản Minh Việt Travel.',
}

export default function ResetPasswordPage() {
  return (
    <SiteChrome>
      <AuthPanel title="Đặt lại mật khẩu" subtitle="Nhập mật khẩu mới cho tài khoản của bạn." footer={null}>
        <ResetPasswordForm />
      </AuthPanel>
    </SiteChrome>
  )
}
