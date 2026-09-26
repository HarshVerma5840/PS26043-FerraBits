import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useParams } from 'react-router-dom'
import { industryApi } from '../api/industryApi'
import { teamApi } from '../api/teamApi'
import { IndustryOrganization, IndustryParticipant, Funding, Mentorship, TeamMember } from '../types'
import { Building2, IndianRupee, Lightbulb, Link as LinkIcon, Plus, Check, MapPin, X, Calendar } from 'lucide-react'

import OrganizationDialog from '../components/industry/OrganizationDialog'
import ParticipantDialog from '../components/industry/ParticipantDialog'
import FundingDialog from '../components/industry/FundingDialog'
import MentorshipDialog from '../components/industry/MentorshipDialog'
import MentorshipSessionDialog from '../components/industry/MentorshipSessionDialog'

export default function IndustryPage() {
  const { projectId } = useParams<{ projectId: string }>()

  // Data state
  const [orgs, setOrgs] = useState<IndustryOrganization[]>([])
  const [participants, setParticipants] = useState<IndustryParticipant[]>([])
  const [funding, setFunding] = useState<Funding[]>([])
  const [mentorships, setMentorships] = useState<Mentorship[]>([])
  const [team, setTeam] = useState<TeamMember[]>([])
  
  // Loading state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Dialog state
  const [showOrg, setShowOrg] = useState(false)
  const [editingOrg, setEditingOrg] = useState<IndustryOrganization | null>(null)
  
  const [showPart, setShowPart] = useState(false)
  
  const [showFund, setShowFund] = useState(false)
  const [editingFund, setEditingFund] = useState<Funding | null>(null)
  
  const [showMentor, setShowMentor] = useState(false)
  const [showSession, setShowSession] = useState<string | null>(null) // mentorshipId

  // Load all data
  useEffect(() => {
    Promise.all([
      industryApi.getOrganizations(),
      industryApi.getProjectParticipants(projectId!),
      industryApi.getProjectFunding(projectId!),
      industryApi.getProjectMentorships(projectId!),
      // Try to load team to see if there are mentors
      teamApi.getMySubmissions().then(subs => {
        const sub = subs.find(s => s.projectId === projectId || s.problemId === projectId)
        if (sub && sub.team) return sub.team.members.map((m: any, _i: number) => ({
          id: m.participantId,
          userId: m.participantId,
          name: m.fullName,
          role: m.participantType === 'UNIVERSITY' ? 'FACULTY_MENTOR' : m.participantType === 'INDUSTRY' ? 'INDUSTRY_MENTOR' : 'STUDENT_MEMBER'
        }))
        return []
      }).catch(() => [])
    ])
    .then(([os, ps, fs, ms, ts]) => {
      setOrgs(os)
      setParticipants(ps)
      setFunding(fs)
      setMentorships(ms)
      setTeam(ts)
    })
    .catch(err => setError(err.message))
    .finally(() => setLoading(false))
  }, [projectId])

  // Handlers
  const handleSaveOrg = async (data: Partial<IndustryOrganization>) => {
    setActionLoading(true)
    try {
      if (editingOrg) {
        const res = await industryApi.updateOrganization(editingOrg.id, data)
        setOrgs(prev => prev.map(o => o.id === res.id ? res : o))
      } else {
        const res = await industryApi.createOrganization(data)
        setOrgs(prev => [...prev, res])
      }
      setShowOrg(false); setEditingOrg(null)
    } catch (err: any) { toast.error(err.message) }
    finally { setActionLoading(false) }
  }

  const handleAddParticipant = async (orgId: string, participationType: string) => {
    setActionLoading(true)
    try {
      const res = await industryApi.addProjectParticipant(projectId!, { organizationId: orgId, participationType })
      setParticipants(prev => [...prev, res])
      setShowPart(false)
    } catch (err: any) { toast.error(err.message) }
    finally { setActionLoading(false) }
  }

  const handleRemoveParticipant = async (participantId: string) => {
    setActionLoading(true)
    try {
      await industryApi.removeProjectParticipant(projectId!, participantId)
      setParticipants(prev => prev.filter(p => p.id !== participantId))
    } catch (err: any) { toast.error(err.message) }
    finally { setActionLoading(false) }
  }

  const handleSaveFunding = async (data: Partial<Funding>) => {
    setActionLoading(true)
    try {
      if (editingFund) {
        const res = await industryApi.updateFunding(editingFund.id, data)
        setFunding(prev => prev.map(f => f.id === res.id ? res : f))
      } else {
        const res = await industryApi.createFunding(projectId!, data)
        setFunding(prev => [...prev, res])
      }
      setShowFund(false); setEditingFund(null)
    } catch (err: any) { toast.error(err.message) }
    finally { setActionLoading(false) }
  }

  const handleApproveFunding = async (fundingId: string) => {
    setActionLoading(true)
    try {
      const res = await industryApi.approveFunding(fundingId)
      setFunding(prev => prev.map(f => f.id === res.id ? res : f))
    } catch (err: any) { toast.error(err.message) }
    finally { setActionLoading(false) }
  }

  const handleAssignMentor = async (mentorUserId: string, scope: string) => {
    setActionLoading(true)
    try {
      const res = await industryApi.assignMentor(projectId!, { mentorUserId, scope })
      setMentorships(prev => [...prev, res])
      setShowMentor(false)
    } catch (err: any) { toast.error(err.message) }
    finally { setActionLoading(false) }
  }

  const handleAddSession = async (data: { scheduledAt: string; durationMinutes: number }) => {
    setActionLoading(true)
    try {
      await industryApi.createMentorshipSession(showSession!, data)
      // Re-fetch mentorships to get updated session list (since Mentorship contains sessions)
      const ms = await industryApi.getProjectMentorships(projectId!)
      setMentorships(ms)
      setShowSession(null)
    } catch (err: any) { toast.error(err.message) }
    finally { setActionLoading(false) }
  }

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading industry integrations...</div>

  return (
    <div className="animate-fade-in">
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Building2 size={32} color="var(--primary)" />
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Industry Integration</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Manage organizational partners, funding, and mentorship</p>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={() => setShowOrg(true)}>
          <Plus size={16} /> Register Organization
        </button>
      </header>

      {error && <div style={{ background: 'rgba(244,63,94,0.1)', color: '#f43f5e', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Participants Panel */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LinkIcon size={18} /> Participating Organizations
            </h3>
            <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => setShowPart(true)}>
              <Plus size={14} /> Add
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {participants.map(p => {
              const org = orgs.find(o => o.id === p.organizationId)
              return (
                <div key={p.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{org?.name || p.organizationName || p.organizationId.substring(0,8)}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Type: {p.participationType} · Status: {p.status}</div>
                  </div>
                  <button className="btn btn-secondary" style={{ padding: '0.4rem', color: '#f43f5e' }} onClick={() => handleRemoveParticipant(p.id)} disabled={actionLoading}>
                    <X size={14} />
                  </button>
                </div>
              )
            })}
            {participants.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0', border: '1px dashed var(--glass-border)', borderRadius: '8px' }}>No organizations linked to this project.</div>}
          </div>
        </div>

        {/* Funding Panel */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <IndianRupee size={18} /> Funding Grants
            </h3>
            <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => setShowFund(true)}>
              <Plus size={14} /> Log Grant
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {funding.map(f => {
              const org = orgs.find(o => o.id === f.organizationId)
              return (
                <div key={f.id} style={{ padding: '1rem', background: f.status === 'APPROVED' ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: f.status === 'APPROVED' ? 'var(--ok)' : 'var(--text)', fontSize: '1.05rem', marginBottom: '0.15rem' }}>{f.currency} {f.amount.toLocaleString()}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>From: {org?.name || f.organizationId.substring(0,8)}</div>
                    {f.purpose && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Purpose: {f.purpose}</div>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.1rem 0.5rem', borderRadius: '999px', background: f.status === 'APPROVED' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: f.status === 'APPROVED' ? '#10b981' : '#f59e0b' }}>
                      {f.status}
                    </span>
                    {f.status !== 'APPROVED' && (
                      <button className="btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', background: 'var(--primary)' }} onClick={() => handleApproveFunding(f.id)} disabled={actionLoading}>
                        <Check size={12} /> Approve
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
            {funding.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0', border: '1px dashed var(--glass-border)', borderRadius: '8px' }}>No funding recorded.</div>}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Mentorship Panel */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lightbulb size={18} /> Mentorship
            </h3>
            <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => setShowMentor(true)}>
              <Plus size={14} /> Assign
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {mentorships.map(m => {
              const mentorInfo = team.find(t => t.userId === m.mentorId || t.id === m.mentorId)
              return (
                <div key={m.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{mentorInfo?.name || m.mentorName || m.mentorId.substring(0,8)}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Scope: {m.scope}</div>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', background: 'rgba(79,70,229,0.1)', padding: '0.1rem 0.5rem', borderRadius: '999px' }}>
                      {m.status}
                    </span>
                  </div>
                  
                  <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sessions ({(m as any).sessions?.length || 0})</span>
                      <button className="btn btn-secondary" style={{ padding: '0.15rem 0.4rem', fontSize: '0.7rem' }} onClick={() => setShowSession(m.id)}>
                        <Calendar size={10} style={{ marginRight: '4px' }} /> Schedule
                      </button>
                    </div>
                    {/* If we had session array on mentorship, map here */}
                  </div>
                </div>
              )
            })}
            {mentorships.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0', border: '1px dashed var(--glass-border)', borderRadius: '8px' }}>No mentors assigned.</div>}
          </div>
        </div>

        {/* Organizations Registry */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={18} /> Global Organizations Registry
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {orgs.map(o => (
              <div key={o.id} style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {o.name} {o.verified && <Check size={14} color="var(--ok)" />}
                  </div>
                  {(o.domain || o.contactEmail || o.contactPersonEmail) && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {[o.domain, o.contactEmail || o.contactPersonEmail].filter(Boolean).join(' · ')}
                    </div>
                  )}
                </div>
                <button className="btn btn-secondary" style={{ padding: '0.3rem' }} onClick={() => { setEditingOrg(o); setShowOrg(true) }}>
                  Edit
                </button>
              </div>
            ))}
            {orgs.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Registry is empty.</div>}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {showOrg && <OrganizationDialog org={editingOrg} onClose={() => { setShowOrg(false); setEditingOrg(null) }} onSave={handleSaveOrg} loading={actionLoading} />}
      {showPart && <ParticipantDialog orgs={orgs} onClose={() => setShowPart(false)} onSave={handleAddParticipant} loading={actionLoading} />}
      {showFund && <FundingDialog orgs={orgs} funding={editingFund} onClose={() => { setShowFund(false); setEditingFund(null) }} onSave={handleSaveFunding} loading={actionLoading} />}
      {showMentor && <MentorshipDialog team={team} onClose={() => setShowMentor(false)} onSave={handleAssignMentor} loading={actionLoading} />}
      {showSession && <MentorshipSessionDialog onClose={() => setShowSession(null)} onSave={handleAddSession} loading={actionLoading} />}

    </div>
  )
}

