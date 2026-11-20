import type { ReactNode } from 'react'

/** Simple 24×24 stroke icons. Each entry is the inner SVG markup. */
const P: Record<string, ReactNode> = {
  sunrise: (<><path d="M3 18h18M7 18a5 5 0 0110 0" /><path d="M12 3v6M9 6l3-3 3 3M4.5 11.5l1.4 1.4M19.5 11.5l-1.4 1.4" /></>),
  sun: (<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>),
  moon: <path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z" />,
  lotus: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v10M8.5 10c0 2 1.5 3.5 3.5 3.5s3.5-1.5 3.5-3.5" /></>),
  pulse: <path d="M3 12h4l2-6 4 12 2-6h6" />,
  run: (<><path d="M5 20l4-4 1-4 4 2v5" /><path d="M10 12l2-5 4 2 3-1" /><circle cx="15" cy="4" r="1.6" /></>),
  walk: (<><circle cx="13" cy="4" r="1.6" /><path d="M9 21l2-6 3 3v3M11 15l1-6 3 3h3M12 9l-3 2-1 4" /></>),
  drop: (<><path d="M12 3s6 6.5 6 11a6 6 0 01-12 0c0-4.5 6-11 6-11z" /><path d="M9 14.5a3 3 0 003 3" /></>),
  language: (<><path d="M4 5h9M8.5 3v2M6 5c0 4 3 7 6 8M11 5c0 4-3 7-7 9" /><path d="M13 21l4-9 4 9M14.5 18h5" /></>),
  book: (<><path d="M3 5a2 2 0 012-2h5a2 2 0 012 2v16a2 2 0 00-2-2H3z" /><path d="M21 5a2 2 0 00-2-2h-5a2 2 0 00-2 2v16a2 2 0 012-2h7z" /></>),
  pen: (<><path d="M4 20h4L19 9a2.8 2.8 0 00-4-4L4 16z" /><path d="M13.5 6.5l4 4" /></>),
  mountain: (<><path d="M3 20l6-10 4 6 3-4 5 8z" /><path d="M7.5 12.5L9 14l1.5-1.5" /></>),
  dumbbell: (<><path d="M6 7v10M18 7v10M3 9.5v5M21 9.5v5M6 12h12" /></>),
  leaf: (<><path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15z" /><path d="M5 19l8-8" /></>),
  apple: (<><path d="M12 7c-2-1.5-6-1-7 3s1 10 4 10c1.2 0 2-.6 3-.6s1.8.6 3 .6c3 0 5-6 4-10s-5-4.5-7-3z" /><path d="M12 7c0-2 1-4 3-4" /></>),
  coffee: (<><path d="M4 9h13v5a5 5 0 01-5 5H9a5 5 0 01-5-5z" /><path d="M17 10h1.5a2.5 2.5 0 010 5H17M8 3v3M12 3v3" /></>),
  bed: (<><path d="M3 18V6M3 14h18v4M21 14v-2a3 3 0 00-3-3h-7v5" /><circle cx="7" cy="11" r="1.6" /></>),
  phone: (<><rect x="7" y="2" width="10" height="20" rx="2.5" /><path d="M11 18h2" /></>),
  noPhone: (<><rect x="7" y="2" width="10" height="20" rx="2.5" /><path d="M3 3l18 18" /></>),
  music: (<><path d="M9 18V5l11-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" /></>),
  guitar: (<><path d="M14 10l6-6M18 2l4 4" /><path d="M11 8.5c-1.5-1-4-1-5.5.5S4 13 2.5 14.5s0 5 1.5 6.5 5 3 6.5 1.5S14 18 15 16.5s.5-4-.5-5.5" /><circle cx="9" cy="15" r="1.5" /></>),
  code: <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" />,
  heart: <path d="M12 20s-8-4.5-8-10.5A4.5 4.5 0 0112 7a4.5 4.5 0 018 2.5C20 15.5 12 20 12 20z" />,
  brain: (<><path d="M9 4a3 3 0 00-3 3 3 3 0 00-2 5 3 3 0 002 5 3 3 0 006 1V5a2 2 0 00-3-1z" /><path d="M15 4a3 3 0 013 3 3 3 0 012 5 3 3 0 01-2 5 3 3 0 01-6 1" /></>),
  bike: (<><circle cx="5.5" cy="16.5" r="3.5" /><circle cx="18.5" cy="16.5" r="3.5" /><path d="M5.5 16.5L9 9h6l3.5 7.5M9 9l3 7.5h-6.5M14 5h2l-1 4" /></>),
  swim: (<><path d="M2 18c2 0 2-1.5 4-1.5S8 18 10 18s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5" /><path d="M6 13l5-5 3 3 3-1" /><circle cx="17" cy="6" r="1.6" /></>),
  pill: (<><rect x="3" y="9" width="18" height="6" rx="3" transform="rotate(-45 12 12)" /><path d="M9.5 9.5l5 5" /></>),
  broom: (<><path d="M14 4l6 6M17 7L9 15" /><path d="M9 15l-5 1 2 4 4 1 1-5z" /></>),
  money: (<><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6 9v.01M18 15v.01" /></>),
  plant: (<><path d="M12 21v-9M12 12c0-4-3-6-7-6 0 4 3 6 7 6zM12 14c0-3 2.5-5 6-5 0 3-2.5 5-6 5z" /><path d="M7 21h10" /></>),
  sparkle: (<><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" /></>),
  stretch: (<><circle cx="12" cy="4" r="1.6" /><path d="M4 8l8 2 8-2M12 10v5l-3 6M12 15l3 6" /></>),
  // ui
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  flame: <path d="M12 21c4 0 7-2.7 7-6.8 0-3.2-2-5.7-4-7.7-.3 2-1.2 3.3-2.5 4C12.8 7 11 4.5 8.5 3c.4 3.2-1.3 5-2.6 6.8A7 7 0 005 14.2C5 18.3 8 21 12 21z" />,
  calendar: (<><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" /></>),
  sliders: (<><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></>),
  grid: (<><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M3 9h18M3 15h18M9 3v18M15 3v18" /></>),
  bars: <path d="M5 20V12M10 20V5M15 20v-9M20 20v-4" />,
  chevronLeft: <path d="M15 5l-7 7 7 7" />,
  chevronRight: <path d="M9 5l7 7-7 7" />,
  play: <path d="M7 4l13 8-13 8z" />,
  pause: <path d="M8 5v14M16 5v14" />,
  settings: (<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" /></>),
  drag: (<><circle cx="9" cy="6" r=".8" /><circle cx="15" cy="6" r=".8" /><circle cx="9" cy="12" r=".8" /><circle cx="15" cy="12" r=".8" /><circle cx="9" cy="18" r=".8" /><circle cx="15" cy="18" r=".8" /></>),
  lock: (<><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></>),
  star: <path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z" />,
  trophy: (<><path d="M8 4h8v5a4 4 0 01-8 0z" /><path d="M8 6H5a3 3 0 003 4M16 6h3a3 3 0 01-3 4M12 13v4M8 21h8M9 17h6" /></>),
  trend: <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />,
  trendDown: <path d="M3 7l6 6 4-4 8 8M15 17h6v-6" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  edit: <path d="M4 20h4L19 9a2.8 2.8 0 00-4-4L4 16z" />,
  trash: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />,
  download: <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />,
  upload: <path d="M12 20V9M7 14l5-5 5 5M5 4h14" />,
  logo: (<><rect x="3" y="3" width="18" height="18" rx="5" /><path d="M8 12.5l3 3 5-6" /></>),
}

/** Icons people can pick for a habit. */
export const HABIT_ICONS = [
  'sunrise', 'sun', 'moon', 'lotus', 'pulse', 'run', 'walk', 'drop', 'language', 'book',
  'pen', 'mountain', 'dumbbell', 'leaf', 'apple', 'coffee', 'bed', 'noPhone', 'music', 'guitar',
  'code', 'heart', 'brain', 'bike', 'swim', 'pill', 'broom', 'money', 'plant', 'sparkle', 'stretch', 'star',
]

export function Icon({ name, size = 18, stroke = 2, className }: { name: string; size?: number; stroke?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {P[name] ?? P.sparkle}
    </svg>
  )
}
