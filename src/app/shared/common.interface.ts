import { StudyOverallStatus } from '../interfaces/study.interface';

export interface DateRange {
  dateBeg: Date
  dateEnd: Date
}

export interface YearRange {
  yearBeg: number
  yearEnd: number
}

export interface AgeRange {
  ageBeg: number
  ageEnd: number
}

// Create a grouping of overall status values to match the template grouping.
export const overallStatusGroups = {
  recruiting: [
    StudyOverallStatus.INVITATION,
    StudyOverallStatus.RECRUITING,
    StudyOverallStatus.AVAILABLE,
  ],
  completed: [
    StudyOverallStatus.COMPLETED,
    StudyOverallStatus.TERMINATED,
    StudyOverallStatus.WITHDRAWN,
  ],
  active: [
    StudyOverallStatus.ACTIVE_NOT,
  ],
  all: Object.keys(StudyOverallStatus)
    .map(key => StudyOverallStatus[key]),
};
