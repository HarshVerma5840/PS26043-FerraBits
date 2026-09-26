import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '../api/analyticsApi'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { BarChart3 } from 'lucide-react'
import { useState } from 'react'

import ImpactSummaryCards from '../components/analytics/ImpactSummaryCards'
import { 
  DistrictAnalyticsTable, 
  InstitutionAnalyticsTable, 
  ProjectAnalyticsTable, 
  HeatmapLayer, 
  AnalyticsFilters, 
  ExportAnalyticsButton 
} from '../components/analytics/AnalyticsComponents'

export default function AnalyticsDashboardPage() {
  const [filterState, setFilterState] = useState({
    date: 'ALL',
    status: 'ALL',
    deployment: 'ALL',
    district: ''
  })

  const { data: summary, isLoading: loadSum } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: () => analyticsApi.getSummary()
  })

  const { data: districts, isLoading: loadDist } = useQuery({
    queryKey: ['analytics-districts'],
    queryFn: () => analyticsApi.getDistrictAnalytics()
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: institutions, isLoading: loadInst } = useQuery({
    queryKey: ['analytics-institutions'],
    queryFn: () => analyticsApi.getInstitutionsAnalytics()
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: projects, isLoading: loadProj } = useQuery({
    queryKey: ['analytics-projects'],
    queryFn: () => analyticsApi.getProjectsAnalytics()
  })

  // Normalize API returns (which might be raw strings currently in backend)
  const safeDistricts = Array.isArray(districts) ? districts : []
  const safeInstitutions = Array.isArray(institutions) ? institutions : []
  const safeProjects = Array.isArray(projects) ? projects : []

  // Apply basic frontend filtering
  const filteredProjects = safeProjects.filter(p => {
    if (filterState.status !== 'ALL' && p.status !== filterState.status) return false
    if (filterState.deployment !== 'ALL' && p.deploymentStatus !== filterState.deployment) return false
    if (filterState.district && !p.district.toLowerCase().includes(filterState.district.toLowerCase())) return false
    return true
  })

  const filteredDistricts = safeDistricts.filter(d => {
    if (filterState.district && !d.district.toLowerCase().includes(filterState.district.toLowerCase())) return false
    return true
  })

  // Dummy fallback for charts if real data is empty/undefined
  const chartData: any[] = filteredProjects.length > 0 ? filteredProjects : [
    { name: 'Jan', active: 12, completed: 5 },
    { name: 'Feb', active: 18, completed: 8 },
    { name: 'Mar', active: 25, completed: 15 }
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
          <ExportAnalyticsButton data={{ summary, districts: filteredDistricts, institutions: safeInstitutions, projects: filteredProjects }} filename="sih-analytics-export" />
        </div>
      </header>

      <AnalyticsFilters filterState={filterState} setFilterState={setFilterState} />

      <div style={{ marginBottom: '2rem' }}>
        <ImpactSummaryCards metrics={summary} loading={loadSum} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        
        {/* District Map */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Geospatial Impact (Geohash)</h3>
          {loadDist ? <div style={{ color: 'var(--text-muted)' }}>Loading map...</div> : (
            <HeatmapLayer districts={filteredDistricts} />
          )}
        </div>

        {/* Project Velocity Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Project Velocity</h3>
          <div style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
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

      </div>

      {/* Data Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Project Level Analytics</h3>
          <ProjectAnalyticsTable data={filteredProjects} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>District Performance</h3>
            <DistrictAnalyticsTable data={filteredDistricts} />
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Institution Performance</h3>
            <InstitutionAnalyticsTable data={safeInstitutions} />
          </div>
        </div>

      </div>

    </div>
  )
}
