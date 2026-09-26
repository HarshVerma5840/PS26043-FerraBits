import React from 'react'
import { Info, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

/**
 * CreateProjectPage — Explains that project creation is not a manual form;
 * projects are created automatically when a governance review is approved.
 * Redirects the user to the review desk.
 */
export default function CreateProjectPage() {
  return (
    <div className="main-content" style={{ maxWidth: '700px', margin: '0 auto', padding: '4rem 2rem' }}>
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <Info size={48} color="var(--secondary)" style={{ marginBottom: '1.5rem', opacity: 0.8 }} />
        <h1 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Projects are created from Governance Reviews</h1>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
          There is no manual project creation form. When an admin approves or overrides a capability-matching recommendation, 
          the system automatically creates and initialises the project workspace, binding it to the matched institution, problem statement, 
          matching run, and registry version.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem', textAlign: 'left' }}>
          {[
            { step: '1', label: 'Capability matching run is triggered for a problem' },
            { step: '2', label: 'Admin reviews the AI recommendation on the Governance Desk' },
            { step: '3', label: 'Admin approves or overrides the matched institution' },
            { step: '4', label: 'Project workspace is automatically created and linked' },
          ].map(({ step, label }) => (
            <div key={step} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '1rem' }}>
              <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '1.2rem' }}>Step {step}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/admin/reviews" className="btn" style={{ background: 'var(--primary)' }}>
            Go to Governance Review Desk <ArrowRight size={16} />
          </Link>
          <Link to="/projects" className="btn btn-secondary">
            View Existing Projects
          </Link>
        </div>
      </div>
    </div>
  )
}
