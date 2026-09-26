export interface User {
  id: string
  name: string
  email: string
  roles: string[]
}

export interface Problem {
  id?: string
  problemId: string
  title: string
  description: string
  domainId?: string
  sourceBucket?: string
  subEntityType?: string
  status?: string
  urgency?: string
  severity?: string
  sourceId?: string
  sourceAccountId?: string
  locationId?: string
  affectedPopulation?: number
  expectedOutcome?: string
  existingIntervention?: string
  submittedAt?: string
  updatedAt?: string
  submittedByUserId?: string
  accessRule?: string
  accessUniversities?: string[]
  version?: number
}

export interface RegistryVersion {
  id: string
  version: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  createdAt: string
  publishedAt?: string
  archivedAt?: string
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
  institutionId?: string
  institutionName?: string
  departmentName?: string
  labName?: string
  equipment?: string[]
  faculty?: string[]
  teamCapability?: string
  denseScore?: number
  sparseScore?: number
  rerankingScore?: number
  finalScore?: number
  explanation?: string
}

export interface RecommendationReview {
  reviewId: string
  problemId: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'OVERRIDDEN'
  runCreatedAt?: string
  currentDecisionId?: string
  topEvidenceCards?: EvidenceCard[]
  auditHistory?: GovernanceAuditRecord[]
}

export interface GovernanceAuditRecord {
  id: string
  action: 'APPROVE' | 'REJECT' | 'OVERRIDE' | string
  actorId?: string
  actorRole?: string
  reason?: string
  requestMetadata?: string
  originalInstitutionId?: string
  selectedInstitutionId?: string
  timestamp?: string
  previousHash?: string
  currentHash?: string
}

export interface Project {
  id: string        // projectId
  projectId: string
  problemId: string
  institutionId: string
  name: string
  description?: string
  status: 'ACTIVE' | 'COMPLETED' | 'SUSPENDED' | string
  createdAt: string
  updatedAt?: string
  // Origin data from matching run / governance decision (joined on client)
  matchingRunId?: string
  registryVersionId?: number
  decisionOrigin?: 'APPROVED' | 'OVERRIDDEN' | string
  selectedByActorRole?: string
  facultyAssignmentId?: string
}

export interface TeamMember {
  id: string           // teamMemberId or participantId
  participantId?: string
  userId?: string
  name: string
  role: string         // LEAD, STUDENT_MEMBER, FACULTY_MENTOR, INDUSTRY_MENTOR
  participantType?: string  // STUDENT, UNIVERSITY, INDUSTRY
  skills?: string[]
  orderIndex?: number
}

export interface SkillGap {
  // NOTE: There is no backend skill-gap endpoint.
  // Skill gaps are computed client-side from matched problem requirements vs team member skills.
  id: string
  skill: string
  requiredLevel: string
  currentLevel?: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  recommendedMemberType?: 'STUDENT' | 'FACULTY_MENTOR' | 'INDUSTRY_MENTOR'
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
  id: string             // organizationId
  name: string
  contactEmail?: string
  contactPersonEmail?: string
  verified: boolean
  totalFundingAmount?: number
  domain?: string
  status?: string
}

export interface IndustryParticipant {
  id: string             // participantId
  projectId: string
  organizationId: string
  organizationName?: string
  participationType: string
  status: string
}

export interface Funding {
  id: string             // fundingId
  projectId: string
  organizationId: string
  amount: number
  currency: string
  status: string
  purpose?: string
}

export interface Mentorship {
  id: string             // mentorshipId
  projectId: string
  mentorUserId?: string
  mentorId: string
  mentorName?: string
  scope: string
  status: string
}

export interface MentorshipSession {
  id: string             // sessionId
  mentorshipId: string
  scheduledAt: string
  durationMinutes: number
  status: string         // SCHEDULED, COMPLETED, CANCELLED
  meetingLink?: string
  notes?: string
}

export interface ConversationParticipant {
  participantId: string
  userId: string
  joinedAt: string
  lastReadAt?: string
  role?: string
}

export interface Conversation {
  id: string             // conversationId
  type: string
  contextId?: string
  createdAt: string
  updatedAt?: string
  participants?: ConversationParticipant[]
  unreadCount?: number
  lastMessageAt?: string
}

export interface Message {
  id: string             // messageId
  conversationId: string
  senderId: string
  content: string
  sentAt: string
  isRead: boolean
  readBy?: string[]
}

export interface PaginatedMessages {
  content: Message[]
  totalPages: number
  totalElements: number
  size: number
  number: number
}

export interface CitizenFeedback {
  id: string             // feedbackId
  projectId: string
  userId: string
  rating: number
  category: string
  comment: string
  completionUsefulness?: string
  isAnonymous: boolean
  moderationStatus: string
  createdAt: string
  locationGeohash?: string
}

export interface CreateFeedback {
  rating: number
  category: string
  comment: string
  completionUsefulness?: string
  isAnonymous: boolean
  latitude?: number
  longitude?: number
}

export interface FeedbackSummary {
  totalFeedback: number
  averageRating: number
}

export interface ImpactMetrics {
  projectsCompleted: number
  projectsDeployed: number
  districtsServed: number
  institutionsInvolved: number
  studentsInvolved: number
  facultyInvolved: number
  industryContributions: number
  citizenFeedbackCount: number
  averageSatisfaction: number
  averageCompletionTimeDays: number
  deploymentSuccessRate: number
}

export interface DistrictAnalytics {
  district: string
  state: string
  projectCount: number
  deployedCount: number
  activeStudents: number
  geohash: string
}

export interface InstitutionAnalytics {
  institutionId: string
  institutionName: string
  projectCount: number
  successRate: number
  totalStudents: number
}

export interface ProjectAnalytics {
  projectId: string
  projectName: string
  status: string
  deploymentStatus: string
  district: string
  institutionName: string
  satisfactionScore: number
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
