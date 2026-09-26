import React, { ReactNode } from 'react'

// --- BADGES ---

export function StatusBadge({ status }: { status: 'Draft' | 'Pending' | 'Verified' | 'Completed' | string }) {
  let bg = 'bg-surface-container'
  let text = 'text-on-surface-variant'
  
  if (status === 'Pending') { bg = 'bg-[#FEF3C7]'; text = 'text-[#B45309]' }
  if (status === 'Verified' || status === 'Completed') { bg = 'bg-[#DCFCE7]'; text = 'text-[#15803D]' }

  return <span className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm uppercase ${bg} ${text}`}>{status}</span>
}

export function VerificationBadge({ text = 'Verified' }: { text?: string }) {
  return (
    <span className="inline-flex items-center gap-1 bg-[#E8F5E9] text-[#2E7D32] px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold">
      <span className="material-symbols-outlined text-[14px]">verified</span>
      {text}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW' }) {
  let bg = 'bg-surface-container'
  let text = 'text-on-surface-variant'
  
  if (priority === 'CRITICAL') { bg = 'bg-secondary-container'; text = 'text-on-primary' }
  if (priority === 'HIGH') { bg = 'bg-surface-container-high'; text = 'text-on-surface-variant' }
  
  return <span className={`px-2 py-0.5 rounded font-label-sm text-label-sm font-bold ${bg} ${text}`}>{priority}</span>
}


// --- CARDS & LAYOUT ---

export function MetricCard({ title, value, icon, color = 'primary', subtext }: { title: string, value: string | number, icon: string, color?: 'primary' | 'secondary' | 'tertiary-container' | 'on-secondary-container', subtext?: string }) {
  return (
    <div className="p-space-md bg-surface-container-low rounded flex items-center justify-between">
      <div>
        <div className={`font-headline-sm text-headline-sm font-bold text-${color}`}>{value}</div>
        <div className="font-label-sm text-label-sm text-on-surface-variant font-semibold mt-0.5">{title}</div>
        {subtext && <div className="text-[10px] text-outline mt-1">{subtext}</div>}
      </div>
      <div className={`w-10 h-10 rounded bg-surface-container-lowest flex items-center justify-center text-${color} shadow-sm`}>
        <span className="material-symbols-outlined text-[22px]">{icon}</span>
      </div>
    </div>
  )
}

export function DataCard({ children, title, action }: { children: ReactNode, title?: string, action?: ReactNode }) {
  return (
    <div className="bg-surface-container-lowest rounded-lg shadow-sm border border-[#E2E8F0] p-space-lg flex flex-col hover:shadow-md transition-shadow">
      {title && (
        <div className="flex items-center justify-between mb-space-md pb-2 border-b border-[#E2E8F0]">
          <h3 className="font-title-md text-title-md font-bold text-on-surface">{title}</h3>
          {action}
        </div>
      )}
      <div className="flex-1">{children}</div>
    </div>
  )
}

export function SectionHeader({ title, subtitle, icon, rightElement }: { title: string, subtitle?: string, icon?: string, rightElement?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-space-md">
      <div className="flex items-center gap-space-xs">
        {icon && <span className="material-symbols-outlined text-primary text-[24px]">{icon}</span>}
        <div>
          <h2 className="font-headline-sm text-headline-sm font-bold text-primary">{title}</h2>
          {subtitle && <p className="font-body-sm text-body-sm text-on-surface-variant">{subtitle}</p>}
        </div>
      </div>
      {rightElement}
    </div>
  )
}


// --- INPUTS & TABLES ---

export function SearchInput({ placeholder = 'Search...' }: { placeholder?: string }) {
  return (
    <div className="relative w-full">
      <label htmlFor="searchInput" className="sr-only">{placeholder}</label>
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]" aria-hidden="true">search</span>
      <input 
        id="searchInput"
        type="text"
        className="w-full h-[48px] pl-10 pr-4 bg-[#FFFFFF] border-2 border-[#CBD5E1] rounded text-on-surface font-body-sm text-body-sm placeholder:text-outline focus:outline-none focus:border-primary focus:ring-2 focus:ring-secondary/20 transition-all" 
        placeholder={placeholder}
      />
    </div>
  )
}

export function FilterBar({ filters }: { filters: { label: string, options: string[] }[] }) {
  return (
    <div className="bg-surface-container-lowest p-space-md rounded shadow-sm border border-[#E2E8F0] flex flex-wrap gap-space-md items-end">
      <div className="flex items-center gap-space-xs mr-4 h-[48px]">
        <span className="material-symbols-outlined text-primary text-[20px]" aria-hidden="true">tune</span>
        <span className="font-label-lg text-label-lg font-bold text-primary">Filters</span>
      </div>
      {filters.map((f, i) => (
        <div key={i} className="flex-1 min-w-[150px]">
          <label htmlFor={`filter-${i}`} className="block font-label-sm text-label-sm text-on-surface-variant font-semibold mb-1">{f.label}</label>
          <select id={`filter-${i}`} aria-label={f.label} className="w-full h-[48px] bg-surface-container-low border border-[#CBD5E1] text-on-surface font-body-sm text-body-sm px-3 rounded focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer">
            <option>All {f.label}</option>
            {f.options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      ))}
      <button className="font-label-sm text-label-sm text-secondary font-bold hover:underline mb-3 ml-2 min-h-[48px] px-2 focus:ring-2 focus:ring-primary rounded outline-none" type="button">Reset All</button>
    </div>
  )
}

export function DataTable({ headers, rows }: { headers: string[], rows: (string | ReactNode)[][] }) {
  return (
    <div className="w-full overflow-x-auto rounded border border-[#E2E8F0]">
      <table className="w-full text-left border-collapse">
        <thead className="bg-surface-container-low border-b border-[#E2E8F0]">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="p-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-[#E2E8F0] last:border-0 hover:bg-surface-bright transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="p-3 font-body-sm text-body-sm text-on-surface">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


// --- STATES ---

export function EmptyState({ title, message, icon = 'inbox' }: { title: string, message: string, icon?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-space-xl text-center">
      <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center text-outline-variant mb-4">
        <span className="material-symbols-outlined text-[32px]">{icon}</span>
      </div>
      <h3 className="font-title-md text-title-md font-bold text-on-surface mb-2">{title}</h3>
      <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">{message}</p>
    </div>
  )
}

export function LoadingState({ message = 'Loading records...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-space-xl">
      <span className="material-symbols-outlined text-primary text-[32px] animate-spin mb-4">progress_activity</span>
      <p className="font-label-sm text-label-sm text-on-surface-variant font-bold uppercase">{message}</p>
    </div>
  )
}

export function ErrorState({ message = 'An error occurred', onRetry }: { message?: string, onRetry?: () => void }) {
  return (
    <div className="bg-error-container text-on-error-container p-space-md rounded-lg flex items-start justify-between gap-3 border border-[#FCA5A5]">
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-[24px]">error</span>
        <div>
          <h4 className="font-title-md text-title-md font-bold">System Error</h4>
          <p className="font-body-sm text-body-sm mt-1">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button 
          onClick={onRetry} 
          className="px-3 py-1 bg-on-error-container text-error-container font-label-sm text-label-sm font-bold rounded hover:opacity-90 outline-none focus:ring-2 focus:ring-on-error-container transition-colors"
          type="button"
        >
          Retry
        </button>
      )}
    </div>
  )
}


// --- COMPONENTS ---

export function Timeline({ events }: { events: { date: string, title: string, desc: string, active?: boolean }[] }) {
  return (
    <div className="relative border-l-2 border-surface-container-high ml-4 space-y-6 py-2">
      {events.map((e, i) => (
        <div key={i} className="relative pl-6">
          <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-[#FFF] ${e.active ? 'bg-secondary' : 'bg-surface-container-high'}`}></div>
          <div className="font-label-sm text-label-sm text-on-surface-variant font-bold mb-1">{e.date}</div>
          <div className={`font-title-md text-title-md font-bold ${e.active ? 'text-primary' : 'text-on-surface'}`}>{e.title}</div>
          <div className="font-body-sm text-body-sm text-on-surface-variant">{e.desc}</div>
        </div>
      ))}
    </div>
  )
}

export function ProgressBar({ progress, label }: { progress: number, label?: string }) {
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between font-label-sm text-label-sm font-bold text-on-surface-variant mb-1">
          <span>{label}</span>
          <span>{progress}%</span>
        </div>
      )}
      <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  )
}

export function ActionButton({ children, variant = 'primary', icon, onClick }: { children: ReactNode, variant?: 'primary' | 'secondary' | 'tertiary', icon?: string, onClick?: () => void }) {
  const base = "font-label-lg text-label-lg px-4 py-3 rounded min-w-[48px] min-h-[48px] flex items-center justify-center gap-2 transition-all font-bold"
  
  let styles = ""
  if (variant === 'primary') styles = "bg-secondary text-[#FFF] hover:bg-[#BF4300]"
  if (variant === 'secondary') styles = "bg-primary text-[#FFF] hover:bg-[#0A1E3D]"
  if (variant === 'tertiary') styles = "bg-transparent text-primary border-2 border-primary hover:border-secondary hover:text-secondary focus:ring-2 focus:ring-secondary/20"
  
  return (
    <button className={`${base} ${styles}`} onClick={onClick} type="button">
      {icon && <span className="material-symbols-outlined text-[20px]">{icon}</span>}
      {children}
    </button>
  )
}

export function ScoreDisplay({ score, max = 100 }: { score: number, max?: number }) {
  const isGood = score >= (max * 0.75)
  const isWarn = score >= (max * 0.4) && !isGood
  
  const color = isGood ? 'text-[#15803D]' : isWarn ? 'text-[#B45309]' : 'text-error'
  
  return (
    <div className="flex items-baseline gap-1">
      <span className={`font-headline-md text-headline-md font-bold ${color}`}>{score}</span>
      <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">/ {max}</span>
    </div>
  )
}

export function ActivityFeed({ activities }: { activities: { user: string, action: string, time: string }[] }) {
  return (
    <div className="space-y-4">
      {activities.map((a, i) => (
        <div key={i} className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[16px] text-outline">person</span>
          </div>
          <div>
            <p className="font-body-sm text-body-sm text-on-surface">
              <span className="font-bold">{a.user}</span> {a.action}
            </p>
            <span className="font-label-sm text-label-sm text-outline font-semibold">{a.time}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

// --- DOMAIN SPECIFIC ---

export function EvidenceCard({ filename, size, type = 'image', geotagged = false }: { filename: string, size: string, type?: 'image' | 'audio' | 'document', geotagged?: boolean }) {
  const iconMap = { image: 'image', audio: 'audio_file', document: 'description' }
  const colorMap = { image: 'text-secondary', audio: 'text-primary', document: 'text-outline-variant' }

  return (
    <div className="bg-surface-container rounded p-space-sm flex items-center gap-space-xs border border-transparent hover:border-[#CBD5E1] transition-colors cursor-pointer">
      <span className={`material-symbols-outlined text-[22px] ${colorMap[type]}`}>{iconMap[type]}</span>
      <div className="min-w-0">
        <span className="font-label-sm text-label-sm font-semibold block truncate">{filename}</span>
        <span className="font-label-sm text-label-sm text-on-surface-variant">
          {size} {geotagged && '• Geotagged'}
        </span>
      </div>
    </div>
  )
}

export function AttachmentCard({ title, url }: { title: string, url?: string }) {
  return (
    <a href={url || '#'} className="flex items-center justify-between p-3 border border-[#E2E8F0] rounded hover:bg-surface-bright transition-colors group">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary-fixed text-primary rounded flex items-center justify-center">
          <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
        </div>
        <span className="font-body-sm text-body-sm font-semibold text-on-surface group-hover:text-primary transition-colors">{title}</span>
      </div>
      <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">download</span>
    </a>
  )
}

export function MapPlaceholder() {
  return (
    <div className="w-full h-full bg-[#dbe4ee] rounded-lg overflow-hidden flex items-center justify-center relative border border-[#E2E8F0]">
      <span className="material-symbols-outlined text-[48px] text-[#AEC7FD] absolute">map</span>
      <div className="absolute bottom-3 left-3 bg-surface-container-lowest/90 px-3 py-1.5 rounded text-[11px] font-mono font-bold shadow-sm z-10 border border-[#E2E8F0]">
        NIC BHARATMAPS
      </div>
    </div>
  )
}


// --- MODALS ---

export function Modal({ isOpen, onClose, title, children, actions }: { isOpen: boolean, onClose: () => void, title: string, children: ReactNode, actions?: ReactNode }) {
  const modalRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div ref={modalRef} tabIndex={-1} className="bg-[#FFFFFF] w-full max-w-lg rounded-lg shadow-[0_10px_25px_-5px_rgba(15,44,89,0.15)] overflow-hidden flex flex-col relative border border-[#E2E8F0] focus:outline-none">
        <div className="h-[3px] w-full bg-primary absolute top-0 left-0"></div>
        <div className="flex items-center justify-between p-4 border-b border-[#E2E8F0]">
          <h2 id="modal-title" className="font-title-md text-title-md font-bold text-primary">{title}</h2>
          <button aria-label="Close modal" onClick={onClose} className="text-on-surface-variant hover:text-on-surface w-[48px] h-[48px] flex items-center justify-center rounded-full hover:bg-surface-container-low focus:ring-2 focus:ring-primary outline-none transition-colors">
            <span className="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>
        <div className="p-space-lg flex-1 overflow-y-auto max-h-[70vh]">
          {children}
        </div>
        {actions && (
          <div className="p-4 bg-surface-container-low border-t border-[#E2E8F0] flex justify-end gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

export function ConfirmationDialog({ isOpen, onClose, onConfirm, title, message, intent = 'primary' }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, title: string, message: string, intent?: 'primary' | 'danger' }) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title}
      actions={
        <>
          <ActionButton variant="tertiary" onClick={onClose}>Cancel</ActionButton>
          <button 
            className={`font-label-lg text-label-lg px-4 py-2 rounded font-bold min-h-[48px] text-[#FFF] ${intent === 'danger' ? 'bg-[#BA1A1A] hover:bg-[#93000A]' : 'bg-primary hover:bg-[#0A1E3D]'}`}
            onClick={() => { onConfirm(); onClose() }}
          >
            Confirm
          </button>
        </>
      }
    >
      <p className="font-body-md text-body-md text-on-surface-variant">{message}</p>
    </Modal>
  )
}
