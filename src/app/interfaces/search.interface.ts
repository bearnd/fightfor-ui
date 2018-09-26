import { MeshDescriptorInterface } from './mesh-descriptor.interface';
import { FacilityCanonicalInterface, StudyInterface } from './study.interface';



export interface CountByCountryInterface {
  country: string
  countStudies: number
}

export interface CountByOverallStatusInterface {
  overallStatus: string
  countStudies: number
}

export interface CountByFacilityInterface {
  facilityCanonical: FacilityCanonicalInterface
  countStudies: number
}

export interface CountByFacilityMeshTermInterface {
  facilityCanonical: FacilityCanonicalInterface
  meshTerm: MeshTermInterface
  countStudies: number
}

export interface SearchInterface {
  searchId?: number
  searchUuid: string
  title?: string
  descriptors: MeshDescriptorInterface[]
  yearBeg?: number
  yearEnd?: number
  studies?: StudyInterface[]
  studiesFiltered?: StudyInterface[]
  studiesStats: {
    byCountry?: CountByCountryInterface[]
    byOverallStatus?: CountByOverallStatusInterface[]
    byFacility?: CountByFacilityInterface[]
  }
}
