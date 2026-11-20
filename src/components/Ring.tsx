/** Progress ring. `value` 0..1. */
export function Ring({ value, size = 22, stroke = 3, color = 'var(--accent)', track = 'var(--line-2)' }: {
  value: number
  size?: number
  stroke?: number
  color?: string
  track?: string
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flex: 'none' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${c * Math.max(0, Math.min(1, value))} ${c}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dasharray .5s ease' }}
      />
    </svg>
  )
}

/** Ring split into one segment per item, each lit in its own colour when done. */
export function SegmentRing({ items, size = 190, stroke = 14 }: { items: { color: string; done: boolean }[]; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const n = Math.max(items.length, 1)
  const gap = items.length > 1 ? Math.min(14, c / n / 3) : 0
  const seg = c / n - gap
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="seg-ring">
      {items.length === 0 && <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line-2)" strokeWidth={stroke} />}
      {items.map((it, i) => (
        <circle
          key={i}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={it.done ? it.color : 'var(--line-2)'}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${Math.max(seg, 0.01)} ${c}`}
          strokeDashoffset={-(i * (c / n)) - gap / 2}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke .35s ease', filter: it.done ? `drop-shadow(0 0 6px ${it.color}66)` : undefined }}
        />
      ))}
    </svg>
  )
}
