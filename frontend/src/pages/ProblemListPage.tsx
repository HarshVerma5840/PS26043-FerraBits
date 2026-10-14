import { useQuery } from '@tanstack/react-query'
import { portalApi } from '../api/portalApi'
import { BookOpen, Filter, ArrowRight, AlertCircle, UserCheck } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ProblemListPage() {
  const [search, setSearch] = useState('')

  const { data: problems, isLoading, error, refetch } = useQuery({
    queryKey: ['portal-problems'],
    queryFn: () => portalApi.getProblems(),
    retry: 1
  })

  const filtered = problems?.filter(p => {
    const text = `${p.title || ''} ${p.description || ''} ${p.expectedOutcome || ''}`.toLowerCase()
    return text.includes(search.toLowerCase())
  })

  const isNotRegistered = (error as any)?.status === 404 ||
    (error instanceof Error && error.message.includes('STUDENT_NOT_REGISTERED'))

  return (
    <div className="animate-fade-in" style={{ padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <BookOpen size={32} color="var(--primary)" />
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Problem Statements</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Discover challenges and innovate solutions</p>
          </div>
        </div>
      </header>

      {isNotRegistered && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', borderLeft: '4px solid var(--primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserCheck size={20} color="var(--primary)" /> Participant Profile Required
            </h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              You must register your participant profile to browse published problem statements and submit proposals.
            </p>
          </div>
          <Link to="/portal/profile" className="btn">
            Complete Profile
          </Link>
        </div>
      )}

      {error && !isNotRegistered && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', borderColor: 'rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--err)' }}>
            <AlertCircle size={20} />
            <span>{error instanceof Error ? error.message : 'Unable to load published problems.'}</span>
          </div>
          <button className="btn btn-secondary" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="Search problems..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: '#fff', width: '300px' }}
        />
        <button className="btn btn-secondary">
          <Filter size={16} /> Filter
        </button>
      </div>

      {isLoading ? (
        <div style={{ color: 'var(--text-muted)', padding: '2rem 0' }}>Loading problems...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filtered?.map((prob) => {
            const probId = prob.problemId || prob.id || ''
            const snippet = prob.description || prob.expectedOutcome || 'No description provided.'
            const domainLabel = prob.domains?.length ? prob.domains.join(', ') : (prob.domainId || prob.sourceBucket || 'General')

            return (
              <div key={probId} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <span className="badge" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)' }}>
                        {domainLabel}
                      </span>
                      {prob.severity && (
                        <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)' }}>
                          Severity: {prob.severity}
                        </span>
                      )}
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ID: {probId.substring(0, 8)}</span>
                    </div>
                    <h3 style={{ fontSize: '1.3rem', margin: '0 0 0.5rem 0' }}>{prob.title || 'Problem Statement'}</h3>
                  </div>

                  <Link to={`/portal/problems/${probId}`} className="btn">
                    View Details <ArrowRight size={16} />
                  </Link>
                </div>

                <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  {snippet.substring(0, 250)}{snippet.length > 250 ? '...' : ''}
                </div>
              </div>
            )
          })}

          {!isLoading && (!filtered || filtered.length === 0) && (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--glass-border)', borderRadius: '12px' }}>
              No active problem statements match your search.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
