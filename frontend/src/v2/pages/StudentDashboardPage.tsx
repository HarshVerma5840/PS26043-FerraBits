import React from 'react'

export function StudentDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto w-full px-6 lg:px-12 py-space-xl space-y-space-xl">
      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-lg">
        <div className="space-y-space-xs">
          <div className="flex flex-wrap items-center gap-space-sm">
            <h1 className="font-headline-lg text-headline-lg font-bold text-primary tracking-tight">Welcome to the Student Innovation Lab</h1>
            <span className="inline-flex items-center gap-1 bg-tertiary-fixed text-tertiary font-label-sm text-label-sm px-2.5 py-1 rounded-full font-bold">
              <span className="material-symbols-outlined text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>science</span>
              University Verified
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Explore live municipal problems and submit prototypes for evaluation.
          </p>
        </div>
      </div>
      
      <div className="bg-primary-container text-on-primary rounded-xl p-space-lg shadow-sm">
        <h2 className="font-headline-md text-headline-md font-bold text-on-primary mb-2">Browse Grand Challenges</h2>
        <p className="font-body-sm text-body-sm text-on-primary-container mb-4">
          View problems sourced directly from the Nodal Scoping Console and citizen reports.
        </p>
        <button className="px-6 py-3.5 bg-secondary-container hover:bg-secondary text-on-secondary font-label-lg font-bold rounded-lg shadow-sm transition-all" type="button">
          Explore Challenge Pool
        </button>
      </div>
    </div>
  )
}

export default StudentDashboardPage
