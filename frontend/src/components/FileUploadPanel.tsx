import { useState } from 'react'
import { UploadCloud, File as FileIcon, X, CheckCircle } from 'lucide-react'
import { portalApi } from '../api/portalApi'
import { PortalFile } from '../types'
import { useQueryClient } from '@tanstack/react-query'

export default function FileUploadPanel({ submissionId, files = [] }: { submissionId: string, files?: PortalFile[] }) {
  const queryClient = useQueryClient()
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files[0])
    }
  }

  const handleUpload = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setError('File is too large (max 10MB)')
      return
    }
    setError('')
    setUploading(true)
    setProgress(0)

    try {
      await portalApi.uploadFile(submissionId, file, (evt) => {
        if (evt.total) {
          setProgress(Math.round((evt.loaded * 100) / evt.total))
        }
      })
      queryClient.invalidateQueries({ queryKey: ['submission-files', submissionId] })
    } catch (err: any) {
      setError(err.response?.data?.message || 'File upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>Supporting Files</h3>
      
      {/* Upload Zone */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--glass-border)'}`,
          borderRadius: '8px',
          padding: '2rem',
          textAlign: 'center',
          background: isDragging ? 'rgba(79, 70, 229, 0.05)' : 'rgba(0,0,0,0.1)',
          transition: 'all 0.2s',
          marginBottom: '1.5rem'
        }}
      >
        <UploadCloud size={32} color={isDragging ? 'var(--primary)' : 'var(--text-muted)'} style={{ marginBottom: '1rem' }} />
        <div style={{ marginBottom: '0.5rem', fontWeight: 500 }}>
          Drag and drop your file here
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          PDF, ZIP, DOCX up to 10MB
        </div>
        <label className="btn btn-secondary" style={{ display: 'inline-flex', cursor: 'pointer' }}>
          Browse Files
          <input type="file" style={{ display: 'none' }} onChange={handleFileChange} disabled={uploading} />
        </label>
      </div>

      {uploading && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <div style={{ width: '100%', height: '4px', background: 'var(--glass-border)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.2s' }} />
          </div>
        </div>
      )}

      {error && <div style={{ color: 'var(--err)', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</div>}

      {/* File List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {files.length === 0 && !uploading && (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>
            No files uploaded yet.
          </div>
        )}
        {files.map(file => (
          <div key={file.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FileIcon size={16} color="var(--primary)" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <a 
                  href={portalApi.getDownloadUrl(file.id)} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ color: '#fff', fontSize: '0.9rem', textDecoration: 'none' }}
                >
                  {file.fileName}
                </a>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{(file.fileSize / 1024).toFixed(1)} KB</span>
              </div>
            </div>
            <CheckCircle size={16} color="var(--ok)" />
          </div>
        ))}
      </div>
    </div>
  )
}
