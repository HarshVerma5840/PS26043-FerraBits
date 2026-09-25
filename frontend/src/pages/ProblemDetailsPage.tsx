import { useQuery, useMutation } from '@tanstack/react-query'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { portalApi } from '../api/portalApi'
import { ArrowLeft, Clock, MapPin, CheckCircle } from 'lucide-react'

export default function ProblemDetailsPage() {
  const { problemId } = useParams<{ problemId: string }>()
  const navigate = useNavigate()

  const { data: problem, isLoading } = useQuery({
    queryKey: ['portal-problem', problemId],
    queryFn: () => portalApi.getProblemById(problemId!)
  })

  // Dummy mutation for submitting to a problem (in reality, navigates to submission creation)
  const startSubmission = () => {
    // Navigate or trigger API
    navigate('/portal/submissions/new', { state: { problemId } })
  }

  if (isLoading) return <div style={{ padding: '2rem' }}>Loading problem details...</div>
  if (!problem) return <div style={{ padding: '2rem' }}>Problem not found.</div>

  return (
    <div className="animate-fade-in" style={{ padding: '2rem' }}>
      <button onClick={() => navigate('/portal/problems')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back to Problems
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <span className="badge" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)' }}>{problem.domainId || 'General'}</span>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.05)' }}>ID: {problem.id}</span>
          </div>
          
          <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', lineHeight: 1.3 }}>{problem.title}</h1>
          
          <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Description</h3>
            <p style={{ lineHeight: 1.7, color: 'var(--text-main)' }}>
              {problem.description}
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Evidences & Documentation</h3>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Reference materials will be available here when registered.
            </div>
          </div>
        </div>

        <div>
          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Actions</h3>
            <button className="btn" style={{ width: '100%', justifyContent: 'center', marginBottom: '1rem' }} onClick={startSubmission}>
              Start Submission
            </button>
            <Link to={`/portal/problems/${problemId}/timeline`} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              <Clock size={16} style={{ marginRight: '0.5rem' }} /> View Timeline
            </Link>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                <MapPin size={16} /> <span>Pan-India Impact</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                <CheckCircle size={16} /> <span>Open for proposals</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
