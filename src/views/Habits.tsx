import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../store'
import { useUI } from '../ui'
import type { Habit, HabitKind, TimeOfDay } from '../types'
import { addDays, monthYear, shortDate, WEEKDAY_LETTERS, WEEKDAYS } from '../dates'
import { amountLabel, habitStreak, isDue, rangeStats, valueOf } from '../stats'
import { HABIT_ICONS, Icon } from '../icons'

export const COLORS = ['#ff7a59', '#f9d65c', '#d4f75c', '#6eeab9', '#7cc8fb', '#a78bfa', '#ff79b0', '#ece4d4']

const IDEAS: { name: string; icon: string; kind?: HabitKind; target?: number; unit?: string }[] = [
  { name: 'Stretch', icon: 'stretch', kind: 'minutes', target: 10 },
  { name: 'Walk 8,000 steps', icon: 'walk' },
  { name: 'No phone in bed', icon: 'noPhone' },
  { name: 'Strength training', icon: 'dumbbell' },
  { name: 'Eat a vegetable', icon: 'leaf' },
  { name: 'Practise guitar', icon: 'guitar', kind: 'minutes', target: 20 },
]

const TIMES: { id: TimeOfDay; label: string }[] = [
  { id: 'morning', label: 'Morning' },
  { id: 'afternoon', label: 'Afternoon' },
  { id: 'evening', label: 'Evening' },
  { id: 'any', label: 'Any time' },
]

type Draft = Omit<Habit, 'id' | 'createdAt'>

const blank = (): Draft => ({
  name: '',
  icon: 'sparkle',
  color: '#d4f75c',
  kind: 'check',
  target: 1,
  unit: '',
  time: 'any',
  days: [true, true, true, true, true, true, true],
})

export function Habits({ newSignal }: { newSignal: number }) {
  const { state, addHabit, updateHabit, deleteHabit, moveHabit } = useStore()
  const { today, toast } = useUI()
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft>(blank)
  const [flash, setFlash] = useState<string | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const [overIdx, setOverIdx] = useState<number | null>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLElement>(null)

  const focusForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    setTimeout(() => nameRef.current?.focus({ preventScroll: true }), 50)
  }

  useEffect(() => {
    if (newSignal) {
      setEditing(null)
      setDraft(blank())
      focusForm()
    }
  }, [newSignal])

  const dueToday = state.habits.filter((h) => isDue(h, today)).length
  const from30 = addDays(today, -29)

  const rows = useMemo(
    () =>
      state.habits.map((h) => {
        const r = rangeStats(state, from30 < h.createdAt ? h.createdAt : from30, today, [h])
        return { h, rate: r.rate, streak: habitStreak(state, h, today) }
      }),
    [state, today, from30],
  )

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }))

  const setKind = (kind: HabitKind) =>
    setDraft((d) => ({ ...d, kind, target: kind === 'check' ? 1 : kind === 'minutes' ? Math.max(5, d.target === 1 ? 10 : d.target) : Math.max(2, d.target === 1 ? 8 : d.target) }))

  const step = draft.kind === 'minutes' ? 5 : 1

  const edit = (h: Habit) => {
    setEditing(h.id)
    setDraft({ name: h.name, icon: h.icon, color: h.color, kind: h.kind, target: h.target, unit: h.unit ?? '', time: h.time, days: [...h.days] })
    focusForm()
  }

  const submit = () => {
    const name = draft.name.trim()
    if (!name) {
      nameRef.current?.focus()
      return
    }
    if (!draft.days.some(Boolean)) return
    const clean = { ...draft, name, target: draft.kind === 'check' ? 1 : Math.max(1, draft.target) }
    if (editing) {
      const old = state.habits.find((h) => h.id === editing)!
      updateHabit({ ...old, ...clean })
      toast('Habit saved')
      setFlash(editing)
    } else {
      const id = `h-${Date.now().toString(36)}`
      addHabit({ ...clean, id, createdAt: today })
      toast('Habit added', `${name} starts today`)
      setFlash(id)
    }
    setEditing(null)
    setDraft(blank())
    setTimeout(() => setFlash(null), 1600)
  }

  const remove = () => {
    if (!editing) return
    const h = state.habits.find((x) => x.id === editing)
    if (h && confirm(`Delete “${h.name}” and all of its history?`)) {
      deleteHabit(h.id)
      setEditing(null)
      setDraft(blank())
      toast('Habit deleted')
    }
  }

  return (
    <div className="layout">
      <section className="panel">
        <div className="row-between head">
          <div>
            <div className="kicker">
              {state.habits.length} habits · {dueToday} due today
            </div>
            <h1 className="title">Habits</h1>
          </div>
          <button
            className="btn ghost"
            onClick={() => {
              setEditing(null)
              setDraft(blank())
              focusForm()
            }}
          >
            <Icon name="plus" size={15} /> New habit
          </button>
        </div>

        <div className="htable">
          <div className="hrow hhead kicker">
            <span />
            <span>Habit</span>
            <span className="hide-md">Days</span>
            <span className="hide-sm">Last 30 days</span>
            <span className="r">Rate</span>
            <span className="r">Streak</span>
          </div>
          {state.habits.length === 0 && <p className="dim" style={{ padding: '24px 8px' }}>No habits yet. Add one with the form.</p>}
          {rows.map(({ h, rate, streak }, idx) => (
            <div
              key={h.id}
              className={`hrow ${editing === h.id ? 'editing' : ''} ${flash === h.id ? 'flash' : ''} ${dragId === h.id ? 'dragging' : ''} ${overIdx === idx && dragId !== h.id ? 'over' : ''}`}
              style={{ ['--c' as string]: h.color }}
              onClick={() => edit(h)}
              onDragOver={(e) => {
                if (!dragId) return
                e.preventDefault()
                setOverIdx(idx)
              }}
              onDrop={(e) => {
                e.preventDefault()
                if (dragId) moveHabit(dragId, idx)
                setDragId(null)
                setOverIdx(null)
              }}
            >
              <span
                className="drag"
                draggable
                onClick={(e) => e.stopPropagation()}
                onDragStart={(e) => {
                  setDragId(h.id)
                  e.dataTransfer.effectAllowed = 'move'
                }}
                onDragEnd={() => {
                  setDragId(null)
                  setOverIdx(null)
                }}
                title="Drag to reorder"
              >
                <Icon name="drag" size={16} />
              </span>
              <span className="hname">
                <span className="tile" style={{ color: h.color }}>
                  <Icon name={h.icon} size={17} />
                </span>
                <span>
                  <b>{h.name}</b>
                  <small className="dim">
                    {amountLabel(h)} · {h.time === 'any' ? 'any time' : h.time} · since {h.createdAt === today ? 'today' : h.createdAt.slice(0, 4) === today.slice(0, 4) ? shortDate(h.createdAt) : monthYear(h.createdAt)}
                  </small>
                </span>
              </span>
              <span className="days hide-md">
                {WEEKDAY_LETTERS.map((l, i) => (
                  <i key={i} className={h.days[i] ? 'on' : ''} title={WEEKDAYS[i]}>
                    {h.days[i] ? <Icon name="check" size={9} stroke={3.5} /> : l}
                  </i>
                ))}
              </span>
              <span className="spark hide-sm" aria-hidden="true">
                {Array.from({ length: 30 }, (_, i) => {
                  const d = addDays(from30, i)
                  if (!isDue(h, d)) return <i key={i} className="off" />
                  const ok = valueOf(state, d, h.id) >= h.target
                  return <i key={i} className={ok ? 'ok' : d === today ? 'pending' : 'miss'} />
                })}
              </span>
              <span className="r num">
                {rate == null ? '–' : Math.round(rate * 100)}
                <small>%</small>
              </span>
              <span className="r num">
                <Icon name="flame" size={13} className="flame" /> {streak}
              </span>
            </div>
          ))}
        </div>
      </section>

      <aside className="side" ref={formRef}>
        <div className="panel form">
          <div className="row-between">
            <h2 className="h2">{editing ? 'Edit habit' : 'New habit'}</h2>
            {editing && (
              <button
                className="link"
                onClick={() => {
                  setEditing(null)
                  setDraft(blank())
                }}
              >
                Cancel
              </button>
            )}
          </div>

          <div className="form-top">
            <div className="preview" style={{ ['--c' as string]: draft.color }}>
              <span className="hcard-icon">
                <Icon name={draft.icon} size={18} />
              </span>
              <div className="dashes">
                {Array.from({ length: 8 }, (_, i) => (
                  <i key={i} />
                ))}
              </div>
              <div className="hcard-meta">
                {draft.time === 'any' ? 'Any time' : draft.time} · {draft.kind === 'check' ? 'once' : `${draft.target} ${draft.kind === 'minutes' ? 'min' : draft.unit || 'times'}`}
              </div>
              <div className="hcard-name">{draft.name || 'New habit'}</div>
              <div className="hcard-foot">
                <span className="hcard-state">Done</span>
                <span className="hcheck">
                  <Icon name="check" size={18} stroke={2.8} />
                </span>
              </div>
            </div>

            <div className="form-fields">
              <input
                ref={nameRef}
                className="input"
                placeholder="Name it…"
                value={draft.name}
                maxLength={40}
                onChange={(e) => set('name', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
              />
              <div className="seg">
                {(['check', 'count', 'minutes'] as HabitKind[]).map((k) => (
                  <button key={k} className={draft.kind === k ? 'on' : ''} onClick={() => setKind(k)}>
                    {k === 'check' ? 'Yes/No' : k === 'count' ? 'Count' : 'Minutes'}
                  </button>
                ))}
              </div>
              {draft.kind !== 'check' && (
                <div className="stepper">
                  <button onClick={() => set('target', Math.max(step, draft.target - step))} aria-label="Less">
                    <Icon name="minus" size={14} />
                  </button>
                  <span className="num">{draft.target}</span>
                  <button onClick={() => set('target', draft.target + step)} aria-label="More">
                    <Icon name="plus" size={14} />
                  </button>
                  {draft.kind === 'count' ? (
                    <input className="unit" placeholder="unit" value={draft.unit} maxLength={14} onChange={(e) => set('unit', e.target.value)} />
                  ) : (
                    <span className="dim small">min</span>
                  )}
                </div>
              )}
              <div className="seg wrap">
                {TIMES.map((t) => (
                  <button key={t.id} className={draft.time === t.id ? 'on' : ''} onClick={() => set('time', t.id)}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {!editing && (
            <>
              <div className="kicker">Ideas</div>
              <div className="ideas">
                {IDEAS.map((i) => (
                  <button
                    key={i.name}
                    className="idea"
                    onClick={() =>
                      setDraft((d) => ({ ...d, name: i.name, icon: i.icon, kind: i.kind ?? 'check', target: i.target ?? 1, unit: i.unit ?? '' }))
                    }
                  >
                    <Icon name={i.icon} size={13} /> {i.name}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="kicker">Icon</div>
          <div className="icon-grid">
            {HABIT_ICONS.map((ic) => (
              <button key={ic} className={draft.icon === ic ? 'on' : ''} onClick={() => set('icon', ic)} aria-label={ic}>
                <Icon name={ic} size={16} />
              </button>
            ))}
          </div>

          <div className="kicker">Colour</div>
          <div className="swatches">
            {COLORS.map((c) => (
              <button key={c} className={draft.color === c ? 'on' : ''} style={{ background: c }} onClick={() => set('color', c)} aria-label={`Colour ${c}`} />
            ))}
          </div>

          <div className="row-between">
            <span className="kicker">Days</span>
            <span className="presets">
              <button className="link" onClick={() => set('days', [true, true, true, true, true, true, true])}>Every day</button>
              <button className="link" onClick={() => set('days', [true, true, true, true, true, false, false])}>Weekdays</button>
              <button className="link" onClick={() => set('days', [false, false, false, false, false, true, true])}>Weekends</button>
            </span>
          </div>
          <div className="day-toggles">
            {WEEKDAYS.map((d, i) => (
              <button
                key={d}
                className={draft.days[i] ? 'on' : ''}
                onClick={() => set('days', draft.days.map((x, j) => (j === i ? !x : x)))}
              >
                {d}
              </button>
            ))}
          </div>

          <button className="btn primary block" onClick={submit} disabled={!draft.name.trim() || !draft.days.some(Boolean)}>
            {editing ? 'Save changes' : 'Add habit'}
          </button>
          {editing && (
            <button className="btn danger block" onClick={remove}>
              <Icon name="trash" size={15} /> Delete habit
            </button>
          )}
        </div>
      </aside>
    </div>
  )
}
