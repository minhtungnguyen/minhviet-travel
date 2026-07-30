import { redirect } from 'next/navigation'
import { getCurrentApplicationUser } from '@/shared/auth/session'
import { AdminShell } from '@/components/admin/admin-shell'
import { visibleNavItems } from '@/lib/admin/nav-config'

/**
 * `proxy.ts` already redirects an unauthenticated request away from
 * `/admin/**` before this ever renders — this layout's own
 * `getCurrentApplicationUser()` call is the second, independent check
 * (an account that got disabled *after* the session cookie was issued,
 * or a session whose cookie is present but the app profile is missing,
 * both throw here even though `proxy.ts`'s plain "is there a user" check
 * would have let it through).
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let actor: Awaited<ReturnType<typeof getCurrentApplicationUser>>['actor']
  let profile: Awaited<ReturnType<typeof getCurrentApplicationUser>>['profile']
  try {
    const result = await getCurrentApplicationUser()
    actor = result.actor
    profile = result.profile
  } catch {
    redirect('/login?next=/admin&expired=1')
  }

  const navItems = visibleNavItems(actor.permissions)

  return (
    <AdminShell navItems={navItems} displayName={profile.display_name} roles={actor.roles}>
      {children}
    </AdminShell>
  )
}
