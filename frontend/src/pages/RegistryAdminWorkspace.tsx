import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { registryAdminApi } from '../api/registryApi'
import { Building, Book, Monitor, Users, PlusCircle } from 'lucide-react'

export default function RegistryAdminWorkspace() {
  const [activeTab, setActiveTab] = useState<'INST' | 'DEPT' | 'LAB' | 'TEAM' | 'SKILLS'>('INST')
  
  // Forms states
  const [instName, setInstName] = useState('')
  const [instCode, setInstCode] = useState('')
  
  const [deptName, setDeptName] = useState('')
  const [deptInstId, setDeptInstId] = useState('')
  
  const [labName, setLabName] = useState('')
  const [labInstId, setLabInstId] = useState('')
  const [eqName, setEqName] = useState('')
  const [eqLabId, setEqLabId] = useState('')
  
  const [teamName, setTeamName] = useState('')
  const [teamInstId, setTeamInstId] = useState('')
  
  const [skillType, setSkillType] = useState<'FACULTY' | 'STUDENT'>('FACULTY')
  const [personId, setPersonId] = useState('')
  const [skillId, setSkillId] = useState('')
  const [profLevel, setProfLevel] = useState('INTERMEDIATE')

  const handleCreateInst = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await registryAdminApi.createInstitution({ name: instName, aisheIdentifier: instCode })
      toast.success('Institution created successfully')
    } catch (err: any) { toast.error(err.message) }
  }

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await registryAdminApi.createDepartment({ name: deptName, institutionId: deptInstId })
      toast.success('Department created successfully')
    } catch (err: any) { toast.error(err.message) }
  }

  const handleCreateLab = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await registryAdminApi.createLab({ name: labName, institutionId: labInstId })
      toast.success('Lab created successfully')
    } catch (err: any) { toast.error(err.message) }
  }

  const handleCreateEq = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await registryAdminApi.createEquipment(eqLabId, { name: eqName })
      toast.success('Equipment added successfully')
    } catch (err: any) { toast.error(err.message) }
  }

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await registryAdminApi.createTeam({ name: teamName, institutionId: teamInstId })
      toast.success('Team created successfully')
    } catch (err: any) { toast.error(err.message) }
  }

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (skillType === 'FACULTY') {
        await registryAdminApi.addFacultySkill(personId, { skillId, proficiencyLevel: profLevel })
      } else {
        await registryAdminApi.addStudentSkill(personId, { skillId, proficiencyLevel: profLevel })
      }
      toast.success('Skill added successfully')
    } catch (err: any) { toast.error(err.message) }
  }

  return (
    <div className="main-content" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Registry Admin Workspace</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manually construct registry hierarchy for institutions</p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button className={`btn ${activeTab === 'INST' ? '' : 'btn-secondary'}`} onClick={() => setActiveTab('INST')}><Building size={16}/> Institutions</button>
        <button className={`btn ${activeTab === 'DEPT' ? '' : 'btn-secondary'}`} onClick={() => setActiveTab('DEPT')}><Book size={16}/> Departments</button>
        <button className={`btn ${activeTab === 'LAB' ? '' : 'btn-secondary'}`} onClick={() => setActiveTab('LAB')}><Monitor size={16}/> Labs & Equip</button>
        <button className={`btn ${activeTab === 'TEAM' ? '' : 'btn-secondary'}`} onClick={() => setActiveTab('TEAM')}><Users size={16}/> Teams</button>
        <button className={`btn ${activeTab === 'SKILLS' ? '' : 'btn-secondary'}`} onClick={() => setActiveTab('SKILLS')}><PlusCircle size={16}/> Assign Skills</button>
      </div>

      {activeTab === 'INST' && (
        <form onSubmit={handleCreateInst} className="glass-panel" style={{ padding: '2rem' }}>
          <h3>Create Institution</h3>
          <div className="form-group">
            <label>Institution Name</label>
            <input className="input-field" value={instName} onChange={e => setInstName(e.target.value)} required />
          </div>
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>AISHE Code</label>
            <input className="input-field" value={instCode} onChange={e => setInstCode(e.target.value)} />
          </div>
          <button type="submit" className="btn" style={{ marginTop: '1.5rem', background: 'var(--primary)' }}>Create Institution</button>
        </form>
      )}

      {activeTab === 'DEPT' && (
        <form onSubmit={handleCreateDept} className="glass-panel" style={{ padding: '2rem' }}>
          <h3>Create Department</h3>
          <div className="form-group">
            <label>Institution ID (UUID)</label>
            <input className="input-field" value={deptInstId} onChange={e => setDeptInstId(e.target.value)} required />
          </div>
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Department Name</label>
            <input className="input-field" value={deptName} onChange={e => setDeptName(e.target.value)} required />
          </div>
          <button type="submit" className="btn" style={{ marginTop: '1.5rem', background: 'var(--primary)' }}>Create Department</button>
        </form>
      )}

      {activeTab === 'LAB' && (
        <div style={{ display: 'grid', gap: '2rem' }}>
          <form onSubmit={handleCreateLab} className="glass-panel" style={{ padding: '2rem' }}>
            <h3>Create Lab</h3>
            <div className="form-group">
              <label>Institution ID (UUID)</label>
              <input className="input-field" value={labInstId} onChange={e => setLabInstId(e.target.value)} required />
            </div>
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>Lab Name</label>
              <input className="input-field" value={labName} onChange={e => setLabName(e.target.value)} required />
            </div>
            <button type="submit" className="btn" style={{ marginTop: '1.5rem', background: 'var(--primary)' }}>Create Lab</button>
          </form>

          <form onSubmit={handleCreateEq} className="glass-panel" style={{ padding: '2rem' }}>
            <h3>Add Equipment</h3>
            <div className="form-group">
              <label>Lab ID (UUID)</label>
              <input className="input-field" value={eqLabId} onChange={e => setEqLabId(e.target.value)} required />
            </div>
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>Equipment Name</label>
              <input className="input-field" value={eqName} onChange={e => setEqName(e.target.value)} required />
            </div>
            <button type="submit" className="btn" style={{ marginTop: '1.5rem', background: 'var(--primary)' }}>Add Equipment</button>
          </form>
        </div>
      )}

      {activeTab === 'TEAM' && (
        <form onSubmit={handleCreateTeam} className="glass-panel" style={{ padding: '2rem' }}>
          <h3>Create Team</h3>
          <div className="form-group">
            <label>Institution ID (UUID)</label>
            <input className="input-field" value={teamInstId} onChange={e => setTeamInstId(e.target.value)} required />
          </div>
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Team Name</label>
            <input className="input-field" value={teamName} onChange={e => setTeamName(e.target.value)} required />
          </div>
          <button type="submit" className="btn" style={{ marginTop: '1.5rem', background: 'var(--primary)' }}>Create Team</button>
        </form>
      )}

      {activeTab === 'SKILLS' && (
        <form onSubmit={handleAddSkill} className="glass-panel" style={{ padding: '2rem' }}>
          <h3>Assign Capability / Skill</h3>
          <div className="form-group">
            <label>Target Type</label>
            <select className="input-field" value={skillType} onChange={e => setSkillType(e.target.value as any)}>
              <option value="FACULTY">Faculty</option>
              <option value="STUDENT">Student</option>
            </select>
          </div>
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Person ID (UUID)</label>
            <input className="input-field" value={personId} onChange={e => setPersonId(e.target.value)} required />
          </div>
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Skill ID (UUID)</label>
            <input className="input-field" value={skillId} onChange={e => setSkillId(e.target.value)} required />
          </div>
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Proficiency Level</label>
            <select className="input-field" value={profLevel} onChange={e => setProfLevel(e.target.value)}>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="EXPERT">Expert</option>
            </select>
          </div>
          <button type="submit" className="btn" style={{ marginTop: '1.5rem', background: 'var(--primary)' }}>Assign Skill</button>
        </form>
      )}
    </div>
  )
}
