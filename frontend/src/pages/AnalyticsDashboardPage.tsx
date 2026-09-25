import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '../api/analyticsApi'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { BarChart3, TrendingUp, Users, Activity } from 'lucide-react'
import { useState } from 'react'

export default function AnalyticsDashboardPage() {
  const [dateFilter, setDateFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const { data: summary, isLoading: loadSum } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: () => analyticsApi.getSummary()
  })

  const { data: districts, isLoading: loadDist } = useQuery({
    queryKey: ['analytics-districts'],
    queryFn: () => analyticsApi.getDistrictAnalytics()
  })

  const { data: institutions, isLoading: loadInst } = useQuery({
    queryKey: ['analytics-institutions'],
    queryFn: () => analyticsApi.getInstitutionsAnalytics()
  })

  const { data: projects, isLoading: loadProj } = useQuery({
    queryKey: ['analytics-projects'],
    queryFn: () => analyticsApi.getProjectsAnalytics()
  })

  // Dummy fallback for charts if real data is empty/undefined
  const mockChartData = projects && projects.length > 0 ? projects : [
    { name: 'Jan', active: 12, completed: 5 },
    { name: 'Feb', active: 18, completed: 8 },
    { name: 'Mar', active: 25, completed: 15 }
  ]

  const mockInstData = institutions && institutions.length > 0 ? institutions : [
    { name: 'IIT Madras', value: 45 },
    { name: 'NIT Trichy', value: 30 },
    { name: 'Anna Univ', value: 25 }
  ]

  return (
    <div className="animate-fade-in" style={{ padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <BarChart3 size={32} color="var(--primary)" />
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Impact & Analytics Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Monitor system-wide capability delivery</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '4px' }}>
            <option value="ALL">All Time</option>
            <option value="YEAR">This Year</option>
            <option value="MONTH">This Month</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '4px' }}>
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Projects</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </header>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(79, 70, 229, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={24} color="var(--primary)" />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Projects</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{summary?.projectsCompleted || '--'}</div>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={24} color="var(--ok)" />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Deployments</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{summary?.projectsDeployed || '--'}</div>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} color="var(--warn)" />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Districts Reached</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{summary?.districtsServed || '--'}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Project Velocity Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Project Velocity</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip contentStyle={{ background: 'var(--bg-color)', border: '1px solid var(--glass-border)', borderRadius: '8px' }} />
                <Bar dataKey="active" fill="var(--primary)" name="Active Projects" radius={[4,4,0,0]} />
                <Bar dataKey="completed" fill="var(--ok)" name="Completed" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Institution Distribution */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Top Institutions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {mockInstData.map(inst => (
              <div key={inst.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                  <span>{inst.name}</span>
                  <span>{inst.value} Projects</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
                  <div style={{ width: `${(inst.value / 50) * 100}%`, height: '100%', background: 'var(--primary)', borderRadius: '3px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* District Heatmap (Leaflet Map) */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>District Impact Heatmap</h3>
        <div style={{ height: '400px', borderRadius: '8px', overflow: 'hidden' }}>
          <MapContainer center={[20.5937, 78.9629]} zoom={4} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            {districts?.map((d: any, i) => (
              <CircleMarker 
                key={i}
                center={[d.lat || 20.5937, d.lng || 78.9629]} // Fake coordinates if missing
                radius={Math.max(5, (d.projectCount || 1) * 2)}
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
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  )
}
