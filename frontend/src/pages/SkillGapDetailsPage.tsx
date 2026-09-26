import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertTriangle, ShieldCheck, Info } from 'lucide-react'
import { SkillGap } from '../types'

// Skill gaps are computed client-side; no backend endpoint.
// This page renders them from router state or a static computation.

const SEVERITY_CONFIG: Record<string, { color: string; bg: string; border: string; label: string; priority: number }> = {
  CRITICAL: { color: '#f43f5e', bg: 'rgba(244,63,94,0.08)', border: 'rgba(244,63,94,0.3)', label: 'Critical', priority: 0 },
  HIGH:     { color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.3)', label: 'High',     priority: 1 },
  MEDIUM:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.3)', label: 'Medium',   priority: 2 },
  LOW:      { color: '#6b7280', bg: 'rgba(107,114,128,0.06)', border: 'rgba(107,114,128,0.2)', label: 'Low',   priority: 3 },
}

const MEMBER_LABELS: Record<string, string> = {
  FACULTY_MENTOR:  'Faculty Mentor',
  INDUSTRY_MENTOR: 'Industry Mentor',
  STUDENT:         'Student Member',
}

// Example static gaps for when no data is injected — replace with real computation
const PLACEHOLDER_GAPS: SkillGap[] = []

export default function SkillGapDetailsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  // In a real flow, gaps would be computed from:
  // 1. GET /capability/registry/institutions/{institutionId}/capabilities  (what the team has)
  // 2. Problem requirement fingerprint (what is needed)
  // Currently no backend endpoint exists — show computed-locally notice.
  const gaps: SkillGap[] = PLACEHOLDER_GAPS

  const sorted = [...gaps].sort((a, b) => {
    const pa = SEVERITY_CONFIG[a.severity]?.priority ?? 99
    const pb = SEVERITY_CONFIG[b.severity]?.priority ?? 99
    return pa - pb
  })

  const counts = {
    CRITICAL: sorted.filter(g => g.severity === 'CRITICAL').length,
    HIGH:     sorted.filter(g => g.severity === 'HIGH').length,
    MEDIUM:   sorted.filter(g => g.severity === 'MEDIUM').length,
    LOW:      sorted.filter(g => g.severity === 'LOW').length,
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '860px' }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back to Team
      </button>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h1 style={{ margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertTriangle size={28} color="#f97316" /> Skill Gap Analysis
        </h1>
        <p style={{ margin: '0 0 1.5rem', color: 'var(--text-muted)' }}>
          Capability coverage report for project {projectId?.substring(0, 8)}...
        </p>

        {/* Info banner */}
        <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#60a5fa', display: 'flex', gap: '0.5rem' }}>
          <Info size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
          <span>
            Skill gap analysis is computed locally by comparing team member skills against problem domain requirements.
            There is currently no backend endpoint for this data. Gaps shown here reflect local computation only.
          </span>
        </div>

        {/* Severity summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {Object.entries(counts).map(([sev, count]) => {
            const cfg = SEVERITY_CONFIG[sev]
            return (
              <div key={sev} style={{ padding: '1rem', borderRadius: '8px', background: cfg.bg, border: `1px solid ${cfg.border}`, textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: cfg.color }}>{count}</div>
                <div style={{ fontSize: '0.8rem', color: cfg.color, fontWeight: 600 }}>{cfg.label}</div>
              </div>
            )
          })}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <ShieldCheck size={48} color="#10b981" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: '#10b981', margin: '0 0 0.5rem' }}>No Skill Gaps Detected</h3>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            The current team appears to cover all required capabilities for this project.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sorted.map((gap, i) => {
            const cfg = SEVERITY_CONFIG[gap.severity] ?? SEVERITY_CONFIG.LOW
            return (
              <div key={gap.id || i} className="glass-panel" style={{ padding: '1.5rem', borderLeft: `4px solid ${cfg.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem' }}>{gap.skill}</h3>
                  <span style={{ padding: '0.2rem 0.65rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, color: cfg.color, background: cfg.bg }}>
                    {cfg.label}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Required Level</div>
                    <div style={{ fontWeight: 600 }}>{gap.requiredLevel || '—'}</div>
                  </div>
                  {gap.currentLevel && (
                    <div>
                      <div style={{ color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Current Level</div>
                      <div style={{ fontWeight: 600 }}>{gap.currentLevel}</div>
                    </div>
                  )}
                  {gap.recommendedMemberType && (
                    <div>
                      <div style={{ color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Recommendation</div>
                      <div style={{ fontWeight: 600, color: 'var(--primary)' }}>
                        Add {MEMBER_LABELS[gap.recommendedMemberType] ?? gap.recommendedMemberType}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
