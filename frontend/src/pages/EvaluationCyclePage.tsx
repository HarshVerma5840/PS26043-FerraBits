import React, { useEffect, useState } from 'react'
import { useParams, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { evaluationAdminApi, EvaluationCycle } from '../api/evaluationAdminApi'
import { ArrowLeft, Play, LayoutList, BarChart2, Star, Globe } from 'lucide-react'

export default function EvaluationCyclePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cycle, setCycle] = useState<EvaluationCycle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      evaluationAdminApi.getCycle(id)
        .then(res => setCycle(res))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false))
    }
  }, [id])

  if (loading) return <div>Loading...</div>
  if (error || !cycle) return <div style={{ color: 'red', padding: '2rem' }}>{error || 'Not found'}</div>

  const navs = [
    { to: 'routing', label: 'Analysis & Routing', icon: Play },
    { to: 'aggregation', label: 'Aggregation', icon: BarChart2 },
    { to: 'prioritization', label: 'Prioritization', icon: Star },
    { to: 'publication', label: 'Publication', icon: Globe },
  ]

  return (
    <div className="main-content" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <button onClick={() => navigate('/admin/evaluation/queue')} className="btn btn-secondary" style={{ marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back to Queue
      </button>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Evaluation Pipeline</h1>
            <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)' }}>
              <span>Cycle ID: <span style={{ fontFamily: 'monospace' }}>{cycle.cycleId.substring(0,8)}</span></span>
              <span>Problem ID: <span style={{ fontFamily: 'monospace' }}>{cycle.problemId.substring(0,8)}</span></span>
            </div>
          </div>
          <div>
            <span style={{ display: 'inline-block', padding: '0.4rem 1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', fontSize: '0.9rem' }}>
              {cycle.status}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '2rem', overflowX: 'auto' }}>
        <NavLink to={`/admin/evaluation/cycles/${cycle.cycleId}`} end className={({ isActive }) => `btn ${isActive ? '' : 'btn-secondary'}`}>
          <LayoutList size={16} /> Overview & History
        </NavLink>
        {navs.map(nav => (
          <NavLink key={nav.to} to={`/admin/evaluation/cycles/${cycle.cycleId}/${nav.to}`} className={({ isActive }) => `btn ${isActive ? '' : 'btn-secondary'}`}>
            <nav.icon size={16} /> {nav.label}
          </NavLink>
        ))}
      </div>

      <Outlet context={{ cycle, refreshCycle: () => evaluationAdminApi.getCycle(cycle.cycleId).then(setCycle) }} />
    </div>
  )
}
