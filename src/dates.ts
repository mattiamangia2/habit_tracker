export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
export const WEEKDAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const pad = (n: number) => String(n).padStart(2, '0')

export function toKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function fromKey(k: string): Date {
  const [y, m, d] = k.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(k: string, n: number): string {
  const d = fromKey(k)
  d.setDate(d.getDate() + n)
  return toKey(d)
}

export function todayKey(): string {
  return toKey(new Date())
}

/** Monday = 0 … Sunday = 6 */
export function weekdayIndex(k: string): number {
  return (fromKey(k).getDay() + 6) % 7
}

export function startOfWeek(k: string): string {
  return addDays(k, -weekdayIndex(k))
}

export function daysBetween(a: string, b: string): number {
  return Math.round((fromKey(b).getTime() - fromKey(a).getTime()) / 86400000)
}

export function dayOfYear(k: string): number {
  const d = fromKey(k)
  return daysBetween(`${d.getFullYear()}-01-01`, k) + 1
}

export function isoWeek(k: string): number {
  const d = fromKey(k)
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const day = t.getUTCDay() || 7
  t.setUTCDate(t.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1))
  return Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function longDate(k: string): string {
  return fromKey(k).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

export function shortDate(k: string): string {
  const d = fromKey(k)
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}

export function monthYear(k: string): string {
  const d = fromKey(k)
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}
