import { MeshDescriptorInterface } from './mesh-descriptor.interface';
import { StudyInterface } from './study.interface';
import { FacilityInterface } from './facility.interface';


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
  studiesStats: {
    byCountry?: CountByCountryInterface[]
    byOverallStatus?: CountByOverallStatusInterface[]
    byFacility?: CountByFacilityInterface[]
  }
}
