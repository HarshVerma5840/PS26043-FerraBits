import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { portalApi } from '../api/portalApi'
import { ArrowLeft, Save, Send, AlertCircle, Code2, CheckCircle2 } from 'lucide-react'
import FileUploadPanel from '../components/FileUploadPanel'

export default function SubmissionDetailsPage() {
  const { submissionId } = useParams<{ submissionId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()

  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [commitSha, setCommitSha] = useState('')
  const [branch, setBranch] = useState('')

  const isNew = submissionId === 'new'

  const { data: sub, isLoading: loadingSub, error, refetch } = useQuery({
    queryKey: ['portal-submission', submissionId],
    queryFn: () => portalApi.getSubmissionById(submissionId!),
    enabled: !isNew,
    retry: 1
  })

  const { data: files } = useQuery({
    queryKey: ['submission-files', submissionId],
    queryFn: () => portalApi.getFiles(submissionId!),
    enabled: !isNew
  })

  useEffect(() => {
    if (sub) {
      setTitle(sub.title || '')
      setSummary(sub.summary || sub.content || '')
      setGithubUrl(sub.githubUrl || '')
      setCommitSha(sub.commitSha || '')
      setBranch(sub.branch || '')
    }
  }, [sub])

  const saveMutation = useMutation({
    mutationFn: () => {
      if (isNew) {
        const problemId = (location.state as { problemId?: string } | null)?.problemId
        if (!problemId) throw new Error('Select a published problem before creating a submission.')
        return portalApi.createSubmission({
          problemId,
          title: title.trim() || undefined,
          summary: summary.trim() || undefined,
          githubUrl: githubUrl.trim() || undefined,
          commitSha: commitSha.trim() || undefined,
          branch: branch.trim() || undefined
        })
      } else {
        return portalApi.updateSubmission(submissionId!, {
          title: title.trim() || undefined,
          summary: summary.trim() || undefined,
          githubUrl: githubUrl.trim() || undefined,
          commitSha: commitSha.trim() || undefined,
          branch: branch.trim() || undefined
        })
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['portal-submissions'] })
      toast.success(isNew ? 'Proposal draft created!' : 'Draft saved successfully!')
      if (isNew) {
        const targetId = data.submissionId || data.id
        navigate(`/portal/submissions/${targetId}`, { replace: true })
      } else {
        queryClient.invalidateQueries({ queryKey: ['portal-submission', submissionId] })
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to save draft.')
    }
  })

  const submitMutation = useMutation({
    mutationFn: () => portalApi.submitSubmission(submissionId!),
    onSuccess: () => {
      toast.success('Proposal submitted for technical evaluation!')
      queryClient.invalidateQueries({ queryKey: ['portal-submissions'] })
      queryClient.invalidateQueries({ queryKey: ['portal-submission', submissionId] })
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to submit proposal for review.')
    }
  })

  const handleSubmit = () => {
    if (githubUrl && (!commitSha || commitSha.trim().length < 7)) {
      toast.error('Commit SHA (7-64 characters) is required for GitHub-backed submissions.')
      return
    }
    submitMutation.mutate()
  }

  if (loadingSub && !isNew) {
    return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading submission details...</div>
  }

  if (error && !isNew) {
    return (
      <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <AlertCircle size={48} color="var(--err)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ margin: '0 0 1rem 0' }}>Submission Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            {error instanceof Error ? error.message : 'You do not have permission to view this submission.'}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={() => navigate('/portal/submissions')} className="btn btn-secondary">
              <ArrowLeft size={16} /> Back to Submissions
            </button>
            <button onClick={() => refetch()} className="btn">
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  const isEditable = isNew || sub?.status === 'DRAFT' || sub?.status === 'RETURNED'
  const subId = sub?.submissionId || sub?.id || submissionId || ''
  const reviewerFeedback = sub?.decisionComment || sub?.feedback

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <button onClick={() => navigate('/portal/submissions')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back to Submissions
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            {isNew ? 'New Solution Proposal' : (sub?.title || `Submission ${subId.substring(0, 8)}`)}
          </h1>
          {!isNew && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span className="badge" style={{
                background: sub?.status === 'SUBMITTED' || sub?.status === 'UNDER_REVIEW' ? 'rgba(79, 70, 229, 0.1)' :
                            sub?.status === 'RETURNED' ? 'rgba(245, 158, 11, 0.1)' :
                            sub?.status === 'ACCEPTED' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.05)',
                color: sub?.status === 'SUBMITTED' || sub?.status === 'UNDER_REVIEW' ? 'var(--primary)' :
                       sub?.status === 'RETURNED' ? 'var(--warn)' :
                       sub?.status === 'ACCEPTED' ? 'var(--ok)' : '#fff'
              }}>
                Status: {sub?.status}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ID: {subId.substring(0, 8)}</span>
            </div>
          )}
        </div>

        {isEditable && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-secondary" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              <Save size={16} /> {saveMutation.isPending ? 'Saving...' : 'Save Draft'}
            </button>
            {!isNew && (
              <button className="btn" onClick={handleSubmit} disabled={submitMutation.isPending || saveMutation.isPending}>
                <Send size={16} /> {submitMutation.isPending ? 'Submitting...' : (sub?.status === 'RETURNED' ? 'Resubmit for Review' : 'Submit Proposal')}
              </button>
            )}
          </div>
        )}
      </div>

      {sub?.status === 'RETURNED' && reviewerFeedback && (
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', borderLeft: '4px solid var(--warn)', padding: '1.25rem 1.5rem', marginBottom: '2rem', borderRadius: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warn)', fontWeight: 600, marginBottom: '0.5rem' }}>
            <AlertCircle size={18} /> Returned for Revisions by Evaluator
          </div>
          <div style={{ color: '#fff', fontSize: '0.95rem', lineHeight: 1.6 }}>{reviewerFeedback}</div>
        </div>
      )}

      {sub?.status === 'ACCEPTED' && (
        <div style={{ background: 'rgba(34, 197, 94, 0.1)', borderLeft: '4px solid var(--ok)', padding: '1.25rem 1.5rem', marginBottom: '2rem', borderRadius: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ok)', fontWeight: 600, marginBottom: '0.5rem' }}>
            <CheckCircle2 size={18} /> Proposal Accepted
          </div>
          <div style={{ color: '#fff', fontSize: '0.95rem' }}>
            {sub.decisionComment || 'Your proposal has been approved through peer evaluation.'}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Proposal Overview</h3>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Proposal Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              disabled={!isEditable}
              placeholder="e.g. Solar Telemetry IoT Grid for Municipal Water Monitoring"
              style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '6px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Technical Approach & Summary</label>
            <textarea
              value={summary}
              onChange={e => setSummary(e.target.value)}
              disabled={!isEditable}
              placeholder="Detail your engineering architecture, deployment methodology, and societal impact..."
              style={{
                width: '100%',
                minHeight: '220px',
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
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Code2 size={20} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Code Repository & Git Versioning</h3>
          </div>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Provide repository details for automated CodeJudge benchmark scoring. A pinned commit SHA is required before submission.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>GitHub Repository URL</label>
              <input
                type="url"
                value={githubUrl}
                onChange={e => setGithubUrl(e.target.value)}
                disabled={!isEditable}
                placeholder="https://github.com/org/project-repo"
                style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '6px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Branch</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={branch}
                  onChange={e => setBranch(e.target.value)}
                  disabled={!isEditable}
                  placeholder="main"
                  style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '6px' }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Commit SHA (Pinned)</label>
              <input
                type="text"
                value={commitSha}
                onChange={e => setCommitSha(e.target.value)}
                disabled={!isEditable}
                placeholder="7-64 char hash"
                style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '6px', fontFamily: 'monospace' }}
              />
            </div>
          </div>
        </div>

        {!isNew && (
          <FileUploadPanel submissionId={subId} files={files} editable={isEditable} />
        )}
      </div>
    </div>
  )
}
