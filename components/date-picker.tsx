'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function formatDateLabel(iso?: string) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface DatePickerProps {
  value?: string
  onChange: (iso: string) => void
  placeholder?: string
  className?: string
  buttonClassName?: string
  /** align popover to the right edge */
  align?: 'left' | 'right'
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Add dates',
  className,
  buttonClassName,
  align = 'left',
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(() => {
    const base = value ? new Date(value) : new Date()
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const year = view.getFullYear()
  const month = view.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          'flex w-full items-center gap-2 text-left text-sm outline-none',
          buttonClassName,
        )}
      >
        <Calendar className="size-4 shrink-0 text-muted-foreground" />
        <span className={cn(value ? 'text-foreground' : 'text-muted-foreground')}>
          {value ? formatDateLabel(value) : placeholder}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Choose a date"
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute top-[calc(100%+0.75rem)] z-50 w-[280px] rounded-xl border border-border bg-popover p-3 shadow-xl',
              align === 'right' ? 'right-0' : 'left-0',
            )}
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => setView(new Date(year, month - 1, 1))}
                className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-muted"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="font-display text-sm font-semibold">
                {MONTHS[month]} {year}
              </span>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => setView(new Date(year, month + 1, 1))}
                className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-muted"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
            <div className="mb-1 grid grid-cols-7 text-center text-[0.7rem] font-medium text-muted-foreground">
              {WEEKDAYS.map((d, i) => (
                <span key={i} className="py-1">{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {cells.map((day, i) => {
                if (day === null) return <span key={i} />
                const cellDate = new Date(year, month, day)
                const iso = toISO(cellDate)
                const isPast = cellDate < today
                const isSelected = value === iso
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={isPast}
                    onClick={() => {
                      onChange(iso)
                      setOpen(false)
                    }}
                    className={cn(
                      'grid size-9 place-items-center rounded-md text-sm transition-colors',
                      isPast && 'cursor-not-allowed text-muted-foreground/40',
                      !isPast && !isSelected && 'hover:bg-muted',
                      isSelected && 'bg-ocean text-white',
                    )}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
