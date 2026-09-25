import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Clock } from 'lucide-react'

export default function ProblemTimelinePage() {
  const { problemId } = useParams<{ problemId: string }>()
  const navigate = useNavigate()

  return (
    <div className="animate-fade-in" style={{ padding: '2rem' }}>
      <button onClick={() => navigate(`/portal/problems/${problemId}`)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '2rem' }}>
        <ArrowLeft size={16} /> Back to Details
      </button>

      <h1 style={{ marginBottom: '2rem' }}>Project Timeline</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', paddingLeft: '2rem' }}>
        <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '10px', width: '2px', background: 'var(--glass-border)' }} />
        
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: '-2rem', top: '2px', background: 'var(--bg-color)', padding: '2px' }}>
            <CheckCircle2 size={16} color="var(--ok)" />
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem', marginLeft: '1rem' }}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>Problem Published</h3>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Open for nationwide proposals.</div>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: '-2rem', top: '2px', background: 'var(--bg-color)', padding: '2px' }}>
            <Clock size={16} color="var(--warn)" />
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem', marginLeft: '1rem', border: '1px solid var(--warn)' }}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>Submission Deadline</h3>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Proposals must be submitted by end of month.</div>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: '-2rem', top: '2px', background: 'var(--bg-color)', padding: '2px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid var(--glass-border)', marginLeft: '2px', marginTop: '2px' }} />
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem', marginLeft: '1rem', opacity: 0.6 }}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>Evaluation Phase</h3>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Capability matching and governance review.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
