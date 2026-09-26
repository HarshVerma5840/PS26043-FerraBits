import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { evaluationAdminApi, PoolMode } from '../api/evaluationAdminApi'
import { Settings, Bot, User } from 'lucide-react'

export default function PoolModePage() {
  const [modes, setModes] = useState<PoolMode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Track ongoing mutations
  const [updating, setUpdating] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchModes()
  }, [])

  const fetchModes = () => {
    setLoading(true)
    evaluationAdminApi.getPoolModes()
      .then(res => setModes(res))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  const handleToggle = async (pool: string, currentMode: 'MANUAL' | 'AUTO') => {
    const newMode = currentMode === 'AUTO' ? 'MANUAL' : 'AUTO'
    
    setUpdating(prev => ({ ...prev, [pool]: true }))
    try {
      await evaluationAdminApi.setPoolMode(pool, newMode)
      // Re-fetch to get updated notes and state
      fetchModes()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setUpdating(prev => ({ ...prev, [pool]: false }))
    }
  }

  return (
    <div className="main-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Settings size={32} color="var(--secondary)" />
        <div>
          <h1 className="page-title">Pool Modes</h1>
          <p style={{ color: 'var(--text-muted)' }}>Configure human vs AI evaluation for each department</p>
        </div>
      </div>

      {error && <div style={{ color: 'var(--accent)', marginBottom: '1rem' }}>{error}</div>}

      <div style={{ display: 'grid', gap: '1rem' }}>
        {loading ? (
          <div>Loading...</div>
        ) : modes.map(m => (
          <div key={m.pool} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1, paddingRight: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{m.pool}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{m.note}</p>
              
              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }}>
                <span style={{ color: m.aiScoringAvailable ? '#10b981' : '#f43f5e', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Bot size={14} /> AI Available: {m.aiScoringAvailable ? 'Yes' : 'No'}
                </span>
                <span style={{ color: m.activeHumanEvaluators > 0 ? '#10b981' : '#f43f5e', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <User size={14} /> Active Humans: {m.activeHumanEvaluators}
                </span>
              </div>
            </div>

            <div>
              <button 
                className="btn"
                style={{ 
                  background: m.mode === 'AUTO' ? '#8b5cf6' : 'var(--primary)',
                  width: '120px',
                  display: 'flex',
                  justifyContent: 'center'
                }}
                disabled={updating[m.pool]}
                onClick={() => handleToggle(m.pool, m.mode)}
              >
                {updating[m.pool] ? 'Saving...' : m.mode === 'AUTO' ? 'AUTO (AI)' : 'MANUAL'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
