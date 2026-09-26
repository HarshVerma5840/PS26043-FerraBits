import React from 'react'
import { ImpactMetrics } from '../../types'
import { TrendingUp, Users, MapPin, Building2, CheckCircle } from 'lucide-react'

export default function ImpactMetricsPanel({ metrics, loading }: { metrics?: ImpactMetrics, loading?: boolean }) {
  if (loading) return <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading impact metrics...</div>
  if (!metrics) return null

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0, marginBottom: '1.5rem' }}>
        <TrendingUp size={18} color="var(--primary)" /> Ecosystem Impact
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{metrics.projectsDeployed}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><CheckCircle size={12}/> Deployed</div>
        </div>
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{metrics.districtsServed}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><MapPin size={12}/> Districts</div>
        </div>
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{metrics.institutionsInvolved}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Building2 size={12}/> Institutions</div>
        </div>
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{metrics.studentsInvolved}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Users size={12}/> Students</div>
        </div>
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{metrics.deploymentSuccessRate.toFixed(1)}%</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><TrendingUp size={12}/> Success</div>
        </div>
      </div>
    </div>
  )
}
