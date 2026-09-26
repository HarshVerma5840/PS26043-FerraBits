
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { governanceApi } from '../../api/governanceApi'
import { RecommendationReview } from '../../types'
import { LoadingState, ErrorState, EmptyState } from '../components/UIComponents'

function EvidenceComparisonPanel({ evidence = [] }: { evidence: any[] }) {
  if (!evidence || evidence.length === 0) {
    return (
      <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm border border-[#E2E8F0]">
        <h3 className="font-title-md text-title-md font-bold text-primary mb-3">Statutory Evidence</h3>
        <p className="font-body-sm text-body-sm text-on-surface-variant">No evidence cards available for this review.</p>
      </div>
    )
  }

  return (
    <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm border border-[#E2E8F0]">
      <h3 className="font-title-md text-title-md font-bold text-primary mb-3">Statutory Evidence</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {evidence.map((ev, i) => (
          <div key={i} className="flex flex-col gap-1 p-3 bg-surface-container-low rounded border border-transparent hover:border-[#CBD5E1] transition-colors cursor-pointer">
            <div className="font-label-sm text-label-sm font-bold text-on-surface truncate flex items-center gap-2">
              <span className="material-symbols-outlined text-outline-variant text-[18px]" aria-hidden="true">domain</span>
              {ev.institutionName || 'Unknown Institution'}
            </div>
            <div className="font-label-sm text-label-sm text-secondary font-semibold">Match Score: {ev.finalScore ? (ev.finalScore * 100).toFixed(1) + '%' : 'N/A'}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DecisionHistoryPanel({ history = [] }: { history: any[] }) {
  return (
    <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm border border-[#E2E8F0]">
      <h3 className="font-title-md text-title-md font-bold text-primary mb-4">Sovereign Audit Trail</h3>
      {history.length === 0 ? (
        <p className="font-body-sm text-body-sm text-on-surface-variant">No history recorded.</p>
      ) : (
        <div className="relative border-l-2 border-surface-container-high ml-4 space-y-5">
          {history.map((h, i) => (
            <div key={i} className="relative pl-6">
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-[#FFF] bg-surface-container-high"></div>
              <div className="font-label-sm text-label-sm text-on-surface-variant font-bold mb-0.5">{new Date(h.timestamp || Date.now()).toLocaleDateString()}</div>
              <div className="font-label-md text-label-md font-bold text-on-surface">{h.action}</div>
              <div className="font-body-sm text-body-sm text-on-surface-variant">by {h.actorRole || 'System'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function RecommendationReviewCard({ rec, onDecision, isPending }: { rec: RecommendationReview, onDecision: (id: string, decision: string, reason: string) => void, isPending: boolean }) {
  const [reason, setReason] = useState('')
  const topEvidence = rec.topEvidenceCards?.[0]

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-md border border-[#E2E8F0] overflow-hidden mb-space-lg">
      <div className="bg-surface-container-low px-space-lg py-space-md border-b border-[#E2E8F0] flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-label-sm text-label-sm px-2 py-0.5 bg-secondary-fixed text-on-secondary-fixed font-bold rounded">
              Capability Match
            </span>
            <span className="font-label-md text-label-md font-mono text-primary font-bold">#{rec.reviewId}</span>
          </div>
          <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Problem ID: {rec.problemId}</h2>
        </div>
        <div className="text-left md:text-right">
          <div className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">Status</div>
          <div className="font-headline-sm text-headline-sm font-bold text-primary">{rec.status}</div>
        </div>
      </div>

      <div className="p-space-lg grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
        <div className="space-y-space-md">
          <div className="bg-surface-container p-space-md rounded-lg flex items-center justify-between">
            <div>
              <div className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Top Recommendation</div>
              <div className="font-label-md text-label-md font-bold text-on-surface">{topEvidence?.institutionName || 'No Match Found'}</div>
            </div>
            <div className="text-right">
              <div className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Match Score</div>
              <div className="font-title-md text-title-md font-bold text-tertiary">
                {topEvidence?.finalScore ? (topEvidence.finalScore * 100).toFixed(1) + '%' : 'N/A'}
              </div>
            </div>
          </div>
          <EvidenceComparisonPanel evidence={rec.topEvidenceCards || []} />
        </div>

        <div className="space-y-space-md">
          <DecisionHistoryPanel history={rec.auditHistory || []} />
        </div>
      </div>

      <div className="bg-surface-container-low p-space-lg border-t border-[#E2E8F0]">
        <h3 className="font-title-md text-title-md font-bold text-primary mb-2">Governance Decision</h3>
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">Provide mandatory reasoning for the public gazette before taking action.</p>
        
        <textarea 
          aria-label="Mandatory reasoning for approval, rejection, or override"
          className="w-full p-3 bg-surface-container-lowest border border-[#CBD5E1] rounded focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 mb-4 font-body-sm text-body-sm"
          rows={3}
          placeholder="Mandatory reasoning for approval, rejection, or override..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={isPending}
        />

        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => onDecision(rec.reviewId, 'APPROVE', reason)}
            disabled={!reason || isPending}
            className="flex-1 min-w-[150px] min-h-[48px] bg-secondary hover:bg-[#BF4300] focus:ring-2 focus:ring-secondary outline-none text-[#FFFFFF] font-label-lg text-label-lg font-bold rounded shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">check_circle</span>
            Approve Allocation
          </button>
          <button 
            onClick={() => onDecision(rec.reviewId, 'REJECT', reason)}
            disabled={!reason || isPending}
            className="flex-1 min-w-[150px] min-h-[48px] bg-error hover:bg-[#93000A] focus:ring-2 focus:ring-error outline-none text-on-error font-label-lg text-label-lg font-bold rounded shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">cancel</span>
            Reject
          </button>
          <button 
            onClick={() => onDecision(rec.reviewId, 'OVERRIDE', reason)}
            disabled={!reason || isPending}
            className="flex-1 min-w-[150px] min-h-[48px] bg-surface-container border border-primary focus:ring-2 focus:ring-primary outline-none text-primary hover:bg-surface-container-high font-label-lg text-label-lg font-bold rounded shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">gavel</span>
            Override Review
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminGovernancePage() {
  const queryClient = useQueryClient()
  
  const { data: recommendations, isLoading, error } = useQuery({
    queryKey: ['governance-reviews'],
    queryFn: governanceApi.getReviews,
  })

  const decisionMutation = useMutation({
    mutationFn: async ({ id, decision, reason }: { id: string, decision: string, reason: string }) => {
      if (decision === 'APPROVE') {
        return governanceApi.approveReview(id)
      } else if (decision === 'REJECT') {
        return governanceApi.rejectReview(id, reason)
      } else if (decision === 'OVERRIDE') {
        // Just mocking the target institution ID for the override API
        return governanceApi.overrideReview(id, 'manual-target-inst-id', reason)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['governance-reviews'] })
    }
  })

  const handleDecision = (id: string, decision: string, reason: string) => {
    decisionMutation.mutate({ id, decision, reason })
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-space-xl flex-1">
      <div className="mb-space-lg flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
        <div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-primary tracking-tight">Admin Governance Desk</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Review node escalations, authorize grants, and issue directives.</p>
        </div>
        <div className="bg-surface-container-highest px-4 py-2 rounded-lg inline-flex items-center gap-2 font-label-sm text-label-sm font-bold text-primary self-start md:self-auto">
          <span className="material-symbols-outlined text-[18px]">verified_user</span>
          MeitY Root Authority
        </div>
      </div>

      {isLoading && <LoadingState message="Loading governance reviews..." />}

      {error && (
        <ErrorState 
          message="Failed to load governance reviews. Please try again." 
          onRetry={() => queryClient.invalidateQueries({ queryKey: ['governance-reviews'] })} 
        />
      )}

      {!isLoading && !error && (!recommendations || recommendations.length === 0) ? (
        <EmptyState 
          icon="task" 
          title="No Pending Actions" 
          message="All escalations and grant recommendations have been cleared from the governance queue." 
        />
      ) : (
        recommendations?.map((rec: RecommendationReview) => (
          <RecommendationReviewCard 
            key={rec.reviewId} 
            rec={rec} 
            onDecision={handleDecision} 
            isPending={decisionMutation.isPending} 
          />
        ))
      )}
    </div>
  )
}
