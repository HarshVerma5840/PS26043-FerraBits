import React, { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { evaluationAdminApi, EvaluationCycle } from '../api/evaluationAdminApi'
import { History } from 'lucide-react'

export default function EvaluationCycleOverview() {
  const { cycle } = useOutletContext<{ cycle: EvaluationCycle }>()
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    evaluationAdminApi.getHistory(cycle.cycleId)
      .then(res => setHistory(res))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [cycle.cycleId])

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <History size={20} color="var(--primary)" /> Lifecycle History
      </h2>
      
      {error && <div style={{ color: 'var(--accent)' }}>{error}</div>}
      
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {history.map((h, i) => (
            <div key={h.historyId} style={{ display: 'flex', gap: '1rem', borderLeft: '2px solid var(--glass-border)', paddingLeft: '1.5rem', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-5px', top: '5px', width: '8px', height: '8px', borderRadius: '50%', background: i === history.length - 1 ? 'var(--primary)' : 'var(--glass-border)' }}></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{h.status}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{new Date(h.changedAt).toLocaleString()} by Actor {h.actorId.substring(0,8)}...</div>
                {h.auditData && Object.keys(h.auditData).length > 0 && (
                  <pre style={{ background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.8rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                    {JSON.stringify(h.auditData, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
