import React from 'react'
import { Link } from 'react-router-dom'
export function TirangaStrip() {
  return (
    <div className="w-full h-1 flex">
      <div className="h-full w-1/3 bg-secondary-container"></div>
      <div className="h-full w-1/3 bg-surface-container-lowest"></div>
      <div className="h-full w-1/3 bg-tertiary-container"></div>
    </div>
  )
}

export function GovHeader() {
  return (
    <div className="w-full bg-surface-container-lowest text-on-surface-variant font-label-sm text-label-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-12 flex items-center justify-between">
        <div className="flex items-center gap-space-md">
          <span className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider">भारत सरकार | GOVT. OF INDIA</span>
          <span className="hidden md:inline text-outline-variant">•</span>
          <span className="hidden md:inline text-on-surface-variant">Ministry of Electronics & IT (MeitY) & DST</span>
        </div>
        <div className="flex items-center gap-space-md">
          <button aria-label="Toggle Screen Reader" className="hover:text-on-surface flex items-center gap-space-xs focus:ring-2 focus:ring-primary outline-none rounded min-h-[48px] px-2" type="button">
            <span className="material-symbols-outlined text-[14px]" aria-hidden="true">record_voice_over</span>
            <span className="hidden sm:inline">Screen Reader</span>
          </button>
          <div className="flex items-center bg-surface-container rounded gap-1 h-8 px-1">
            <button aria-label="Decrease text size" className="hover:text-on-surface px-2 min-h-[32px] font-bold focus:ring-2 focus:ring-primary outline-none rounded" type="button">A-</button>
            <button aria-label="Normal text size" className="hover:text-on-surface px-2 min-h-[32px] font-bold focus:ring-2 focus:ring-primary outline-none rounded" type="button">A</button>
            <button aria-label="Increase text size" className="hover:text-on-surface px-2 min-h-[32px] font-bold focus:ring-2 focus:ring-primary outline-none rounded" type="button">A+</button>
          </div>
          <div className="flex items-center gap-1 font-bold">
            <button aria-label="Switch to English" className="text-primary min-h-[48px] px-2 focus:ring-2 focus:ring-primary outline-none rounded" type="button">English</button>
            <span className="text-outline" aria-hidden="true">|</span>
            <button aria-label="Switch to Hindi" className="text-on-surface-variant hover:text-on-surface min-h-[48px] px-2 focus:ring-2 focus:ring-primary outline-none rounded" type="button">हिन्दी</button>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useAuth } from '../../auth/AuthContext'

export function BrandingHeader({ role = 'Nodal Evaluator', name = 'Rajeev Sharma' }) {
  const { user, logout } = useAuth()
  
  const displayRole = user?.role || role
  const displayName = user?.phone || name

  return (
    <div className="w-full bg-surface-container-lowest bg-opacity-95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between gap-space-lg">
        <div className="flex items-center gap-space-md min-w-max">
          <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center text-on-primary" aria-hidden="true">
            <span className="material-symbols-outlined">assured_workload</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-space-xs">
              <span className="font-headline-sm text-headline-sm font-bold text-primary tracking-tight">SAAMYUKT</span>
              <span className="font-title-md text-title-md font-bold text-secondary">संयुक्त</span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">National Societal Innovation Portal</span>
          </div>
        </div>
        <div className="hidden lg:flex flex-1 max-w-md mx-space-lg">
          <div className="relative w-full">
            <label htmlFor="globalSearch" className="sr-only">Search innovations, grand challenges, dossiers</label>
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]" aria-hidden="true">search</span>
            <input id="globalSearch" className="w-full h-[48px] pl-10 pr-4 bg-surface-container-low rounded text-on-surface font-body-sm text-body-sm placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Search innovations, grand challenges, dossiers..." type="text" />
          </div>
        </div>
        <div className="flex items-center gap-space-md">
          <Link to="/notifications" aria-label="View notifications" className="relative p-2 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low focus:ring-2 focus:ring-primary outline-none transition-colors">
            <span className="material-symbols-outlined text-[22px]" aria-hidden="true">notifications</span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-secondary"></span>
          </Link>
          <div className="flex items-center gap-space-sm pl-space-sm border-l border-outline-variant">
            <div className="text-right hidden sm:block">
              <div className="font-label-md text-label-md text-on-surface font-semibold">{displayName}</div>
              <div className="font-label-sm text-label-sm text-on-surface-variant">{displayRole}</div>
            </div>
            <button 
              onClick={logout}
              title="Logout"
              className="w-10 h-10 rounded-full bg-primary hover:bg-primary-container flex items-center justify-center cursor-pointer focus:ring-2 focus:ring-primary outline-none transition-colors" 
              aria-label="Logout"
            >
              <span className="material-symbols-outlined text-on-primary hover:text-primary text-[20px]" aria-hidden="true">logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="w-full bg-surface-container-low text-on-surface">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-space-xl pb-space-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-space-xl mb-space-xl">
          <div className="space-y-space-sm">
            <div className="flex items-center gap-space-sm">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary text-[16px]">assured_workload</span>
              </div>
              <span className="font-title-md text-title-md font-bold text-primary">SAAMYUKT संयुक्त</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">Unified Public Societal Innovation Platform bridging grassroots innovators, academia, nodal ministries, and industry consortia.</p>
            <div className="flex items-center gap-space-sm pt-space-xs">
              <span className="material-symbols-outlined text-primary text-[20px]">verified_user</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">STQC Certified & Audit Compliant</span>
            </div>
          </div>
          <div>
            <h4 className="font-label-lg text-label-lg font-bold text-primary mb-space-md uppercase tracking-wider">Important Links</h4>
            <ul className="space-y-space-xs font-body-sm text-body-sm text-on-surface-variant">
              <li><a className="hover:text-primary transition-colors" href="#">National Innovation Foundation</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Department of Science & Technology (DST)</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Ministry of Electronics & IT (MeitY)</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Data.gov.in Open Data Portal</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-label-lg text-label-lg font-bold text-primary mb-space-md uppercase tracking-wider">Governance & Policy</h4>
            <ul className="space-y-space-xs font-body-sm text-body-sm text-on-surface-variant">
              <li><a className="hover:text-primary transition-colors" href="#">Terms of Public Participation</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Data Privacy & Citizen Protection Charter</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Copyright Policy & Open Intellectual Property</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Hyperlinking Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-label-lg text-label-lg font-bold text-primary mb-space-md uppercase tracking-wider">Institutional Mandate</h4>
            <div className="p-space-md bg-surface-container rounded space-y-space-xs">
              <div className="flex items-center gap-space-xs text-primary font-bold font-label-md text-label-md">
                <span className="material-symbols-outlined text-[18px]">security</span>
                <span>256-Bit SSL Encrypted</span>
              </div>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Hosted in National Informatics Centre (NIC) Government Cloud Architecture.</p>
              <div className="font-label-sm text-label-sm text-on-surface font-semibold pt-space-xs">Web Information Manager: <span className="text-on-surface-variant font-normal">Dir. (Innovations), MeitY</span></div>
            </div>
          </div>
        </div>
        <div className="bg-surface-container-high h-[1px] w-full mb-space-lg"></div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-space-md font-label-sm text-label-sm text-on-surface-variant">
          <div className="text-center md:text-left">
            <span>© 2025 National Informatics Centre (NIC), Ministry of Electronics & Information Technology, Government of India. All Rights Reserved.</span>
          </div>
          <div className="flex items-center gap-space-md">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-tertiary-container">check_circle</span>
              <span>Audit Cleared: CERT-In</span>
            </span>
            <span className="text-outline-variant">•</span>
            <span className="font-bold text-primary tracking-wide">Digital India Initiative</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
