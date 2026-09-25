import { useQuery } from '@tanstack/react-query'
import { portalApi } from '../api/portalApi'
import { BookOpen, Filter, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ProblemListPage() {
  const [search, setSearch] = useState('')

  const { data: problems, isLoading } = useQuery({
    queryKey: ['portal-problems'],
    queryFn: () => portalApi.getProblems()
  })

  const filtered = problems?.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="animate-fade-in" style={{ padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <BookOpen size={32} color="var(--primary)" />
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Problem Statements</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Discover challenges and innovate solutions</p>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <input 
          type="text" 
          placeholder="Search problems..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: '#fff', width: '300px' }} 
        />
        <button className="btn btn-secondary">
          <Filter size={16} /> Filter
        </button>
      </div>

      {isLoading ? (
        <div style={{ color: 'var(--text-muted)' }}>Loading problems...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filtered?.map((prob) => (
            <div key={prob.id} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <span className="badge" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)' }}>
                      {prob.domainId || 'General'}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ID: {prob.id}</span>
                  </div>
                  <h3 style={{ fontSize: '1.3rem', margin: '0 0 0.5rem 0' }}>{prob.title || 'Problem Statement'}</h3>
                </div>
                
                <Link to={`/portal/problems/${prob.id}`} className="btn">
                  View Details <ArrowRight size={16} />
                </Link>
              </div>

              <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                {prob.description?.substring(0, 250)}{prob.description?.length > 250 ? '...' : ''}
              </div>
            </div>
          ))}
          
          {(!filtered || filtered.length === 0) && (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--glass-border)', borderRadius: '12px' }}>
              No active problem statements match your search.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
