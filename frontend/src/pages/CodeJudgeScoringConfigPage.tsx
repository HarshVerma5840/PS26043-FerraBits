import React, { useEffect, useState } from 'react'
import { codejudgeApi } from '../api/codejudgeApi'
import { Sliders, CheckCircle, XCircle } from 'lucide-react'

export default function CodeJudgeScoringConfigPage() {
  const [config, setConfig] = useState<{ categories: any[], policies: any[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    codejudgeApi.getScoringConfig()
      .then(res => setConfig(res))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading...</div>
  if (error || !config) return <div style={{ color: 'red', padding: '2rem' }}>{error}</div>

  return (
    <div className="main-content">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Sliders size={32} color="var(--secondary)" />
        <div>
          <h1 className="page-title">Scoring Configuration</h1>
          <p style={{ color: 'var(--text-muted)' }}>Read-only view of seeded weights and policies</p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Categories & Weights</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '0.75rem' }}>Key</th>
                <th style={{ padding: '0.75rem' }}>Name</th>
                <th style={{ padding: '0.75rem' }}>Max Score</th>
                <th style={{ padding: '0.75rem' }}>Weight</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {config.categories.map(c => (
                <tr key={c.categoryKey} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>{c.categoryKey}</td>
                  <td style={{ padding: '0.75rem' }}>{c.name}</td>
                  <td style={{ padding: '0.75rem', fontWeight: 600 }}>{c.maxScore}</td>
                  <td style={{ padding: '0.75rem' }}>{c.weight}</td>
                  <td style={{ padding: '0.75rem' }}>
                    {c.active ? <CheckCircle size={16} color="#10b981" /> : <XCircle size={16} color="#f43f5e" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Deterministic Policies</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '0.75rem' }}>Rule Key</th>
                <th style={{ padding: '0.75rem' }}>Severity Match</th>
                <th style={{ padding: '0.75rem' }}>Action</th>
                <th style={{ padding: '0.75rem' }}>Amount</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {config.policies.map(p => (
                <tr key={p.ruleKey} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>{p.ruleKey}</td>
                  <td style={{ padding: '0.75rem' }}>{p.severity || 'ANY'}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ 
                      padding: '0.2rem 0.5rem', 
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      background: p.action === 'DEDUCT' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                      color: p.action === 'DEDUCT' ? '#f43f5e' : '#10b981'
                    }}>
                      {p.action}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>{p.amount}</td>
                  <td style={{ padding: '0.75rem' }}>
                    {p.active ? <CheckCircle size={16} color="#10b981" /> : <XCircle size={16} color="#f43f5e" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
