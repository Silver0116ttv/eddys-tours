'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TourDetail } from '@/components/tour-detail'
import { ADMIN_DEMO_STORAGE_KEY, type AdminRecord } from '@/lib/admin-workspace'
export function TourPreview({
  id,
  records,
}: {
  id: string
  records: AdminRecord[]
}) {
  const [record, setRecord] = useState(records.find((r) => r.id === id))
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const value = JSON.parse(
          localStorage.getItem(ADMIN_DEMO_STORAGE_KEY) ?? '{}',
        )
        const saved = value.tours?.find((r: AdminRecord) => r.id === id)
        if (saved?.tour) setRecord(saved)
      } catch {
        /* The initial sample remains visible. */
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [id])
  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 flex flex-wrap items-center justify-between gap-2 bg-[#173d47] px-6 py-4 text-sm text-white">
        <span>Vista previa del tour · Demostración</span>
        <Link href="/admin/demo/tours" className="font-semibold underline">
          Volver al catálogo
        </Link>
      </div>
      <main id="main">
        {record?.tour ? (
          <TourDetail tour={record.tour} related={[]} preview />
        ) : (
          <div className="travel-container py-36">
            <h1 className="text-3xl font-bold">
              Guarda el tour para ver su vista previa
            </h1>
            <p className="mt-4 text-muted-foreground">
              Abre el editor, completa los datos y guarda los cambios.
            </p>
            <Link className="action-primary mt-6" href="/admin/demo/tours">
              Volver al catálogo
            </Link>
          </div>
        )}
      </main>
    </>
  )
}
