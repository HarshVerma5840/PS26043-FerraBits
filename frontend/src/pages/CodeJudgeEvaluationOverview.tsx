import React from 'react'
import { useOutletContext } from 'react-router-dom'
import { CodeJudgeEvaluation } from '../api/codejudgeApi'
import { History, GitCommit, Link as LinkIcon } from 'lucide-react'

export default function CodeJudgeEvaluationOverview() {
  const { evaluation } = useOutletContext<{ evaluation: CodeJudgeEvaluation }>()

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <GitCommit size={20} color="var(--primary)" /> Repository Details
        </h2>
        <div style={{ display: 'grid', gap: '1rem', color: 'var(--text-muted)' }}>
          <div>
            <strong>URL:</strong> <a href={evaluation.repositoryUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--secondary)' }}>{evaluation.repositoryUrl} <LinkIcon size={12} /></a>
          </div>
          <div>
            <strong>Pinned Commit:</strong> <span style={{ fontFamily: 'monospace', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{evaluation.commitSha}</span>
          </div>
          <div>
            <strong>Started At:</strong> {new Date(evaluation.startedAt).toLocaleString()}
          </div>
          {evaluation.completedAt && (
            <div>
              <strong>Completed At:</strong> {new Date(evaluation.completedAt).toLocaleString()}
            </div>
          )}
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <History size={20} color="var(--primary)" /> Timeline
        </h2>
        
        {evaluation.history && evaluation.history.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {evaluation.history.map((h: any, i: number) => (
              <div key={h.historyId} style={{ display: 'flex', gap: '1rem', borderLeft: '2px solid var(--glass-border)', paddingLeft: '1.5rem', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-5px', top: '5px', width: '8px', height: '8px', borderRadius: '50%', background: i === evaluation.history!.length - 1 ? 'var(--primary)' : 'var(--glass-border)' }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{h.status}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(h.changedAt).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)' }}>No history recorded.</div>
        )}
      </div>
    </div>
  )
}
