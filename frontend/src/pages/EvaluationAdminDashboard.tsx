import React from 'react'
import { Link } from 'react-router-dom'
import { List, Settings } from 'lucide-react'

export default function EvaluationAdminDashboard() {
  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Evaluation Control Center</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage the problem evaluation pipeline</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <Link to="/admin/evaluation/queue" className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', color: 'inherit' }}>
          <List size={32} color="var(--primary)" />
          <div>
            <h3>Evaluation Queue</h3>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Track all problem evaluation cycles</div>
          </div>
        </Link>
        <Link to="/admin/evaluation/pool-modes" className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', color: 'inherit' }}>
          <Settings size={32} color="var(--secondary)" />
          <div>
            <h3>Pool Modes</h3>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Configure MANUAL / AUTO scoring for pools</div>
          </div>
        </Link>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
        <h3>Pipeline Overview</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>The evaluation pipeline follows a strict state machine:</p>
        <ol style={{ paddingLeft: '1.5rem', lineHeight: 1.8 }}>
          <li><strong>RECEIVED:</strong> Intake complete. Waiting for analysis.</li>
          <li><strong>ROUTING:</strong> AI context built. Waiting for assignment to evaluator pools.</li>
          <li><strong>EVALUATION_IN_PROGRESS:</strong> Evaluators are scoring the problem.</li>
          <li><strong>EVALUATION_COMPLETED:</strong> All scorecards submitted. Ready for aggregation.</li>
          <li><strong>SCORES_AGGREGATED:</strong> Normalised into a 0-100 final score.</li>
          <li><strong>PRIORITIZED:</strong> Priority band assigned (P1-P4).</li>
          <li><strong>PHASE_3_READY:</strong> Handoff to project phase.</li>
        </ol>
      </div>
    </div>
  )
}
