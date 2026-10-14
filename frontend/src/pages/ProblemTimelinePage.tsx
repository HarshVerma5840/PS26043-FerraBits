import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { problemApi } from '../api/problemApi'

export default function ProblemTimelinePage() {
  const { problemId } = useParams<{ problemId: string }>()
  const navigate = useNavigate()
  const { data: timeline = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['citizen-problem-timeline', problemId],
    queryFn: () => problemApi.getTimeline(problemId!),
    enabled: Boolean(problemId),
    retry: 1
  })

  const formatAction = (action?: string) => {
    if (!action) return 'Status Event'
    return action.replace(/_/g, ' ')
  }

  const formatDetails = (event: any) => {
    if (event.afterState?.status) {
      return `Problem status updated to: ${event.afterState.status}`
    }
    if (event.comment || event.description) {
      return event.comment || event.description
    }
    if (event.afterState && Object.keys(event.afterState).length > 0) {
      return `Updated fields: ${Object.keys(event.afterState).join(', ')}`
    }
    return 'Dossier audit milestone logged.'
  }

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => navigate(`/portal/problems/${problemId}`)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '2rem' }}>
        <ArrowLeft size={16} /> Back to Problem Details
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <Clock size={28} color="var(--primary)" />
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Problem Timeline & Audit History</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Chronological lifecycle events for Problem {problemId?.substring(0, 8)}</p>
        </div>
      </div>

      {isLoading && (
        <div style={{ color: 'var(--text-muted)', padding: '2rem 0' }}>Loading problem timeline...</div>
      )}

      {isError && (
        <div className="glass-panel" style={{ padding: '1.5rem', borderColor: 'rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--err)' }}>
            <AlertCircle size={20} />
            <span>{error instanceof Error ? error.message : 'Unable to load timeline history.'}</span>
          </div>
          <button className="btn btn-secondary" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && timeline.length === 0 && (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No lifecycle milestones recorded for this problem statement yet.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {timeline.map((event: any, index: number) => {
          const actionText = formatAction(event.actionType || event.eventType || event.action || event.status)
          const detailText = formatDetails(event)
          const timestamp = event.performedAt || event.createdAt

          return (
            <div key={event.logId || event.id || index} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <CheckCircle2 size={20} color="var(--primary)" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', textTransform: 'capitalize' }}>{actionText}</h3>
                  {timestamp && (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {new Date(timestamp).toLocaleString()}
                    </span>
                  )}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{detailText}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
