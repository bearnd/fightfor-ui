enum ClinicalTrialStudyOverallStatus {
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

enum ClinicalTrialStudyPhase {
  NA = 'N/A',
  PHASE_1_EARLY = 'Early Phase 1',
  PHASE_1 = 'Phase 1',
  PHASE_1_2 = 'Phase 1/Phase 2',
  PHASE_2 = 'Phase 2',
  PHASE_2_3 = 'Phase 2/Phase 3',
  PHASE_3 = 'Phase 3',
  PHASE_4 = 'Phase 4',
}

enum ClinicalTrialStudyType {
    EXPANDED = 'Expanded Access',
    INTERVENTIONAL = 'Interventional',
    NA = 'N/A',
    OBSERVATIONAL = 'Observational',
    OBSERVATIONAL_PR = 'Observational [Patient Registry]',
}

export interface ClinicalTrialStudyInterface {
  studyId?: number
  orgStudyId?: string
  secondaryId?: string
  nctId: string
  briefTitle?: string
  acronym?: string
  officialTitle?: string
  source?: string
  briefSummary?: string
  detailedDescription: string
  overallStatus?: ClinicalTrialStudyOverallStatus
  lastKnownStatus?: ClinicalTrialStudyOverallStatus
  whyStopped?: string
  startDate?: Date
  completionDate?: Date
  primaryCompletionDate?: Date
  verificationDate?: Date
  phase?: ClinicalTrialStudyPhase
  studyType?: ClinicalTrialStudyType
  targetDuration: string
}
