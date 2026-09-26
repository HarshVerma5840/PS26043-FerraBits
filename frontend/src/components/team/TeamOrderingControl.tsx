import React from 'react'
import { ArrowUp, ArrowDown, GripVertical } from 'lucide-react'
import { TeamMember } from '../../types'

interface Props {
  members: TeamMember[]
  onChange: (reordered: TeamMember[]) => void
}

export default function TeamOrderingControl({ members, onChange }: Props) {
  const move = (index: number, dir: -1 | 1) => {
    const next = [...members]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next.map((m, i) => ({ ...m, orderIndex: i })))
  }

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Member Order
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {members.map((m, i) => (
          <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}>
            <GripVertical size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: '0.9rem' }}>{m.name}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>#{i + 1}</span>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button
                onClick={() => move(i, -1)}
                disabled={i === 0}
                style={{ background: 'none', border: 'none', color: i === 0 ? 'var(--glass-border)' : 'var(--text-muted)', cursor: i === 0 ? 'default' : 'pointer', padding: '0.2rem' }}
              >
                <ArrowUp size={14} />
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={i === members.length - 1}
                style={{ background: 'none', border: 'none', color: i === members.length - 1 ? 'var(--glass-border)' : 'var(--text-muted)', cursor: i === members.length - 1 ? 'default' : 'pointer', padding: '0.2rem' }}
              >
                <ArrowDown size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: '0.75rem 0 0' }}>
        Ordering is local-only. The backend does not persist member order.
      </p>
    </div>
  )
}
