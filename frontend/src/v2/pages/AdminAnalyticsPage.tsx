import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '../../api/analyticsApi'

function ImpactMetricGrid({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm mb-space-lg">
      <div className="bg-surface-container-lowest p-space-md border border-[#E2E8F0] rounded-lg shadow-sm">
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold block mb-1">Total Impact</span>
        <div className="flex items-end gap-2">
          <span className="font-headline-md text-headline-md font-bold text-primary">{data.projectsCompleted || 0}</span>
          <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold pb-1">Projects</span>
        </div>
      </div>
      <div className="bg-surface-container-lowest p-space-md border border-[#E2E8F0] rounded-lg shadow-sm">
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold block mb-1">Field Deployments</span>
        <div className="flex items-end gap-2">
          <span className="font-headline-md text-headline-md font-bold text-tertiary">{data.projectsDeployed || 0}</span>
          <span className="font-label-sm text-label-sm text-secondary font-semibold pb-1">{(data.deploymentSuccessRate * 100 || 0).toFixed(0)}% Success</span>
        </div>
      </div>
      <div className="bg-surface-container-lowest p-space-md border border-[#E2E8F0] rounded-lg shadow-sm">
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold block mb-1">Citizen Feedback</span>
        <div className="flex items-end gap-2">
          <span className="font-headline-md text-headline-md font-bold text-primary">{data.citizenFeedbackCount || 0}</span>
          <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold pb-1">Verified</span>
        </div>
      </div>
      <div className="bg-surface-container-lowest p-space-md border border-[#E2E8F0] rounded-lg shadow-sm">
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold block mb-1">Districts Reached</span>
        <div className="flex items-end gap-2">
          <span className="font-headline-md text-headline-md font-bold text-secondary">{data.districtsServed || 0}</span>
        </div>
      </div>
    </div>
  )
}

function HeatmapPlaceholder() {
  return (
    <div className="w-full h-[300px] bg-[#dbe4ee] rounded-lg overflow-hidden flex items-center justify-center relative border border-[#E2E8F0]">
      <svg className="absolute inset-0 w-full h-full text-slate-300" preserveAspectRatio="none" viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg">
        <path d="M100,100 C200,150 300,50 400,200 C500,350 600,200 700,300" fill="none" opacity="0.6" stroke="#90caf9" strokeLinecap="round" strokeWidth="40"></path>
        <circle cx="300" cy="150" fill="rgba(252, 96, 24, 0.4)" r="80"></circle>
        <circle cx="450" cy="250" fill="rgba(252, 96, 24, 0.2)" r="120"></circle>
        <circle cx="200" cy="300" fill="rgba(252, 96, 24, 0.6)" r="50"></circle>
      </svg>
      <div className="absolute inset-0 bg-gradient-to-t from-[#dbe4ee] to-transparent opacity-50"></div>
      <div className="absolute z-10 flex flex-col items-center">
        <span className="material-symbols-outlined text-[48px] text-secondary opacity-80">local_fire_department</span>
        <span className="font-label-md text-label-md font-bold text-primary mt-2 bg-surface-container-lowest/80 px-2 py-1 rounded backdrop-blur-sm">District Heatmap Projection</span>
      </div>
    </div>
  )
}

function DistrictImpactPanel({ districts = [] }: { districts: any[] }) {
  const maxProjects = districts.length > 0 ? Math.max(...districts.map(d => d.projectCount)) : 1

  return (
    <div className="bg-surface-container-lowest border border-[#E2E8F0] rounded-lg p-space-md shadow-sm">
      <h3 className="font-title-md text-title-md font-bold text-primary mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-[20px]">map</span>
        Regional Penetration
      </h3>
      {districts.length === 0 ? (
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">No district data available.</p>
      ) : (
        <div className="space-y-3 mb-4">
          {districts.slice(0, 5).map((d, i) => (
            <div key={i} className="flex items-center justify-between font-body-sm text-body-sm">
              <span className="font-semibold text-on-surface w-1/3 truncate pr-2">{d.district}</span>
              <div className="w-1/3 h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-secondary" style={{ width: `${(d.projectCount / maxProjects) * 100}%` }}></div>
              </div>
              <span className="text-right w-1/3 text-on-surface-variant">{d.projectCount} Active</span>
            </div>
          ))}
        </div>
      )}
      <HeatmapPlaceholder />
    </div>
  )
}

function InstitutionRankingTable({ institutions = [] }: { institutions: any[] }) {
  return (
    <div className="bg-surface-container-lowest border border-[#E2E8F0] rounded-lg p-space-md shadow-sm">
      <h3 className="font-title-md text-title-md font-bold text-primary mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">school</span>
        Academic Consortium Rankings
      </h3>
      {institutions.length === 0 ? (
        <p className="font-body-sm text-body-sm text-on-surface-variant">No institution data available.</p>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left font-body-sm text-body-sm min-w-[400px]">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase">
                <th scope="col" className="py-2 px-3 rounded-tl">Rank</th>
                <th scope="col" className="py-2 px-3">Institution</th>
                <th scope="col" className="py-2 px-3 text-center">Projects</th>
                <th scope="col" className="py-2 px-3 text-center rounded-tr">Success Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {institutions.map((inst, index) => (
                <tr key={inst.institutionId || index} className="hover:bg-surface-bright transition-colors">
                  <td className="py-3 px-3 font-bold text-secondary">#{index + 1}</td>
                  <td className="py-3 px-3 font-semibold text-on-surface">{inst.institutionName}</td>
                  <td className="py-3 px-3 text-center text-on-surface-variant">{inst.projectCount}</td>
                  <td className="py-3 px-3 text-center font-bold text-tertiary">{(inst.successRate * 100).toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function DeploymentTrendChart() {
  return (
    <div className="bg-surface-container-lowest border border-[#E2E8F0] rounded-lg p-space-md shadow-sm flex flex-col h-full">
      <h3 className="font-title-md text-title-md font-bold text-primary mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-[20px]">moving</span>
        Velocity & Trend
      </h3>
      <div className="flex-1 flex items-end justify-between gap-2 h-40 pt-4 border-b border-surface-container pb-2">
        {[20, 35, 45, 60, 85, 124].map((val, i) => (
          <div key={i} className="w-full bg-primary/20 hover:bg-primary transition-colors rounded-t relative group flex flex-col justify-end" style={{ height: `${(val / 130) * 100}%` }}>
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 font-label-sm text-label-sm font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">{val}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 font-label-sm text-label-sm text-outline">
        <span>Q1</span>
        <span>Q2</span>
        <span>Q3</span>
        <span>Q4</span>
        <span>Q1 '25</span>
        <span>Current</span>
      </div>
    </div>
  )
}

export default function AdminAnalyticsPage() {
  const { data: summary, isLoading: loadingSummary, error: errSummary } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: analyticsApi.getSummary,
  })

  const { data: districts, isLoading: loadingDistricts } = useQuery({
    queryKey: ['analytics-districts'],
    queryFn: analyticsApi.getDistrictAnalytics,
  })

  const { data: institutions, isLoading: loadingInst } = useQuery({
    queryKey: ['analytics-institutions'],
    queryFn: analyticsApi.getInstitutionsAnalytics,
  })

  const isLoading = loadingSummary || loadingDistricts || loadingInst

  return (
    <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-space-xl flex-1">
      <div className="mb-space-lg flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
        <div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-primary tracking-tight">State Impact Analytics</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Global observatory for societal innovation scale and reach.</p>
        </div>
        <button className="bg-surface-container-highest hover:bg-surface-dim px-4 py-2 rounded font-label-md text-label-md font-bold text-primary transition-colors self-start md:self-auto flex items-center gap-2" type="button">
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export Report
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center p-space-xl">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
      )}

      {errSummary && (
        <div className="bg-error-container text-on-error-container p-space-md rounded-lg font-body-sm text-body-sm mb-space-lg">
          Failed to load analytics summary. Please try again.
        </div>
      )}

      {!isLoading && !errSummary && summary && (
        <>
          <ImpactMetricGrid data={summary} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-md mb-space-md">
            <DistrictImpactPanel districts={districts || []} />
            <div className="flex flex-col gap-space-md">
              <InstitutionRankingTable institutions={institutions || []} />
              <DeploymentTrendChart />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
