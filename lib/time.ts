/**
 * Puerto Vallarta sits in Jalisco, which observes Central time year-round
 * (Mexico dropped daylight saving in 2022). Every date and time shown to a
 * traveller is expressed in this zone so the schedule matches the dock.
 */
export const VALLARTA_TIME_ZONE = 'America/Mexico_City'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  month: '2-digit',
  timeZone: VALLARTA_TIME_ZONE,
  year: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  timeZone: VALLARTA_TIME_ZONE,
})

/** `YYYY-MM-DD` for the given instant, on the Vallarta calendar. */
export function toVallartaDate(value: Date | string): string {
  const parts = dateFormatter.formatToParts(new Date(value))
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? ''

  return `${part('year')}-${part('month')}-${part('day')}`
}

/** `9:00 AM` for the given instant, on the Vallarta clock. */
export function toVallartaTime(value: Date | string): string {
  return timeFormatter.format(new Date(value))
}

/** `YYYY-MM-DD` for a day relative to today, on the Vallarta calendar. */
export function vallartaDateOffset(days: number): string {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + days)
  return toVallartaDate(date)
}
