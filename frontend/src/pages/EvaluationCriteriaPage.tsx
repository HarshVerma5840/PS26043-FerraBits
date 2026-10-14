import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { evaluationApi, CriterionScore } from '../api/evaluationApi'
import { useAuth } from '../auth/AuthContext'
import { CheckSquare, ShieldAlert, ArrowRight } from 'lucide-react'

export default function EvaluationCriteriaPage() {
  const { user } = useAuth()
  const isEvaluator = user?.role === 'EVALUATOR'

  const [criteria, setCriteria] = useState<CriterionScore[]>([])
  const [loading, setLoading] = useState(isEvaluator)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isEvaluator) return
    setLoading(true)
    evaluationApi.getCriteria()
      .then(res => setCriteria(res))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [isEvaluator])

  if (!isEvaluator) {
    return (
      <div className="main-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="page-header flex justify-between" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <CheckSquare size={32} color="var(--secondary)" />
          <div>
            <h1 className="page-title">Scoring Criteria</h1>
            <p style={{ color: 'var(--text-muted)' }}>Blank scorecard template for evaluation pools</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '8px',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
            color: '#93c5fd'
          }}>
            <ShieldAlert size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Administrative Observer Mode</div>
              <div style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                Personal scoring criteria templates are tailored to each domain evaluator&apos;s assigned pool. Administrators configure pool scoring modes and inspect cycle aggregations globally.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <Link to="/admin/evaluation/pool-modes" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              Configure Pool Modes <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    )
  }

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
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{c.criterionLabel || c.name || c.criterionKey}</h3>
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
