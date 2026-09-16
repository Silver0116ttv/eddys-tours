import { notFound } from 'next/navigation'
import { AdminWorkspace } from '@/components/admin/workspace'
import { demoWorkspace } from '@/lib/data/admin-workspace'
import { adminSections, type AdminSection } from '@/lib/admin-workspace'
export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Demo del panel | Eddy’s Tours',
  robots: { index: false, follow: false },
}
export default async function Page({
  params,
}: {
  params: Promise<{ section?: string[] }>
}) {
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
      initialData={demoWorkspace()}
      name="Equipo Eddy’s"
      demo
    />
  )
}
