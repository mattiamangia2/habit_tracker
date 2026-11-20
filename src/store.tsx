import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AppState, Habit } from './types'
import { emptyState, sampleState } from './sample'

const KEY = 'dayloop:v1'
/** Earlier name of the app; data saved under it is moved over on first load. */
const OLD_KEYS = ['streakwall:v1']

/** Old neon habit colours -> their sunset equivalents. */
const COLOR_MAP: Record<string, string> = {
  '#f9d65c': '#f2b54a',
  '#a78bfa': '#9b6bd6',
  '#ece4d4': '#e0c9a6',
  '#ff7a59': '#d65a3a',
  '#7cc8fb': '#5aa9c9',
  '#ff79b0': '#e86a8a',
  '#d4f75c': '#8fbf8a',
  '#6eeab9': '#ff8a5c',
}

function migrate(s: AppState): AppState {
  return { ...s, habits: s.habits.map((h) => ({ ...h, color: COLOR_MAP[h.color.toLowerCase()] ?? h.color })) }
}

export function isValidState(x: unknown): x is AppState {
  const s = x as AppState
  return !!s && s.version === 1 && Array.isArray(s.habits) && typeof s.logs === 'object'
}

function load(): AppState {
  try {
    for (const k of [KEY, ...OLD_KEYS]) {
      const raw = localStorage.getItem(k)
      if (!raw) continue
      const parsed = JSON.parse(raw) as AppState
      if (isValidState(parsed)) return migrate(parsed)
    }
  } catch {
    /* storage unavailable: fall through to sample */
  }
  return sampleState()
}

interface Store {
  state: AppState
  setValue: (date: string, habitId: string, value: number) => void
  toggle: (date: string, habit: Habit) => void
  addHabit: (h: Habit) => void
  updateHabit: (h: Habit) => void
  deleteHabit: (id: string) => void
  moveHabit: (id: string, toIndex: number) => void
  setName: (name: string) => void
  replace: (s: AppState) => void
  startFresh: () => void
  loadSample: () => void
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* ignore quota / private mode */
    }
  }, [state])

  const setValue = useCallback((date: string, habitId: string, value: number) => {
    setState((s) => {
      const day = { ...(s.logs[date] ?? {}) }
      if (value > 0) day[habitId] = value
      else delete day[habitId]
      const logs = { ...s.logs }
      if (Object.keys(day).length) logs[date] = day
      else delete logs[date]
      return { ...s, logs }
    })
  }, [])

  const toggle = useCallback(
    (date: string, habit: Habit) => {
      const cur = state.logs[date]?.[habit.id] ?? 0
      setValue(date, habit.id, cur >= habit.target ? 0 : habit.target)
    },
    [state.logs, setValue],
  )

  const store: Store = useMemo(
    () => ({
      state,
      setValue,
      toggle,
      addHabit: (h) => setState((s) => ({ ...s, habits: [...s.habits, h] })),
      updateHabit: (h) => setState((s) => ({ ...s, habits: s.habits.map((x) => (x.id === h.id ? h : x)) })),
      deleteHabit: (id) =>
        setState((s) => {
          const logs: AppState['logs'] = {}
          for (const [d, day] of Object.entries(s.logs)) {
            const { [id]: _removed, ...rest } = day
            if (Object.keys(rest).length) logs[d] = rest
          }
          return { ...s, habits: s.habits.filter((h) => h.id !== id), logs }
        }),
      moveHabit: (id, toIndex) =>
        setState((s) => {
          const list = [...s.habits]
          const from = list.findIndex((h) => h.id === id)
          if (from < 0) return s
          const [h] = list.splice(from, 1)
          list.splice(Math.max(0, Math.min(list.length, toIndex)), 0, h)
          return { ...s, habits: list }
        }),
      setName: (name) => setState((s) => ({ ...s, name })),
      replace: (s) => setState(migrate(s)),
      startFresh: () => setState((s) => emptyState(s.isSample ? '' : s.name)),
      loadSample: () => setState(sampleState()),
    }),
    [state, setValue, toggle],
  )

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

export function useStore(): Store {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore outside provider')
  return s
}
