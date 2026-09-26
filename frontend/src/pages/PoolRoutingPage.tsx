import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useOutletContext } from 'react-router-dom'
import { evaluationAdminApi, EvaluationCycle } from '../api/evaluationAdminApi'
import { Play, RotateCw } from 'lucide-react'

export default function PoolRoutingPage() {
  const { cycle, refreshCycle } = useOutletContext<{ cycle: EvaluationCycle, refreshCycle: () => void }>()
  const [running, setRunning] = useState(false)

  const handleAction = async (action: 'analyze' | 'route' | 'route-pools') => {
    setRunning(true)
    try {
      if (action === 'analyze') await evaluationAdminApi.analyzeCycle(cycle.cycleId)
      if (action === 'route') await evaluationAdminApi.routeCycle(cycle.cycleId)
      if (action === 'route-pools') await evaluationAdminApi.routeAllPools(cycle.cycleId)
      
      refreshCycle()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <Play size={20} color="var(--primary)" /> Analysis & Routing
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Manually trigger the pipeline stages to generate AI context and assign to evaluator pools.
        These are usually triggered automatically but can be run here for testing or recovery.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3>1. AI Problem Analysis</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Analyzes the problem and automatically triggers route-pools.</p>
          </div>
          <button onClick={() => handleAction('analyze')} disabled={running} className="btn" style={{ background: 'var(--primary)' }}>
            <Play size={16} /> Run Analysis
          </button>
        </div>

        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3>2. Route to Origin Bucket</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Assigns only to the pool matching the origin bucket ({cycle.originBucket}).</p>
          </div>
          <button onClick={() => handleAction('route')} disabled={running} className="btn" style={{ background: 'var(--secondary)' }}>
            <RotateCw size={16} /> Route Bucket
          </button>
        </div>

        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3>3. Route All Pools</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>The 5-pool repair pass. Safe to run multiple times.</p>
          </div>
          <button onClick={() => handleAction('route-pools')} disabled={running} className="btn" style={{ background: '#8b5cf6' }}>
            <RotateCw size={16} /> Route All Pools
          </button>
        </div>
      </div>
    </div>
  )
}
