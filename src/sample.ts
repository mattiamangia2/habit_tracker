import type { AppState, Habit } from './types'
import { addDays, todayKey, weekdayIndex, daysBetween } from './dates'

const EVERY = [true, true, true, true, true, true, true]
const WEEKDAYS = [true, true, true, true, true, false, false]

function rng(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** A made-up person's habits, with about a year of history ending today. */
export function sampleState(): AppState {
  const today = todayKey()
  const start = addDays(today, -380)
  const since = (daysAgo: number) => addDays(today, -daysAgo)

  const habits: (Habit & { p: number })[] = [
    { id: 'h-up', name: 'Up by 6:30', icon: 'sunrise', color: '#f2b54a', kind: 'check', target: 1, time: 'morning', days: WEEKDAYS, createdAt: start, p: 0.9 },
    { id: 'h-med', name: 'Meditate', icon: 'lotus', color: '#9b6bd6', kind: 'minutes', target: 10, time: 'morning', days: EVERY, createdAt: start, p: 0.86 },
    { id: 'h-run', name: 'Long run', icon: 'mountain', color: '#e0c9a6', kind: 'check', target: 1, time: 'morning', days: [false, false, false, false, false, true, false], createdAt: since(84), p: 0.95 },
    { id: 'h-move', name: 'Move 30 minutes', icon: 'pulse', color: '#d65a3a', kind: 'minutes', target: 30, time: 'any', days: [true, true, true, true, true, true, false], createdAt: start, p: 0.82 },
    { id: 'h-water', name: 'Drink water', icon: 'drop', color: '#5aa9c9', kind: 'count', target: 8, unit: 'glasses', time: 'any', days: EVERY, createdAt: start, p: 0.85 },
    { id: 'h-span', name: 'Spanish lesson', icon: 'language', color: '#e86a8a', kind: 'check', target: 1, time: 'afternoon', days: WEEKDAYS, createdAt: since(263), p: 0.9 },
    { id: 'h-read', name: 'Read 20 pages', icon: 'book', color: '#8fbf8a', kind: 'check', target: 1, time: 'evening', days: EVERY, createdAt: start, p: 0.87 },
    { id: 'h-jour', name: 'Journal', icon: 'pen', color: '#ff8a5c', kind: 'check', target: 1, time: 'evening', days: EVERY, createdAt: since(172), p: 0.8 },
  ]

  const r = rng(20261119)
  const logs: AppState['logs'] = {}
  const total = daysBetween(start, today)
  // Weekday modifiers: strong mid-week, weaker on Sunday.
  const wdBoost = [0.0, 0.02, 0.06, 0.02, -0.02, -0.04, -0.1]

  for (let i = 0; i <= total; i++) {
    const d = addDays(start, i)
    const wd = weekdayIndex(d)
    const progress = i / total // people get better over time
    // A couple of rough patches make the wall more interesting.
    const slump = (i > 70 && i < 90) || (i > 215 && i < 228) ? -0.3 : 0
    const isToday = d === today
    const day: Record<string, number> = {}
    for (const h of habits) {
      if (d < h.createdAt || !h.days[wd]) continue
      const p = Math.min(0.99, h.p - 0.1 + progress * 0.18 + wdBoost[wd] + slump)
      // Today: morning habits done, the rest left for the user.
      const done = isToday ? h.time === 'morning' : r() < p
      if (done) day[h.id] = h.target
      else if (h.kind !== 'check' && r() < 0.5 && !isToday) day[h.id] = Math.max(1, Math.floor(h.target * r() * 0.8))
    }
    if (Object.keys(day).length) logs[d] = day
  }

  // Keep the last two weeks spotless so the sample shows a nice streak.
  for (let i = 1; i <= 14; i++) {
    const d = addDays(today, -i)
    const wd = weekdayIndex(d)
    const day = (logs[d] ??= {})
    for (const h of habits) if (d >= h.createdAt && h.days[wd]) day[h.id] = h.target
  }

  return {
    version: 1,
    name: 'Alex',
    habits: habits.map(({ p: _p, ...h }) => h),
    logs,
    isSample: true,
  }
}

export function emptyState(name = ''): AppState {
  return { version: 1, name, habits: [], logs: {}, isSample: false }
}
