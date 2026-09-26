import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useOutletContext } from 'react-router-dom'
import { evaluationAdminApi, EvaluationCycle } from '../api/evaluationAdminApi'
import { Star, RefreshCw } from 'lucide-react'

export default function PrioritizationPage() {
  const { cycle, refreshCycle } = useOutletContext<{ cycle: EvaluationCycle, refreshCycle: () => void }>()
  const [running, setRunning] = useState(false)

  const handlePrioritize = async () => {
    setRunning(true)
    try {
      await evaluationAdminApi.prioritizeCycle(cycle.cycleId)
      refreshCycle()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Star size={20} color="orange" /> Prioritization
        </h2>
      </div>

      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Applies band thresholds to the final score to categorise the problem into P1 (highest) to P4 (lowest) priority.
        Runs automatically after aggregation.
      </p>

      {cycle.priorityBand ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Assigned Priority Band</div>
          <div style={{ fontSize: '4rem', fontWeight: 800, color: 'orange', lineHeight: 1 }}>{cycle.priorityBand}</div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          Not yet prioritized. Ensure aggregation is complete.
        </div>
      )}

      <div style={{ marginTop: '2rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
        <button onClick={handlePrioritize} disabled={running} className="btn btn-secondary">
          <RefreshCw size={16} /> Run Prioritization
        </button>
      </div>
    </div>
  )
}
