import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useParams, useNavigate } from 'react-router-dom'
import { registryApi } from '../api/registryApi'
import { ArrowLeft, Database, Archive, RefreshCw } from 'lucide-react'
import { RegistryVersion } from '../types'

export default function RegistryVersionDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [version, setVersion] = useState<RegistryVersion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      registryApi.getVersionById(id)
        .then(setVersion)
        .catch(err => setError(err.message))
        .finally(() => setLoading(false))
    }
  }, [id])

  const handlePublish = async () => {
    if (!id) return
    try {
      await registryApi.publishVersion(id)
      setVersion(prev => prev ? { ...prev, status: 'PUBLISHED' } : null)
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleArchive = async () => {
    if (!id) return
    try {
      await registryApi.archiveVersion(id)
      setVersion(prev => prev ? { ...prev, status: 'ARCHIVED' } : null)
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error || !version) return <div style={{ color: 'red', padding: '2rem' }}>{error || 'Not found'}</div>

  return (
    <div className="main-content" style={{ padding: '2rem' }}>
      <button onClick={() => navigate('/admin/registry')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back to Registry
      </button>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Database size={24} color="var(--primary)" /> Version {version.version}
            </h2>
            <div style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
              Created At: {new Date(version.createdAt).toLocaleString()}
            </div>
            {version.publishedAt && (
              <div style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
                Published At: {new Date(version.publishedAt).toLocaleString()}
              </div>
            )}
            {version.archivedAt && (
              <div style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
                Archived At: {new Date(version.archivedAt).toLocaleString()}
              </div>
            )}
          </div>
          <div>
            <span style={{ 
              padding: '0.25rem 0.75rem', 
              borderRadius: '999px',
              fontSize: '0.9rem',
              background: version.status === 'PUBLISHED' ? 'rgba(16, 185, 129, 0.1)' : 
                         version.status === 'ARCHIVED' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(59, 130, 246, 0.1)',
              color: version.status === 'PUBLISHED' ? '#10b981' : 
                     version.status === 'ARCHIVED' ? 'var(--text-muted)' : '#3b82f6'
            }}>
              {version.status}
            </span>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              {version.status === 'DRAFT' && (
                <button onClick={handlePublish} className="btn" style={{ background: '#10b981' }}>
                  <RefreshCw size={14} /> Publish
                </button>
              )}
              {version.status === 'PUBLISHED' && (
                <button onClick={handleArchive} className="btn btn-secondary" style={{ color: '#f43f5e' }}>
                  <Archive size={14} /> Archive
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
