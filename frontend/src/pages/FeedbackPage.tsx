import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { feedbackApi } from '../api/feedbackApi'
import { useAuth } from '../auth/AuthContext'
import { MessageSquarePlus } from 'lucide-react'

import FeedbackSubmissionForm from '../components/feedback/FeedbackSubmissionForm'
import FeedbackList from '../components/feedback/FeedbackList'
import FeedbackSummary from '../components/feedback/FeedbackSummary'
import ImpactMetricsPanel from '../components/feedback/ImpactMetricsPanel'
import FeedbackModerationDialog from '../components/feedback/FeedbackModerationDialog'
import { CreateFeedback, CitizenFeedback } from '../types'

export default function FeedbackPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  // Assume admin if role is ADMIN
  const isAdmin = user?.role === 'ADMIN'
  
  const [moderateItem, setModerateItem] = useState<CitizenFeedback | null>(null)

  // Fetch feedback for this project
  const { data: feedbackList, isLoading: loadingList } = useQuery({
    queryKey: ['feedback', projectId],
    queryFn: () => feedbackApi.getProjectFeedback(projectId!)
  })

  // Fetch global summary
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['feedback-summary'],
    queryFn: () => feedbackApi.getFeedbackSummary()
  })

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: (data: CreateFeedback) => feedbackApi.submitFeedback(projectId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback', projectId] })
      queryClient.invalidateQueries({ queryKey: ['feedback-summary'] })
      toast.success('Feedback submitted successfully!')
    },
    onError: (err: any) => toast.error(err.message)
  })

  // Moderate mutation
  const moderateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => feedbackApi.moderateFeedback(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback', projectId] })
      setModerateItem(null)
    },
    onError: (err: any) => toast.error(err.message)
  })

  const handleModerate = (id: string, status: string) => {
    moderateMutation.mutate({ id, status })
  }

  // Fetch global impact metrics
  const { data: impact, isLoading: loadingImpact } = useQuery({
    queryKey: ['impact-metrics'],
    queryFn: () => feedbackApi.getImpactMetrics()
  })

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      
      {/* Left Column: Form & Summary & Impact */}
      <div>
        <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <MessageSquarePlus size={32} color="var(--primary)" />
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Citizen Feedback</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Community impact and review</p>
          </div>
        </header>

        <ImpactMetricsPanel metrics={impact} loading={loadingImpact} />

        <div style={{ marginBottom: '2rem' }}>
          <FeedbackSummary summary={summary} loading={loadingSummary} />
        </div>

        <FeedbackSubmissionForm 
          onSubmit={(data) => submitMutation.mutate(data)} 
          loading={submitMutation.isPending} 
        />
      </div>

      {/* Right Column: Feedback List */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', marginTop: '0.5rem' }}>
          <h2 style={{ margin: 0 }}>Recent Feedback</h2>
          {isAdmin && (
            <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', borderRadius: '4px' }}>
              Moderator View
            </span>
          )}
        </div>
        
        <FeedbackList 
          feedback={feedbackList || []} 
          loading={loadingList} 
          adminView={isAdmin}
          onModerate={isAdmin ? (item) => setModerateItem(item) : undefined}
        />
      </div>

      {/* Dialogs */}
      {moderateItem && (
        <FeedbackModerationDialog 
          feedback={moderateItem} 
          onClose={() => setModerateItem(null)} 
          onModerate={handleModerate} 
          loading={moderateMutation.isPending}
        />
      )}
    </div>
  )
}
