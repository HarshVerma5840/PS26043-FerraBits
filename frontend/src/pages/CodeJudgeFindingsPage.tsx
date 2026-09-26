import React, { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { codejudgeApi, CodeJudgeEvaluation, CodeJudgeFinding } from '../api/codejudgeApi'
import { ShieldAlert, AlertTriangle, Info } from 'lucide-react'

export default function CodeJudgeFindingsPage() {
  const { evaluation } = useOutletContext<{ evaluation: CodeJudgeEvaluation }>()
  const [findings, setFindings] = useState<CodeJudgeFinding[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    codejudgeApi.getFindings(evaluation.evaluationId)
      .then(res => setFindings(res))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [evaluation.evaluationId])

  if (loading) return <div>Loading...</div>
  if (error) return <div style={{ padding: '2rem', color: 'var(--accent)' }}>Failed to load findings: {error}</div>

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return <ShieldAlert size={18} color="#ef4444" />
      case 'HIGH': return <ShieldAlert size={18} color="#f97316" />
      case 'MEDIUM': return <AlertTriangle size={18} color="#eab308" />
      case 'LOW': return <Info size={18} color="#3b82f6" />
      case 'INFO': return <Info size={18} color="#6b7280" />
      default: return <Info size={18} color="#6b7280" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'rgba(239, 68, 68, 0.1)'
      case 'HIGH': return 'rgba(249, 115, 22, 0.1)'
      case 'MEDIUM': return 'rgba(234, 179, 8, 0.1)'
      case 'LOW': return 'rgba(59, 130, 246, 0.1)'
      case 'INFO': return 'rgba(107, 114, 128, 0.1)'
      default: return 'transparent'
    }
  }

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        <ShieldAlert size={24} color="var(--primary)" /> Findings
      </h2>

      {findings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          No findings reported. Perfect score!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {findings.map(f => (
            <div key={f.findingId} style={{ 
              padding: '1.5rem', 
              background: getSeverityColor(f.severity), 
              borderLeft: `4px solid ${f.severity === 'CRITICAL' ? '#ef4444' : f.severity === 'HIGH' ? '#f97316' : f.severity === 'MEDIUM' ? '#eab308' : '#3b82f6'}`,
              borderRadius: '0 8px 8px 0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  {getSeverityIcon(f.severity)} {f.severity}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Category: {f.categoryKey} | Rule: {f.ruleKey}
                </div>
              </div>
              <p style={{ margin: '0 0 1rem 0' }}>{f.description}</p>
              {f.evidenceRef && (
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  {f.evidenceRef}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
