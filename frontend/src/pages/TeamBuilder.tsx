import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { teamApi, PortalTeam, PortalTeamMember } from '../api/teamApi'
import { TeamMember, SkillGap } from '../types'
import { Users, User, Shield, GraduationCap, Building2, UserPlus, Trash2, UserCog, Info, AlertCircle } from 'lucide-react'
import AddMemberDialog from '../components/team/AddMemberDialog'
import RemoveMemberDialog from '../components/team/RemoveMemberDialog'
import RoleAssignmentDialog from '../components/team/RoleAssignmentDialog'
import TeamOrderingControl from '../components/team/TeamOrderingControl'
import SkillGapPanel from '../components/SkillGapPanel'

// ── helpers ──────────────────────────────────────────────────────────────────

function toTeamMember(m: PortalTeamMember, idx: number): TeamMember {
  return {
    id: m.participantId,
    participantId: m.participantId,
    name: m.fullName,
    role: m.participantType === 'UNIVERSITY' ? 'FACULTY_MENTOR' : 'STUDENT_MEMBER',
    participantType: m.participantType,
    skills: [],
    orderIndex: idx,
  }
}

function roleIcon(role: string, type?: string) {
  if (role === 'LEAD') return <Shield size={18} color="var(--primary)" />
  if (role === 'FACULTY_MENTOR' || type === 'UNIVERSITY') return <GraduationCap size={18} color="#10b981" />
  if (role === 'INDUSTRY_MENTOR' || type === 'INDUSTRY') return <Building2 size={18} color="#f59e0b" />
  return <User size={18} color="var(--text-muted)" />
}

function roleBadge(role: string) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    LEAD:            { label: 'Team Lead',       color: 'var(--primary)',  bg: 'rgba(79,70,229,0.1)' },
    STUDENT_MEMBER:  { label: 'Student Member',  color: '#60a5fa',         bg: 'rgba(96,165,250,0.1)' },
    FACULTY_MENTOR:  { label: 'Faculty Mentor',  color: '#10b981',         bg: 'rgba(16,185,129,0.1)' },
    INDUSTRY_MENTOR: { label: 'Industry Mentor', color: '#f59e0b',         bg: 'rgba(245,158,11,0.1)' },
  }
  const cfg = map[role] ?? { label: role, color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.05)' }
  return (
    <span style={{ padding: '0.2rem 0.65rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600, color: cfg.color, background: cfg.bg }}>
      {cfg.label}
    </span>
  )
}

// ── main component ────────────────────────────────────────────────────────────

export default function TeamBuilder() {
  const { projectId } = useParams<{ projectId: string }>()

  // We can't load team directly from projectId — need a submissionId.
  // Users can paste their submissionId to load. We also try scanning /portal/submissions.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [submissionId, setSubmissionId] = useState('')
  const [submissionIdInput, setSubmissionIdInput] = useState('')
  const [team, setTeam] = useState<PortalTeam | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(false)
  const [scanLoading, setScanLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dialogs
  const [showAdd, setShowAdd] = useState(false)
  const [removingMember, setRemovingMember] = useState<TeamMember | null>(null)
  const [assigningMember, setAssigningMember] = useState<TeamMember | null>(null)

  // Skill gaps — computed client-side (no backend endpoint)
  const gaps: SkillGap[] = []

  // On mount: scan submissions to find one belonging to this project
  useEffect(() => {
    setScanLoading(true)
    teamApi.getMySubmissions()
      .then(submissions => {
        // Find a submission linked to this projectId if any field matches
        const match = submissions.find((s: any) =>
          s.projectId === projectId || s.problemId === projectId
        )
        if (match) {
          setSubmissionId(match.submissionId || match.id)
          return teamApi.getTeamForSubmission(match.submissionId || match.id)
        }
        return null
      })
      .then(t => {
        if (t) loadTeam(t)
      })
      .catch(() => {/* no submission found — show manual lookup */})
      .finally(() => setScanLoading(false))
  }, [projectId])

  function loadTeam(t: PortalTeam) {
    setTeam(t)
    setMembers(t.members.map(toTeamMember))
    setError(null)
  }

  const handleManualLoad = async () => {
    if (!submissionIdInput.trim()) return
    setLoading(true)
    setError(null)
    try {
      const t = await teamApi.getTeamForSubmission(submissionIdInput.trim())
      if (!t) {
        setError('This submission has no team (individual submission).')
      } else {
        setSubmissionId(submissionIdInput.trim())
        loadTeam(t)
      }
    } catch (err: any) {
      setError(err?.response?.status === 403 ? 'Unauthorized — you are not a member of this submission.' : err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = (memberId: string, newRole: string) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m))
    setAssigningMember(null)
  }

  const handleAddMember = ({ userId, role }: { userId: string; role: string }) => {
    // No backend endpoint — add locally for display
    const newMember: TeamMember = {
      id: `local-${Date.now()}`,
      name: `User ${userId.substring(0, 8)}`,
      role,
      skills: [],
      orderIndex: members.length,
    }
    setMembers(prev => [...prev, newMember])
    setShowAdd(false)
  }

  const handleRemoveMember = (member: TeamMember) => {
    // No backend endpoint — remove from local state only
    setMembers(prev => prev.filter(m => m.id !== member.id))
    setRemovingMember(null)
  }

  const sortedByRole = [...members].sort((a, b) => {
    const order = ['LEAD', 'FACULTY_MENTOR', 'INDUSTRY_MENTOR', 'STUDENT_MEMBER']
    return (order.indexOf(a.role) ?? 99) - (order.indexOf(b.role) ?? 99)
  })

  return (
    <div className="animate-fade-in">
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Users size={28} color="var(--primary)" />
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem' }}>Team Assembly</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>
              {team ? `Team: ${team.name}` : 'Manage project members and capabilities'}
            </p>
          </div>
        </div>
        {team && (
          <button className="btn btn-secondary" onClick={() => setShowAdd(true)}>
            <UserPlus size={16} /> Add Member
          </button>
        )}
      </header>

      {/* Backend constraint notice */}
      <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1.5rem', fontSize: '0.82rem', color: '#60a5fa', display: 'flex', gap: '0.5rem' }}>
        <Info size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
        <span>
          Team data is sourced from <strong>submission records</strong> ({' '}
          <code>GET /portal/submissions/{'{id}'}</code>). 
          There is no standalone <code>/projects/{'{id}'}/team</code> endpoint.
          Member add/remove/role mutations are <strong>local-only</strong> — no backend endpoint exists for post-creation team changes.
        </span>
      </div>

      {/* Manual submission lookup */}
      {!team && !scanLoading && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem' }}>Load Team from Submission</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 1rem' }}>
            No submission found automatically for this project. Enter your submission ID to load team data.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              className="input-field"
              style={{ flex: 1 }}
              placeholder="Submission UUID"
              value={submissionIdInput}
              onChange={e => setSubmissionIdInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleManualLoad()}
            />
            <button className="btn" style={{ background: 'var(--primary)' }} onClick={handleManualLoad} disabled={loading || !submissionIdInput.trim()}>
              {loading ? 'Loading...' : 'Load Team'}
            </button>
          </div>
          {error && (
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', color: '#f43f5e', fontSize: '0.85rem' }}>
              <AlertCircle size={15} /> {error}
            </div>
          )}
        </div>
      )}

      {scanLoading && (
        <div style={{ color: 'var(--text-muted)', padding: '2rem', textAlign: 'center' }}>
          Scanning submissions...
        </div>
      )}

      {team && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Members list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sortedByRole.length === 0 ? (
              <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--glass-border)', borderRadius: '12px' }}>
                <Users size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <div>No team members found.</div>
              </div>
            ) : sortedByRole.map(member => (
              <div key={member.id} className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {roleIcon(member.role, member.participantType)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{member.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {member.participantType && `${member.participantType} · `}
                    ID: {(member.participantId || member.id).substring(0, 8)}...
                  </div>
                  {member.skills && member.skills.length > 0 && (
                    <div style={{ marginTop: '0.35rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {member.skills.map(s => (
                        <span key={s} style={{ fontSize: '0.72rem', padding: '0.1rem 0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', color: 'var(--text-muted)' }}>{s}</span>
                      ))}
                    </div>
                  )}
                </div>
                {roleBadge(member.role)}
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <button
                    title="Change role"
                    onClick={() => setAssigningMember(member)}
                    style={{ background: 'none', border: '1px solid var(--glass-border)', padding: '0.35rem', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
                  >
                    <UserCog size={15} />
                  </button>
                  <button
                    title="Remove member"
                    onClick={() => setRemovingMember(member)}
                    style={{ background: 'none', border: '1px solid var(--glass-border)', padding: '0.35rem', borderRadius: '6px', cursor: 'pointer', color: '#f43f5e', display: 'flex' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <SkillGapPanel projectId={projectId!} gaps={gaps} />
            <TeamOrderingControl members={members} onChange={setMembers} />
          </div>
        </div>
      )}

      {/* Dialogs */}
      {showAdd && (
        <AddMemberDialog
          onClose={() => setShowAdd(false)}
          onAdd={handleAddMember}
        />
      )}
      {removingMember && (
        <RemoveMemberDialog
          member={removingMember}
          onClose={() => setRemovingMember(null)}
          onConfirm={() => handleRemoveMember(removingMember)}
        />
      )}
      {assigningMember && (
        <RoleAssignmentDialog
          member={assigningMember}
          onClose={() => setAssigningMember(null)}
          onSave={(role) => handleRoleChange(assigningMember.id, role)}
        />
      )}
    </div>
  )
}
