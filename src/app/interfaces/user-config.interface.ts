import {
  DescriptorInterface
} from './descriptor.interface';
import {
  FacilityCanonicalInterface,
  StudyInterface
} from './study.interface';
import {
  AffiliationCanonicalInterface,
  CitationInterface,
  PubMedQualifierInterface
} from './citation.interface';


export interface StudiesCountByCountryInterface {
  country: string
  countStudies: number
}


export interface StudiesCountByOverallStatusInterface {
  overallStatus: string
  countStudies: number
}


export interface StudiesCountByFacilityInterface {
  facilityCanonical: FacilityCanonicalInterface
  countStudies: number
}


export interface StudiesCountByFacilityDescriptorInterface {
  facilityCanonical: FacilityCanonicalInterface
  meshTerm: DescriptorInterface
  countStudies: number
}


export interface StudiesCountByDescriptorInterface {
  meshTerm: DescriptorInterface
  countStudies: number
}

export interface CitationsCountByCountryInterface {
  country: string
  countCitations: number
}


export interface CitationsCountByAffiliationInterface {
  affiliationCanonical: AffiliationCanonicalInterface
  countCitations: number
}


export interface CitationsCountByQualifierInterface {
  qualifier: PubMedQualifierInterface
  countCitations: number
}


export interface SearchInterface {
  searchId?: number
  searchUuid: string
  title?: string
  gender?: string
  yearBeg?: number
  yearEnd?: number
  ageBeg?: number
  ageEnd?: number
  descriptors: DescriptorInterface[]
  studies?: StudyInterface[]
  citations?: CitationInterface[]
  studiesStats: {
    byCountry?: StudiesCountByCountryInterface[]
    byOverallStatus?: StudiesCountByOverallStatusInterface[]
    byFacility?: StudiesCountByFacilityInterface[]
    byDescriptor?: StudiesCountByDescriptorInterface[]
  }
  citationsStats: {
    byCountry?: CitationsCountByCountryInterface[]
    byAffiliation?: CitationsCountByAffiliationInterface[]
    byQualifier?: CitationsCountByQualifierInterface[]
  }
}

export interface UserInterface {
  userId?: number
  auth0UserId: string
  email?: string
  searches?: SearchInterface[]
  studies?: StudyInterface[]
  citations?: CitationInterface[]
}
