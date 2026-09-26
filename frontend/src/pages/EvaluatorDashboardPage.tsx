import React from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, User, CheckSquare, History, FileText } from 'lucide-react'

export default function EvaluatorDashboardPage() {
  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Evaluator Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>Welcome to your evaluation hub</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <Link to="/evaluator/profile" className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', color: 'inherit' }}>
          <User size={32} color="var(--primary)" />
          <div>
            <h3>My Profile</h3>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>View your assignment stats</div>
          </div>
        </Link>
        <Link to="/evaluator/criteria" className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', color: 'inherit' }}>
          <CheckSquare size={32} color="var(--secondary)" />
          <div>
            <h3>Scoring Criteria</h3>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>View your pool's criteria</div>
          </div>
        </Link>
        <Link to="/evaluator/assignments" className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', color: 'inherit' }}>
          <ClipboardList size={32} color="orange" />
          <div>
            <h3>Assignment Queue</h3>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Accept and score problems</div>
          </div>
        </Link>
        <Link to="/evaluator/project-reviews" className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', color: 'inherit' }}>
          <FileText size={32} color="#8b5cf6" />
          <div>
            <h3>Project Reviews</h3>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Review submitted solutions</div>
          </div>
        </Link>
        <Link to="/evaluator/history" className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', color: 'inherit' }}>
          <History size={32} color="var(--accent)" />
          <div>
            <h3>History</h3>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>View completed evaluations</div>
          </div>
        </Link>
      </div>
    </div>
  )
}
