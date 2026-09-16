'use client'
import { useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Images, X } from 'lucide-react'
import { useI18n } from '@/components/use-i18n'

export function TourGallery({
  images,
  title,
}: {
  images: string[]
  title: string
}) {
  const { language } = useI18n()
  const es = language === 'ES'
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const [index, setIndex] = useState(0)
  if (!images.length) return null
  function close() {
    dialog.current?.close()
    trigger.current?.focus()
  }
  return (
    <>
      <button
        ref={trigger}
        className="action-secondary"
        onClick={() => dialog.current?.showModal()}
      >
        <Images className="size-4" />
        {es ? 'Ver fotografías' : 'View photos'}
        <span className="text-xs text-muted-foreground">({images.length})</span>
      </button>
      <dialog
        ref={dialog}
        aria-label={es ? `Fotografías de ${title}` : `Photos of ${title}`}
        onCancel={close}
        onClick={(e) => {
          if (e.target === e.currentTarget) close()
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') setIndex((index + 1) % images.length)
          if (e.key === 'ArrowLeft')
            setIndex((index - 1 + images.length) % images.length)
        }}
        className="m-auto w-[min(1000px,calc(100vw-32px))] overflow-hidden rounded-2xl bg-white p-4 backdrop:bg-black/75"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold">{title}</h2>
          <button
            aria-label={es ? 'Cerrar galería' : 'Close gallery'}
            className="rounded-full p-2 hover:bg-muted"
            onClick={close}
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="relative h-[min(65svh,650px)]">
          <Image
            src={images[index]!}
            alt={`${title} — ${index + 1}`}
            fill
            sizes="(max-width: 1000px) 90vw, 1000px"
            className="object-contain"
          />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <button
            className="action-secondary"
            disabled={images.length < 2}
            aria-label={es ? 'Foto anterior' : 'Previous photo'}
            onClick={() =>
              setIndex((index - 1 + images.length) % images.length)
            }
          >
            <ChevronLeft className="size-4" />
          </button>
          <p role="status" className="text-sm text-muted-foreground">
            {index + 1} / {images.length}
          </p>
          <button
            className="action-secondary"
            disabled={images.length < 2}
            aria-label={es ? 'Siguiente foto' : 'Next photo'}
            onClick={() => setIndex((index + 1) % images.length)}
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </dialog>
    </>
  )
}
