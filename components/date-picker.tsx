'use client'

import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/components/use-i18n'

/** Distance between the trigger and the calendar, matching the old `calc(100% + 0.75rem)`. */
const POPOVER_GAP_PX = 12

function toISO(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/**
 * Parses `YYYY-MM-DD` in the *local* calendar. `new Date('2026-08-18')` would
 * be read as UTC midnight, which lands on the previous day — and sometimes the
 * previous month — for every visitor west of Greenwich.
 */
function parseISODate(iso: string): Date | null {
  const [year, month, day] = iso.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

export function formatDateLabel(iso?: string, locale = 'en-US') {
  const date = iso ? parseISODate(iso) : null
  if (!date) return ''
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' })
}

interface DatePickerProps {
  value?: string
  onChange: (iso: string) => void
  placeholder?: string
  className?: string
  buttonClassName?: string
  /** id of the element that names this control, for screen readers */
  labelledBy?: string
  /** align popover to the right edge */
  align?: 'left' | 'right'
}

interface PopoverCoords {
  placement: 'top' | 'bottom'
  top: number
  left?: number
  right?: number
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Add dates',
  className,
  buttonClassName,
  labelledBy,
  align = 'left',
}: DatePickerProps) {
  const { locale, t } = useI18n()
  const triggerId = useId()
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState<PopoverCoords | null>(null)
  const [view, setView] = useState(() => {
    const base = (value ? parseISODate(value) : null) ?? new Date()
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })
  const ref = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  /*
   * Rendered through a portal into `document.body` instead of positioned
   * relative to the trigger. The search bar this lives in has a
   * `backdrop-blur`, and `backdrop-filter` creates a new stacking context —
   * so the calendar's z-index only won comparisons *inside* that form, and
   * later page content (the tours strip) painted over it regardless of
   * z-index. Escaping to `document.body` puts the calendar back in the root
   * stacking context, where its z-index is compared against the whole page.
   *
   * `mounted` delays the portal to after hydration so the server and the
   * first client render produce identical markup (no `document` on the
   * server). `useSyncExternalStore` with a snapshot that only flips after
   * mount is the React-endorsed way to read "are we on the client yet?" —
   * unlike a `setState` in a `useEffect`, it doesn't force an extra render pass.
   */
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  /**
   * The picker often sits low on the screen — in the hero it is the last
   * thing above the fold — so open upward whenever the calendar would not
   * fit below. Coordinates are viewport-relative, matching `position: fixed`.
   */
  const updatePlacement = useCallback(() => {
    const trigger = triggerRef.current
    const panel = panelRef.current
    if (!trigger || !panel) return

    const rect = trigger.getBoundingClientRect()
    const required = panel.offsetHeight + POPOVER_GAP_PX
    const fitsBelow = window.innerHeight - rect.bottom >= required
    const fitsAbove = rect.top >= required
    // Flip up only when the calendar genuinely fits there. If it fits
    // nowhere, stay below: overflowing the bottom can be scrolled to,
    // overflowing the top of the page cannot.
    const placement = !fitsBelow && fitsAbove ? 'top' : 'bottom'

    setCoords({
      placement,
      top: placement === 'top' ? rect.top - required : rect.bottom + POPOVER_GAP_PX,
      ...(align === 'right' ? { right: window.innerWidth - rect.right } : { left: rect.left }),
    })
  }, [align])

  const toggle = useCallback(() => {
    if (!open) updatePlacement()
    setOpen((isOpen) => !isOpen)
  }, [open, updatePlacement])

  useEffect(() => {
    if (!open) return

    function onDoc(e: MouseEvent) {
      const target = e.target as Node
      // The panel now lives outside `ref` (it's portaled to <body>), so a
      // click inside it must be checked separately, or every day/month click
      // would register as "outside" and close the picker before its own
      // handler runs.
      const insideTrigger = ref.current?.contains(target)
      const insidePanel = panelRef.current?.contains(target)
      if (!insideTrigger && !insidePanel) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', updatePlacement)
    window.addEventListener('scroll', updatePlacement, true)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', updatePlacement)
      window.removeEventListener('scroll', updatePlacement, true)
    }
  }, [open, updatePlacement])

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

  const placement = coords?.placement ?? 'bottom'

  const panel = (
    <div
      ref={panelRef}
      role="dialog"
      aria-label={t('date.choose')}
      inert={!open}
      style={{ top: coords?.top ?? 0, left: coords?.left, right: coords?.right }}
      className={cn(
        'fixed z-70 w-[280px] rounded-xl border border-border bg-popover p-3 shadow-xl',
        'transition duration-150 motion-reduce:transition-none',
        placement === 'top' ? 'origin-bottom' : 'origin-top',
        open && 'translate-y-0 scale-100 opacity-100',
        !open && 'pointer-events-none scale-[0.98] opacity-0',
        !open && (placement === 'top' ? '-translate-y-1.5' : 'translate-y-1.5'),
        // Invisible until the first real measurement lands, so it never
        // flashes at the (0,0) fallback position before `updatePlacement` runs.
        !coords && 'invisible',
      )}
    >
      <div className="mb-2 flex items-center justify-between px-1">
        <button
          type="button"
          aria-label={t('date.previous')}
          onClick={() => setView(new Date(year, month - 1, 1))}
          className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-muted"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="font-display text-sm font-semibold">
          {new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(view)}
        </span>
        <button
          type="button"
          aria-label={t('date.next')}
          onClick={() => setView(new Date(year, month + 1, 1))}
          className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-muted"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
      <div className="mb-1 grid grid-cols-7 text-center text-[0.7rem] font-medium text-muted-foreground">
        {Array.from({ length: 7 }, (_, index) => {
          const weekday = new Intl.DateTimeFormat(locale, { weekday: 'narrow' }).format(
            new Date(2026, 7, 16 + index),
          )
          return (
            <span key={index} className="py-1">
              {weekday}
            </span>
          )
        })}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, index) => {
          if (day == null) return <span key={index} />

          const cellDate = new Date(year, month, day)
          const iso = toISO(cellDate)
          const isPast = cellDate < today
          const isSelected = value === iso

          return (
            <button
              key={index}
              type="button"
              disabled={isPast}
              onClick={() => {
                onChange(iso)
                setOpen(false)
              }}
              aria-pressed={isSelected}
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
    </div>
  )

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        // Names the control "When, Aug 22" — the caption plus the current
        // value, rather than replacing the value with the caption.
        aria-labelledby={labelledBy ? `${labelledBy} ${triggerId}` : undefined}
        className={cn(
          'flex w-full items-center gap-2 text-left text-sm outline-none',
          buttonClassName,
        )}
      >
        <Calendar className="size-4 shrink-0 text-muted-foreground" />
        <span className={cn(value ? 'text-foreground' : 'text-muted-foreground')}>
          {value ? formatDateLabel(value, locale) : placeholder}
        </span>
      </button>

      {mounted ? createPortal(panel, document.body) : null}
    </div>
  )
}
