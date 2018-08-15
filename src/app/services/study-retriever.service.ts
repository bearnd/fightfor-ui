import { Injectable } from '@angular/core';

import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import {
  InterventionType,
  OrderType,
  StudyInterface,
  StudyOverallStatus,
  StudyPhase,
  StudyType
} from '../interfaces/study.interface';
import {
  MeshDescriptorInterface
} from '../interfaces/mesh-descriptor.interface';


interface VariablesSearchStudies {
  meshDescriptorIds: number[]
  yearBeg?: number
  yearEnd?: number
  doIncludeChildren?: boolean
}

interface VariablesFilterStudies {
  studyIds: number[]
  countries?: string[]
  states?: string[]
  cities?: string[]
  overallStatuses?: StudyOverallStatus[]
  interventionTypes?: InterventionType[]
  phases?: StudyPhase[]
  studyTypes?: StudyType[]
  yearBeg?: number
  yearEnd?: number
  ageBeg?: number
  ageEnd?: number
  orderBy?: string
  order?: OrderType
  limit?: number
  offset?: number
}

interface VariablesCountStudies {
  studyIds: number[]
  countries?: string[]
  states?: string[]
  cities?: string[]
  overallStatuses?: StudyOverallStatus[]
  interventionTypes?: InterventionType[]
  phases?: StudyPhase[]
  studyTypes?: StudyType[]
  yearBeg?: number
  yearEnd?: number
  ageBeg?: number
  ageEnd?: number
}

interface ResponseSearchStudies {
  studies: {
    search: StudyInterface[]
  }
}

interface ResponseFilterStudies {
  studies: {
    filter: StudyInterface[]
  }
}

interface ResponseCountStudies {
  studies: {
    count: number
  }
}

interface ResponseGetStudyByNctId {
  getStudyByNctId: StudyInterface
}

interface VariablesGetStudyByNctId {
  nctId: string
}

@Injectable()
export class StudyRetrieverService {

  private loadingSearchStudies = new BehaviorSubject<boolean>(false);
  private loadingGetStudyByNctId = new BehaviorSubject<boolean>(false);
  private loadingFilterStudies = new BehaviorSubject<boolean>(false);
  private loadingCountStudies = new BehaviorSubject<boolean>(false);

  public isLoadingSearchStudies = this.loadingSearchStudies.asObservable();
  public isLoadingGetStudyByNctId = this.loadingGetStudyByNctId.asObservable();
  public isLoadingFilterStudies = this.loadingFilterStudies.asObservable();
  public isLoadingCountStudies = this.loadingCountStudies.asObservable();

  querySearchStudies = gql`
    query searchStudies(
      $meshDescriptorIds: [Int]!,
      $yearBeg: Int,
      $yearEnd: Int,
      $doIncludeChildren: Boolean,
    ) {
      studies {
        search(
          meshDescriptorIds: $meshDescriptorIds,
          yearBeg: $yearBeg,
          yearEnd: $yearEnd,
          doIncludeChildren: $doIncludeChildren,
        ) {
          studyId,
          nctId,
        }
      }
    }
  `;

  queryGetStudyByNctId = gql`
    query($nctId: String!) {
       getStudyByNctId(nctId: $nctId) {
        studyId,
        nctId,
      }
    }
  `;

  queryFilterStudies = gql`
    query filterStudies(
      $studyIds: [Int]!,
      $countries: [String],
      $states: [String],
      $cities: [String],
      $overallStatuses: [OverallStatusType],
      $interventionTypes: [InterventionType],
      $phases: [PhaseType],
      $studyTypes: [StudyType],
      $yearBeg: Int,
      $yearEnd: Int,
      $ageBeg: Int,
      $ageEnd: Int,
      $orderBy: String,
      $order: TypeEnumOrder,
      $limit: Int,
      $offset: Int,
    ) {
      studies {
        filter(
          studyIds: $studyIds,
          countries: $countries,
          states: $states,
          cities: $cities,
          overallStatuses: $overallStatuses,
          interventionTypes: $interventionTypes,
          phases: $phases,
          studyTypes: $studyTypes,
          yearBeg: $yearBeg,
          yearEnd: $yearEnd,
          ageBeg: $ageBeg,
          ageEnd: $ageEnd,
          orderBy: $orderBy,
          order: $order,
          limit: $limit,
          offset: $offset,
        ) {
          studyId,
          briefTitle,
          locations {
            facility {
              name,
              city,
              state,
              country
            }
          },
          overallStatus,
          studyMeshTerms {
            meshTermType,
            meshTerm {
              term,
            },
          }
        }
      }
    }
  `;

  queryCountStudies = gql`
    query countStudies(
      $studyIds: [Int]!,
      $countries: [String],
      $states: [String],
      $cities: [String],
      $overallStatuses: [OverallStatusType],
      $interventionTypes: [InterventionType],
      $phases: [PhaseType],
      $studyTypes: [StudyType],
      $yearBeg: Int,
      $yearEnd: Int,
      $ageBeg: Int,
      $ageEnd: Int,
    ) {
      studies {
        count(
          studyIds: $studyIds,
          countries: $countries,
          states: $states,
          cities: $cities,
          overallStatuses: $overallStatuses,
          interventionTypes: $interventionTypes,
          phases: $phases,
          studyTypes: $studyTypes,
          yearBeg: $yearBeg,
          yearEnd: $yearEnd,
          ageBeg: $ageBeg,
          ageEnd: $ageEnd,
        ) 
      }
    }
  `;

  constructor(private apollo: Apollo) {
  }

  /**
   * Retrieve a clinical-trials study through its NCT ID.
   * @param {string} nctId The NCT ID of the study to be retrieved.
   */
  getTrialByNctId(nctId: string) {
    // Update the 'loading' observable to indicate that loading is in progress.
    this.loadingGetStudyByNctId.next(true);

    return this.apollo
      .query<ResponseGetStudyByNctId, VariablesGetStudyByNctId>({
        query: this.queryGetStudyByNctId,
        variables: {
          nctId: nctId
        }
      }).map((response) => {
        // Update the 'loading' observable to indicate that loading is complete.
        this.loadingGetStudyByNctId.next(false);
        return response.data.getStudyByNctId;
      });
  }

  /**
   * Search for clinical-trial studies based on an array of MeSH descriptors
   * studies are associated with.
   * @param {MeshDescriptorInterface[]} descriptors Array of MeSH descriptors
   * for which the search is performed
   * @param {number} yearBeg The beginning of the year-range studies will be
   * limited to for this search.
   * @param {number} yearEnd The end of the year-range studies will be limited
   * to for this search.
   */
  searchStudies(
    descriptors: MeshDescriptorInterface[],
    yearBeg?: number,
    yearEnd?: number,
  ) {
    // Update the 'loading' observable to indicate that loading is in progress.
    this.loadingSearchStudies.next(true);

    // Retrieve the IDs out of the provided MeSH descriptors.
    const descriptorIds: number[] = descriptors.map(
      function (d) {
        return d.descriptorId;
      }
    );

    return this.apollo
      .query<ResponseSearchStudies, VariablesSearchStudies>({
        query: this.querySearchStudies,
        variables: {
          meshDescriptorIds: descriptorIds,
          yearBeg: yearBeg || null,
          yearEnd: yearEnd || null,
          doIncludeChildren: true,
        }
      }).map((response) => {
        // Update the 'loading' observable to indicate that loading is complete.
        this.loadingSearchStudies.next(false);
        return response.data.studies.search;
      });
  }

  /**
   * Filter clinical-trial studies with support for filtering, ordering, and
   * pagination.
   * @param {StudyInterface[]} studies The studies on which filtering will be
   * performed.
   * @param {string[]} countries Array of country names to filter on.
   * @param {string[]} states Array of state/region names to filter on.
   * @param {string[]} cities Array of city names to filter on.
   * @param {StudyOverallStatus[]} overallStatuses Array of overall-statuses to
   * filter on.
   * @param {InterventionType[]} interventionTypes Array of intervention-types
   * to filter on.
   * @param {StudyPhase[]} phases Array of study-phases to filter on.
   * @param {StudyType[]} studyTypes Array of study-types to filter on.
   * @param {number} yearBeg Earliest year (inclusive) a filtered study can
   * start to be included.
   * @param {number} yearEnd Latest year (inclusive) a filtered study can start
   * to be included.
   * @param {number} ageBeg Minimum eligibility age in seconds a filtered
   * study may have to be included.
   * @param {number} ageEnd Maximum eligibility age in seconds a filtered
   * study may have to be included.
   * @param {string} orderBy Field to order the results by.
   * @param {OrderType} order The ordering direction.
   * @param {number} limit The number of studies to limit the results to (used
   * in pagination).
   * @param {number} offset The study offset (used in pagination).
   */
  filterStudies(
    studies: StudyInterface[],
    countries?: string[],
    states?: string[],
    cities?: string[],
    overallStatuses?: StudyOverallStatus[],
    interventionTypes?: InterventionType[],
    phases?: StudyPhase[],
    studyTypes?: StudyType[],
    yearBeg?: number,
    yearEnd?: number,
    ageBeg?: number,
    ageEnd?: number,
    orderBy?: string,
    order?: OrderType,
    limit?: number,
    offset?: number,
  ) {
    // Update the 'loading' observable to indicate that loading is in progress.
    this.loadingFilterStudies.next(true);

    // Retrieve the IDs out of the provided studies.
    const studyIds: number[] = studies.map(
      function (s) {
        return s.studyId;
      }
    );

    return this.apollo
      .query<ResponseFilterStudies, VariablesFilterStudies>({
        query: this.queryFilterStudies,
        variables: {
          studyIds: studyIds,
          countries: countries,
          states: states,
          cities: cities,
          overallStatuses: overallStatuses,
          interventionTypes: interventionTypes,
          phases: phases,
          studyTypes: studyTypes,
          yearBeg: yearBeg,
          yearEnd: yearEnd,
          ageBeg: ageBeg,
          ageEnd: ageEnd,
          orderBy: orderBy,
          order: order,
          limit: limit,
          offset: offset,
        }
      }).map((response) => {
        // Update the 'loading' observable to indicate that loading is complete.
        this.loadingFilterStudies.next(false);

        return response.data.studies.filter;
      });
  }

  /**
   * Count clinical-trial studies with support for filtering, ordering, and
   * pagination.
   * @param {StudyInterface[]} studies The studies on which filtering will be
   * performed.
   * @param {string[]} countries Array of country names to filter on.
   * @param {string[]} states Array of state/region names to filter on.
   * @param {string[]} cities Array of city names to filter on.
   * @param {StudyOverallStatus[]} overallStatuses Array of overall-statuses to
   * filter on.
   * @param {InterventionType[]} interventionTypes Array of intervention-types
   * to filter on.
   * @param {StudyPhase[]} phases Array of study-phases to filter on.
   * @param {StudyType[]} studyTypes Array of study-types to filter on.
   * @param {number} yearBeg Earliest year (inclusive) a filtered study can
   * start to be included.
   * @param {number} yearEnd Latest year (inclusive) a filtered study can start
   * to be included.
   * @param {number} ageBeg Minimum eligibility age in seconds a filtered
   * study may have to be included.
   * @param {number} ageEnd Maximum eligibility age in seconds a filtered
   * study may have to be included.
   */
  countStudies(
    studies: StudyInterface[],
    countries?: string[],
    states?: string[],
    cities?: string[],
    overallStatuses?: StudyOverallStatus[],
    interventionTypes?: InterventionType[],
    phases?: StudyPhase[],
    studyTypes?: StudyType[],
    yearBeg?: number,
    yearEnd?: number,
    ageBeg?: number,
    ageEnd?: number,
  ) {
    // Update the 'loading' observable to indicate that loading is in progress.
    this.loadingCountStudies.next(true);

    // Retrieve the IDs out of the provided studies.
    const studyIds: number[] = studies.map(
      function (s) {
        return s.studyId;
      }
    );

    return this.apollo
      .query<ResponseCountStudies, VariablesCountStudies>({
        query: this.queryCountStudies,
        variables: {
          studyIds: studyIds,
          countries: countries,
          states: states,
          cities: cities,
          overallStatuses: overallStatuses,
          interventionTypes: interventionTypes,
          phases: phases,
          studyTypes: studyTypes,
          yearBeg: yearBeg,
          yearEnd: yearEnd,
          ageBeg: ageBeg,
          ageEnd: ageEnd,
        }
      }).map((response) => {
        // Update the 'loading' observable to indicate that loading is complete.
        this.loadingCountStudies.next(false);

        return response.data.studies.count;
      });
  }

}
