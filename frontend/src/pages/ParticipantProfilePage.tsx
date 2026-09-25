import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { portalApi } from '../api/portalApi'
import { User, Shield } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

export default function ParticipantProfilePage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [teamName, setTeamName] = useState('')
  const [skills, setSkills] = useState('')

  const { data: profile, isLoading } = useQuery({
    queryKey: ['portal-me'],
    queryFn: async () => {
      try {
        return await portalApi.getMe()
      } catch (e) {
        return null // Not registered
      }
    }
  })

  const registerMutation = useMutation({
    mutationFn: () => portalApi.registerParticipant({ 
      userId: user?.id, 
      teamName, 
      skills: skills.split(',').map(s => s.trim()) 
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portal-me'] })
  })

  if (isLoading) return <div style={{ padding: '2rem' }}>Loading profile...</div>

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <User size={32} color="var(--primary)" />
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Participant Profile</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Manage your registration details</p>
        </div>
      </header>

      {!profile ? (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Register for Portal</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Team Name</label>
              <input 
                type="text" 
                value={teamName} 
                onChange={e => setTeamName(e.target.value)} 
                style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '6px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Core Skills (comma separated)</label>
              <input 
                type="text" 
                value={skills} 
                onChange={e => setSkills(e.target.value)} 
                style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '6px' }}
              />
            </div>
            <button 
              className="btn" 
              onClick={() => registerMutation.mutate()}
              disabled={registerMutation.isPending || !teamName}
            >
              {registerMutation.isPending ? 'Registering...' : 'Complete Registration'}
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--glass-border)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(79, 70, 229, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={32} color="var(--primary)" />
            </div>
            <div>
              <h2 style={{ margin: 0 }}>{profile.teamName}</h2>
              <div style={{ color: 'var(--text-muted)' }}>Registered User ID: {profile.userId}</div>
            </div>
          </div>

          <h3 style={{ marginTop: 0 }}>Registered Skills</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {profile.skills?.map(skill => (
              <span key={skill} className="badge" style={{ background: 'rgba(255,255,255,0.05)', fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
