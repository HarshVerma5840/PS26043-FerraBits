import React, { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { codejudgeApi, CodeJudgeEvaluation, CodeJudgeScore } from '../api/codejudgeApi'
import { BarChart2, CheckCircle, XCircle } from 'lucide-react'

export default function CodeJudgeScorePage() {
  const { evaluation } = useOutletContext<{ evaluation: CodeJudgeEvaluation }>()
  const [score, setScore] = useState<CodeJudgeScore | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    codejudgeApi.getScore(evaluation.evaluationId)
      .then(res => setScore(res))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [evaluation.evaluationId])

  if (loading) return <div>Loading...</div>
  if (error || !score) return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Score not yet available ({error}). Pipeline may still be running.</div>

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        <BarChart2 size={24} color="var(--secondary)" /> Deterministic Score
      </h2>

      <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginBottom: '2rem' }}>
        <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Weighted Score</div>
        <div style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--secondary)', lineHeight: 1 }}>{score.totalScore.toFixed(2)}</div>
      </div>

      <h3>Category Breakdown</h3>
      <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
            <th style={{ padding: '1rem' }}>Category</th>
            <th style={{ padding: '1rem' }}>Status</th>
            <th style={{ padding: '1rem' }}>Score</th>
            <th style={{ padding: '1rem' }}>Reason</th>
          </tr>
        </thead>
        <tbody>
          {score.categoryBreakdown.map(c => (
            <tr key={c.categoryKey} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '1rem', fontWeight: 600 }}>{c.name}</td>
              <td style={{ padding: '1rem' }}>
                {c.status === 'SCORED' ? (
                  <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle size={14}/> Scored</span>
                ) : (
                  <span style={{ color: '#f43f5e', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><XCircle size={14}/> {c.status}</span>
                )}
              </td>
              <td style={{ padding: '1rem', fontWeight: 600 }}>
                {c.awardedScore} <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.85rem' }}>/ {c.maxScore}</span>
              </td>
              <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{c.reason || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
