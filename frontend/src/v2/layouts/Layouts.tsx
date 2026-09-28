import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { TirangaStrip, GovHeader, BrandingHeader, Footer } from '../components/SharedComponents'

const getNavClass = ({ isActive }: { isActive: boolean }) => 
  `font-label-lg px-space-md py-2.5 rounded transition-all whitespace-nowrap ${isActive ? 'bg-primary text-on-primary shadow-sm' : 'text-on-primary-container hover:text-on-primary hover:bg-primary'}`

export function NodalOfficerLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed top-0 w-full z-50 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
        <TirangaStrip />
        <GovHeader />
        <BrandingHeader role="Nodal Scoping Director" name="Shri Amitabh Verma" />
        <div className="w-full bg-primary-container text-on-primary">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
            <nav className="flex items-center overflow-x-auto py-1 gap-1 hide-scrollbar">
              <NavLink to="/nodal/triage" className={getNavClass}>Nodal Scoping & GIS Console</NavLink>
            </nav>
          </div>
        </div>
      </header>
      <main className="w-full pt-44 bg-surface min-h-[calc(100vh-180px)]">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export function EvaluatorDemoLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed top-0 w-full z-50 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
        <TirangaStrip />
        <GovHeader />
        <BrandingHeader role="Academic Evaluator" name="Dr. Rakesh Singh" />
        <div className="w-full bg-primary-container text-on-primary">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
            <nav className="flex items-center overflow-x-auto py-1 gap-1 hide-scrollbar">
              <NavLink to="/evaluator/dossier" className={getNavClass}>Evaluation Dossier</NavLink>
            </nav>
          </div>
        </div>
      </header>
      <main className="w-full pt-44 bg-surface min-h-[calc(100vh-180px)]">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export function FacultyDemoLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed top-0 w-full z-50 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
        <TirangaStrip />
        <GovHeader />
        <BrandingHeader role="Faculty Principal" name="Prof. Anil Kumar" />
        <div className="w-full bg-primary-container text-on-primary">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
            <nav className="flex items-center overflow-x-auto py-1 gap-1 hide-scrollbar">
              <NavLink to="/faculty/projects" className={getNavClass}>Faculty Workspace</NavLink>
            </nav>
          </div>
        </div>
      </header>
      <main className="w-full pt-44 bg-surface min-h-[calc(100vh-180px)]">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export function AdminDemoLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed top-0 w-full z-50 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
        <TirangaStrip />
        <GovHeader />
        <BrandingHeader role="System Administrator" name="Admin Portal" />
        <div className="w-full bg-primary-container text-on-primary">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
            <nav className="flex items-center overflow-x-auto py-1 gap-1 hide-scrollbar">
              <NavLink to="/admin/governance" className={getNavClass}>Governance Desk</NavLink>
              <NavLink to="/admin/analytics" className={getNavClass}>State Impact Analytics</NavLink>
            </nav>
          </div>
        </div>
      </header>
      <main className="w-full pt-44 bg-surface min-h-[calc(100vh-180px)]">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export function CommonLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed top-0 w-full z-50 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
        <TirangaStrip />
        <GovHeader />
        <BrandingHeader role="User Platform" name="Smart India Hackathon" />
        <div className="w-full bg-primary-container text-on-primary">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
            <nav className="flex items-center overflow-x-auto py-1 gap-1 hide-scrollbar">
              <NavLink to="/messages" className={getNavClass}>Messages</NavLink>
              <NavLink to="/notifications" className={getNavClass}>Notifications</NavLink>
            </nav>
          </div>
        </div>
      </header>
      <main className="w-full pt-44 bg-surface min-h-[calc(100vh-180px)] px-6 lg:px-12 py-space-lg max-w-7xl mx-auto">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export function CitizenDemoLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed top-0 w-full z-50 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
        <TirangaStrip />
        <GovHeader />
        <BrandingHeader role="Citizen Grievance Filer" name="Ramesh Kumar" />
        <div className="w-full bg-primary-container text-on-primary">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
            <nav className="flex items-center overflow-x-auto py-1 gap-1 hide-scrollbar">
              <NavLink to="/citizen/dashboard" className={getNavClass}>Dashboard & Citizen Portal</NavLink>
            </nav>
          </div>
        </div>
      </header>
      <main className="w-full pt-44 bg-surface min-h-[calc(100vh-180px)]">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export function StudentDemoLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed top-0 w-full z-50 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
        <TirangaStrip />
        <GovHeader />
        <BrandingHeader role="Student Innovator" name="Student Lab" />
        <div className="w-full bg-primary-container text-on-primary">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
            <nav className="flex items-center overflow-x-auto py-1 gap-1 hide-scrollbar">
              <NavLink to="/student/dashboard" className={getNavClass}>Innovation & Student Lab</NavLink>
            </nav>
          </div>
        </div>
      </header>
      <main className="w-full pt-44 bg-surface min-h-[calc(100vh-180px)]">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
