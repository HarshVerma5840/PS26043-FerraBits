import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { governanceApi } from '../api/governanceApi'
import { Shield, CheckCircle, XCircle, AlertTriangle, ArrowLeft } from 'lucide-react'

export default function ReviewDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [rejectReason, setRejectReason] = useState('')
  const [overrideReason, setOverrideReason] = useState('')
  const [overrideInst, setOverrideInst] = useState('')
  const [activeModal, setActiveModal] = useState<'NONE' | 'REJECT' | 'OVERRIDE'>('NONE')

  const { data: review, isLoading } = useQuery({
    queryKey: ['review', id],
    queryFn: () => governanceApi.getReviewById(id!)
  })

  const approveMutation = useMutation({
    mutationFn: () => governanceApi.approveReview(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review', id] })
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
    }
  })

  const rejectMutation = useMutation({
    mutationFn: () => governanceApi.rejectReview(id!, rejectReason),
    onSuccess: () => {
      setActiveModal('NONE')
      queryClient.invalidateQueries({ queryKey: ['review', id] })
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
    }
  })

  const overrideMutation = useMutation({
    mutationFn: () => governanceApi.overrideReview(id!, overrideInst, overrideReason),
    onSuccess: () => {
      setActiveModal('NONE')
      queryClient.invalidateQueries({ queryKey: ['review', id] })
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
    }
  })

  if (isLoading) return <div style={{ padding: '2rem' }}>Loading review details...</div>
  if (!review) return <div style={{ padding: '2rem' }}>Review not found.</div>

  return (
    <div className="animate-fade-in" style={{ padding: '2rem' }}>
      <button onClick={() => navigate('/admin/reviews')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back to Desk
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', marginBottom: '0.5rem' }}>Review {review.id}</h1>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.05)' }}>Status: {review.status}</span>
        </div>
        
        {review.status === 'PENDING' && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-secondary" onClick={() => setActiveModal('OVERRIDE')} disabled={approveMutation.isPending || rejectMutation.isPending || overrideMutation.isPending}>
              <AlertTriangle size={16} /> Override
            </button>
            <button className="btn btn-secondary" onClick={() => setActiveModal('REJECT')} disabled={approveMutation.isPending || rejectMutation.isPending || overrideMutation.isPending} style={{ color: 'var(--err)', borderColor: 'var(--err)' }}>
              <XCircle size={16} /> Reject
            </button>
            <button className="btn" onClick={() => approveMutation.mutate()} disabled={approveMutation.isPending || rejectMutation.isPending || overrideMutation.isPending}>
              <CheckCircle size={16} /> {approveMutation.isPending ? 'Approving...' : 'Approve'}
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginTop: 0 }}>Matching Scores</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Dense Retrieval Score</span> <span>85.4%</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Sparse Term Match</span> <span>72.1%</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Cross-Encoder Rerank</span> <span>91.2%</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid var(--glass-border)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
              <span>Final Aggregate Score</span> <span>{(review.aggregateScore * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
        
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginTop: 0 }}>Target Context</h3>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <p><strong>Problem:</strong> {review.problemId}</p>
            <p><strong>Proposed Institution:</strong> {review.targetInstitutionId}</p>
            {review.overrideReason && <p><strong>Override Reason:</strong> {review.overrideReason}</p>}
          </div>
        </div>
      </div>

      <h3 style={{ marginBottom: '1rem' }}>Top Evidence Cards</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {review.evidenceCards?.map((card, i) => (
          <div key={card.id || i} className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600 }}>{card.title}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Score: {(card.relevanceScore * 100).toFixed(0)}%</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{card.description}</p>
          </div>
        ))}
      </div>

      {/* Modals */}
      {activeModal !== 'NONE' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel" style={{ width: '400px', padding: '2rem' }}>
            <h2 style={{ marginTop: 0 }}>{activeModal === 'REJECT' ? 'Reject Recommendation' : 'Manual Override'}</h2>
            
            {activeModal === 'OVERRIDE' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Select Target Institution ID</label>
                <input type="text" value={overrideInst} onChange={e => setOverrideInst(e.target.value)} style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: '#fff' }} />
              </div>
            )}
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Reason (Mandatory)</label>
              <textarea 
                value={activeModal === 'REJECT' ? rejectReason : overrideReason} 
                onChange={e => activeModal === 'REJECT' ? setRejectReason(e.target.value) : setOverrideReason(e.target.value)}
                style={{ width: '100%', height: '100px', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: '#fff' }} 
              />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setActiveModal('NONE')}>Cancel</button>
              <button 
                className="btn" 
                onClick={() => activeModal === 'REJECT' ? rejectMutation.mutate() : overrideMutation.mutate()}
                disabled={(activeModal === 'REJECT' && !rejectReason) || (activeModal === 'OVERRIDE' && (!overrideReason || !overrideInst))}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
