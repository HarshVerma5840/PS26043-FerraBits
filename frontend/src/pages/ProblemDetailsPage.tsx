import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { portalApi } from '../api/portalApi'
import { ArrowLeft, Clock, MapPin, CheckCircle, AlertCircle, FileText, Globe } from 'lucide-react'

export default function ProblemDetailsPage() {
  const { problemId } = useParams<{ problemId: string }>()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  const { data: problem, isLoading, error, refetch } = useQuery({
    queryKey: ['portal-problem', problemId],
    queryFn: () => portalApi.getProblemById(problemId!),
    enabled: Boolean(problemId),
    retry: 1
  })

  const startSubmission = async () => {
    if (!problemId || !problem) return
    setSubmitting(true)
    try {
      const sub = await portalApi.createSubmission({
        problemId,
        title: `Proposal: ${problem.title}`,
        summary: `Solution proposal for problem: ${problem.title}`
      })
      toast.success('Draft submission created!')
      const subId = sub.submissionId || sub.id
      navigate(`/portal/submissions/${subId}`)
    } catch (err: any) {
      toast.error(err?.message || 'Failed to start submission')
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="animate-fade-in" style={{ padding: '2rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading problem details...</p>
      </div>
    )
  }

  if (error || !problem) {
    return (
      <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <AlertCircle size={48} color="var(--err)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ margin: '0 0 1rem 0' }}>Problem Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            {error instanceof Error ? error.message : 'This problem statement does not exist or is not visible to your participant profile.'}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={() => navigate('/portal/problems')} className="btn btn-secondary">
              <ArrowLeft size={16} /> Back to Catalog
            </button>
            <button onClick={() => refetch()} className="btn">
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  const probId = problem.problemId || problem.id || problemId || ''
  const domainLabel = problem.domains?.length ? problem.domains.join(', ') : (problem.domainId || problem.sourceBucket || 'General')

  return (
    <div className="animate-fade-in" style={{ padding: '2rem' }}>
      <button onClick={() => navigate('/portal/problems')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back to Problems
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
            <span className="badge" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)' }}>{domainLabel}</span>
            {problem.sourceBucket && (
              <span className="badge" style={{ background: 'rgba(255,255,255,0.05)' }}>Source: {problem.sourceBucket}</span>
            )}
            {problem.severity && (
              <span className="badge" style={{ background: 'rgba(244,63,94,0.1)', color: 'var(--accent)' }}>Severity: {problem.severity}</span>
            )}
            {problem.urgency && (
              <span className="badge" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--warn)' }}>Urgency: {problem.urgency}</span>
            )}
            <span className="badge" style={{ background: 'rgba(255,255,255,0.05)' }}>ID: {probId.substring(0, 8)}</span>
          </div>

          <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', lineHeight: 1.3 }}>{problem.title}</h1>

          <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Problem Description</h3>
            <p style={{ lineHeight: 1.7, color: 'var(--text-main)', whiteSpace: 'pre-line' }}>
              {problem.description || problem.expectedOutcome || 'No detailed description available.'}
            </p>
          </div>

          {problem.expectedOutcome && problem.description && (
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={20} color="var(--ok)" /> Expected Outcome
              </h3>
              <p style={{ lineHeight: 1.7, color: 'var(--text-main)' }}>
                {problem.expectedOutcome}
              </p>
            </div>
          )}

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} color="var(--primary)" /> Evidences & Artifacts
            </h3>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {problem.evidenceCount ? `${problem.evidenceCount} verified evidence artifacts registered with this dossier.` : 'No external multimedia artifacts attached.'}
            </div>
          </div>
        </div>

        <div>
          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Actions</h3>
            <button
              className="btn"
              style={{ width: '100%', justifyContent: 'center', marginBottom: '1rem' }}
              onClick={startSubmission}
              disabled={submitting}
            >
              {submitting ? 'Creating Proposal...' : 'Start Submission'}
            </button>
            <Link to={`/portal/problems/${probId}/timeline`} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              <Clock size={16} style={{ marginRight: '0.5rem' }} /> View Timeline
            </Link>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Summary Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                <MapPin size={16} /> <span>{problem.location || 'Pan-India Scope'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                <Globe size={16} /> <span>Access Rule: {problem.accessRule || 'OPEN_TO_ALL'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                <CheckCircle size={16} color="var(--ok)" /> <span>Open for proposals</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
