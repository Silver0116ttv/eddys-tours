'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { DatePicker } from '@/components/date-picker'

export function HeroSearch() {
  const [date, setDate] = useState<string>('')
  const [query, setQuery] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Mock result behavior: scroll to the tours grid.
    console.log('[v0] search', { date, query })
    document.getElementById('tours')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl border border-white/40 bg-background/95 p-2 shadow-2xl backdrop-blur-md"
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-stretch">
        <div className="flex flex-1 items-center rounded-xl px-4 py-3 md:py-2 md:hover:bg-muted/60">
          <div className="w-full">
            <span className="mb-0.5 block text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
              When
            </span>
            <DatePicker value={date} onChange={setDate} placeholder="Any date" buttonClassName="font-medium" />
          </div>
        </div>

        <div className="hidden w-px bg-border md:block" />

        <div className="flex flex-[1.6] items-center rounded-xl px-4 py-3 md:py-2 md:hover:bg-muted/60">
          <div className="w-full">
            <label
              htmlFor="hero-search"
              className="mb-0.5 block text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground"
            >
              What
            </label>
            <input
              id="hero-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ATV, yacht, snorkeling..."
              className="w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-sunset px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] active:scale-95 md:px-7"
        >
          <Search className="size-4" />
          Find Tours
        </button>
      </div>
    </form>
  )
}
