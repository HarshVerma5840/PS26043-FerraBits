import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { governanceApi } from '../api/governanceApi'
import { Shield, Search, Filter } from 'lucide-react'

export default function ReviewDeskPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('PENDING')

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: () => governanceApi.getReviews()
  })

  const filtered = Array.isArray(reviews) ? reviews.filter(r => {
    if (statusFilter && r.status !== statusFilter) return false
    if (search && !r.reviewId?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }) : []

  return (
    <div className="animate-fade-in" style={{ padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Shield size={32} color="var(--primary)" />
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Governance Desk</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Review capability matching recommendations</p>
          </div>
        </div>
      </header>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px', flex: 1 }}>
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search by Review ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', color: '#fff' }} 
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
            <Filter size={18} color="var(--text-muted)" />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none' }}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="OVERRIDDEN">Overridden</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div style={{ color: 'var(--text-muted)' }}>Loading reviews...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered?.map((review) => (
              <div key={review.reviewId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600 }}>Review {review.reviewId ? `${review.reviewId.substring(0, 8)}...` : 'Unavailable'}</span>
                    <span className="badge" style={{ 
                      background: review.status === 'PENDING' ? 'rgba(245, 158, 11, 0.1)' : 
                                  review.status === 'APPROVED' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: review.status === 'PENDING' ? 'var(--warn)' : 
                             review.status === 'APPROVED' ? 'var(--ok)' : 'var(--err)'
                    }}>
                      {review.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '1.5rem' }}>
                    <span>Problem ID: {review.problemId}</span>
                    <span>Evidence cards: {review.topEvidenceCards?.length ?? 0}</span>
                  </div>
                </div>
                <Link to={`/admin/reviews/${review.reviewId}`} className="btn btn-secondary">
                  View Details
                </Link>
              </div>
            ))}
            
            {filtered?.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                No reviews found matching the criteria.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
