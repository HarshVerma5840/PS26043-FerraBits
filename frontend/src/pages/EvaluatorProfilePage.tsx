import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { evaluationApi, EvaluatorProfile } from '../api/evaluationApi'
import { useAuth } from '../auth/AuthContext'
import { User, ShieldAlert, ArrowRight } from 'lucide-react'

export default function EvaluatorProfilePage() {
  const { user } = useAuth()
  const isEvaluator = user?.role === 'EVALUATOR'

  const [profile, setProfile] = useState<EvaluatorProfile | null>(null)
  const [loading, setLoading] = useState(isEvaluator)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isEvaluator) return
    setLoading(true)
    evaluationApi.getProfile()
      .then(res => setProfile(res))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [isEvaluator])

  if (!isEvaluator) {
    return (
      <div className="main-content" style={{ maxWidth: '650px', margin: '0 auto' }}>
        <div className="page-header text-center">
          <User size={48} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
          <h1 className="page-title">Evaluator Profile</h1>
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
                Personal evaluator profiles are reserved for domain evaluators assigned to specific evaluation pools. As an administrator, you manage evaluation cycles, prioritization, and pool modes globally.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Link to="/admin/evaluation" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              Open Admin Evaluation Dashboard <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading) return <div style={{ padding: '2rem' }}>Loading profile...</div>
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
          {profile.fullName && (
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Full Name</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{profile.fullName}</div>
              {(profile.designation || profile.organization) && (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  {[profile.designation, profile.organization].filter(Boolean).join(' • ')}
                </div>
              )}
            </div>
          )}
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Evaluator Pool</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 500 }}>{profile.evaluatorType || profile.evaluatorPool || 'GENERAL'}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Status</div>
            <div>
              {(() => {
                const isActive = profile.active !== undefined ? profile.active : profile.isActive
                return (
                  <span style={{
                    background: isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                    color: isActive ? '#10b981' : '#f43f5e',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '999px',
                    fontSize: '0.85rem'
                  }}>
                    {isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                )
              })()}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Max Workload</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{profile.maxWorkload ?? profile.maxConcurrentAssignments ?? 5}</div>
            </div>
            {profile.experienceYears !== undefined && (
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Experience</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{profile.experienceYears} yrs</div>
              </div>
            )}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Assigned</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{profile.totalAssigned ?? '-'}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Completed</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{profile.totalCompleted ?? '-'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
