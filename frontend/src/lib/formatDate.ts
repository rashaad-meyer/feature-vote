const DIVISIONS: Array<{ amount: number; unit: Intl.RelativeTimeFormatUnit }> = [
  { amount: 60, unit: 'second' },
  { amount: 60, unit: 'minute' },
  { amount: 24, unit: 'hour' },
  { amount: 7, unit: 'day' },
  { amount: 4.34524, unit: 'week' },
  { amount: 12, unit: 'month' },
  { amount: Number.POSITIVE_INFINITY, unit: 'year' },
]

const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

/** e.g. "3 days ago". Falls back gracefully on an unparseable date. */
export function formatRelativeTime(iso: string): string {
  const timestamp = Date.parse(iso)
  if (Number.isNaN(timestamp)) return ''

  let duration = (timestamp - Date.now()) / 1000
  for (const { amount, unit } of DIVISIONS) {
    if (Math.abs(duration) < amount) {
      return formatter.format(Math.round(duration), unit)
    }
    duration /= amount
  }
  return ''
}
