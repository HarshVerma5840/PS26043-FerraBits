import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { portalApi } from '../api/portalApi'
import { User, Shield, Building2, Phone, Mail, IdCard, AlertCircle } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import toast from 'react-hot-toast'

export default function ParticipantProfilePage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    if (user) {
      if (user.email) setEmail(user.email)
      if (user.phone) setPhone(user.phone)
    }
  }, [user])

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['portal-me'],
    queryFn: async () => {
      try {
        return await portalApi.getMe()
      } catch (err: any) {
        if (err?.status === 404 || err?.message?.includes('STUDENT_NOT_REGISTERED')) {
          return null // Not registered
        }
        throw err
      }
    },
    retry: 1
  })

  const registerMutation = useMutation({
    mutationFn: () => portalApi.registerParticipant({
      fullName: fullName.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || user?.phone || undefined,
    }),
    onSuccess: () => {
      toast.success('Participant profile created successfully!')
      queryClient.invalidateQueries({ queryKey: ['portal-me'] })
      queryClient.invalidateQueries({ queryKey: ['portal-problems'] })
      queryClient.invalidateQueries({ queryKey: ['portal-submissions'] })
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to register participant profile.')
    }
  })

  if (isLoading) return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading participant profile...</div>

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <User size={32} color="var(--primary)" />
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Participant Profile</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>National Innovation Portal participant credentials</p>
        </div>
      </header>

      {error && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--err)', borderColor: 'rgba(239,68,68,0.3)' }}>
          <AlertCircle size={20} />
          <span>{error instanceof Error ? error.message : 'Unable to load profile.'}</span>
        </div>
      )}

      {!profile ? (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Complete Participant Registration</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Register your participant details to solve challenges and submit technical proposals.
          </p>

          <form onSubmit={e => { e.preventDefault(); registerMutation.mutate() }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Full Legal Name *</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                placeholder="e.g. Ramesh Kumar"
                style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '6px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. ramesh.kumar@institution.edu.in"
                style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '6px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Contact Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '6px' }}
              />
            </div>

            <button
              type="submit"
              className="btn"
              style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}
              disabled={registerMutation.isPending || !fullName.trim()}
            >
              {registerMutation.isPending ? 'Registering...' : 'Register as Participant'}
            </button>
          </form>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(79, 70, 229, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={32} color="var(--primary)" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{profile.fullName}</h2>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                <span className="badge" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)' }}>
                  {profile.participantType || 'STUDENT'}
                </span>
                <span className="badge" style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--ok)' }}>
                  Active Participant
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <IdCard size={18} color="var(--text-muted)" style={{ marginTop: '0.2rem' }} />
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Participant ID</span>
                <span style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}>{profile.participantId}</span>
              </div>
            </div>

            {profile.institutionName && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <Building2 size={18} color="var(--text-muted)" style={{ marginTop: '0.2rem' }} />
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Verified Institution</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{profile.institutionName}</span>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <Mail size={18} color="var(--text-muted)" style={{ marginTop: '0.2rem' }} />
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Email Address</span>
                <span style={{ fontSize: '0.9rem' }}>{profile.email || 'Not specified'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <Phone size={18} color="var(--text-muted)" style={{ marginTop: '0.2rem' }} />
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Mobile Phone</span>
                <span style={{ fontSize: '0.9rem' }}>{profile.phone || 'Not specified'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
