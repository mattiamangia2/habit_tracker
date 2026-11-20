import { useEffect } from 'react'
import { useStore } from '../store'
import { isDue, valueOf, dayStats } from '../stats'
import { longDate } from '../dates'
import { Icon } from '../icons'

export function DayModal({ date, onClose }: { date: string; onClose: () => void }) {
  const { state, setValue, toggle } = useStore()
  const habits = state.habits.filter((h) => h.createdAt <= date)
  const due = habits.filter((h) => isDue(h, date))
  const extra = habits.filter((h) => !isDue(h, date))
  const { done, due: dueN } = dayStats(state, date)

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])

  const row = (h: (typeof habits)[number], muted: boolean) => {
    const v = valueOf(state, date, h.id)
    const ok = v >= h.target
    return (
      <div key={h.id} className={`day-row ${muted ? 'muted' : ''}`} style={{ ['--c' as string]: h.color }}>
        <span className="tile" style={{ color: h.color }}>
          <Icon name={h.icon} size={16} />
        </span>
        <span className="grow">
          <b>{h.name}</b>
          {muted && <small> · not scheduled</small>}
        </span>
        {h.kind !== 'check' && (
          <span className="stepper sm">
            <button onClick={() => setValue(date, h.id, Math.max(0, v - (h.kind === 'minutes' ? 5 : 1)))} aria-label="Less">
              <Icon name="minus" size={14} />
            </button>
            <span className="mono">
              {v}/{h.target}
            </span>
            <button onClick={() => setValue(date, h.id, v + (h.kind === 'minutes' ? 5 : 1))} aria-label="More">
              <Icon name="plus" size={14} />
            </button>
          </span>
        )}
        <button className={`check ${ok ? 'on' : ''}`} onClick={() => toggle(date, h)} aria-label={ok ? 'Mark not done' : 'Mark done'}>
          <Icon name="check" size={16} stroke={2.6} />
        </button>
      </div>
    )
  }

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={longDate(date)}>
        <div className="modal-head">
          <div>
            <div className="kicker">
              {done} of {dueN} done
            </div>
            <h3>{longDate(date)}</h3>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="x" />
          </button>
        </div>
        {habits.length === 0 && <p className="dim">No habits were being tracked on this day.</p>}
        {due.map((h) => row(h, false))}
        {extra.length > 0 && due.length > 0 && <div className="kicker" style={{ margin: '14px 0 6px' }}>Also</div>}
        {extra.map((h) => row(h, true))}
      </div>
    </div>
  )
}
