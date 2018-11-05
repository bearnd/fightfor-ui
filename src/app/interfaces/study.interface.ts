export enum StudyOverallStatus {
  ACTIVE_NOT = 'Active, not recruiting',
  COMPLETED = 'Completed',
  INVITATION = 'Enrolling by invitation',
  NOT_YET = 'Not yet recruiting',
  RECRUITING = 'Recruiting',
  SUSPENDED = 'Suspended',
  TERMINATED = 'Terminated',
  WITHDRAWN = 'Withdrawn',
  AVAILABLE = 'Available',
  UNAVAILABLE = 'No longer available',
  TEMP_UNAVAILABLE = 'Temporarily not available',
  APPROVED = 'Approved for marketing',
  WITHHELD = 'Withheld',
  UNKNOWN = 'Unknown status',
}

export enum RecruitmentStatusType {
  ACTIVE_NOT = 'Active, not recruiting',
  COMPLETED = 'Completed',
  INVITATION = 'Enrolling by invitation',
  NOT_YET = 'Not yet recruiting',
  RECRUITING = 'Recruiting',
  SUSPENDED = 'Suspended',
  TERMINATED = 'Terminated',
  WITHDRAWN = 'Withdrawn',
}

export enum StudyPhase {
  NA = 'N/A',
  PHASE_1_EARLY = 'Early Phase 1',
  PHASE_1 = 'Phase 1',
  PHASE_1_2 = 'Phase 1/Phase 2',
  PHASE_2 = 'Phase 2',
  PHASE_2_3 = 'Phase 2/Phase 3',
  PHASE_3 = 'Phase 3',
  PHASE_4 = 'Phase 4',
}

export enum StudyType {
  EXPANDED = 'Expanded Access',
  INTERVENTIONAL = 'Interventional',
  NA = 'N/A',
  OBSERVATIONAL = 'Observational',
  OBSERVATIONAL_PR = 'Observational [Patient Registry]',
}

export enum InterventionType {
  BEHAVIORAL = 'Behavioral',
  BIOLOGICAL = 'Biological',
  COMBINATION = 'Combination Product',
  DEVICE = 'Device',
  DIAGNOSTIC = 'Diagnostic Test',
  DIETARY = 'Dietary Supplement',
  DRUG = 'Drug',
  GENETIC = 'Genetic',
  PROCEDURE = 'Procedure',
  RADIATION = 'Radiation',
  OTHER = 'Other',
}

export enum OrderType {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum RoleType {
  PRINCIPAL = 'Principal Investigator',
  SUB = 'Sub-Investigator',
  CHAIR = 'Study Chair',
  DIRECTOR = 'Study Director',
}

export enum MeshTermType {
  CONDITION = 'Condition',
  INTERVENTION = 'Intervention',
}

export enum ActualType {
  ACTUAL = 'Actual',
  ANTICIPATED = 'Anticipated',
  ESTIMATE = 'Estimate',
}

export enum GenderType {
  MALE = 'Male',
  FEMALE = 'Female',
  ALL = 'All',
}

export enum SamplingMethod {
  PROBABILITY = 'Probability Sample',
  NON_PROBABILITY = 'Non-Probability Sample',
}

export enum OutcomeType {
  PRIMARY = 'Primary',
  SECONDARY = 'Secondary',
  POST_HOC = 'Post-Hoc',
  OTHER = 'Other Pre-specified',
}

export enum ReferenceType {
  STANDARD = 'Standard',
  RESULTS = 'Results',
}

export interface InterventionInterface {
  interventionId: number
  interventionType?: InterventionType
  name?: string
  description?: string
  armGroups: ArmGroupInterface[]
}

export interface MeshTermInterface {
  meshTermId?: number
  term?: string
}

export interface StudyMeshTermInterface {
  studyMeshTermId?: number
  studyId?: number
  meshTermId?: number
  meshTermType?: MeshTermType
  meshTerm?: MeshTermInterface
}

export interface FacilityInterface {
  facilityId?: number
  name?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  facilityCanonical?: FacilityCanonicalInterface
}

export interface FacilityCanonicalInterface {
  facilityCanonicalId?: number
  name?: string
  address?: string
  phoneNumber?: string
  url?: string
  locality?: string
  administrativeAreaLevel1?: string
  country?: string
  postalCode?: string
}

export interface PersonInterface {
  personId?: number
  nameFirst?: string
  nameMiddle?: string
  nameLast?: string
  degrees?: string
}

export interface ContactInterface {
  contactId?: number
  personId?: number
  phone?: string
  phoneExt?: string
  email?: string
  person?: PersonInterface
}

export interface InvestigatorInterface {
  investigatorId?: number
  personId?: number
  role?: RoleType
  affiliation?: string
  person?: PersonInterface
  locations?: LocationInterface[]
}

export interface LocationInterface {
  locationId?: number
  facilityId?: number
  status?: RecruitmentStatusType
  contactPrimaryId?: number
  contactBackupId?: number
  facility?: FacilityInterface
  contactPrimary?: ContactInterface
  contactBackup?: ContactInterface
  investigators?: InvestigatorInterface[]
  studies?: StudyInterface[]
}

export interface EnrollmentInterface {
  enrollmentId?: number
  enrollmentType?: ActualType
  value: number
}

export interface StudyDesignInfoInterface {
  studyDesignInfoId?: number
  allocation?: string
  interventionModel?: string
  interventionModelDescription?: string
  primaryPurpose?: string
  observationalModel?: string
  timePerspective?: string
  masking?: string
  maskingDescription?: string
}

export interface EligibilityInterface {
  eligibilityId: number
  studyPop: string
  samplingMethod: SamplingMethod
  criteria: string
  genderBased: boolean
  genderDescription: string
  minimumAge: string
  maximumAge: string
  healthyVolunteers: string
  gender: GenderType
}

export interface ProtocolOutcomeInterface {
  protocolOutcomeId: number
  measure: string
  timeFrame: string
  description: string
}

export interface StudyOutcomeInterface {
  studyPrimaryOutcomeId: number
  studyId: number
  protocolOutcomeId: number
  outcomeType: OutcomeType,
  study: StudyInterface,
  protocolOutcome: ProtocolOutcomeInterface
}

export interface ReferenceInterface {
  referenceId: number
  citation: string
  pmid: number
  studies: StudyInterface[]
  studyReferences: StudyReferenceInterface[]
}

export interface StudyReferenceInterface {
  studyReferenceId: number
  studyId: number
  referenceId: number
  referenceType: ReferenceType
  study: StudyInterface
  reference: ReferenceInterface
}

export interface ArmGroupInterface {
  armGroupId: number
  armGroupType: string
  label: string
  description: string
  interventions: InterventionInterface[]
}

export interface StudyInterface {
  studyId?: number
  orgStudyId?: string
  secondaryId?: string
  nctId?: string
  briefTitle?: string
  acronym?: string
  officialTitle?: string
  source?: string
  briefSummary?: string
  detailedDescription?: string
  overallStatus?: StudyOverallStatus
  lastKnownStatus?: StudyOverallStatus
  whyStopped?: string
  startDate?: Date
  completionDate?: Date
  primaryCompletionDate?: Date
  verificationDate?: Date
  phase?: StudyPhase
  studyType?: StudyType
  targetDuration?: string
  interventions?: InterventionInterface[]
  studyMeshTerms?: StudyMeshTermInterface[]
  locations?: LocationInterface[]
  facilities?: FacilityInterface[]
  facilitiesCanonical?: FacilityCanonicalInterface[]
  enrollment?: EnrollmentInterface
  studyDesignInfo?: StudyDesignInfoInterface
  eligibility?: EligibilityInterface
  investigators?: InvestigatorInterface[]
  studyOutcomes?: StudyOutcomeInterface[]
  outcomes?: ProtocolOutcomeInterface[]
  studyReferences?: StudyReferenceInterface[]
  references?: ReferenceInterface[]
  armGroups?: ArmGroupInterface[]
}
