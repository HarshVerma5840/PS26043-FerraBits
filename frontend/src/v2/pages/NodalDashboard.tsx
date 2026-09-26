import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { problemApi } from '../../api/problemApi'
import { analyticsApi } from '../../api/analyticsApi'
import { LoadingState, ErrorState, EmptyState } from '../components/UIComponents'

function NodalSummaryMetrics({ problems }: { problems: any[] }) {
  const { data: impact } = useQuery({
    queryKey: ['nodal-impact'],
    queryFn: analyticsApi.getSummary,
    staleTime: 5 * 60_000,
  })

  const openCount = problems.filter(p => p.status === 'SUBMITTED' || p.status === 'REGISTERED').length
  const scopedCount = problems.filter(p => p.status === 'REGISTERED').length
  const resolvedCount = problems.filter(p => p.status === 'RESOLVED' || p.status === 'CLOSED').length

  return (
    <div className="w-full bg-surface-container-lowest shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-space-md">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-space-md">
          <div className="p-space-md bg-surface-container-low rounded flex items-center justify-between">
            <div>
              <div className="font-headline-sm text-headline-sm font-bold text-primary">{openCount}</div>
              <div className="font-label-sm text-label-sm text-on-surface-variant font-semibold mt-0.5">Open Civic Grievances</div>
            </div>
            <div className="w-10 h-10 rounded bg-surface-container-lowest flex items-center justify-center text-secondary shadow-sm">
              <span className="material-symbols-outlined text-[22px]">inbox</span>
            </div>
          </div>
          <div className="p-space-md bg-surface-container-low rounded flex items-center justify-between">
            <div>
              <div className="font-headline-sm text-headline-sm font-bold text-primary">{scopedCount}</div>
              <div className="font-label-sm text-label-sm text-on-surface-variant font-semibold mt-0.5">Verified &amp; Scoped</div>
            </div>
            <div className="w-10 h-10 rounded bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm">
              <span className="material-symbols-outlined text-[22px]">fact_check</span>
            </div>
          </div>
          <div className="p-space-md bg-surface-container-low rounded flex items-center justify-between">
            <div>
              <div className="font-headline-sm text-headline-sm font-bold text-secondary">{impact?.studentsInvolved ?? '–'}</div>
              <div className="font-label-sm text-label-sm text-on-surface-variant font-semibold mt-0.5">Assigned to Innovators</div>
            </div>
            <div className="w-10 h-10 rounded bg-surface-container-lowest flex items-center justify-center text-secondary shadow-sm">
              <span className="material-symbols-outlined text-[22px]">school</span>
            </div>
          </div>
          <div className="p-space-md bg-surface-container-low rounded flex items-center justify-between">
            <div>
              <div className="font-headline-sm text-headline-sm font-bold text-tertiary-container">{resolvedCount}</div>
              <div className="font-label-sm text-label-sm text-on-surface-variant font-semibold mt-0.5">Resolved Today</div>
            </div>
            <div className="w-10 h-10 rounded bg-surface-container-lowest flex items-center justify-center text-tertiary-container shadow-sm">
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
            </div>
          </div>
          <div className="p-space-md bg-surface-container-low rounded flex items-center justify-between col-span-2 sm:col-span-1">
            <div>
              <div className="font-headline-sm text-headline-sm font-bold text-on-secondary-container">{impact?.projectsCompleted ?? '–'}</div>
              <div className="font-label-sm text-label-sm text-on-surface-variant font-semibold mt-0.5">Projects Completed</div>
            </div>
            <div className="w-10 h-10 rounded bg-surface-container-lowest flex items-center justify-center text-on-secondary-container shadow-sm">
              <span className="material-symbols-outlined text-[22px]">hub</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TriageFilterBar() {
  return (
    <div className="bg-surface-container-lowest p-space-md rounded shadow-sm space-y-space-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
          <span className="font-label-lg text-label-lg font-bold text-primary">Triage Filters / वर्गीकरण</span>
        </div>
        <button className="font-label-sm text-label-sm text-secondary font-bold hover:underline" type="button">Reset All</button>
      </div>
      <div className="grid grid-cols-3 gap-space-xs">
        <div>
          <label htmlFor="filter-ward" className="block font-label-sm text-label-sm text-on-surface-variant font-semibold mb-1">Ward Zone</label>
          <select id="filter-ward" className="w-full bg-surface-container-low text-on-surface font-body-sm text-body-sm px-2 py-2 rounded focus:outline-none focus:bg-surface-container-highest cursor-pointer">
            <option>All Wards</option>
            <option>Namkum (Ward 14)</option>
            <option>Kanke (Ward 03)</option>
            <option>Doranda (Ward 22)</option>
          </select>
        </div>
        <div>
          <label htmlFor="filter-dept" className="block font-label-sm text-label-sm text-on-surface-variant font-semibold mb-1">Line Dept</label>
          <select id="filter-dept" className="w-full bg-surface-container-low text-on-surface font-body-sm text-body-sm px-2 py-2 rounded focus:outline-none focus:bg-surface-container-highest cursor-pointer">
            <option>All Depts</option>
            <option>PHED (Water)</option>
            <option>PWD (Roads)</option>
            <option>RMC Municipal</option>
          </select>
        </div>
        <div>
          <label htmlFor="filter-priority" className="block font-label-sm text-label-sm text-on-surface-variant font-semibold mb-1">Priority</label>
          <select id="filter-priority" className="w-full bg-surface-container-low text-on-surface font-body-sm text-body-sm px-2 py-2 rounded focus:outline-none focus:bg-surface-container-highest cursor-pointer">
            <option>All Levels</option>
            <option>Critical</option>
            <option>High</option>
            <option>Normal</option>
          </select>
        </div>
      </div>
      <div className="flex items-center justify-between pt-1">
        <span className="font-label-sm text-label-sm text-on-surface-variant">Queue: <strong className="text-on-surface">Auto-updating</strong></span>
        <div className="flex items-center gap-1 font-label-sm text-label-sm text-tertiary-container font-semibold">
          <span className="material-symbols-outlined text-[16px]">sync</span>
          <span>Auto-refresh: Active</span>
        </div>
      </div>
    </div>
  )
}

function CivicProblemQueue({ problems, selectedId, onSelect }: { problems: any[], selectedId: string, onSelect: (id: string) => void }) {
  if (!problems || problems.length === 0) {
    return (
      <div className="flex flex-col gap-space-md">
        <TriageFilterBar />
        <EmptyState title="No problems found" message="No problems found in the queue." />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-space-md">
      <TriageFilterBar />
      
      {problems.map(t => {
        const isActive = t.problemId === selectedId
        const isCritical = t.urgency === 'CRITICAL' || t.severity === 'CRITICAL'
        const isHigh = t.urgency === 'HIGH' || t.severity === 'HIGH'
        const badgeBg = isCritical ? 'bg-secondary-container text-on-primary' : isHigh ? 'bg-surface-container-high text-on-surface-variant' : 'bg-surface-container text-on-surface-variant'
        
        return (
          <div 
            key={t.problemId} 
            role="button"
            tabIndex={0}
            onClick={() => onSelect(t.problemId)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(t.problemId); } }}
            className={`text-left cursor-pointer bg-surface-container-lowest p-space-md rounded shadow-sm transition-all hover:bg-surface-container-low relative focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isActive ? 'bg-gradient-to-r from-secondary/5 via-transparent to-transparent shadow-md' : 'pl-5'}`}
          >
            {isActive && <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-secondary"></div>}
            
            <div className={`flex items-start justify-between gap-space-sm mb-space-xs ${isActive ? 'pl-1' : ''}`}>
              <div className="flex items-center gap-space-xs">
                <span className={`px-2 py-0.5 rounded font-label-sm text-label-sm font-bold ${badgeBg}`}>{t.urgency || 'NORMAL'}</span>
                <span className="font-label-md text-label-md font-bold text-primary">#{t.problemId.substring(0,8)}</span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                {t.submittedAt ? new Date(t.submittedAt).toLocaleDateString() : 'Recent'}
              </span>
            </div>
            
            <div className={`space-y-space-xs ${isActive ? 'pl-1' : ''}`}>
              <h2 className="font-title-md text-title-md font-bold text-on-surface">{t.title}</h2>
              <div className="flex items-center gap-space-sm font-body-sm text-body-sm text-on-surface-variant">
                <span className="flex items-center gap-0.5"><span className="material-symbols-outlined text-[16px] text-outline">location_on</span>{t.locationId ? 'Mapped Location' : 'Unknown Location'}</span>
                <span>•</span>
                <span className={`flex items-center gap-0.5 ${isCritical ? 'text-secondary font-semibold' : ''}`}><span className="material-symbols-outlined text-[16px]">water_drop</span>{t.sourceBucket || 'General'}</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">{t.description}</p>
            </div>
            
            {t.status === 'SUBMITTED' && (
              <div className="pl-1 pt-space-sm flex items-center justify-between flex-wrap gap-space-xs">
                <div className="flex items-center gap-space-xs">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-surface-container rounded font-label-sm text-label-sm text-on-surface-variant font-semibold">
                    <span className="material-symbols-outlined text-[14px]">photo_library</span> Attached Files
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">Scoping Required</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function SpatialConsole() {
  return (
    <div className="bg-surface-container-lowest rounded shadow-sm overflow-hidden flex flex-col mb-space-md">
      <div className="px-space-md py-space-sm bg-primary text-on-primary flex items-center justify-between flex-wrap gap-space-xs">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-[20px] text-secondary-fixed">layers</span>
          <span className="font-label-md text-label-md font-bold uppercase tracking-wider">Spatial Layer: ISRO Bhuvan & Ranchi GIS Grid (Zone 4)</span>
        </div>
        <div className="flex items-center gap-space-xs font-label-sm text-label-sm">
          <button className="px-2 py-1 bg-primary-container text-on-primary rounded hover:bg-surface-container-high transition-colors font-bold flex items-center gap-1" type="button">
            <span className="material-symbols-outlined text-[14px]">radar</span> Heatmap On
          </button>
          <button className="px-2 py-1 bg-primary-container text-on-primary rounded hover:bg-surface-container-high transition-colors font-bold flex items-center gap-1" type="button">
            <span className="material-symbols-outlined text-[14px]">tune</span> 5km Buffer
          </button>
        </div>
      </div>
      <div className="relative w-full h-[360px] bg-[#dbe4ee] overflow-hidden select-none">
        <svg className="absolute inset-0 w-full h-full text-slate-300" preserveAspectRatio="none" viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg">
          <path d="M-20,180 C150,220 280,140 450,260 C620,380 720,290 850,330" fill="none" opacity="0.6" stroke="#90caf9" strokeLinecap="round" strokeWidth="28"></path>
          <path d="M-20,180 C150,220 280,140 450,260 C620,380 720,290 850,330" fill="none" opacity="0.7" stroke="#64b5f6" strokeLinecap="round" strokeWidth="12"></path>
          <path d="M50,-10 L220,150 L340,240 L580,310 L820,440" fill="none" stroke="#ffffff" strokeWidth="8"></path>
          <path d="M50,-10 L220,150 L340,240 L580,310 L820,440" fill="none" stroke="#f1c40f" strokeDasharray="8 6" strokeWidth="2"></path>
          <line stroke="#cbd5e1" strokeDasharray="4 4" strokeWidth="1.5" x1="120" x2="120" y1="0" y2="450"></line>
          <line stroke="#cbd5e1" strokeDasharray="4 4" strokeWidth="1.5" x1="380" x2="380" y1="0" y2="450"></line>
          <line stroke="#cbd5e1" strokeDasharray="4 4" strokeWidth="1.5" x1="640" x2="640" y1="0" y2="450"></line>
          <line stroke="#cbd5e1" strokeDasharray="4 4" strokeWidth="1.5" x1="0" x2="800" y1="120" y2="120"></line>
          <line stroke="#cbd5e1" strokeDasharray="4 4" strokeWidth="1.5" x1="0" x2="800" y1="280" y2="280"></line>
          <circle cx="480" cy="180" fill="rgba(252, 96, 24, 0.12)" r="110" stroke="#fc6018" strokeDasharray="6 4" strokeWidth="2"></circle>
          <circle cx="480" cy="180" fill="rgba(252, 96, 24, 0.22)" r="45" stroke="#a83900" strokeWidth="1.5"></circle>
        </svg>
        <div className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-sm p-2 rounded shadow-sm font-label-sm text-label-sm text-on-surface space-y-1">
          <div className="font-bold text-primary flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-secondary">explore</span>
            <span>LAT 23.3441° N | LON 85.3096° E</span>
          </div>
          <div className="text-on-surface-variant">Cluster Code: Auto-generated</div>
        </div>
        <div className="absolute top-[160px] left-[465px] transform -translate-x-1/2 -translate-y-full cursor-pointer group">
          <div className="relative flex flex-col items-center">
            <span className="absolute -top-1 w-8 h-8 bg-secondary-container rounded-full animate-ping opacity-75"></span>
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-on-primary shadow-lg ring-4 ring-surface-container-lowest z-10">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>water_drop</span>
            </div>
          </div>
        </div>
      </div>
      <div className="px-space-md py-2 bg-surface-container-low flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px] text-tertiary-container">verified</span>
          NIC BharatMaps Integration: Active & Geocoded
        </span>
        <span>Spatial Projection: WGS 84 / UTM Zone 45N</span>
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function RoutingActionCards({ ticket, onRoute, isPending }: { ticket: any, onRoute: (action: string) => void, isPending: boolean }) {
  return (
    <div>
      <span className="block font-label-sm text-label-sm text-on-surface-variant font-bold uppercase mb-space-sm">Nodal Determination & Scoping Routing</span>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
        <button disabled={isPending} onClick={() => onRoute('REGISTERED')} className="p-space-md rounded text-left transition-all bg-secondary hover:bg-on-secondary-fixed-variant text-on-primary flex flex-col justify-between group shadow-sm disabled:opacity-50" type="button">
          <div>
            <div className="flex items-center justify-between mb-space-xs">
              <span className="material-symbols-outlined text-[24px]">school</span>
              <span className="material-symbols-outlined text-[18px] opacity-75 group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </div>
            <div className="font-label-lg text-label-lg font-bold mb-1">Convert to Challenge</div>
            <p className="font-body-sm text-body-sm opacity-90 leading-tight">Dispatch open prototyping challenge.</p>
          </div>
          <div className="mt-space-md pt-space-xs border-t border-white/20 font-label-sm text-label-sm font-semibold">
            Status: REGISTERED
          </div>
        </button>
        <button disabled={isPending} onClick={() => onRoute('ARCHIVED')} className="p-space-md rounded text-left transition-all bg-surface-container-high hover:bg-surface-dim text-on-surface flex flex-col justify-between group shadow-sm disabled:opacity-50" type="button">
          <div>
            <div className="flex items-center justify-between mb-space-xs">
              <span className="material-symbols-outlined text-[24px] text-primary">merge</span>
              <span className="material-symbols-outlined text-[18px] opacity-75 group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </div>
            <div className="font-label-lg text-label-lg font-bold mb-1">Merge / Archive</div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-tight">Consolidate with previous grievances.</p>
          </div>
          <div className="mt-space-md pt-space-xs border-t border-outline-variant/30 font-label-sm text-label-sm text-on-surface-variant font-semibold">
            Status: ARCHIVED
          </div>
        </button>
        <button disabled={isPending} onClick={() => onRoute('REJECTED')} className="p-space-md rounded text-left transition-all bg-error text-on-error flex flex-col justify-between group shadow-sm disabled:opacity-50" type="button">
          <div>
            <div className="flex items-center justify-between mb-space-xs">
              <span className="material-symbols-outlined text-[24px]">cancel</span>
              <span className="material-symbols-outlined text-[18px] opacity-75 group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </div>
            <div className="font-label-lg text-label-lg font-bold mb-1">Reject Problem</div>
            <p className="font-body-sm text-body-sm opacity-90 leading-tight">Invalidate grievance.</p>
          </div>
          <div className="mt-space-md pt-space-xs border-t border-white/20 font-label-sm text-label-sm font-semibold">
            Status: REJECTED
          </div>
        </button>
      </div>
    </div>
  )
}

function ScopingDossier({ ticket, onRoute, isPending }: { ticket: any, onRoute: (action: string) => void, isPending: boolean }) {
  return (
    <div className="bg-surface-container-lowest rounded shadow-md p-space-lg space-y-space-md relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-secondary rounded-t"></div>
      
      <div className="flex items-start justify-between flex-wrap gap-space-sm pt-1">
        <div>
          <div className="flex items-center gap-space-xs mb-1">
            <span className="font-headline-sm text-headline-sm font-bold text-primary">Scoping Dossier & Action Hub</span>
            <span className="px-2 py-0.5 bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-bold rounded">LIVE TRIAGE</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Reference ID: <strong className="text-on-surface">{ticket.problemId}</strong>
          </p>
        </div>
      </div>
      
      <div className="bg-surface-container-low p-space-md rounded border border-surface-container">
        <h3 className="font-title-md text-title-md font-bold mb-2">{ticket.title}</h3>
        <p className="font-body-sm text-body-sm text-on-surface-variant whitespace-pre-wrap">{ticket.description}</p>
        <div className="mt-2 text-sm">
          <strong>Status: </strong> <span>{ticket.status}</span><br />
          <strong>Severity: </strong> <span>{ticket.severity}</span>
        </div>
      </div>
      
      <RoutingActionCards ticket={ticket} onRoute={onRoute} isPending={isPending} />
      
      <div className="pt-space-sm flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm flex-wrap gap-2 border-t border-[#E2E8F0] mt-4">
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px] text-primary">fingerprint</span>
          Digitally Authenticated by e-Sign / NIC PKI Infrastructure
        </span>
        <span className="font-mono text-outline">STQC Cert: 2025/IN/MEITY/6102</span>
      </div>
    </div>
  )
}

export default function NodalOfficerDashboardPage() {
  const queryClient = useQueryClient()
  
  const { data: problemsData, isLoading, error } = useQuery({
    queryKey: ['nodal-problems'],
    queryFn: () => problemApi.getProblems(23.3441, 85.3096, 50.0),
  })

  // Filter to show actionable triage problems by default, though we might show all
  const problems = problemsData || []

  const [selectedId, setSelectedId] = useState<string | null>(null)
  
  // Set default selection when data loads
  if (problems.length > 0 && !selectedId && !isLoading) {
    setSelectedId(problems[0].problemId)
  }

  const selectedTicket = problems.find((t: any) => t.problemId === selectedId)

  const mutation = useMutation({
    mutationFn: ({ id, status, version }: { id: string, status: string, version: number }) => {
      return problemApi.updateStatus(id, status, version)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodal-problems'] })
      toast.success('Triage decision registered successfully!')
    },
    onError: (err: any) => {
      toast.error(`Failed to route problem: ${err.message}`)
    }
  })

  const handleRouteAction = (actionStatus: string) => {
    if (!selectedTicket) return
    mutation.mutate({
      id: selectedTicket.problemId,
      status: actionStatus,
      version: selectedTicket.version || 0
    })
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="w-full bg-surface-container-low px-6 lg:px-12 py-space-md shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md">
            <div className="w-12 h-12 bg-primary rounded flex items-center justify-center text-on-primary shadow-sm flex-shrink-0">
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield_with_house</span>
            </div>
            <div>
              <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">
                <span>STATE NODAL COMMAND</span>
                <span>•</span>
                <span className="text-secondary font-bold">Triage Queue</span>
              </div>
              <div className="flex items-baseline gap-space-sm">
                <h1 className="font-headline-md text-headline-md text-primary font-bold">Nodal Officer Panel</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <NodalSummaryMetrics problems={problems} />

      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-space-lg flex-1">
        {isLoading ? (
          <LoadingState message="Loading incoming grievances..." />
        ) : error ? (
          <ErrorState 
            message="Failed to load incoming grievances. Please try again." 
            onRetry={() => queryClient.invalidateQueries({ queryKey: ['nodal-problems'] })} 
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
            
            <div className="lg:col-span-5 h-[calc(100vh-320px)] overflow-y-auto pr-2">
              <CivicProblemQueue 
                problems={problems} 
                selectedId={selectedId || ''} 
                onSelect={setSelectedId} 
              />
            </div>

            <div className="lg:col-span-7 flex flex-col gap-space-md">
              <SpatialConsole />
              
              {selectedTicket ? (
                <ScopingDossier ticket={selectedTicket} onRoute={handleRouteAction} isPending={mutation.isPending} />
              ) : (
                <div className="bg-surface-container-lowest rounded shadow-md p-space-lg flex items-center justify-center min-h-[300px]">
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Select a grievance from the queue to view dossier.</p>
                </div>
              )}
            </div>
            
          </div>
        )}
      </div>
    </div>
  )
}
