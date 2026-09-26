import React, { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { codejudgeApi, CodeJudgeEvaluation } from '../api/codejudgeApi'
import { FileText, Download } from 'lucide-react'

export default function CodeJudgeReportPage() {
  const { evaluation } = useOutletContext<{ evaluation: CodeJudgeEvaluation }>()
  const [markdown, setMarkdown] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    codejudgeApi.getReportMarkdown(evaluation.evaluationId)
      .then(res => setMarkdown(res))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [evaluation.evaluationId])

  const handleDownload = () => {
    if (!markdown) return
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report-${evaluation.evaluationId.substring(0,8)}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Report not yet generated ({error}).</div>

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <FileText size={24} color="#10b981" /> Full Report
        </h2>
        <button onClick={handleDownload} className="btn btn-secondary">
          <Download size={16} /> Download Markdown
        </button>
      </div>

      <div style={{ 
        background: 'rgba(0,0,0,0.3)', 
        padding: '2rem', 
        borderRadius: '8px', 
        fontFamily: 'monospace', 
        fontSize: '0.9rem',
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
        overflowX: 'auto',
        border: '1px solid var(--glass-border)'
      }}>
        {markdown}
      </div>
    </div>
  )
}
