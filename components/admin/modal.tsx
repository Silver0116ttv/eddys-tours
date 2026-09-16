'use client'
import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
export function AdminModal({
  title,
  children,
  onClose,
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    dialog?.showModal()
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      dialog?.close()
      document.body.style.overflow = previous
    }
  }, [])
  return (
    <dialog
      ref={ref}
      aria-labelledby="admin-dialog-title"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="admin-dialog"
    >
      <div className="flex items-center justify-between gap-4 border-b px-6 py-5">
        <h2 id="admin-dialog-title" className="text-xl font-bold">
          {title}
        </h2>
        <button
          type="button"
          aria-label="Cerrar ventana"
          onClick={onClose}
          className="rounded-full p-2 hover:bg-muted"
        >
          <X className="size-5" />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </dialog>
  )
}
