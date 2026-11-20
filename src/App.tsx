import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from './store'
import { UICtx, type UI } from './ui'
import type { View } from './types'
import { todayKey } from './dates'
import { dayStats, groupStreak } from './stats'
import { Icon } from './icons'
import { Ring } from './components/Ring'
import { DayModal } from './components/DayModal'
import { Settings } from './components/Settings'
import { Today } from './views/Today'
import { Habits } from './views/Habits'
import { Year } from './views/Year'
import { Insights } from './views/Insights'

const TABS: { id: View; label: string; icon: string }[] = [
  { id: 'today', label: 'Today', icon: 'calendar' },
  { id: 'habits', label: 'Habits', icon: 'sliders' },
  { id: 'year', label: 'Year', icon: 'grid' },
  { id: 'insights', label: 'Insights', icon: 'bars' },
]

function readView(): View {
  const h = location.hash.slice(1)
  return (TABS.find((t) => t.id === h)?.id ?? 'today') as View
}

export default function App() {
  const { state } = useStore()
  const [view, setView] = useState<View>(readView)
  const [today, setToday] = useState(todayKey)
  const [toastMsg, setToastMsg] = useState<{ title: string; detail?: string; n: number } | null>(null)
  const [dayOpen, setDayOpen] = useState<string | null>(null)
  const [settings, setSettings] = useState(false)
  const [newSignal, setNewSignal] = useState(0)
  const toastTimer = useRef<number>()

  // Roll over at midnight.
  useEffect(() => {
    const t = window.setInterval(() => setToday(todayKey()), 30_000)
    return () => window.clearInterval(t)
  }, [])

  useEffect(() => {
    const onHash = () => setView(readView())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const go = useCallback((v: View) => {
    setView(v)
    history.replaceState(null, '', `#${v}`)
    window.scrollTo({ top: 0 })
  }, [])

  const toast = useCallback((title: string, detail?: string) => {
    setToastMsg({ title, detail, n: Date.now() })
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToastMsg(null), 2600)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('input, textarea, select, [contenteditable]') || e.metaKey || e.ctrlKey || e.altKey) return
      if (dayOpen || settings) return
      const i = ['1', '2', '3', '4'].indexOf(e.key)
      if (i >= 0) go(TABS[i].id)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, dayOpen, settings])

  const ui: UI = useMemo(
    () => ({
      today,
      view,
      go,
      toast,
      newHabit: () => {
        go('habits')
        setNewSignal((n) => n + 1)
      },
      openDay: setDayOpen,
    }),
    [today, view, go, toast],
  )

  const t = dayStats(state, today)
  const perfect = useMemo(() => groupStreak(state, state.habits, today), [state, today])
  const initial = (state.name || '?').trim().charAt(0).toUpperCase() || '?'

  return (
    <UICtx.Provider value={ui}>
      <div className="app">
        <header className="topbar">
          <div className="brand">
            <span className="brand-mark">
              <Icon name="check" size={16} stroke={3} />
            </span>
            <span>Dayloop</span>
          </div>
          <nav className="tabs" role="tablist">
            {TABS.map((tab, i) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={view === tab.id}
                className={`tab ${view === tab.id ? 'on' : ''}`}
                onClick={() => go(tab.id)}
                title={`${tab.label} (${i + 1})`}
              >
                <Icon name={tab.icon} size={15} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
          <div className="top-right">
            <button className="pill" onClick={() => go('today')} title="Done today">
              <Ring value={t.due ? t.done / t.due : 0} size={18} stroke={3} color={t.due && t.done === t.due ? 'var(--good)' : 'var(--text)'} />
              <b>
                {t.done}/{t.due}
              </b>
              <span className="dim hide-sm">today</span>
            </button>
            <div className="pill" title="Perfect days in a row">
              <Icon name="flame" size={15} className="flame" />
              <b>{perfect}</b>
              <span className="dim hide-sm">perfect days</span>
            </div>
            <button className="icon-btn round" onClick={() => setSettings(true)} aria-label="Settings">
              <Icon name="settings" size={17} />
            </button>
            <button className="avatar" onClick={() => setSettings(true)} aria-label="Profile">
              {initial}
            </button>
          </div>
        </header>

        <main className="main" key={view}>
          {view === 'today' && <Today />}
          {view === 'habits' && <Habits newSignal={newSignal} />}
          {view === 'year' && <Year />}
          {view === 'insights' && <Insights />}
        </main>

        <footer className="footbar">
          <div className="keys hide-sm">
            <kbd>←</kbd>
            <kbd>→</kbd> move <kbd>↵</kbd> check <kbd>1</kbd>–<kbd>4</kbd> views
          </div>
          <div className="dim">
            {state.isSample ? (
              <>
                Sample year of a made-up person.{' '}
                <button className="link" onClick={() => setSettings(true)}>
                  Start your own
                </button>
              </>
            ) : (
              'Saved in this browser'
            )}
          </div>
        </footer>

        {toastMsg && (
          <div className="toast" key={toastMsg.n}>
            <span className="toast-check">
              <Icon name="check" size={14} stroke={3} />
            </span>
            <b>{toastMsg.title}</b>
            {toastMsg.detail && <span className="dim">{toastMsg.detail}</span>}
          </div>
        )}
        {dayOpen && <DayModal date={dayOpen} onClose={() => setDayOpen(null)} />}
        {settings && <Settings onClose={() => setSettings(false)} />}
      </div>
    </UICtx.Provider>
  )
}
