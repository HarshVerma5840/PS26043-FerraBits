import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { sourceApi, SourceAccount } from '../api/sourceApi'
import { CheckCircle, ShieldAlert } from 'lucide-react'

export default function SourceAccountPage() {
  const [accounts, setAccounts] = useState<SourceAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = () => {
    setLoading(true)
    sourceApi.getSourceAccounts()
      .then(res => setAccounts(res))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  const handleVerify = async (id: string) => {
    try {
      await sourceApi.verifySourceAccount(id)
      fetchAccounts()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Source Accounts</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage and verify active source organizations</p>
      </div>

      {error && <div style={{ color: 'var(--accent)', marginBottom: '1rem' }}>{error}</div>}

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '1rem' }}>Name</th>
              <th style={{ padding: '1rem' }}>Type</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Verification</th>
              <th style={{ padding: '1rem' }}>Can Submit?</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
            ) : accounts.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>No source accounts found.</td></tr>
            ) : accounts.map(acc => (
              <tr key={acc.sourceAccountId} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '1rem' }}><strong>{acc.displayName}</strong></td>
                <td style={{ padding: '1rem' }}>{acc.sourceType}</td>
                <td style={{ padding: '1rem' }}>{acc.status}</td>
                <td style={{ padding: '1rem' }}>
                  {acc.verificationStatus === 'VERIFIED' ? (
                    <span style={{ color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle size={16} /> Verified</span>
                  ) : (
                    <span style={{ color: 'orange', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><ShieldAlert size={16} /> {acc.verificationStatus}</span>
                  )}
                </td>
                <td style={{ padding: '1rem' }}>{acc.canSubmit ? 'Yes' : 'No'}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  {acc.verificationStatus !== 'VERIFIED' && (
                    <button onClick={() => handleVerify(acc.sourceAccountId)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>
                      Verify
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
