import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { sourceApi, User } from '../api/sourceApi'
import { BackendRole } from '../auth/roles'
import { Users, UserPlus, X } from 'lucide-react'

// Strictly restrict to backend UserRole enum
const ALLOWED_BACKEND_ROLES: BackendRole[] = [
  BackendRole.SUBMITTER,
  BackendRole.REVIEWER,
  BackendRole.EVALUATOR,
  BackendRole.ADMIN,
]

const EVALUATOR_POOLS = [
  { value: 'GOVERNMENT', label: 'Government Pool' },
  { value: 'INDUSTRY', label: 'Industry Pool' },
  { value: 'HEI', label: 'Higher Education Institution (HEI)' },
  { value: 'CITIZEN', label: 'Citizen Pool' },
  { value: 'COMMUNITY', label: 'Community Pool' },
]

export default function UserRoleManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Maps userId -> new role selection
  const [roleEdits, setRoleEdits] = useState<Record<string, string>>({})
  const [savingId, setSavingId] = useState<string | null>(null)

  // Onboard Evaluator Modal state
  const [showOnboardModal, setShowOnboardModal] = useState(false)
  const [onboardPhone, setOnboardPhone] = useState('')
  const [onboardPool, setOnboardPool] = useState('GOVERNMENT')
  const [onboarding, setOnboarding] = useState(false)
  const [onboardResult, setOnboardResult] = useState<{ phone: string; devOtp?: string } | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = () => {
    setLoading(true)
    sourceApi.getUsers()
      .then(res => setUsers(res))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  const handleRoleChange = (userId: string, role: string) => {
    setRoleEdits(prev => ({ ...prev, [userId]: role }))
  }

  const handleSaveRole = async (userId: string) => {
    const role = roleEdits[userId]
    if (!role) return

    setSavingId(userId)
    try {
      await sourceApi.updateUserRole(userId, role)
      toast.success(`User role updated to ${role}`)
      setRoleEdits(prev => {
        const next = { ...prev }
        delete next[userId]
        return next
      })
      fetchUsers()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user role')
    } finally {
      setSavingId(null)
    }
  }

  const handleOnboardEvaluator = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!onboardPhone) return

    setOnboarding(true)
    try {
      const res = await sourceApi.onboardEvaluator({
        phone: onboardPhone.trim(),
        evaluatorPool: onboardPool,
      })
      toast.success(`Evaluator onboarded successfully`)
      setOnboardResult({ phone: res.phone, devOtp: res.devOtp })
      setOnboardPhone('')
      fetchUsers()
    } catch (err: any) {
      toast.error(err.message || 'Failed to onboard evaluator')
    } finally {
      setOnboarding(false)
    }
  }

  return (
    <div className="main-content">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Users size={32} color="var(--primary)" />
          <div>
            <h1 className="page-title">User Roles</h1>
            <p style={{ color: 'var(--text-muted)' }}>Manage system access and roles across the platform</p>
          </div>
        </div>

        <button
          onClick={() => { setShowOnboardModal(true); setOnboardResult(null); }}
          className="btn"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <UserPlus size={18} /> Onboard Evaluator
        </button>
      </div>

      {error && <div style={{ color: 'var(--accent)', marginBottom: '1rem' }}>{error}</div>}

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '1rem' }}>Phone</th>
              <th style={{ padding: '1rem' }}>Email</th>
              <th style={{ padding: '1rem' }}>KYC Status</th>
              <th style={{ padding: '1rem' }}>Role</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>Loading users...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>No users found.</td></tr>
            ) : users.map(user => {
              const currentRole = roleEdits[user.userId] || user.role
              const hasChanged = roleEdits[user.userId] && roleEdits[user.userId] !== user.role
              const isSaving = savingId === user.userId

              return (
                <tr key={user.userId} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '1rem' }}>{user.phone}</td>
                  <td style={{ padding: '1rem' }}>{user.email || '-'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: '999px',
                      fontSize: '0.8rem',
                      background: user.kycStatus === 'VERIFIED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      color: user.kycStatus === 'VERIFIED' ? '#34d399' : 'inherit'
                    }}>
                      {user.kycStatus}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <select
                      value={currentRole}
                      onChange={e => handleRoleChange(user.userId, e.target.value)}
                      style={{ padding: '0.4rem', width: 'auto', borderRadius: '4px' }}
                    >
                      {ALLOWED_BACKEND_ROLES.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    {hasChanged && (
                      <button
                        onClick={() => handleSaveRole(user.userId)}
                        disabled={isSaving}
                        className="btn"
                        style={{ padding: '0.4rem 0.8rem' }}
                      >
                        {isSaving ? 'Saving...' : 'Save'}
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Onboard Evaluator Modal */}
      {showOnboardModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}>
          <div className="glass-panel" style={{ maxWidth: '480px', width: '100%', padding: '2rem', background: '#0f172a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.3rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus size={20} color="var(--primary)" /> Onboard Domain Evaluator
              </h2>
              <button onClick={() => setShowOnboardModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {onboardResult ? (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', padding: '1rem', borderRadius: '8px', color: '#a7f3d0', marginBottom: '1rem' }}>
                  <strong>Evaluator Created!</strong>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                    Phone: {onboardResult.phone}
                    {onboardResult.devOtp && (
                      <div style={{ marginTop: '0.25rem', fontFamily: 'monospace', fontWeight: 'bold' }}>
                        Dev OTP Challenge: {onboardResult.devOtp}
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={() => setShowOnboardModal(false)} className="btn btn-secondary" style={{ width: '100%' }}>
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleOnboardEvaluator}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    Evaluator Mobile Number (10 digits) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={onboardPhone}
                    onChange={e => setOnboardPhone(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px' }}
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Evaluators do not self-register; an OTP will be minted for their initial login.
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    Evaluation Pool *
                  </label>
                  <select
                    value={onboardPool}
                    onChange={e => setOnboardPool(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px' }}
                  >
                    {EVALUATOR_POOLS.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowOnboardModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={onboarding} className="btn" style={{ background: 'var(--primary)' }}>
                    {onboarding ? 'Onboarding...' : 'Create Evaluator'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
