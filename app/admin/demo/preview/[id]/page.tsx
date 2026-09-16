import { TourPreview } from '@/components/admin/tour-preview'
import { demoWorkspace } from '@/lib/data/admin-workspace'
export const metadata = {
  title: 'Vista previa de tour | Eddy’s Tours',
  robots: { index: false },
}
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return <TourPreview id={(await params).id} records={demoWorkspace().tours} />
}
