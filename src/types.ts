export type HabitKind = 'check' | 'count' | 'minutes'
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'any'

export interface Habit {
  id: string
  name: string
  icon: string
  color: string
  kind: HabitKind
  /** Value needed for the day to count as done. 1 for yes/no habits. */
  target: number
  /** Unit label for count habits, e.g. "glasses". */
  unit?: string
  time: TimeOfDay
  /** Scheduled weekdays, Monday first. */
  days: boolean[]
  /** YYYY-MM-DD the habit started being tracked. */
  createdAt: string
}

/** date key -> habit id -> value logged that day */
export type Logs = Record<string, Record<string, number>>

export interface AppState {
  version: 1
  name: string
  habits: Habit[]
  logs: Logs
  isSample: boolean
}

export type View = 'today' | 'habits' | 'year' | 'insights'
