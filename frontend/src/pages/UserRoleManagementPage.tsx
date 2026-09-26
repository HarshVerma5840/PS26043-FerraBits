import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { sourceApi, User } from '../api/sourceApi'

export default function UserRoleManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Maps userId -> new role selection
  const [roleEdits, setRoleEdits] = useState<Record<string, string>>({})

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

    try {
      await sourceApi.updateUserRole(userId, role)
      setRoleEdits(prev => {
        const next = { ...prev }
        delete next[userId]
        return next
      })
      fetchUsers()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">User Roles</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage system access and roles</p>
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
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>No users found.</td></tr>
            ) : users.map(user => {
              const currentRole = roleEdits[user.userId] || user.role
              const hasChanged = roleEdits[user.userId] && roleEdits[user.userId] !== user.role

              return (
                <tr key={user.userId} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '1rem' }}>{user.phone}</td>
                  <td style={{ padding: '1rem' }}>{user.email || '-'}</td>
                  <td style={{ padding: '1rem' }}>{user.kycStatus}</td>
                  <td style={{ padding: '1rem' }}>
                    <select 
                      value={currentRole} 
                      onChange={e => handleRoleChange(user.userId, e.target.value)}
                      style={{ padding: '0.4rem', width: 'auto' }}
                    >
                      <option value="CITIZEN">CITIZEN</option>
                      <option value="SOURCE_ADMIN">SOURCE_ADMIN</option>
                      <option value="REVIEWER">REVIEWER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="PROJECT_MANAGER">PROJECT_MANAGER</option>
                      <option value="EVALUATOR">EVALUATOR</option>
                    </select>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    {hasChanged && (
                      <button onClick={() => handleSaveRole(user.userId)} className="btn" style={{ padding: '0.4rem 0.8rem' }}>
                        Save
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
