import React from 'react'
import { ImpactMetrics } from '../../types'
import { Activity, TrendingUp, MapPin, Building2, Users, Briefcase, Star } from 'lucide-react'

interface Props {
  metrics?: ImpactMetrics
  loading?: boolean
}

export default function ImpactSummaryCards({ metrics, loading }: Props) {
  if (loading) {
    return <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)' }}>Loading metrics...</div>
  }

  if (!metrics) {
    return null
  }

  const cards = [
    { title: 'Projects Completed', value: metrics.projectsCompleted, icon: <Activity size={20} color="var(--primary)" />, bg: 'rgba(79, 70, 229, 0.1)' },
    { title: 'Projects Deployed', value: metrics.projectsDeployed, icon: <TrendingUp size={20} color="var(--ok)" />, bg: 'rgba(34, 197, 94, 0.1)' },
    { title: 'Districts Served', value: metrics.districtsServed, icon: <MapPin size={20} color="#f59e0b" />, bg: 'rgba(245, 158, 11, 0.1)' },
    { title: 'Institutions', value: metrics.institutionsInvolved, icon: <Building2 size={20} color="#8b5cf6" />, bg: 'rgba(139, 92, 246, 0.1)' },
    { title: 'Students', value: metrics.studentsInvolved, icon: <Users size={20} color="#ec4899" />, bg: 'rgba(236, 72, 153, 0.1)' },
    { title: 'Faculty', value: metrics.facultyInvolved, icon: <Briefcase size={20} color="#06b6d4" />, bg: 'rgba(6, 182, 212, 0.1)' },
    { title: 'Industry Funding', value: metrics.industryContributions, icon: <Activity size={20} color="#eab308" />, bg: 'rgba(234, 179, 8, 0.1)' },
    { title: 'Avg Satisfaction', value: `${metrics.averageSatisfaction.toFixed(1)}/5`, icon: <Star size={20} color="#f97316" />, bg: 'rgba(249, 115, 22, 0.1)' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
      {cards.map(c => (
        <div key={c.title} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {c.icon}
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{c.title}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{c.value}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
