import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { evaluationApi, ScoreSubmission } from '../../api/evaluationApi'

function DossierHeader({ problemId }: { problemId?: string }) {
  return (
    <>
      {/* Sovereign Breadcrumb & Header Appraisal Ribbon */}
      <section className="w-full bg-surface-container-low py-space-md shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <nav aria-label="Breadcrumb" className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant flex-wrap">
            <a className="hover:text-primary transition-colors" href="#">Home</a>
            <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
            <a className="hover:text-primary transition-colors" href="#">Innovation Hub</a>
            <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
            <span className="text-on-surface">Evaluation Queue</span>
            <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
            <span className="text-primary font-bold bg-primary-fixed text-on-primary-fixed px-2 py-0.5 rounded">#{problemId || 'EV-9102'}</span>
          </nav>
          <div className="flex items-center gap-space-md self-start md:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-highest text-primary font-label-sm text-label-sm font-semibold">
              <span className="material-symbols-outlined text-[16px] text-secondary">verified_user</span>
              DST Dossier Verifier v4.2
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-fixed text-tertiary font-label-sm text-label-sm font-bold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse"></span>
              Stage 2: Technical Appraisal
            </span>
          </div>
        </div>
      </section>

      {/* Dossier Headline Authority Banner */}
      <section className="w-full bg-surface-container-lowest shadow-sm mb-space-xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-space-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
            <div className="space-y-space-xs">
              <div className="flex items-center gap-space-sm flex-wrap">
                <span className="font-label-sm text-label-sm uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed">
                  Jal Jeevan Mission / जल जीवन मिशन
                </span>
                <span className="text-on-surface-variant font-label-sm text-label-sm">Problem ID: {problemId || 'IN-JH-2025-00891'}</span>
                <span className="text-outline-variant">•</span>
                <span className="text-on-surface-variant font-label-sm text-label-sm">Class: Tier-2</span>
              </div>
              <h1 className="font-headline-lg text-headline-lg font-bold text-primary tracking-tight">
                Evaluating Project Submission
              </h1>
              <div className="flex flex-wrap items-center gap-x-space-lg gap-y-space-xs font-body-sm text-body-sm text-on-surface-variant pt-space-xs">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary text-[18px]">school</span>
                  <span>Submitter: <strong className="text-on-surface font-semibold">Assigned Team</strong></span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary text-[18px]">account_balance</span>
                  <span>Nodal Authority: <strong className="text-on-surface font-semibold">Jharkhand State Innovation Council</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function TechnicalAbstractPanel() {
  return (
    <article className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm space-y-space-md">
      <div className="flex items-center justify-between pb-space-sm">
        <div className="flex items-center gap-space-sm">
          <div className="w-8 h-8 rounded bg-primary-container flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined text-[20px]">architecture</span>
          </div>
          <h2 className="font-headline-sm text-headline-sm font-bold text-primary">Technical Abstract & Architecture</h2>
        </div>
        <span className="font-label-sm text-label-sm bg-surface-container-low px-2.5 py-1 rounded text-on-surface-variant font-semibold">Specs v1.02</span>
      </div>
      <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
        Autonomous multi-sensor node engineered for riparian and shallow catchment zones along the Subarnarekha river tributaries. 
        The system pairs an array of optical nephelometric sensors with an internal temperature compensation probe, routing sampled telemetry 
        via a low-power LoRaWAN transceiver (865–867 MHz IN-band) to a community gateway located at the Namkum Block Development Office.
      </p>
      
      <div className="grid grid-cols-3 gap-space-sm pt-space-xs">
        <div className="p-space-sm bg-surface-container-low rounded">
          <span className="font-label-sm text-label-sm text-on-surface-variant block">Sampling Cadence</span>
          <span className="font-title-md text-title-md font-bold text-primary">Every 15 min</span>
        </div>
        <div className="p-space-sm bg-surface-container-low rounded">
          <span className="font-label-sm text-label-sm text-on-surface-variant block">RF Protocol</span>
          <span className="font-title-md text-title-md font-bold text-primary">LoRaWAN 865MHz</span>
        </div>
        <div className="p-space-sm bg-surface-container-low rounded">
          <span className="font-label-sm text-label-sm text-on-surface-variant block">Battery Autonomy</span>
          <span className="font-title-md text-title-md font-bold text-primary">28 Days (0-sun)</span>
        </div>
      </div>
    </article>
  )
}

function RepositoryAuditCard() {
  return (
    <article className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm space-y-space-md">
      <div className="flex items-center justify-between pb-space-sm">
        <div className="flex items-center gap-space-sm">
          <div className="w-8 h-8 rounded bg-primary-container flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined text-[20px]">terminal</span>
          </div>
          <h2 className="font-headline-sm text-headline-sm font-bold text-primary">Code Repository & Static Audit</h2>
        </div>
        <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-secondary font-bold">
          <span className="material-symbols-outlined text-[16px]">lock_open</span> Public Open Source
        </span>
      </div>
      <div className="p-space-md bg-surface-container-low rounded-lg space-y-space-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-outline text-[20px]">hub</span>
            <span className="font-label-lg text-label-lg font-bold text-primary select-all">https://github.com/gov-jh-saamyukt/submission</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm pt-space-xs font-label-sm text-label-sm">
          <div>
            <span className="text-on-surface-variant block">Active Release:</span>
            <span className="font-bold text-on-surface font-mono">abc123d-v1.0</span>
          </div>
          <div>
            <span className="text-on-surface-variant block">Licensing:</span>
            <span className="font-bold text-primary">MIT License (OSI)</span>
          </div>
          <div>
            <span className="text-on-surface-variant block">Clean Code Audit:</span>
            <span className="font-bold text-tertiary-container flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[14px]">check_circle</span> 96% Score
            </span>
          </div>
          <div>
            <span className="text-on-surface-variant block">Static Analysis:</span>
            <span className="font-bold text-on-surface">0 Severe CWEs</span>
          </div>
        </div>
      </div>
    </article>
  )
}

function CriterionScoreRow({ id, title, score, maxScore, minLabel, maxLabel, onChange }: { id: string, title: string, score: number, maxScore: number, minLabel: string, maxLabel: string, onChange: (val: number) => void }) {
  return (
    <div className="space-y-1 bg-surface-container-low p-space-sm rounded">
      <div className="flex justify-between items-center">
        <label className="font-label-md text-label-md font-semibold text-primary" htmlFor={id}>
          {title}
        </label>
        <span className="font-title-md text-title-md font-bold text-primary font-mono">{score}<span className="text-outline text-label-sm font-normal">/{maxScore}</span></span>
      </div>
      <input 
        id={id}
        type="range" 
        min="0" 
        max={maxScore} 
        value={score}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full accent-secondary cursor-pointer h-2 bg-surface-container-highest rounded" 
      />
      <div className="flex justify-between font-label-sm text-label-sm text-outline">
        <span>{minLabel} (0)</span>
        <span>{maxLabel} ({maxScore})</span>
      </div>
    </div>
  )
}

function EvaluationRubric({ criteria, scores, onScoreChange }: { criteria: any[], scores: Record<string, number>, onScoreChange: (criterionId: string, val: number) => void }) {
  const total = Object.values(scores).reduce((a, b) => a + b, 0)
  const maxPossible = criteria.reduce((sum, c) => sum + (c.maxScore || 100), 0)
  
  return (
    <div className="space-y-space-md">
      {criteria.map((c, idx) => (
        <CriterionScoreRow 
          key={c.criterionId} 
          id={`score-${c.criterionId}`} 
          title={`${idx + 1}. ${c.name}`} 
          score={scores[c.criterionId] || 0} 
          maxScore={c.maxScore} 
          minLabel="Low" 
          maxLabel="High" 
          onChange={(val) => onScoreChange(c.criterionId, val)} 
        />
      ))}
      
      <div className="p-space-md bg-primary text-on-primary rounded-lg flex items-center justify-between shadow-sm mt-4">
        <div className="space-y-0.5">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary-fixed">Calculated Dossier Score</span>
          <div className="font-headline-sm text-headline-sm font-bold flex items-baseline gap-1">
            <span>{total}</span>
            <span className="font-label-md text-label-md text-outline-variant font-normal">/ {maxPossible || 100}</span>
          </div>
        </div>
        <div className="text-right">
          <span className={`inline-block px-2.5 py-1 ${(total / (maxPossible || 100)) >= 0.75 ? 'bg-tertiary-fixed text-tertiary' : 'bg-secondary-fixed text-secondary'} rounded font-label-sm text-label-sm font-bold`}>
            {(total / (maxPossible || 100)) >= 0.75 ? 'PASS (GRADE A)' : 'REVISION NEEDED'}
          </span>
          <span className="block font-label-sm text-label-sm text-primary-fixed pt-0.5">Threshold: {Math.ceil((maxPossible || 100) * 0.75)}/{maxPossible || 100}</span>
        </div>
      </div>
    </div>
  )
}

function EvaluatorCommentsPanel({ comments, setComments }: { comments: string, setComments: (c: string) => void }) {
  return (
    <div className="space-y-space-xs mt-space-lg">
      <label className="font-label-lg text-label-lg font-bold text-primary block" htmlFor="evaluatorRemarks">
        Evaluator Comments & Statutory Recommendation
      </label>
      <div className="relative">
        <textarea 
          id="evaluatorRemarks"
          aria-label="Evaluator Comments & Statutory Recommendation"
          className="w-full p-3 bg-surface-container-low text-on-surface font-body-sm text-body-sm rounded-lg focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary border border-transparent focus:border-primary transition-all" 
          rows={4}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Enter formal technical observations for council gazette record..." 
        />
      </div>
    </div>
  )
}

function EvaluationDecisionPanel({ onSubmit, isPending }: { onSubmit: (action: string) => void, isPending: boolean }) {
  return (
    <div className="space-y-space-sm pt-space-xs mt-space-md">
      <button 
        onClick={() => onSubmit('SUBMIT')} 
        disabled={isPending}
        className="w-full min-h-[48px] px-6 py-3 bg-secondary hover:bg-[#BF4300] focus:ring-2 focus:ring-secondary focus:outline-none text-[#FFFFFF] rounded font-label-lg text-label-lg font-bold transition-all shadow-md flex items-center justify-center gap-space-xs group disabled:opacity-50" 
        type="button"
      >
        <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform" aria-hidden="true">verified</span>
        <span>Submit Official Evaluation</span>
      </button>
      <button 
        onClick={() => onSubmit('REVISE')} 
        disabled={isPending}
        className="w-full min-h-[48px] px-6 py-2.5 bg-surface-container text-primary hover:bg-surface-container-high focus:ring-2 focus:ring-primary focus:outline-none rounded font-label-lg text-label-lg font-bold transition-all flex items-center justify-center gap-space-xs disabled:opacity-50" 
        type="button"
      >
        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">assignment_late</span>
        <span>Request Revision / Clarification</span>
      </button>
    </div>
  )
}

export default function EvaluatorDashboardPage() {
  const queryClient = useQueryClient()
  
  const { data: assignments, isLoading, error } = useQuery({
    queryKey: ['evaluator-assignments'],
    queryFn: () => evaluationApi.getAssignments('IN_PROGRESS'),
  })

  const activeAssignment = assignments && assignments.length > 0 ? assignments[0] : null
  
  const { data: assignmentDetail, isLoading: isDetailLoading } = useQuery({
    queryKey: ['evaluator-assignment-detail', activeAssignment?.assignmentId],
    queryFn: () => evaluationApi.getAssignmentDetail(activeAssignment!.assignmentId),
    enabled: !!activeAssignment
  })

  // Initialize scores based on criteria fetched
  const [scores, setScores] = useState<Record<string, number>>({})
  const [comments, setComments] = useState("")
  
  // Pre-fill scores if criteria exist and we haven't initialized them yet
  React.useEffect(() => {
    if (assignmentDetail && Object.keys(scores).length === 0) {
      const initialScores: Record<string, number> = {}
      assignmentDetail.criteria.forEach((c: any) => {
        initialScores[c.criterionId] = c.score || 0
      })
      setScores(initialScores)
    }
  }, [assignmentDetail, scores])

  const submitMutation = useMutation({
    mutationFn: async ({ assignmentId, data }: { assignmentId: string, data: ScoreSubmission }) => {
      return evaluationApi.submitEvaluation(assignmentId, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluator-assignments'] })
      toast.success('Evaluation submitted successfully.')
    },
    onError: (err: any) => {
      toast.error(`Failed to submit evaluation: ${err.message}`)
    }
  })

  const handleScoreChange = (criterionId: string, val: number) => {
    setScores(prev => ({ ...prev, [criterionId]: val }))
  }

  const handleSubmit = (action: string) => {
    if (!activeAssignment || !assignmentDetail) return
    
    submitMutation.mutate({
      assignmentId: activeAssignment.assignmentId,
      data: {
        scores: assignmentDetail.criteria.map((c: any) => ({
          criterionId: c.criterionId,
          score: scores[c.criterionId] || 0,
          comment: `Score for ${c.name}`
        })),
        feedback: comments,
        recommendation: action === 'SUBMIT' ? 'APPROVE' : 'REVISE'
      }
    })
  }

  if (isLoading || (activeAssignment && isDetailLoading)) {
    return (
      <div className="flex flex-col w-full">
        <div className="flex justify-center p-space-xl min-h-screen items-center">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col w-full p-space-xl">
        <div className="bg-error-container text-on-error-container p-space-md rounded-lg font-body-sm text-body-sm">
          Failed to load assignments. Please try again.
        </div>
      </div>
    )
  }

  if (!activeAssignment || !assignmentDetail) {
    return (
      <div className="flex flex-col w-full p-space-xl">
        <div className="bg-surface-container-lowest border border-[#E2E8F0] p-space-xl rounded-xl text-center flex flex-col items-center">
          <span className="material-symbols-outlined text-[48px] text-outline mb-4">task</span>
          <h3 className="font-title-md text-title-md font-bold text-on-surface">No Pending Evaluations</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">You have no pending evaluation assignments at this time.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full">
      <DossierHeader problemId={activeAssignment.problemId} />
      
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-space-xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          
          <div className="lg:col-span-7 space-y-space-xl">
            <TechnicalAbstractPanel />
            <RepositoryAuditCard />
          </div>
          
          <div className="lg:col-span-5 space-y-space-xl">
            <section className="bg-surface-container-lowest p-space-lg rounded-xl shadow-md space-y-space-lg sticky top-28 border border-[#E2E8F0]">
              <div className="space-y-space-xs">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm uppercase font-bold text-secondary tracking-wider">
                    Statutory Assessment
                  </span>
                  <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-tertiary-fixed text-tertiary font-semibold">
                    Quorum Present
                  </span>
                </div>
                <h2 className="font-headline-md text-headline-md font-bold text-primary">
                  Official Evaluation Rubric
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Joint Academic & Nodal Ministry Scoring per National Innovation Framework Norms.
                </p>
              </div>
              
              <div className="p-space-sm bg-surface-container rounded-lg space-y-space-xs">
                <div className="font-label-sm text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">Evaluation Bench</div>
                <div className="flex items-center gap-space-sm">
                  <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-label-sm">YOU</div>
                  <div className="min-w-0">
                    <div className="font-label-md text-label-md font-bold text-on-surface truncate">Evaluator Node</div>
                    <div className="font-label-sm text-label-sm text-on-surface-variant truncate">Assigned by System</div>
                  </div>
                </div>
              </div>
              
              <EvaluationRubric criteria={assignmentDetail.criteria} scores={scores} onScoreChange={handleScoreChange} />
              <EvaluatorCommentsPanel comments={comments} setComments={setComments} />
              <EvaluationDecisionPanel onSubmit={handleSubmit} isPending={submitMutation.isPending} />
              
              <div className="p-space-xs bg-surface-container-low rounded text-center mt-4">
                <span className="font-label-sm text-label-sm text-outline flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">lock</span>
                  Recorded permanently under IT Act Section 65B Sovereign Audit Trail
                </span>
              </div>
            </section>
          </div>
          
        </div>
      </main>
    </div>
  )
}
