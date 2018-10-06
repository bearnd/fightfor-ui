import { MeshDescriptorInterface } from './mesh-descriptor.interface';
import {
  FacilityCanonicalInterface,
  MeshTermInterface,
  StudyInterface,
} from './study.interface';
import {
  AffiliationCanonicalInterface,
  CitationInterface, PubMedQualifierInterface,
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


export interface StudiesCountByFacilityMeshTermInterface {
  facilityCanonical: FacilityCanonicalInterface
  meshTerm: MeshTermInterface
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
  descriptors: MeshDescriptorInterface[]
  yearBeg?: number
  yearEnd?: number
  studies?: StudyInterface[]
  citations?: CitationInterface[]
  studiesStats: {
    byCountry?: StudiesCountByCountryInterface[]
    byOverallStatus?: StudiesCountByOverallStatusInterface[]
    byFacility?: StudiesCountByFacilityInterface[]
  }
  citationsStats: {
    byCountry?: CitationsCountByCountryInterface[]
    byAffiliation?: CitationsCountByAffiliationInterface[]
    byQualifier?: CitationsCountByQualifierInterface[]
  }
}
