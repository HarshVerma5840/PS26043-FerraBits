export interface User {
  id: string
  name: string
  email: string
  roles: string[]
}

export interface Problem {
  id: string
  title: string
  description: string
  domainId?: string
}

export interface RegistryVersion {
  id: string
  version: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  createdAt: string
  publishedAt?: string
}

export interface Capability {
  id: string
  skill: string
  level: string
}

export interface Institution {
  id: string
  code: string
  name: string
  type: string
  state: string
  district: string
  verified: boolean
  capabilities: Capability[]
}

export interface EvidenceCard {
  id: string
  title: string
  description: string
  relevanceScore: number
}

export interface RecommendationReview {
  id: string
  problemId: string
  targetInstitutionId: string
  aggregateScore: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'OVERRIDDEN'
  overrideReason?: string
  evidenceCards: EvidenceCard[]
}

export interface Project {
  id: string
  title: string
  description: string
  institutionId: string
  status: string
  problemId?: string
  createdAt: string
}

export interface TeamMember {
  id: string
  userId: string
  name: string
  role: string
  skills: string[]
}

export interface SkillGap {
  id: string
  skill: string
  requiredLevel: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
}

export interface Milestone {
  id: string
  title: string
  description?: string
  dueDate: string
  status: string
}

export interface Task {
  id: string
  title: string
  description: string
  assignee?: string
  status: string
  position: number
  priority?: string
  dueDate?: string
}

export interface FieldTest {
  id: string
  location: string
  result?: string
  status: string
  testDate: string
}

export interface Deployment {
  id: string
  target: string
  deploymentDate: string
  status: string
}

export interface IndustryOrganization {
  id: string
  name: string
  contactPersonEmail: string
  verified: boolean
  totalFundingAmount?: number
}

export interface Funding {
  id: string
  amount: number
  currency: string
  status: string
}

export interface Mentorship {
  id: string
  mentorId: string
  scope: string
  status: string
}

export interface Conversation {
  id: string
  type: string
  contextId?: string
}

export interface Message {
  id: string
  senderId: string
  content: string
  read: boolean
  timestamp: string
}

export interface Feedback {
  id: string
  rating: number
  category: string
  comment: string
  moderationStatus: string
}

export interface AnalyticsSummary {
  projectsCompleted: number
  projectsDeployed: number
  districtsServed: number
  averageSatisfaction: number
}

export interface DistrictAnalytics {
  district: string
  state: string
  projectCount: number
}

export interface Participant {
  id: string
  userId: string
  teamName: string
  skills: string[]
  registeredAt: string
}

export interface PortalFile {
  id: string
  fileName: string
  fileSize: number
  contentType: string
  uploadedAt: string
}

export interface Submission {
  id: string
  problemId: string
  participantId: string
  status: 'DRAFT' | 'SUBMITTED' | 'RETURNED' | 'ACCEPTED' | 'REJECTED'
  content: string
  createdAt: string
  updatedAt: string
  feedback?: string
}
