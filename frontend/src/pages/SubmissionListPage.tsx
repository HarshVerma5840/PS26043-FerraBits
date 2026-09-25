import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { portalApi } from '../api/portalApi'
import { FileText, Plus, AlertCircle } from 'lucide-react'

export default function SubmissionListPage() {
  const navigate = useNavigate()

  const { data: submissions, isLoading, error } = useQuery({
    queryKey: ['portal-submissions'],
    queryFn: () => portalApi.getSubmissions(),
    retry: 1
  })

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

      {error ? (
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--err)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
          <AlertCircle size={24} />
          <div>
            <h3 style={{ margin: '0 0 0.25rem 0' }}>Failed to load</h3>
            <span>{error instanceof Error ? error.message : 'Please register your profile first or try again later.'}</span>
          </div>
        </div>
      ) : isLoading ? (
        <div style={{ color: 'var(--text-muted)' }}>Loading submissions...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {submissions?.map(sub => (
            <div key={sub.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                  <h3 style={{ margin: 0 }}>Submission {sub.id.substring(0, 8)}</h3>
                  <span className="badge" style={{ 
                    background: sub.status === 'SUBMITTED' ? 'rgba(79, 70, 229, 0.1)' : 
                                sub.status === 'RETURNED' ? 'rgba(245, 158, 11, 0.1)' : 
                                sub.status === 'ACCEPTED' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.05)',
                    color: sub.status === 'SUBMITTED' ? 'var(--primary)' : 
                           sub.status === 'RETURNED' ? 'var(--warn)' : 
                           sub.status === 'ACCEPTED' ? 'var(--ok)' : '#fff'
                  }}>
                    {sub.status}
                  </span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Problem ID: {sub.problemId} &bull; Updated: {new Date(sub.updatedAt || sub.createdAt).toLocaleDateString()}
                </div>
              </div>
              <Link to={`/portal/submissions/${sub.id}`} className="btn btn-secondary">
                View Submission
              </Link>
            </div>
          ))}

          {(!submissions || submissions.length === 0) && (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--glass-border)', borderRadius: '12px' }}>
              You haven't made any submissions yet.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
