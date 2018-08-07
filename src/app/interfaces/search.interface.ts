import { MeshDescriptorInterface } from './mesh-descriptor.interface';
import { FacilityInterface, StudyInterface } from './study.interface';



export interface CountByCountryInterface {
  country: string
  countStudies: number
}

export interface CountByOverallStatusInterface {
  overallStatus: string
  countStudies: number
}

export interface CountByFacilityInterface {
  facility: FacilityInterface
  countStudies: number
}

export interface SearchInterface {
  searchId?: number
  searchUuid: string
  title?: string
  descriptors: MeshDescriptorInterface[]
  studies?: StudyInterface[]
  studiesFiltered?: StudyInterface[]
  studiesStats: {
    byCountry?: CountByCountryInterface[]
    byOverallStatus?: CountByOverallStatusInterface[]
    byFacility?: CountByFacilityInterface[]
  }
}
