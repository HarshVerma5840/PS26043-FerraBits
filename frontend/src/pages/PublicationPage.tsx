import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useOutletContext } from 'react-router-dom'
import { evaluationAdminApi, EvaluationCycle } from '../api/evaluationAdminApi'
import { Globe, UploadCloud } from 'lucide-react'

export default function PublicationPage() {
  const { cycle } = useOutletContext<{ cycle: EvaluationCycle }>()
  const [running, setRunning] = useState(false)

  const handlePublish = async () => {
    setRunning(true)
    try {
      await evaluationAdminApi.publishToPortal(cycle.cycleId)
      toast.success('Successfully published/updated on the portal!')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <Globe size={20} color="#10b981" /> Portal Publication
      </h2>

      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
        Problems are published to the public portal as soon as their evaluation phase completes (or when all pools are on AUTO). 
        If a network failure occurred during the automatic push, you can manually trigger a sync here.
      </p>

      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3>Push to Portal</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Upserts this problem to the portal-service.</p>
        </div>
        <button onClick={handlePublish} disabled={running} className="btn" style={{ background: '#10b981' }}>
          <UploadCloud size={16} /> {running ? 'Publishing...' : 'Publish Now'}
        </button>
      </div>
    </div>
  )
}
