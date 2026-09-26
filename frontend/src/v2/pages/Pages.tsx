import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { projectApi } from '../../api/projectApi'

export function FacultyWorkspace() {
  const { projectId } = useParams<{ projectId?: string }>()
  
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['faculty-projects'],
    queryFn: projectApi.getProjects,
  })

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-space-lg flex-1 flex justify-center items-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-space-lg flex-1">
        <div className="bg-error-container text-on-error-container p-space-md rounded-lg font-body-sm text-body-sm">
          Failed to load projects. Please try again.
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-space-lg flex-1 flex flex-col md:flex-row gap-space-lg">
      
      {/* Left Sidebar: Projects List */}
      <div className="w-full md:w-1/3 flex flex-col gap-space-md">
        <h2 className="font-headline-sm text-headline-sm font-bold text-primary">Your Projects</h2>
        
        {(!projects || projects.length === 0) ? (
          <div className="bg-surface-container-lowest p-space-md rounded shadow-sm text-center">
            <p className="text-on-surface-variant text-body-sm font-body-sm">No active projects found.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-space-xs">
            {projects.map(proj => {
              const isActive = proj.projectId === projectId || proj.id === projectId
              return (
                <Link
                  key={proj.id}
                  to={`/faculty/projects/${proj.id}`}
                  className={`p-space-md rounded shadow-sm transition-colors border ${
                    isActive 
                      ? 'bg-primary-container text-on-primary-container border-primary-container' 
                      : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-low border-[#E2E8F0]'
                  }`}
                >
                  <div className="font-label-md text-label-md font-bold mb-1">{proj.name}</div>
                  <div className="font-label-sm text-label-sm opacity-80 truncate">{proj.description || 'No description available'}</div>
                  <div className="mt-2 flex items-center justify-between font-label-sm text-label-sm">
                    <span className="font-bold">{proj.status}</span>
                    <span className="opacity-75">ID: {proj.id.substring(0,8)}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Right Content: Project Details */}
      <div className="w-full md:w-2/3">
        {projectId ? (
          <ProjectDetailsPanel projectId={projectId} />
        ) : (
          <div className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm text-center flex flex-col items-center justify-center h-full min-h-[400px] border border-[#E2E8F0]">
            <span className="material-symbols-outlined text-[48px] text-outline mb-4">folder_open</span>
            <h3 className="font-title-md text-title-md font-bold text-on-surface">Select a Project</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">Choose a project from the sidebar to view milestones, tasks, and deployments.</p>
          </div>
        )}
      </div>

    </div>
  )
}

function ProjectDetailsPanel({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient()

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectApi.getProjectById(projectId),
  })
  
  const { data: milestones } = useQuery({
    queryKey: ['project-milestones', projectId],
    queryFn: () => projectApi.getProjectMilestones(projectId),
  })

  const { data: fieldTests } = useQuery({
    queryKey: ['project-field-tests', projectId],
    queryFn: () => projectApi.getFieldTests(projectId),
  })

  const { data: deployments } = useQuery({
    queryKey: ['project-deployments', projectId],
    queryFn: () => projectApi.getDeployments(projectId),
  })

  const updateMilestoneMutation = useMutation({
    mutationFn: ({ milestoneId, status }: { milestoneId: string, status: string }) => 
      projectApi.updateMilestone(milestoneId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-milestones', projectId] })
    }
  })

  const handleUpdateMilestone = (milestoneId: string, status: string) => {
    updateMilestoneMutation.mutate({ milestoneId, status })
  }

  if (isLoading) {
    return <div className="p-space-lg text-center text-on-surface-variant">Loading project details...</div>
  }

  if (!project) {
    return <div className="p-space-lg text-center text-on-surface-variant">Project not found.</div>
  }

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-[#E2E8F0]">
        <div className="flex items-center justify-between mb-space-md">
          <h2 className="font-headline-md text-headline-md font-bold text-primary">{project.name}</h2>
          <span className="px-3 py-1 rounded bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-bold uppercase tracking-wider">{project.status}</span>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed whitespace-pre-wrap">{project.description}</p>
        <div className="grid grid-cols-2 gap-space-md mt-space-md pt-space-md border-t border-[#E2E8F0] font-label-sm text-label-sm">
          <div>
            <span className="text-on-surface-variant block mb-1">Project ID</span>
            <span className="font-bold font-mono">{project.id}</span>
          </div>
          <div>
            <span className="text-on-surface-variant block mb-1">Created At</span>
            <span className="font-bold">{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-[#E2E8F0]">
        <h3 className="font-title-lg text-title-lg font-bold text-primary mb-space-md">Milestones</h3>
        {(!milestones || milestones.length === 0) ? (
          <p className="font-body-sm text-body-sm text-on-surface-variant">No milestones defined for this project.</p>
        ) : (
          <div className="space-y-space-sm">
            {milestones.map(m => (
              <div key={m.id} className="p-space-md bg-surface-container-low rounded-lg border border-surface-container flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
                <div>
                  <h4 className="font-title-md text-title-md font-bold text-on-surface mb-1">{m.title}</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{m.description || 'No description'}</p>
                </div>
                <div className="flex items-center gap-space-md shrink-0">
                  <span className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm font-bold ${m.status === 'COMPLETED' ? 'bg-tertiary-fixed text-tertiary' : 'bg-surface-container-highest text-on-surface-variant'}`}>{m.status}</span>
                  {m.dueDate && <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Due: {new Date(m.dueDate).toLocaleDateString()}</span>}
                  {m.status !== 'COMPLETED' && (
                    <button 
                      onClick={() => handleUpdateMilestone(m.id, 'COMPLETED')}
                      className="ml-2 px-3 py-1 bg-primary text-on-primary rounded text-sm hover:bg-primary-hover"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-[#E2E8F0]">
        <h3 className="font-title-lg text-title-lg font-bold text-primary mb-space-md">Field Testing</h3>
        {(!fieldTests || fieldTests.length === 0) ? (
          <p className="font-body-sm text-body-sm text-on-surface-variant">No field tests recorded.</p>
        ) : (
          <div className="space-y-space-sm">
            {fieldTests.map(t => (
              <div key={t.id} className="p-space-md bg-surface-container-low rounded-lg border border-surface-container flex justify-between items-center">
                <div>
                  <div className="font-title-md text-title-md font-bold text-on-surface mb-1">{t.location}</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">{t.result || 'No results yet'}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm font-bold ${t.status === 'PASSED' ? 'bg-tertiary-fixed text-tertiary' : 'bg-surface-container-highest text-on-surface-variant'}`}>{t.status}</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">{new Date(t.testDate).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-[#E2E8F0]">
        <h3 className="font-title-lg text-title-lg font-bold text-primary mb-space-md">Deployment Tracking</h3>
        {(!deployments || deployments.length === 0) ? (
          <p className="font-body-sm text-body-sm text-on-surface-variant">No deployments tracked.</p>
        ) : (
          <div className="space-y-space-sm">
            {deployments.map(d => (
              <div key={d.id} className="p-space-md bg-surface-container-low rounded-lg border border-surface-container flex justify-between items-center">
                <div className="font-title-md text-title-md font-bold text-on-surface">{d.target}</div>
                <div className="flex items-center gap-space-md">
                  <span className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm font-bold ${d.status === 'SUCCESS' ? 'bg-tertiary-fixed text-tertiary' : 'bg-surface-container-highest text-on-surface-variant'}`}>{d.status}</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">{new Date(d.deploymentDate).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function ProjectProgress() {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-space-lg flex-1">
      <h2 className="font-headline-lg text-headline-lg font-bold text-primary mb-4">Project Progress</h2>
      <div className="bg-surface-container-lowest p-space-md rounded shadow-sm">
        <p className="text-on-surface-variant">Track milestones, deploy status, and funding.</p>
      </div>
    </div>
  )
}

export function TeamOverview() {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-space-lg flex-1">
      <h2 className="font-headline-lg text-headline-lg font-bold text-primary mb-4">Team Overview</h2>
      <div className="bg-surface-container-lowest p-space-md rounded shadow-sm">
        <p className="text-on-surface-variant">View student assignments and skill gaps.</p>
      </div>
    </div>
  )
}

export function CapabilityRegistry() {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-space-lg flex-1">
      <h2 className="font-headline-lg text-headline-lg font-bold text-primary mb-4">Capability Registry</h2>
      <div className="bg-surface-container-lowest p-space-md rounded shadow-sm">
        <p className="text-on-surface-variant">Directory of institutions, departments, and labs.</p>
      </div>
    </div>
  )
}
