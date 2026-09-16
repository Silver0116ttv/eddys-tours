import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getViewer } from '@/lib/auth/viewer'
import { liveWorkspace } from '@/lib/data/admin-workspace'
import { AdminWorkspace } from '@/components/admin/workspace'
import { adminSections, type AdminSection } from '@/lib/admin-workspace'
export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Administración | Eddy’s Tours',
  robots: { index: false, follow: false },
}
export default async function Page({
  params,
}: {
  params: Promise<{ section?: string[] }>
}) {
  const viewer = await getViewer()
  if (!viewer) redirect('/admin/login')
  if (viewer.role !== 'admin')
    return (
      <main
        id="main"
        className="flex min-h-svh items-center justify-center p-6"
      >
        <div className="surface max-w-lg">
          <h1 className="text-3xl font-bold">Esta cuenta no tiene acceso</h1>
          <p className="mt-4 leading-7 text-muted-foreground">
            Tu sesión está activa, pero necesitas permisos de administrador para
            entrar a este espacio. Contacta al responsable de tu equipo.
          </p>
          <Link href="/admin/login" className="action-primary mt-6">
            Usar otra cuenta
          </Link>
          <Link href="/" className="action-secondary mt-3 ml-3">
            Volver al sitio
          </Link>
        </div>
      </main>
    )
  const { section } = await params
  const selected = section?.[0] ?? 'overview'
  if (
    (section?.length ?? 0) > 1 ||
    !adminSections.some((s) => s.id === selected)
  )
    notFound()
  return (
    <AdminWorkspace
      key={selected}
      section={selected as AdminSection}
      initialData={await liveWorkspace()}
      name={viewer.fullName ?? 'Administrador'}
    />
  )
}
