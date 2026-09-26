import React from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ShieldCheck, ChevronRight, Info } from 'lucide-react'
import { SkillGap } from '../types'

interface Props {
  projectId: string
  gaps: SkillGap[]
}

const SEVERITY_CONFIG = {
  CRITICAL: { color: '#f43f5e', bg: 'rgba(244,63,94,0.1)', label: 'Critical' },
  HIGH:     { color: '#f97316', bg: 'rgba(249,115,22,0.1)', label: 'High' },
  MEDIUM:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Medium' },
  LOW:      { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', label: 'Low' },
}

const MEMBER_TYPE_LABELS: Record<string, string> = {
  FACULTY_MENTOR:  'Faculty Mentor',
  INDUSTRY_MENTOR: 'Industry Mentor',
  STUDENT:         'Student Member',
}

export default function SkillGapPanel({ projectId, gaps }: Props) {
  if (gaps.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(16,185,129,0.04)', borderLeft: '3px solid #10b981' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 600, marginBottom: '0.5rem' }}>
          <ShieldCheck size={18} /> Full Skill Coverage
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
          All required capabilities appear to be covered by current team members.
        </p>
        <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem' }}>
          <Info size={12} style={{ flexShrink: 0, marginTop: '2px' }} />
          Gaps are computed locally — no backend skill-gap endpoint exists.
        </div>
      </div>
    )
  }

  const critical = gaps.filter(g => g.severity === 'CRITICAL' || g.severity === 'HIGH')

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '3px solid #f97316' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f97316' }}>
          <AlertTriangle size={16} /> Skill Gaps ({gaps.length})
        </h3>
        <Link to={`/projects/${projectId}/skill-gaps`} style={{ fontSize: '0.8rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          View all <ChevronRight size={14} />
        </Link>
      </div>

      {critical.length > 0 && (
        <div style={{ background: 'rgba(244,63,94,0.07)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '6px', padding: '0.6rem 0.75rem', marginBottom: '1rem', fontSize: '0.82rem', color: '#f43f5e' }}>
          {critical.length} critical/high severity gap{critical.length !== 1 ? 's' : ''} require immediate attention
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {gaps.slice(0, 5).map((gap, i) => {
          const cfg = SEVERITY_CONFIG[gap.severity as keyof typeof SEVERITY_CONFIG] ?? SEVERITY_CONFIG.LOW
          return (
            <div key={gap.id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{gap.skill}</div>
                {gap.recommendedMemberType && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    → Add {MEMBER_TYPE_LABELS[gap.recommendedMemberType] ?? gap.recommendedMemberType}
                  </div>
                )}
              </div>
              <span style={{ padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, color: cfg.color, background: cfg.bg, flexShrink: 0 }}>
                {cfg.label}
              </span>
            </div>
          )
        })}
        {gaps.length > 5 && (
          <Link to={`/projects/${projectId}/skill-gaps`} style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', paddingTop: '0.25rem' }}>
            +{gaps.length - 5} more gaps
          </Link>
        )}
      </div>
    </div>
  )
}
