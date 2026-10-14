import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { portalApi } from '../api/portalApi'
import { FileText, Plus, AlertCircle, UserCheck } from 'lucide-react'

export default function SubmissionListPage() {
  const navigate = useNavigate()

  const { data: submissions, isLoading, error, refetch } = useQuery({
    queryKey: ['portal-submissions'],
    queryFn: () => portalApi.getSubmissions(),
    retry: 1
  })

  const isNotRegistered = (error as any)?.status === 404 ||
    (error instanceof Error && error.message.includes('STUDENT_NOT_REGISTERED'))

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
        return { bg: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)' }
      case 'RETURNED':
        return { bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--warn)' }
      case 'ACCEPTED':
        return { bg: 'rgba(34, 197, 94, 0.1)', color: 'var(--ok)' }
      case 'REJECTED':
        return { bg: 'rgba(244, 63, 94, 0.1)', color: 'var(--accent)' }
      case 'DRAFT':
      default:
        return { bg: 'rgba(255, 255, 255, 0.05)', color: '#cbd5e1' }
    }
  }

  return (
    <div className="animate-fade-in" style={{ padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <FileText size={32} color="var(--primary)" />
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>My Submissions</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Manage your drafted and submitted proposals</p>
          </div>
        </div>
        <button className="btn" onClick={() => navigate('/portal/problems')}>
          <Plus size={16} /> New Submission
        </button>
      </header>

      {isNotRegistered && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', borderLeft: '4px solid var(--primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserCheck size={20} color="var(--primary)" /> Participant Profile Required
            </h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              You need to complete your participant profile before creating and viewing proposals.
            </p>
          </div>
          <Link to="/portal/profile" className="btn">
            Register Profile
          </Link>
        </div>
      )}

      {error && !isNotRegistered && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--err)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={24} />
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0' }}>Failed to load submissions</h3>
              <span style={{ fontSize: '0.9rem' }}>{error instanceof Error ? error.message : 'Please try again later.'}</span>
            </div>
          </div>
          <button className="btn btn-secondary" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div style={{ color: 'var(--text-muted)', padding: '2rem 0' }}>Loading submissions...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {submissions?.map(sub => {
            const subId = sub.submissionId || sub.id || ''
            const badgeStyle = getStatusBadge(sub.status)
            const dateVal = sub.submittedAt || sub.decidedAt || sub.updatedAt || sub.createdAt

            return (
              <div key={subId} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>
                      {sub.title || `Submission ${subId.substring(0, 8)}`}
                    </h3>
                    <span className="badge" style={{
                      background: badgeStyle.bg,
                      color: badgeStyle.color
                    }}>
                      {sub.status || 'DRAFT'}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Problem ID: {sub.problemId?.substring(0, 8)} &bull; {dateVal ? `Updated: ${new Date(dateVal).toLocaleDateString()}` : 'Draft in progress'}
                  </div>
                </div>
                <Link to={`/portal/submissions/${subId}`} className="btn btn-secondary">
                  View Submission
                </Link>
              </div>
            )
          })}

          {!isLoading && (!submissions || submissions.length === 0) && !isNotRegistered && !error && (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--glass-border)', borderRadius: '12px' }}>
              <p style={{ margin: '0 0 1rem 0' }}>You haven't created any solution proposals yet.</p>
              <button className="btn" onClick={() => navigate('/portal/problems')}>
                Browse Open Problems
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
