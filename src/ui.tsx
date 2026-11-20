import { createContext, useContext } from 'react'
import type { View } from './types'

export interface UI {
  today: string
  view: View
  go: (v: View) => void
  toast: (title: string, detail?: string) => void
  /** Open the Habits view with the form ready for a new habit. */
  newHabit: () => void
  /** Open a past day to correct it. */
  openDay: (d: string) => void
}

export const UICtx = createContext<UI | null>(null)

export function useUI(): UI {
  const u = useContext(UICtx)
  if (!u) throw new Error('useUI outside provider')
  return u
}
