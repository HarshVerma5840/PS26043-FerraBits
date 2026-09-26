import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useOutletContext } from 'react-router-dom'
import { evaluationAdminApi, EvaluationCycle, AggregationResponse } from '../api/evaluationAdminApi'
import { BarChart2, RefreshCw } from 'lucide-react'

export default function AggregationPage() {
  const { cycle, refreshCycle } = useOutletContext<{ cycle: EvaluationCycle, refreshCycle: () => void }>()
  const [data, setData] = useState<AggregationResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    fetchData()
  }, [cycle.cycleId])

  const fetchData = () => {
    setLoading(true)
    evaluationAdminApi.getAggregation(cycle.cycleId)
      .then(res => setData(res))
      .catch(() => setData(null)) // 404 is fine if not aggregated yet
      .finally(() => setLoading(false))
  }

  const handleAggregate = async () => {
    setRunning(true)
    try {
      const res = await evaluationAdminApi.aggregateScores(cycle.cycleId)
      setData(res)
      refreshCycle()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart2 size={20} color="var(--secondary)" /> Aggregation
        </h2>
        <button onClick={handleAggregate} disabled={running} className="btn btn-secondary">
          <RefreshCw size={16} /> Force Aggregate
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : !data ? (
        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
          Scores have not been aggregated yet.
        </div>
      ) : (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Final Score (0-100)</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--secondary)' }}>{data.finalScore.toFixed(2)}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Impact Level</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#8b5cf6' }}>{data.impactLevel}</div>
            </div>
            {data.reviewRequired && (
              <div style={{ background: 'rgba(244,63,94,0.1)', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--accent)' }}>
                <div style={{ color: 'var(--accent)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Disagreement Flagged</div>
                <div style={{ fontSize: '1rem' }}>{data.reviewReason}</div>
              </div>
            )}
          </div>

          <h3>Pool Breakdown</h3>
          <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '1rem' }}>Pool</th>
                <th style={{ padding: '1rem' }}>Present</th>
                <th style={{ padding: '1rem' }}>Raw Score</th>
                <th style={{ padding: '1rem' }}>Norm (0-100)</th>
                <th style={{ padding: '1rem' }}>Weight</th>
              </tr>
            </thead>
            <tbody>
              {data.pools.map(p => (
                <tr key={p.pool} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{p.pool}</td>
                  <td style={{ padding: '1rem' }}>
                    {p.present ? <span style={{ color: '#10b981' }}>Yes</span> : <span style={{ color: '#f43f5e' }}>No ({p.reason})</span>}
                  </td>
                  <td style={{ padding: '1rem' }}>{p.rawScore ?? '-'}</td>
                  <td style={{ padding: '1rem' }}>{p.normalizedScore ? p.normalizedScore.toFixed(2) : '-'}</td>
                  <td style={{ padding: '1rem' }}>{p.effectiveWeight ? (p.effectiveWeight * 100).toFixed(1) + '%' : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
