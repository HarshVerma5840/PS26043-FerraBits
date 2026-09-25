import React from 'react'
import { Loader2 } from 'lucide-react'

export default function LoadingScreen({ message = 'Loading...' }: { message?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100vw' }}>
      <Loader2 size={48} color="var(--primary)" style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
      <div style={{ color: 'var(--text-muted)' }}>{message}</div>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
