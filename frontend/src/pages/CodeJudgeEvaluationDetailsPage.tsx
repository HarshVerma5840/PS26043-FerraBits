import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useParams, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { codejudgeApi, CodeJudgeEvaluation } from '../api/codejudgeApi'
import { ArrowLeft, LayoutList, BarChart2, ShieldAlert, FileText, RefreshCw } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

export default function CodeJudgeEvaluationDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [evaluation, setEvaluation] = useState<CodeJudgeEvaluation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retrying, setRetrying] = useState(false)

  const isAdmin = user?.role === 'ADMIN'

  useEffect(() => {
    if (id) {
      fetchData()
    }
  }, [id])

  const fetchData = () => {
    if (!id) return
    codejudgeApi.getEvaluation(id)
      .then(res => setEvaluation(res))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  const handleRetry = async () => {
    if (!id) return
    setRetrying(true)
    try {
      await codejudgeApi.retryEvaluation(id)
      fetchData()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setRetrying(false)
    }
  }

  const handleReevaluate = async () => {
    if (!id) return
    setRetrying(true)
    try {
      const res = await codejudgeApi.reevaluate(id)
      navigate(`/portal/codejudge/${res.evaluationId}`)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setRetrying(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error || !evaluation) return <div style={{ color: 'red', padding: '2rem' }}>{error || 'Not found'}</div>

  const navs = [
    { to: 'score', label: 'Scorecard', icon: BarChart2 },
    { to: 'findings', label: 'Findings', icon: ShieldAlert },
    { to: 'report', label: 'Full Report', icon: FileText },
  ]

  return (
    <div className="main-content" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <button onClick={() => navigate('/portal/codejudge')} className="btn btn-secondary" style={{ marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back to List
      </button>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Evaluation: {evaluation.repositoryUrl.split('/').pop()}</h1>
            <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)' }}>
              <span>ID: <span style={{ fontFamily: 'monospace' }}>{evaluation.evaluationId.substring(0,8)}</span></span>
              <span>Commit: <span style={{ fontFamily: 'monospace' }}>{evaluation.commitSha.substring(0,8)}</span></span>
            </div>
            {evaluation.evaluationSummary && (
              <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>{evaluation.evaluationSummary}</p>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ 
              display: 'inline-block', 
              padding: '0.4rem 1rem', 
              background: evaluation.status === 'FAILED' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(255,255,255,0.1)', 
              borderRadius: '999px', 
              fontSize: '0.9rem',
              color: evaluation.status === 'FAILED' ? 'var(--accent)' : 'inherit',
              marginBottom: '1rem'
            }}>
              {evaluation.status}
            </span>
            
            {isAdmin && (
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                {evaluation.status === 'FAILED' && (
                  <button onClick={handleRetry} disabled={retrying} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'var(--primary)' }}>
                    <RefreshCw size={14} /> Retry
                  </button>
                )}
                <button onClick={handleReevaluate} disabled={retrying} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} title="Start a fresh run on this commit">
                  <RefreshCw size={14} /> Re-evaluate
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '2rem', overflowX: 'auto' }}>
        <NavLink to={`/portal/codejudge/${evaluation.evaluationId}`} end className={({ isActive }) => `btn ${isActive ? '' : 'btn-secondary'}`}>
          <LayoutList size={16} /> Overview
        </NavLink>
        {navs.map(nav => (
          <NavLink key={nav.to} to={`/portal/codejudge/${evaluation.evaluationId}/${nav.to}`} className={({ isActive }) => `btn ${isActive ? '' : 'btn-secondary'}`}>
            <nav.icon size={16} /> {nav.label}
          </NavLink>
        ))}
      </div>

      <Outlet context={{ evaluation }} />
    </div>
  )
}
