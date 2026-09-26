import React, { useEffect, useState } from 'react'
import { evaluationApi, EvaluatorProfile } from '../api/evaluationApi'
import { User } from 'lucide-react'

export default function EvaluatorProfilePage() {
  const [profile, setProfile] = useState<EvaluatorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    evaluationApi.getProfile()
      .then(res => setProfile(res))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>{error}</div>
  if (!profile) return null

  return (
    <div className="main-content" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="page-header text-center">
        <User size={48} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
        <h1 className="page-title">My Evaluator Profile</h1>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Pool</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 500 }}>{profile.evaluatorPool}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Status</div>
            <div>
              <span style={{ 
                background: profile.isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)', 
                color: profile.isActive ? '#10b981' : '#f43f5e',
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
                fontSize: '0.85rem'
              }}>
                {profile.isActive ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Max Concurrent Workload</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{profile.maxConcurrentAssignments}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Assigned</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{profile.totalAssigned}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Completed</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{profile.totalCompleted}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
