import { useState } from 'react'
import { portalApi } from '../api/portalApi'
import { PortalFile } from '../types'
import { useQueryClient } from '@tanstack/react-query'
import { ProgressBar } from '../v2/components/UIComponents'

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
    // 1. Safe file size validation (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('File is too large. Maximum allowed size is 10MB.')
      return
    }

    // 2. Safe file type validation (MIME types)
    const allowedTypes = [
      'application/pdf', 
      'application/zip', 
      'application/x-zip-compressed',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ]
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only PDF, ZIP, and DOC/DOCX files are allowed.')
      return
    }

    // 3. Filename safety validation
    if (/[^\w.-]/.test(file.name.replace(/\s+/g, '_'))) {
      setError('Invalid filename. Please use only alphanumeric characters, dots, dashes, or underscores.')
      return
    }

    setError('')
    setUploading(true)
    setProgress(0)

    try {
      await portalApi.uploadFile(submissionId, file, undefined, (evt) => {
        if (evt.total) {
          setProgress(Math.round((evt.loaded * 100) / evt.total))
        }
      })
      queryClient.invalidateQueries({ queryKey: ['submission-files', submissionId] })
    } catch (err: any) {
      setError((err as any)?.message || 'File upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>Supporting Files</h3>
      
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-space-xl text-center mb-space-lg transition-all ${isDragging ? 'border-primary bg-primary-container/10' : 'border-[#CBD5E1] bg-surface-container-lowest'}`}
      >
        <span className="material-symbols-outlined text-[32px] mb-space-sm" style={{ color: isDragging ? 'var(--primary)' : 'var(--text-muted)' }}>cloud_upload</span>
        <div className="font-title-md text-title-md font-bold text-on-surface mb-1">
          Drag and drop your file here
        </div>
        <div className="font-label-sm text-label-sm text-on-surface-variant mb-space-md">
          PDF, ZIP, DOCX up to 10MB
        </div>
        <label className="inline-flex cursor-pointer px-4 py-2 bg-surface-container border border-outline rounded hover:bg-surface-container-high transition-colors font-label-sm text-label-sm font-bold text-on-surface">
          Browse Files
          <input type="file" className="hidden" onChange={handleFileChange} disabled={uploading} accept=".pdf,.zip,.docx,.doc" />
        </label>
      </div>

      {uploading && (
        <div className="mb-space-lg">
          <ProgressBar progress={progress} label="Uploading file..." />
        </div>
      )}

      {error && <div style={{ color: 'var(--err)', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</div>}

      {/* File List */}
      <div className="flex flex-col gap-2">
        {files.length === 0 && !uploading && (
          <div className="text-on-surface-variant text-sm text-center p-4">
            No files uploaded yet.
          </div>
        )}
        {files.map(file => (
          <div key={file.id} className="flex items-center justify-between p-3 bg-surface-container-lowest border border-[#E2E8F0] rounded shadow-sm">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[20px]">description</span>
              <div className="flex flex-col">
                <a 
                  href={portalApi.getDownloadUrl(file.id)} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-secondary font-label-sm text-label-sm font-bold hover:underline"
                >
                  {file.fileName}
                </a>
                <span className="text-on-surface-variant font-label-sm text-[10px]">{(file.fileSize / 1024).toFixed(1)} KB</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#15803D] text-[18px]">check_circle</span>
          </div>
        ))}
      </div>
    </div>
  )
}
