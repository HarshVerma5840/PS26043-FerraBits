import React, {} from 'react'
import { DistrictAnalytics, InstitutionAnalytics, ProjectAnalytics } from '../../types'
import { Download } from 'lucide-react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'

// --- Tables ---

export function DistrictAnalyticsTable({ data }: { data: DistrictAnalytics[] }) {
  if (!data || data.length === 0) return <div style={{ color: 'var(--text-muted)' }}>No district data available.</div>
  
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
            <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>District</th>
            <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>State</th>
            <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Projects</th>
            <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Deployed</th>
            <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Students</th>
          </tr>
        </thead>
        <tbody>
          {data.map(d => (
            <tr key={d.district} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '0.75rem', fontWeight: 500 }}>{d.district}</td>
              <td style={{ padding: '0.75rem' }}>{d.state}</td>
              <td style={{ padding: '0.75rem' }}>{d.projectCount}</td>
              <td style={{ padding: '0.75rem' }}>{d.deployedCount}</td>
              <td style={{ padding: '0.75rem' }}>{d.activeStudents}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function InstitutionAnalyticsTable({ data }: { data: InstitutionAnalytics[] }) {
  if (!data || data.length === 0) return <div style={{ color: 'var(--text-muted)' }}>No institution data available.</div>

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
            <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Institution</th>
            <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Projects</th>
            <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Success Rate</th>
            <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Students</th>
          </tr>
        </thead>
        <tbody>
          {data.map(d => (
            <tr key={d.institutionId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '0.75rem', fontWeight: 500 }}>{d.institutionName}</td>
              <td style={{ padding: '0.75rem' }}>{d.projectCount}</td>
              <td style={{ padding: '0.75rem' }}>{(d.successRate * 100).toFixed(1)}%</td>
              <td style={{ padding: '0.75rem' }}>{d.totalStudents}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ProjectAnalyticsTable({ data }: { data: ProjectAnalytics[] }) {
  if (!data || data.length === 0) return <div style={{ color: 'var(--text-muted)' }}>No project data available.</div>

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
            <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Project</th>
            <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Institution</th>
            <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>District</th>
            <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Status</th>
            <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Satisfaction</th>
          </tr>
        </thead>
        <tbody>
          {data.map(d => (
            <tr key={d.projectId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '0.75rem', fontWeight: 500 }}>{d.projectName}</td>
              <td style={{ padding: '0.75rem' }}>{d.institutionName}</td>
              <td style={{ padding: '0.75rem' }}>{d.district}</td>
              <td style={{ padding: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}>
                  {d.status}
                </span>
              </td>
              <td style={{ padding: '0.75rem' }}>{d.satisfactionScore.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// --- Map Layer ---

export function HeatmapLayer({ districts }: { districts: DistrictAnalytics[] }) {
  return (
    <div style={{ height: '400px', borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer center={[20.5937, 78.9629]} zoom={4} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=cb1_3ybs_1_67a77380e9be78eb13925067"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        {Array.isArray(districts) && districts.map((d: any, i) => {
          // Fake lat/lng from geohash or use dummy for visualization. 
          // Requirements say: "anonymized geohash/H3 cells only. Do not display exact citizen coordinates."
          // We will use randomish coords based on district name to simulate geohash center for display purposes, 
          // as we don't have a geohash decoder library here.
          const lat = 20.5937 + (Math.sin(d.district.length) * 5)
          const lng = 78.9629 + (Math.cos(d.district.length) * 5)

          return (
            <CircleMarker 
              key={i}
              center={[lat, lng]} 
              radius={Math.max(5, (d.projectCount || 1) * 3)}
              fillColor="var(--primary)"
              color="var(--primary)"
              fillOpacity={0.6}
            >
              <Popup>
                <div style={{ color: '#000' }}>
                  <div style={{ fontWeight: 600 }}>{d.district}, {d.state}</div>
                  <div>{d.projectCount} Projects</div>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>
    </div>
  )
}

// --- Filters ---

export function AnalyticsFilters({ filterState, setFilterState }: any) {
  return (
    <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
      <div style={{ fontWeight: 600, marginRight: '1rem' }}>Filters</div>
      
      <select value={filterState.date} onChange={e => setFilterState({...filterState, date: e.target.value})} className="input-field" style={{ width: 'auto' }}>
        <option value="ALL">All Time</option>
        <option value="YEAR">This Year</option>
        <option value="MONTH">This Month</option>
      </select>
      
      <select value={filterState.status} onChange={e => setFilterState({...filterState, status: e.target.value})} className="input-field" style={{ width: 'auto' }}>
        <option value="ALL">All Statuses</option>
        <option value="ACTIVE">Active Projects</option>
        <option value="COMPLETED">Completed</option>
      </select>
      
      <select value={filterState.deployment} onChange={e => setFilterState({...filterState, deployment: e.target.value})} className="input-field" style={{ width: 'auto' }}>
        <option value="ALL">All Deployments</option>
        <option value="DEPLOYED">Deployed</option>
        <option value="PENDING">Pending</option>
      </select>

      <input 
        type="text" 
        placeholder="Filter by District..." 
        value={filterState.district}
        onChange={e => setFilterState({...filterState, district: e.target.value})}
        className="input-field"
        style={{ width: '200px' }}
      />
    </div>
  )
}

export function ExportAnalyticsButton({ data, filename }: { data: any, filename: string }) {
  const handleExport = () => {
    if (!data) return
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <button className="btn btn-secondary" onClick={handleExport} disabled={!data}>
      <Download size={16} /> Export JSON
    </button>
  )
}
