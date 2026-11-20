import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../store'
import { useUI } from '../ui'
import type { Habit } from '../types'
import { addDays, isoWeek, longDate, shortDate, startOfWeek, WEEKDAY_LETTERS, WEEKDAYS, fromKey } from '../dates'
import { dayStats, groupLongest, groupStreak, habitStreak, isDue, milestones, scheduleLabel, totals, valueOf } from '../stats'
import { Icon } from '../icons'
import { Ring, SegmentRing } from '../components/Ring'

const TIME_ORDER = { morning: 0, afternoon: 1, any: 2, evening: 3 }

export function Today() {
  const { state, setValue } = useStore()
  const { today, toast, newHabit } = useUI()
  const [date, setDate] = useState(today)
  const [focus, setFocus] = useState(0)
  const gridRef = useRef<HTMLDivElement>(null)

  const due = useMemo(
    () => state.habits.filter((h) => isDue(h, date)).sort((a, b) => TIME_ORDER[a.time] - TIME_ORDER[b.time]),
    [state.habits, date],
  )
  const notDue = state.habits.filter((h) => !isDue(h, date))
  const ds = dayStats(state, date)
  const isToday = date === today

  const setAndCelebrate = (h: Habit, v: number) => {
    const wasDone = valueOf(state, date, h.id) >= h.target
    setValue(date, h.id, v)
    const nowDone = v >= h.target
    if (!wasDone && nowDone) {
      if (ds.done + 1 === ds.due) toast('Perfect day', 'Every habit done. +25 points')
      else toast(`${h.name} done`, '+10 points')
    }
  }

  const toggle = (h: Habit) => {
    const v = valueOf(state, date, h.id)
    setAndCelebrate(h, v >= h.target ? 0 : h.target)
  }

  // Keyboard: arrows move between cards, Enter/Space checks, [ and ] change day.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('input, textarea, .modal') || document.querySelector('.modal')) return
      const cols = gridRef.current ? getComputedStyle(gridRef.current).gridTemplateColumns.split(' ').length : 4
      const n = due.length
      if (!n) return
      let f = focus
      if (e.key === 'ArrowRight') f = Math.min(n - 1, f + 1)
      else if (e.key === 'ArrowLeft') f = Math.max(0, f - 1)
      else if (e.key === 'ArrowDown') f = Math.min(n - 1, f + cols)
      else if (e.key === 'ArrowUp') f = Math.max(0, f - cols)
      else if (e.key === 'Enter' || e.key === ' ') {
        if (t.tagName === 'BUTTON' && !t.classList.contains('hcard')) return
        e.preventDefault()
        toggle(due[Math.min(f, n - 1)])
        return
      } else if (e.key === '[') return setDate((d) => addDays(d, -1))
      else if (e.key === ']') return setDate((d) => (d < today ? addDays(d, 1) : d))
      else return
      e.preventDefault()
      setFocus(f)
      ;(gridRef.current?.children[f] as HTMLElement | undefined)?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const week = startOfWeek(date)
  const t = useMemo(() => totals(state, today), [state, today])
  const perfectNow = useMemo(() => groupStreak(state, state.habits, today), [state, today])
  const perfectBest = useMemo(() => groupLongest(state, state.habits, today), [state, today])
  const bestHabitStreak = useMemo(() => Math.max(0, ...state.habits.map((h) => habitStreak(state, h, today))), [state, today])
  const next = milestones(t, Math.max(perfectBest, bestHabitStreak)).find((m) => m.value < m.goal)

  const remaining = ds.due - ds.done
  const subtitle =
    ds.due === 0
      ? 'Nothing scheduled. Enjoy the day off.'
      : remaining === 0
        ? 'Perfect day. Every habit is done.'
        : `${remaining} to go${isToday ? ' today' : ''}. ${ds.done ? 'Keep going.' : 'Start with the easiest one.'}`

  return (
    <div className="layout">
      <section className="panel today-panel">
        <div className="today-head">
          <div>
            <div className="kicker">
              Week {isoWeek(date)} · {state.name ? `Hello ${state.name}` : 'Hello'}
            </div>
            <h1 className="title">{longDate(date)}</h1>
            <p className="dim small">{subtitle}</p>
          </div>
          <div className="week-strip">
            <button className="icon-btn round sm" onClick={() => setDate(addDays(date, -7))} aria-label="Previous week">
              <Icon name="chevronLeft" size={14} />
            </button>
            {Array.from({ length: 7 }, (_, i) => {
              const d = addDays(week, i)
              const s = dayStats(state, d)
              const future = d > today
              return (
                <button
                  key={d}
                  className={`wday ${d === date ? 'on' : ''} ${future ? 'future' : ''}`}
                  disabled={future}
                  onClick={() => setDate(d)}
                  title={longDate(d)}
                >
                  <span className="wl">{WEEKDAY_LETTERS[i]}</span>
                  <span className="wn">
                    {!future && <Ring value={s.due ? s.done / s.due : 0} size={30} stroke={2.5} color={s.due && s.done === s.due ? 'var(--good)' : 'var(--text)'} />}
                    <i>{fromKey(d).getDate()}</i>
                  </span>
                </button>
              )
            })}
            <button
              className="icon-btn round sm"
              onClick={() => setDate(addDays(date, 7) > today ? today : addDays(date, 7))}
              disabled={week >= startOfWeek(today)}
              aria-label="Next week"
            >
              <Icon name="chevronRight" size={14} />
            </button>
          </div>
        </div>

        {state.habits.length === 0 ? (
          <div className="empty">
            <h2>Start your first habit</h2>
            <p className="dim">Pick something small you can do every day. You can add more later.</p>
            <button className="btn primary" onClick={newHabit}>
              <Icon name="plus" size={16} /> New habit
            </button>
          </div>
        ) : (
          <div className="card-grid" ref={gridRef}>
            {due.map((h, i) => (
              <HabitCard
                key={h.id}
                habit={h}
                date={date}
                focused={i === focus}
                onFocus={() => setFocus(i)}
                onToggle={() => toggle(h)}
                onSet={(v) => setAndCelebrate(h, v)}
              />
            ))}
            <button className="hcard add" onClick={newHabit}>
              <span className="add-plus">
                <Icon name="plus" size={18} />
              </span>
              <span>New habit</span>
            </button>
          </div>
        )}

        {notDue.length > 0 && (
          <div className="offday">
            <div className="kicker">Not scheduled {isToday ? 'today' : 'this day'}</div>
            <div className="offday-list">
              {notDue.map((h) => (
                <span key={h.id} className="offday-item" title={h.createdAt > date ? 'Not started yet' : undefined}>
                  <span className="tile" style={{ color: h.color }}>
                    <Icon name={h.icon} size={14} />
                  </span>
                  {h.name}
                  <small>{h.createdAt > date ? `starts ${shortDate(h.createdAt)}` : daysList(h.days)}</small>
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      <aside className="side">
        <div className="panel center">
          <div className="ring-wrap">
            <SegmentRing items={due.map((h) => ({ color: h.color, done: valueOf(state, date, h.id) >= h.target }))} />
            <div className="ring-label">
              <span className="big">
                {ds.done}
                <small>/{ds.due}</small>
              </span>
              <span className="kicker">{isToday ? "Today's day" : 'That day'}</span>
            </div>
          </div>
          <div className="chips">
            {due.map((h) => {
              const done = valueOf(state, date, h.id) >= h.target
              return (
                <button
                  key={h.id}
                  className={`chip ${done ? 'on' : ''}`}
                  style={{ ['--c' as string]: h.color }}
                  onClick={() => toggle(h)}
                >
                  <i />
                  {h.name}
                </button>
              )
            })}
          </div>
        </div>

        <div className="panel stat-row">
          <span className="flame-tile">
            <Icon name="flame" size={22} />
          </span>
          <div>
            <div className="stat-line">
              <b className="num">{perfectNow}</b> perfect day{perfectNow === 1 ? '' : 's'} in a row
            </div>
            <div className="kicker">
              {perfectNow > 0 && perfectNow >= perfectBest ? 'Your longest run yet' : `Longest run: ${perfectBest}`}
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="level-head">
            <div>
              <div className="kicker">Level</div>
              <b className="num xl">{t.level}</b>
            </div>
            <div className="right">
              <b className="num">{t.points.toLocaleString()}</b>
              <div className="kicker">Points</div>
            </div>
          </div>
          <div className="bar">
            <i style={{ width: `${t.levelProgress * 100}%` }} />
          </div>
          <div className="kicker" style={{ marginTop: 8 }}>
            {t.toNext.toLocaleString()} points to level {t.level + 1}
          </div>
        </div>

        {next && (
          <div className="panel stat-row">
            <span className="tile" style={{ color: next.color }}>
              <Icon name="trophy" size={18} />
            </span>
            <div className="grow">
              <div className="row-between">
                <b className="small">{next.label}</b>
                <span className="kicker">{next.goal - next.value} to go</span>
              </div>
              <div className="bar thin">
                <i style={{ width: `${(next.value / next.goal) * 100}%`, background: 'var(--amber)' }} />
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}

function HabitCard({ habit: h, date, focused, onFocus, onToggle, onSet }: {
  habit: Habit
  date: string
  focused: boolean
  onFocus: () => void
  onToggle: () => void
  onSet: (v: number) => void
}) {
  const { state } = useStore()
  const { today } = useUI()
  const v = valueOf(state, date, h.id)
  const done = v >= h.target
  const streak = habitStreak(state, h, date > today ? today : date)

  // The last 10 scheduled days before this one, oldest first.
  const history: boolean[] = []
  for (let d = addDays(date, -1); history.length < 10 && d >= h.createdAt; d = addDays(d, -1)) {
    if (isDue(h, d)) history.unshift(valueOf(state, d, h.id) >= h.target)
  }
  const step = h.kind === 'minutes' ? 5 : 1

  return (
    <div
      className={`hcard ${done ? 'done' : ''} ${focused ? 'focus' : ''}`}
      style={{ ['--c' as string]: h.color }}
      tabIndex={0}
      onFocus={onFocus}
      role="group"
      aria-label={`${h.name}, ${done ? 'done' : 'not done'}`}
    >
      <div className="hcard-top">
        <span className="hcard-icon">
          <Icon name={h.icon} size={18} />
        </span>
        <span className="streak-badge" title="Current streak">
          <Icon name="flame" size={12} /> {streak}
        </span>
      </div>
      <div className="dashes" aria-hidden="true">
        {history.map((ok, i) => (
          <i key={i} className={ok ? 'ok' : ''} />
        ))}
      </div>
      <div className="hcard-meta">
        {h.time === 'any' ? 'Any time' : h.time} · {scheduleLabel(h.days)}
      </div>
      <div className="hcard-name">{h.name}</div>
      <div className="hcard-foot">
        {h.kind === 'check' ? (
          <span className="hcard-state">{done ? 'Done' : 'Not yet'}</span>
        ) : (
          <span className="hcard-amount">
            <b>{v}</b>
            <small>
              / {h.target} {h.kind === 'minutes' ? 'min' : h.unit || ''}
            </small>
            <button className="mini" onClick={() => onSet(Math.max(0, v - step))} aria-label="Less" disabled={v === 0}>
              <Icon name="minus" size={12} stroke={2.6} />
            </button>
            <button className="mini" onClick={() => onSet(v + step)} aria-label="More">
              <Icon name="plus" size={12} stroke={2.6} />
            </button>
          </span>
        )}
        <button className="hcheck" onClick={onToggle} aria-label={done ? 'Mark not done' : 'Mark done'}>
          <Icon name="check" size={18} stroke={2.8} />
        </button>
      </div>
    </div>
  )
}

/** "Sat, Sun" or "every day" / "weekdays" for common schedules. */
function daysList(days: boolean[]): string {
  const label = scheduleLabel(days)
  if (label === 'every day' || label === 'weekdays' || label === 'weekends') return label
  return WEEKDAYS.filter((_, i) => days[i]).join(', ')
}
