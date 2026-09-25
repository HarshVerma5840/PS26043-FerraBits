import { NavLink } from 'react-router-dom'
import { LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  icon: LucideIcon
  label: string
}

export default function Sidebar({ items, title, titleIcon: TitleIcon }: { items: NavItem[], title: string, titleIcon?: React.ElementType }) {
  return (
    <aside className="sidebar">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#fff', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {TitleIcon ? (
            <TitleIcon size={24} color="var(--primary)" />
          ) : (
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              S
            </div>
          )}
          {title}
        </h2>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              color: isActive ? '#fff' : 'var(--text-muted)',
              background: isActive ? 'rgba(79, 70, 229, 0.15)' : 'transparent',
              border: isActive ? '1px solid rgba(79, 70, 229, 0.3)' : '1px solid transparent',
              textDecoration: 'none',
              fontWeight: isActive ? 500 : 400,
              transition: 'all 0.2s',
            })}
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
