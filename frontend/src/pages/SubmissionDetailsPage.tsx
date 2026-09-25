import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { portalApi } from '../api/portalApi'
import { ArrowLeft, Save, Send, AlertCircle } from 'lucide-react'
import FileUploadPanel from '../components/FileUploadPanel'

export default function SubmissionDetailsPage() {
  const { submissionId } = useParams<{ submissionId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')

  const isNew = submissionId === 'new'

  const { data: sub, isLoading: loadingSub } = useQuery({
    queryKey: ['portal-submission', submissionId],
    queryFn: () => portalApi.getSubmissionById(submissionId!),
    enabled: !isNew
  })

  const { data: files } = useQuery({
    queryKey: ['submission-files', submissionId],
    queryFn: () => portalApi.getFiles(submissionId!),
    enabled: !isNew
  })

  useEffect(() => {
    if (sub && sub.content) {
      setContent(sub.content)
    }
  }, [sub])

  const saveMutation = useMutation({
    mutationFn: () => {
      if (isNew) {
        return portalApi.createSubmission({ problemId: 'DEMO', content }) // In reality, get from state
      } else {
        return portalApi.updateSubmission(submissionId!, { content })
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['portal-submissions'] })
      if (isNew) {
        navigate(`/portal/submissions/${data.id}`, { replace: true })
      } else {
        queryClient.invalidateQueries({ queryKey: ['portal-submission', submissionId] })
      }
    }
  })

  const submitMutation = useMutation({
    mutationFn: () => portalApi.submitSubmission(submissionId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal-submissions'] })
      queryClient.invalidateQueries({ queryKey: ['portal-submission', submissionId] })
    }
  })

  if (loadingSub && !isNew) return <div style={{ padding: '2rem' }}>Loading submission...</div>

  const isEditable = isNew || sub?.status === 'DRAFT' || sub?.status === 'RETURNED'

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <button onClick={() => navigate('/portal/submissions')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back to Submissions
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            {isNew ? 'New Submission' : `Submission ${sub?.id.substring(0, 8)}`}
          </h1>
          {!isNew && (
            <span className="badge" style={{ background: 'rgba(255,255,255,0.05)' }}>Status: {sub?.status}</span>
          )}
        </div>

        {isEditable && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-secondary" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              <Save size={16} /> {saveMutation.isPending ? 'Saving...' : 'Save Draft'}
            </button>
            {!isNew && (
              <button className="btn" onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending || saveMutation.isPending}>
                <Send size={16} /> {submitMutation.isPending ? 'Submitting...' : (sub?.status === 'RETURNED' ? 'Resubmit' : 'Submit')}
              </button>
            )}
          </div>
        )}
      </div>

      {sub?.status === 'RETURNED' && sub.feedback && (
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', borderLeft: '4px solid var(--warn)', padding: '1rem 1.5rem', marginBottom: '2rem', borderRadius: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warn)', fontWeight: 600, marginBottom: '0.5rem' }}>
            <AlertCircle size={18} /> Returned for Revisions
          </div>
          <div style={{ color: '#fff', fontSize: '0.9rem' }}>{sub.feedback}</div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Proposal Content</h3>
          <textarea 
            value={content}
            onChange={e => setContent(e.target.value)}
            disabled={!isEditable}
            placeholder="Describe your technical approach..."
            style={{ 
              width: '100%', 
              minHeight: '300px', 
              padding: '1rem', 
              background: 'rgba(0,0,0,0.2)', 
              border: '1px solid var(--glass-border)', 
              color: '#fff', 
              borderRadius: '8px',
              resize: 'vertical',
              fontFamily: 'inherit',
              lineHeight: 1.6
            }}
          />
        </div>

        {!isNew && (
          <FileUploadPanel submissionId={submissionId!} files={files} />
        )}
      </div>
    </div>
  )
}
