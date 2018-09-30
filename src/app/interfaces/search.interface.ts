import { MeshDescriptorInterface } from './mesh-descriptor.interface';
import { FacilityCanonicalInterface, MeshTermInterface, StudyInterface } from './study.interface';



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
    byCountry?: StudiesCountByCountryInterface[]
    byOverallStatus?: StudiesCountByOverallStatusInterface[]
    byFacility?: StudiesCountByFacilityInterface[]
  }
}
