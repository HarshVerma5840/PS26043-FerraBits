import React from 'react'
import { useNavigate } from 'react-router-dom'

export function CitizenDashboardPage() {
  const navigate = useNavigate()

  return (
    <div className="max-w-7xl mx-auto w-full px-6 lg:px-12 py-space-xl space-y-space-xl">
      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-700 text-xs font-semibold flex items-center justify-between">
        <span>PREVIEW PROTOTYPE: CITIZEN is not an issuable JWT role. Citizens authenticate as SUBMITTER in the production portal.</span>
        <button onClick={() => navigate('/portal/problems')} className="underline hover:text-amber-900">Go to Submitter Portal &rarr;</button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-lg">
        <div className="space-y-space-xs">
          <div className="flex flex-wrap items-center gap-space-sm">
            <h1 className="font-headline-lg text-headline-lg font-bold text-primary tracking-tight">नमस्ते, Citizen</h1>
            <span className="inline-flex items-center gap-1 bg-tertiary-fixed text-tertiary font-label-sm text-label-sm px-2.5 py-1 rounded-full font-bold">
              <span className="material-symbols-outlined text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
              DigiLocker & Aadhaar Verified
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Welcome to the National Societal Innovation & Grievance Redressal Network
          </p>
        </div>
      </div>

      <div className="bg-primary-container text-on-primary rounded-xl p-space-lg shadow-sm">
        <h2 className="font-headline-md text-headline-md font-bold text-on-primary mb-2">File a Civic Problem</h2>
        <p className="font-body-sm text-body-sm text-on-primary-container mb-4">
          Submit photo evidence, location pin, and problem scope. Connect directly with municipal engineers and academic lab innovators.
        </p>
        <button
          onClick={() => navigate('/portal/problems')}
          className="px-6 py-3.5 bg-secondary-container hover:bg-secondary text-on-secondary font-label-lg font-bold rounded-lg shadow-sm transition-all"
          type="button"
        >
          + File New Societal Problem
        </button>
      </div>

      <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
        <h3 className="font-title-md font-bold text-primary mb-4">Your Civic Dossiers</h3>
        <p className="text-on-surface-variant font-body-sm">No active dossiers found.</p>
      </div>
    </div>
  )
}

export default CitizenDashboardPage
