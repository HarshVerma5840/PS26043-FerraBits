import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { registryApi } from '../api/registryApi'
import { Database, UploadCloud, RefreshCw, Archive } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import RegistryImportDialog from '../components/RegistryImportDialog'

export default function RegistryPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'INSTITUTIONS' | 'VERSIONS'>('INSTITUTIONS')
  const [showImport, setShowImport] = useState(false)

  const { data: institutions, isLoading: loadingInst } = useQuery({
    queryKey: ['institutions'],
    queryFn: () => registryApi.getInstitutions()
  })

  const { data: versions, isLoading: loadingVers } = useQuery({
    queryKey: ['registry-versions'],
    queryFn: () => registryApi.getVersions()
  })

  const publishMutation = useMutation({
    mutationFn: (id: string) => registryApi.publishVersion(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['registry-versions'] })
  })

  const archiveMutation = useMutation({
    mutationFn: (id: string) => registryApi.archiveVersion(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['registry-versions'] })
  })

  return (
    <div className="animate-fade-in" style={{ padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Database size={32} color="var(--primary)" />
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Capability Registry</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Manage institutional capabilities and data imports</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={() => setShowImport(true)}>
            <UploadCloud size={16} /> Import Data
          </button>
        </div>
      </header>
      
      {showImport && (
        <RegistryImportDialog 
          onClose={() => setShowImport(false)} 
          onSuccess={() => {
            setShowImport(false)
            queryClient.invalidateQueries({ queryKey: ['registry-versions'] })
            setActiveTab('VERSIONS')
          }}
        />
      )}

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--glass-border)', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('INSTITUTIONS')}
          style={{ background: 'none', border: 'none', padding: '0.75rem 1.5rem', color: activeTab === 'INSTITUTIONS' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'INSTITUTIONS' ? '2px solid var(--primary)' : '2px solid transparent', cursor: 'pointer', fontWeight: 500 }}
        >
          Institutions
        </button>
        <button 
          onClick={() => setActiveTab('VERSIONS')}
          style={{ background: 'none', border: 'none', padding: '0.75rem 1.5rem', color: activeTab === 'VERSIONS' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'VERSIONS' ? '2px solid var(--primary)' : '2px solid transparent', cursor: 'pointer', fontWeight: 500 }}
        >
          Registry Versions
        </button>
      </div>

      {activeTab === 'INSTITUTIONS' && (
        <div>
          {loadingInst ? <div style={{ color: 'var(--text-muted)' }}>Loading...</div> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {institutions?.map(inst => (
                <div key={inst.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{inst.name}</h3>
                    <span className="badge" style={{ background: inst.verified ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: inst.verified ? 'var(--ok)' : 'var(--warn)' }}>
                      {inst.verified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Code: {inst.code} &bull; Type: {inst.type}
                  </div>
                  <Link to={`/admin/registry/${inst.id}`} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'VERSIONS' && (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
              <tr>
                <th style={{ padding: '1rem' }}>Version</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Created At</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingVers ? <tr><td colSpan={4} style={{ padding: '1rem' }}>Loading...</td></tr> : versions?.map(v => (
                <tr key={v.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>
                    <Link to={`/admin/registry/versions/${v.id}`} style={{ color: 'var(--text-main)' }}>{v.version}</Link>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className="badge" style={{ background: v.status === 'PUBLISHED' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.1)' }}>
                      {v.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{new Date(v.createdAt).toLocaleString()}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {v.status === 'DRAFT' && (
                        <button className="btn btn-secondary" onClick={() => publishMutation.mutate(v.id)} disabled={publishMutation.isPending}>
                          <RefreshCw size={14} /> Publish
                        </button>
                      )}
                      {v.status === 'PUBLISHED' && (
                        <button className="btn btn-secondary" style={{ color: 'var(--accent)' }} onClick={() => archiveMutation.mutate(v.id)} disabled={archiveMutation.isPending}>
                          <Archive size={14} /> Archive
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
