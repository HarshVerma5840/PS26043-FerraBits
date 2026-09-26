import React, { useEffect, useState } from 'react'
import { evaluationApi, CriterionScore } from '../api/evaluationApi'
import { CheckSquare } from 'lucide-react'

export default function EvaluationCriteriaPage() {
  const [criteria, setCriteria] = useState<CriterionScore[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    evaluationApi.getCriteria()
      .then(res => setCriteria(res))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="main-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header flex justify-between" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <CheckSquare size={32} color="var(--secondary)" />
        <div>
          <h1 className="page-title">Scoring Criteria</h1>
          <p style={{ color: 'var(--text-muted)' }}>Blank scorecard template for your pool</p>
        </div>
      </div>

      {error && <div style={{ color: 'var(--accent)', marginBottom: '1rem' }}>{error}</div>}

      <div style={{ display: 'grid', gap: '1rem' }}>
        {loading ? (
          <div>Loading...</div>
        ) : criteria.length === 0 ? (
          <div>No criteria found.</div>
        ) : criteria.map(c => (
          <div key={c.criterionId} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{c.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{c.description}</p>
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#6366f1' }}>Key: {c.criterionKey}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Max Score</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--secondary)' }}>{c.maxScore}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
