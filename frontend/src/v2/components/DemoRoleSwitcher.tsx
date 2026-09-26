import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export function DemoRoleSwitcher() {
  const location = useLocation()
  
  if (!location.pathname.startsWith('/demo')) return null

  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-surface-container-lowest rounded-lg shadow-[0_10px_25px_-5px_rgba(15,44,89,0.3)] border border-[#E2E8F0] overflow-hidden flex flex-col min-w-[200px]">
      <div className="bg-secondary text-on-primary text-[10px] font-bold uppercase tracking-wider px-3 py-1 flex items-center justify-between">
        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">science</span> Phase 1 Mock Demo</span>
      </div>
      <div className="p-2 flex flex-col gap-1 font-label-sm text-label-sm">
        <span className="text-on-surface-variant px-2 py-1 font-semibold uppercase text-[10px]">Switch Role:</span>
        <Link 
          to="/demo/admin/governance" 
          className={`px-3 py-2 rounded flex items-center gap-2 ${location.pathname.startsWith('/demo/admin') ? 'bg-primary-container text-on-primary font-bold' : 'hover:bg-surface-container text-on-surface'}`}
        >
          <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span> System Admin
        </Link>
        <Link 
          to="/demo/nodal/triage" 
          className={`px-3 py-2 rounded flex items-center gap-2 ${location.pathname.startsWith('/demo/nodal') ? 'bg-primary-container text-on-primary font-bold' : 'hover:bg-surface-container text-on-surface'}`}
        >
          <span className="material-symbols-outlined text-[16px]">shield_with_house</span> Nodal Officer
        </Link>
        <Link 
          to="/demo/evaluator/dossier" 
          className={`px-3 py-2 rounded flex items-center gap-2 ${location.pathname.startsWith('/demo/evaluator') ? 'bg-primary-container text-on-primary font-bold' : 'hover:bg-surface-container text-on-surface'}`}
        >
          <span className="material-symbols-outlined text-[16px]">how_to_reg</span> Academic Evaluator
        </Link>
        <Link 
          to="/demo/faculty/projects" 
          className={`px-3 py-2 rounded flex items-center gap-2 ${location.pathname.startsWith('/demo/faculty') ? 'bg-primary-container text-on-primary font-bold' : 'hover:bg-surface-container text-on-surface'}`}
        >
          <span className="material-symbols-outlined text-[16px]">local_library</span> Faculty Principal
        </Link>
      </div>
    </div>
  )
}
