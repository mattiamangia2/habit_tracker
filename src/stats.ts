import type { AppState, Habit } from './types'
import { addDays, weekdayIndex } from './dates'

export function isDue(h: Habit, d: string): boolean {
  return d >= h.createdAt && h.days[weekdayIndex(d)]
}

export function valueOf(s: AppState, d: string, id: string): number {
  return s.logs[d]?.[id] ?? 0
}

export function isDone(s: AppState, h: Habit, d: string): boolean {
  return valueOf(s, d, h.id) >= h.target
}

export function earliest(s: AppState): string | null {
  let min: string | null = null
  for (const h of s.habits) if (!min || h.createdAt < min) min = h.createdAt
  for (const d of Object.keys(s.logs)) if (!min || d < min) min = d
  return min
}

export function dayStats(s: AppState, d: string, habits: Habit[] = s.habits) {
  let due = 0
  let done = 0
  for (const h of habits) {
    if (!isDue(h, d)) continue
    due++
    if (isDone(s, h, d)) done++
  }
  return { due, done }
}

export function isPerfect(s: AppState, d: string, habits: Habit[] = s.habits): boolean {
  const { due, done } = dayStats(s, d, habits)
  return due > 0 && done === due
}

/** Walk back from `today` counting consecutive days that pass `ok`.
 *  Days with nothing due are skipped; today gets grace if not yet complete. */
function streakBack(today: string, stop: string, hasDue: (d: string) => boolean, ok: (d: string) => boolean): number {
  let n = 0
  for (let d = today; d >= stop; d = addDays(d, -1)) {
    if (!hasDue(d)) continue
    if (ok(d)) n++
    else if (d !== today) break
  }
  return n
}

function longestRun(from: string, to: string, hasDue: (d: string) => boolean, ok: (d: string) => boolean): number {
  let best = 0
  let cur = 0
  for (let d = from; d <= to; d = addDays(d, 1)) {
    if (!hasDue(d)) continue
    if (ok(d)) best = Math.max(best, ++cur)
    else cur = 0
  }
  return best
}

export function habitStreak(s: AppState, h: Habit, today: string): number {
  return streakBack(today, h.createdAt, (d) => isDue(h, d), (d) => isDone(s, h, d))
}

export function habitLongest(s: AppState, h: Habit, today: string): number {
  return longestRun(h.createdAt, today, (d) => isDue(h, d), (d) => isDone(s, h, d))
}

/** Streak for a group of habits: every due habit done counts as a day kept. */
export function groupStreak(s: AppState, habits: Habit[], today: string): number {
  const start = minCreated(habits)
  if (!start) return 0
  return streakBack(today, start, (d) => dayStats(s, d, habits).due > 0, (d) => isPerfect(s, d, habits))
}

export function groupLongest(s: AppState, habits: Habit[], today: string, from?: string): number {
  const start = from ?? minCreated(habits)
  if (!start) return 0
  return longestRun(start, today, (d) => dayStats(s, d, habits).due > 0, (d) => isPerfect(s, d, habits))
}

function minCreated(habits: Habit[]): string | null {
  let m: string | null = null
  for (const h of habits) if (!m || h.createdAt < m) m = h.createdAt
  return m
}

export function rangeStats(s: AppState, from: string, to: string, habits: Habit[] = s.habits) {
  let due = 0
  let done = 0
  for (let d = from; d <= to; d = addDays(d, 1)) {
    const r = dayStats(s, d, habits)
    due += r.due
    done += r.done
  }
  return { due, done, rate: due ? done / due : null }
}

export function totals(s: AppState, today: string) {
  let checkins = 0
  let perfectDays = 0
  const start = earliest(s)
  if (start) {
    for (let d = start; d <= today; d = addDays(d, 1)) {
      const r = dayStats(s, d)
      checkins += r.done
      if (r.due > 0 && r.done === r.due) perfectDays++
    }
  }
  const points = checkins * 10 + perfectDays * 25
  const perLevel = 1000
  const level = Math.floor(points / perLevel) + 1
  return {
    checkins,
    perfectDays,
    points,
    level,
    levelProgress: (points % perLevel) / perLevel,
    toNext: level * perLevel - points,
  }
}

export interface Milestone {
  id: string
  label: string
  icon: string
  color: string
  value: number
  goal: number
}

export function milestones(t: { checkins: number; perfectDays: number }, bestStreak: number): Milestone[] {
  return [
    { id: 'w', label: 'One week', icon: 'flame', color: '#ff6a3d', value: bestStreak, goal: 7 },
    { id: 'm', label: 'Thirty days', icon: 'flame', color: '#ff6a3d', value: bestStreak, goal: 30 },
    { id: 'h', label: 'One hundred days', icon: 'flame', color: '#ff6a3d', value: bestStreak, goal: 100 },
    { id: 'c5', label: '500 check-ins', icon: 'check', color: '#5cb8f7', value: t.checkins, goal: 500 },
    { id: 'c1k', label: '1,000 check-ins', icon: 'check', color: '#5cb8f7', value: t.checkins, goal: 1000 },
    { id: 'c2k', label: '2,000 check-ins', icon: 'check', color: '#5cb8f7', value: t.checkins, goal: 2000 },
    { id: 'p25', label: '25 perfect days', icon: 'star', color: '#4fe0a6', value: t.perfectDays, goal: 25 },
    { id: 'p100', label: '100 perfect days', icon: 'star', color: '#4fe0a6', value: t.perfectDays, goal: 100 },
  ]
}

export function scheduleLabel(days: boolean[]): string {
  const n = days.filter(Boolean).length
  if (n === 7) return 'every day'
  if (n === 5 && days.slice(0, 5).every(Boolean)) return 'weekdays'
  if (n === 2 && days[5] && days[6]) return 'weekends'
  if (n === 1) return 'once a week'
  return `${n}× a week`
}

export function amountLabel(h: Habit): string {
  if (h.kind === 'minutes') return `${h.target} min`
  if (h.kind === 'count') return `${h.target} ${h.unit || 'times'}`
  return 'once'
}

export const pct = (r: number | null) => (r == null ? '–' : `${Math.round(r * 100)}`)
