import { useMemo, useState } from 'react'
import { useStore } from '../store'
import { useUI } from '../ui'
import type { AppState, Habit } from '../types'
import { addDays, shortDate, startOfWeek, weekdayIndex, WEEKDAY_LETTERS } from '../dates'

const FULL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
import { dayStats, earliest, habitStreak, rangeStats } from '../stats'
import { Icon } from '../icons'
import { Ring } from '../components/Ring'

const RANGES = [
  { id: '4w', label: '4 weeks', days: 28, name: '4 weeks' },
  { id: '12w', label: '12 weeks', days: 84, name: '12 weeks' },
  { id: 'y', label: 'Year', days: 364, name: 'year' },
] as const

type RangeId = (typeof RANGES)[number]['id']

function weekdayRates(s: AppState, from: string, to: string, habits: Habit[]) {
  const acc = Array.from({ length: 7 }, () => ({ due: 0, done: 0 }))
  for (let d = from; d <= to; d = addDays(d, 1)) {
    const r = dayStats(s, d, habits)
    const w = weekdayIndex(d)
    acc[w].due += r.due
    acc[w].done += r.done
  }
  return acc.map((a) => (a.due ? a.done / a.due : null))
}

export function Insights() {
  const { state } = useStore()
  const { today } = useUI()
  const [rangeId, setRangeId] = useState<RangeId>('12w')
  const [focus, setFocus] = useState<string | null>(null)
  const range = RANGES.find((r) => r.id === rangeId)!

  const to = today
  const from = addDays(today, -(range.days - 1))
  const prevTo = addDays(from, -1)
  const prevFrom = addDays(prevTo, -(range.days - 1))
  const start = earliest(state)
  const habits = focus ? state.habits.filter((h) => h.id === focus) : state.habits
  const color = focus ? habits[0]?.color ?? 'var(--accent)' : 'var(--accent)'

  const d = useMemo(() => {
    const cur = rangeStats(state, from, to, habits)
    const prev = start && start <= prevTo ? rangeStats(state, prevFrom, prevTo, habits) : null

    const weeks: { from: string; rate: number | null }[] = []
    for (let w = startOfWeek(from); w <= to; w = addDays(w, 7)) {
      const wFrom = w < from ? from : w
      const wTo = addDays(w, 6) > to ? to : addDays(w, 6)
      weeks.push({ from: w, rate: rangeStats(state, wFrom, wTo, habits).rate })
    }

    const wd = weekdayRates(state, from, to, habits)

    const perHabit = state.habits.map((h) => {
      const c = rangeStats(state, from, to, [h])
      const p = h.createdAt <= prevTo ? rangeStats(state, prevFrom, prevTo, [h]) : null
      return {
        h,
        rate: c.rate,
        delta: c.rate != null && p?.rate != null ? Math.round((c.rate - p.rate) * 100) : null,
        streak: habitStreak(state, h, today),
      }
    })
    perHabit.sort((a, b) => (b.rate ?? -1) - (a.rate ?? -1))

    // Time of day reliability (all habits).
    const byTime: Record<string, { due: number; done: number }> = {}
    for (const h of state.habits) {
      const r = rangeStats(state, from, to, [h])
      const k = h.time
      byTime[k] ??= { due: 0, done: 0 }
      byTime[k].due += r.due
      byTime[k].done += r.done
    }

    let perfect = 0
    for (let x = from; x <= to; x = addDays(x, 1)) {
      const r = dayStats(state, x, habits)
      if (r.due && r.done === r.due) perfect++
    }

    return { cur, prev, weeks, wd, perHabit, byTime, perfect }
  }, [state, habits, from, to, prevFrom, prevTo, start, today])

  const delta = d.cur.rate != null && d.prev?.rate != null ? Math.round((d.cur.rate - d.prev.rate) * 100) : null
  const wdValid = d.wd.map((r, i) => ({ r, i })).filter((x) => x.r != null) as { r: number; i: number }[]
  const bestWd = wdValid.length ? wdValid.reduce((a, b) => (b.r > a.r ? b : a)) : null
  const worstWd = wdValid.length ? wdValid.reduce((a, b) => (b.r < a.r ? b : a)) : null

  // Plain-language findings.
  const notes: { icon: string; text: string }[] = []
  if (bestWd && worstWd && bestWd.i !== worstWd.i)
    notes.push({
      icon: 'calendar',
      text: `${FULL_DAYS[bestWd.i]}s are the strongest day at ${Math.round(bestWd.r * 100)}%. ${FULL_DAYS[worstWd.i]}s are the weakest at ${Math.round(worstWd.r * 100)}%.`,
    })
  const movers = d.perHabit.filter((p) => p.delta != null).sort((a, b) => Math.abs(b.delta!) - Math.abs(a.delta!))
  if (movers[0] && movers[0].delta !== 0) {
    const m = movers[0]
    notes.push({
      icon: m.delta! > 0 ? 'trend' : 'trendDown',
      text: `${m.h.name} is ${m.delta! > 0 ? 'up' : 'down'} ${Math.abs(m.delta!)} points on the ${range.name} before.`,
    })
  }
  const times = Object.entries(d.byTime).filter(([, v]) => v.due > 0)
  if (times.length > 1) {
    const [k, v] = times.reduce((a, b) => (b[1].done / b[1].due > a[1].done / a[1].due ? b : a))
    const label = k === 'any' ? 'Any-time' : k[0].toUpperCase() + k.slice(1)
    notes.push({ icon: 'sun', text: `${label} habits are the most reliable: ${Math.round((v.done / v.due) * 100)}% done.` })
  }
  if (d.perHabit.length > 1) {
    const low = [...d.perHabit].filter((p) => p.rate != null).sort((a, b) => a.rate! - b.rate!)[0]
    if (low && low.rate! < 0.8)
      notes.push({ icon: 'sparkle', text: `${low.h.name} slips the most (${Math.round(low.rate! * 100)}%). Try making it smaller, or moving it to a different time.` })
  }
  notes.push({ icon: 'star', text: `${d.perfect} perfect day${d.perfect === 1 ? '' : 's'} in the last ${range.name === 'year' ? 'year' : range.name}.` })

  const firstW = d.weeks[0]
  const lastW = d.weeks[d.weeks.length - 1]
  const midW = d.weeks[Math.floor(d.weeks.length / 2)]

  return (
    <div className="stack">
      <section className="row-between head insights-head">
        <div>
          <div className="kicker">
            {shortDate(from)} to {shortDate(to)} · {focus ? habits[0]?.name : 'All habits'}
            {focus && (
              <button className="link" style={{ marginLeft: 8 }} onClick={() => setFocus(null)}>
                show all
              </button>
            )}
          </div>
          <h1 className="title">Insights</h1>
        </div>
        <div className="seg">
          {RANGES.map((r) => (
            <button key={r.id} className={rangeId === r.id ? 'on' : ''} onClick={() => setRangeId(r.id)}>
              {r.label}
            </button>
          ))}
        </div>
      </section>

      <div className="ins-grid">
        <section className="panel donut-card">
          <div className="kicker">Done out of due</div>
          <div className="donut-row">
            <div className="donut">
              <Ring value={d.cur.rate ?? 0} size={120} stroke={11} color={color} />
              <span className="donut-label num">
                {d.cur.rate == null ? '–' : Math.round(d.cur.rate * 100)}
                <small>%</small>
              </span>
            </div>
            <div>
              {delta == null ? (
                <>
                  <b className="small">No earlier period</b>
                  <p className="dim xsmall">Nothing was tracked before this range.</p>
                </>
              ) : (
                <>
                  <b className={`small ${delta >= 0 ? 'up' : 'down'}`}>
                    <Icon name={delta >= 0 ? 'trend' : 'trendDown'} size={14} /> {delta >= 0 ? '+' : ''}
                    {delta} pts
                  </b>
                  <p className="dim xsmall">against the {range.name} before</p>
                </>
              )}
            </div>
          </div>
          <div className="small">
            <b className="num">{d.cur.done.toLocaleString()}</b> <span className="dim">done out of</span> <b className="num">{d.cur.due.toLocaleString()}</b>{' '}
            <span className="dim">due</span>
          </div>
        </section>

        <section className="panel">
          <div className="row-between">
            <span className="kicker">Week by week</span>
            <span className="kicker">Share done</span>
          </div>
          <div className="wbars" style={{ ['--c' as string]: color }}>
            {d.weeks.map((w, i) => (
              <i
                key={w.from}
                title={`Week of ${shortDate(w.from)}: ${w.rate == null ? 'nothing due' : Math.round(w.rate * 100) + '%'}`}
                style={{ height: `${Math.max(2, (w.rate ?? 0) * 100)}%`, opacity: i === d.weeks.length - 1 ? 1 : 0.55 + (w.rate ?? 0) * 0.35 }}
              />
            ))}
          </div>
          <div className="row-between kicker">
            <span>{firstW && shortDate(firstW.from)}</span>
            <span>{midW && shortDate(midW.from)}</span>
            <span>{lastW && shortDate(lastW.from)}</span>
          </div>
        </section>

        <section className="panel">
          <span className="kicker">By weekday</span>
          <div className="wdbars" style={{ ['--c' as string]: color }}>
            {d.wd.map((r, i) => (
              <div key={i} className={`wdbar ${bestWd?.i === i ? 'best' : ''}`}>
                <span className="kicker">{r == null ? '–' : Math.round(r * 100)}</span>
                <div className="wdtrack">
                  <i style={{ height: `${(r ?? 0) * 100}%` }} />
                </div>
                <span className="kicker">{WEEKDAY_LETTERS[i]}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="ins-grid2">
        <section className="panel">
          <div className="row-between">
            <span className="kicker">Habit by habit</span>
            <span className="kicker hide-sm">Click one to look at it alone</span>
          </div>
          <div className="hbh">
            {d.perHabit.length === 0 && <p className="dim">Add a habit to see how it is going.</p>}
            {d.perHabit.map(({ h, rate, delta, streak }) => (
              <button
                key={h.id}
                className={`hbh-row ${focus === h.id ? 'on' : ''} ${focus && focus !== h.id ? 'faded' : ''}`}
                style={{ ['--c' as string]: h.color }}
                onClick={() => setFocus(focus === h.id ? null : h.id)}
              >
                <span className="tile sm" style={{ color: h.color }}>
                  <Icon name={h.icon} size={14} />
                </span>
                <span className="hbh-name">{h.name}</span>
                <span className="hbh-track">
                  <i style={{ width: `${(rate ?? 0) * 100}%` }} />
                </span>
                <span className="num r">
                  {rate == null ? '–' : Math.round(rate * 100)}
                  <small>%</small>
                </span>
                <span className={`num r dim hide-sm ${delta != null && delta > 0 ? 'up' : delta != null && delta < 0 ? 'down' : ''}`}>
                  {delta == null ? '–' : (delta > 0 ? '↗ ' : delta < 0 ? '↘ ' : '') + Math.abs(delta)}
                </span>
                <span className="num r">
                  <Icon name="flame" size={12} className="flame" /> {streak}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="panel">
          <span className="kicker">What the numbers say</span>
          <ul className="notes">
            {notes.map((n, i) => (
              <li key={i}>
                <Icon name={n.icon} size={16} />
                <span>{n.text}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
