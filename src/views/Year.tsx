import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../store'
import { useUI } from '../ui'
import { MONTHS, addDays, dayOfYear, daysInMonth, longDate, toKey } from '../dates'
import { dayStats, earliest, groupLongest, groupStreak, habitLongest, habitStreak, milestones, totals } from '../stats'
import { Icon } from '../icons'

const LIME = '#d4f75c'

function level(r: number): number {
  if (r <= 0) return 0
  if (r < 0.34) return 30
  if (r < 0.67) return 55
  if (r < 1) return 78
  return 100
}

export function Year() {
  const { state } = useStore()
  const { today, openDay } = useUI()
  const thisYear = Number(today.slice(0, 4))
  const first = earliest(state)
  const firstYear = first ? Number(first.slice(0, 4)) : thisYear
  const [year, setYear] = useState(thisYear)
  const [filter, setFilter] = useState<string>('all')
  const [replay, setReplay] = useState<number | null>(null)
  const raf = useRef<number>()

  const habits = filter === 'all' ? state.habits : state.habits.filter((h) => h.id === filter)
  const color = filter === 'all' ? LIME : habits[0]?.color ?? LIME
  const y0 = `${year}-01-01`
  const yEnd = year === thisYear ? today : `${year}-12-31`
  const lastDoy = year === thisYear ? dayOfYear(today) : dayOfYear(`${year}-12-31`)

  const data = useMemo(() => {
    const cells: Record<string, number | null> = {}
    const months = Array.from({ length: 12 }, () => ({ due: 0, done: 0 }))
    let activeDays = 0
    let trackedDays = 0
    let due = 0
    let done = 0
    for (let d = y0; d <= yEnd; d = addDays(d, 1)) {
      const s = dayStats(state, d, habits)
      if (s.due === 0) {
        cells[d] = s.done > 0 ? 1 : null
        continue
      }
      trackedDays++
      if (s.done > 0) activeDays++
      due += s.due
      done += s.done
      const m = Number(d.slice(5, 7)) - 1
      months[m].due += s.due
      months[m].done += s.done
      cells[d] = s.done / s.due
    }
    return { cells, months, activeDays, trackedDays, due, done }
  }, [state, habits, y0, yEnd])

  const streakNow = useMemo(() => {
    if (year !== thisYear) return null
    return filter === 'all' ? groupStreak(state, habits, today) : habits[0] ? habitStreak(state, habits[0], today) : 0
  }, [state, habits, filter, today, year, thisYear])

  const streakBest = useMemo(() => {
    if (filter === 'all') return groupLongest(state, habits, yEnd, first && first > y0 ? first : y0)
    return habits[0] ? habitLongest(state, habits[0], yEnd) : 0
  }, [state, habits, filter, yEnd, y0, first])

  const t = useMemo(() => totals(state, today), [state, today])
  const best = useMemo(
    () => Math.max(groupLongest(state, state.habits, today), ...state.habits.map((h) => habitLongest(state, h, today))),
    [state, today],
  )
  const ms = milestones(t, best)

  const play = () => {
    if (replay != null) {
      cancelAnimationFrame(raf.current!)
      setReplay(null)
      return
    }
    const start = performance.now()
    const dur = 3200
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur)
      setReplay(Math.ceil(p * lastDoy))
      if (p < 1) raf.current = requestAnimationFrame(tick)
      else setTimeout(() => setReplay(null), 400)
    }
    raf.current = requestAnimationFrame(tick)
  }
  useEffect(() => () => cancelAnimationFrame(raf.current!), [])

  const rate = data.due ? data.done / data.due : null
  const maxMonth = 1

  return (
    <div className="layout">
      <div className="stack">
        <section className="panel">
          <div className="row-between head">
            <div className="year-title">
              <div className="year-switch">
                <button className="icon-btn round sm" disabled={year <= firstYear} onClick={() => setYear(year - 1)} aria-label="Previous year">
                  <Icon name="chevronLeft" size={14} />
                </button>
                <h1 className="title huge">{year}</h1>
                <button className="icon-btn round sm" disabled={year >= thisYear} onClick={() => setYear(year + 1)} aria-label="Next year">
                  <Icon name="chevronRight" size={14} />
                </button>
              </div>
              <div>
                <div className="kicker">
                  {y0} → {yEnd} · day {lastDoy}
                </div>
                <div className="small">
                  <b className="num">{data.activeDays}</b> <span className="dim">days done {year === thisYear ? 'this year' : `in ${year}`}</span>
                </div>
              </div>
            </div>
            <button className="btn light" onClick={play}>
              <Icon name={replay != null ? 'pause' : 'play'} size={14} /> {replay != null ? 'Stop' : 'Replay the year'}
            </button>
          </div>

          <div className="filters">
            <button className={`fchip ${filter === 'all' ? 'on' : ''}`} onClick={() => setFilter('all')}>
              All habits
            </button>
            {state.habits.map((h) => (
              <button
                key={h.id}
                className={`fchip ${filter === h.id ? 'on' : ''}`}
                style={{ ['--c' as string]: h.color }}
                onClick={() => setFilter(h.id)}
              >
                <Icon name={h.icon} size={13} /> {h.name}
              </button>
            ))}
          </div>

          <div className="wall-scroll">
            <div className="wall" style={{ ['--c' as string]: color }}>
              <span />
              {Array.from({ length: 31 }, (_, i) => (
                <span key={i} className="wall-col kicker">
                  {i % 2 === 0 ? i + 1 : ''}
                </span>
              ))}
              <span />
              {MONTHS.map((m, mi) => {
                const dim = daysInMonth(year, mi)
                const mo = data.months[mi]
                return (
                  <Fragment key={m}>
                    <span className="wall-month kicker">{m}</span>
                    {Array.from({ length: 31 }, (_, di) => {
                      if (di >= dim) return <span key={di} />
                      const d = toKey(new Date(year, mi, di + 1))
                      const r = data.cells[d]
                      const hidden = replay != null && dayOfYear(d) > replay
                      if (d > today || r === undefined)
                        return <span key={di} className="cell future" />
                      if (r === null || hidden)
                        return <span key={di} className="cell none" title={hidden ? undefined : `${longDate(d)} · nothing due`} />
                      return (
                        <button
                          key={di}
                          className={`cell ${d === today ? 'today' : ''}`}
                          style={{ ['--l' as string]: `${level(r)}%` }}
                          title={`${longDate(d)} · ${Math.round(r * 100)}%`}
                          onClick={() => openDay(d)}
                        />
                      )
                    })}
                    <span className="wall-pct kicker">{mo.due ? `${Math.round((mo.done / mo.due) * 100)}%` : ''}</span>
                  </Fragment>
                )
              })}
            </div>
          </div>
          <div className="row-between legend">
            <span className="kicker legend-scale" style={{ ['--c' as string]: color }}>
              Less <i style={{ ['--l' as string]: '0%' }} /> <i style={{ ['--l' as string]: '30%' }} /> <i style={{ ['--l' as string]: '55%' }} />{' '}
              <i style={{ ['--l' as string]: '78%' }} /> <i style={{ ['--l' as string]: '100%' }} /> More
            </span>
            <span className="kicker hide-sm">Click a day to open it and correct it</span>
          </div>
        </section>

        <section className="panel milestones">
          <div className="ms-head">
            <div className="kicker">Milestones</div>
            <b className="num xl">
              {ms.filter((m) => m.value >= m.goal).length}
              <small className="dim">/{ms.length}</small>
            </b>
          </div>
          <div className="ms-list">
            {ms.map((m) => {
              const got = m.value >= m.goal
              return (
                <div key={m.id} className={`ms ${got ? 'got' : ''}`} title={got ? 'Unlocked' : `${m.value.toLocaleString()} / ${m.goal.toLocaleString()}`}>
                  <span className="ms-badge" style={{ background: got ? m.color : undefined }}>
                    <Icon name={got ? m.icon : 'lock'} size={16} stroke={2.4} />
                  </span>
                  <span className="ms-label">{m.label}</span>
                  {!got && (
                    <span className="bar thin">
                      <i style={{ width: `${Math.min(100, (m.value / m.goal) * 100)}%`, background: m.color }} />
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      </div>

      <aside className="side">
        <div className="panel ystats">
          <div className="kicker">{filter === 'all' ? 'All habits' : habits[0]?.name}</div>
          {streakNow != null && (
            <div className="ystat">
              <div>
                <span className="dim small">Current streak</span>
                <b className="num xl">
                  {streakNow} <small className="dim">days</small>
                </b>
              </div>
              <Icon name="flame" size={22} className="flame" />
            </div>
          )}
          <div className="ystat">
            <div>
              <span className="dim small">Longest streak</span>
              <b className="num xl">
                {streakBest} <small className="dim">days</small>
              </b>
            </div>
          </div>
          <div className="ystat">
            <div>
              <span className="dim small">Check-ins</span>
              <b className="num xl">
                {data.done.toLocaleString()} <small className="dim">of {data.due.toLocaleString()} due</small>
              </b>
            </div>
          </div>
          <div className="ystat">
            <div>
              <span className="dim small">Completion</span>
              <b className="num xl">
                {rate == null ? '–' : Math.round(rate * 100)}
                <small className="dim">% {year === thisYear ? 'this year' : `in ${year}`}</small>
              </b>
            </div>
          </div>
          <div className="ystat">
            <div>
              <span className="dim small">Days tracked</span>
              <b className="num xl">
                {data.trackedDays} <small className="dim">since {year === thisYear && first && first > y0 ? 'you started' : 'Jan 1'}</small>
              </b>
            </div>
          </div>
        </div>
        <div className="panel">
          <div className="kicker">Month by month</div>
          <div className="mbars" style={{ ['--c' as string]: color }}>
            {data.months.map((m, i) => {
              const r = m.due ? m.done / m.due : 0
              return (
                <div key={i} className="mbar" title={`${MONTHS[i]}: ${m.due ? Math.round(r * 100) + '%' : 'nothing due'}`}>
                  <i style={{ height: `${(r / maxMonth) * 100}%`, opacity: m.due ? 0.45 + r * 0.55 : 0 }} />
                  <span className="kicker">{MONTHS[i][0]}</span>
                </div>
              )
            })}
          </div>
        </div>
      </aside>
    </div>
  )
}
