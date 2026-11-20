import { useRef, useState } from 'react'
import { useStore, isValidState } from '../store'
import { Icon } from '../icons'
import { todayKey } from '../dates'

export function Settings({ onClose }: { onClose: () => void }) {
  const { state, setName, replace, startFresh, loadSample } = useStore()
  const [name, setLocal] = useState(state.name)
  const [msg, setMsg] = useState('')
  const file = useRef<HTMLInputElement>(null)

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `streakwall-${todayKey()}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const importData = async (f: File) => {
    try {
      const data = JSON.parse(await f.text())
      if (!isValidState(data)) throw new Error('bad')
      replace({ ...data, isSample: false })
      setMsg('Imported.')
    } catch {
      setMsg('That file is not a Streakwall backup.')
    }
  }

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Settings">
        <div className="modal-head">
          <h3>Settings</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="x" />
          </button>
        </div>

        <label className="field">
          <span className="kicker">Your name</span>
          <input
            className="input"
            value={name}
            placeholder="What should we call you?"
            onChange={(e) => setLocal(e.target.value)}
            onBlur={() => setName(name.trim())}
          />
        </label>

        <div className="kicker" style={{ marginTop: 18 }}>Your data</div>
        <p className="dim small">Everything is stored in this browser only. Export a backup now and then.</p>
        <div className="btn-row">
          <button className="btn" onClick={exportData}>
            <Icon name="download" size={16} /> Export backup
          </button>
          <button className="btn" onClick={() => file.current?.click()}>
            <Icon name="upload" size={16} /> Import backup
          </button>
          <input ref={file} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])} />
        </div>

        <div className="kicker" style={{ marginTop: 18 }}>Start over</div>
        <div className="btn-row">
          <button
            className="btn danger"
            onClick={() => {
              if (confirm(state.isSample ? 'Clear the sample data and start with no habits?' : 'Delete all your habits and history? This cannot be undone.')) {
                startFresh()
                onClose()
              }
            }}
          >
            <Icon name="trash" size={16} /> {state.isSample ? 'Clear sample, start fresh' : 'Delete everything'}
          </button>
          <button
            className="btn"
            onClick={() => {
              if (state.isSample || confirm('Replace your data with the sample year?')) {
                loadSample()
                onClose()
              }
            }}
          >
            Load sample year
          </button>
        </div>
        {msg && <p className="small" style={{ marginTop: 12 }}>{msg}</p>}
      </div>
    </div>
  )
}
