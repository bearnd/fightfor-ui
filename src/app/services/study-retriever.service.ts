import { Injectable } from '@angular/core';

import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Rx';

import {
  InterventionType,
  OrderType,
  StudyInterface,
  StudyOverallStatus,
  StudyPhase,
  StudyType
} from '../interfaces/study.interface';
import { DescriptorInterface } from '../interfaces/descriptor.interface';


interface VariablesSearchStudies {
  meshDescriptorIds: number[]
  gender?: string
  yearBeg?: number
  yearEnd?: number
  ageBeg?: number
  ageEnd?: number
  doIncludeChildren?: boolean
}

interface VariablesFilterStudies {
  studyIds: number[]
  countries?: string[]
  states?: string[]
  cities?: string[]
  currentLocationLongitude?: number
  currentLocationLatitude?: number
  distanceMaxKm?: number
  overallStatuses?: string[]
  interventionTypes?: string[]
  phases?: string[]
  studyTypes?: string[]
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
  currentLocationLongitude?: number
  currentLocationLatitude?: number
  distanceMaxKm?: number
  overallStatuses?: string[]
  interventionTypes?: string[]
  phases?: string[]
  studyTypes?: string[]
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

interface ResponseGetStudiesByNctIds {
  studies: {
    byNctId: StudyInterface[]
  }
}

interface VariablesGetStudiesByNctIds {
  nctIds: string[]
}

@Injectable()
export class StudyRetrieverService {

  private loadingSearchStudies: BehaviorSubject<boolean>
    = new BehaviorSubject<boolean>(false);
  private loadingGetStudiesByNctId: BehaviorSubject<boolean>
    = new BehaviorSubject<boolean>(false);
  private loadingFilterStudies: BehaviorSubject<boolean>
    = new BehaviorSubject<boolean>(false);
  private loadingCountStudies: BehaviorSubject<boolean>
    = new BehaviorSubject<boolean>(false);

  public isLoadingSearchStudies: Observable<boolean>
    = this.loadingSearchStudies.asObservable();
  public isLoadingGetStudiesByNctId: Observable<boolean>
    = this.loadingGetStudiesByNctId.asObservable();
  public isLoadingFilterStudies: Observable<boolean>
    = this.loadingFilterStudies.asObservable();
  public isLoadingCountStudies: Observable<boolean>
    = this.loadingCountStudies.asObservable();

  querySearchStudies = gql`
    query searchStudies(
      $meshDescriptorIds: [Int]!,
      $gender: GenderType,
      $yearBeg: Int,
      $yearEnd: Int,
      $ageBeg: Int,
      $ageEnd: Int,
      $doIncludeChildren: Boolean,
    ) {
      studies {
        search(
          meshDescriptorIds: $meshDescriptorIds,
          gender: $gender,
          yearBeg: $yearBeg,
          yearEnd: $yearEnd,
          ageBeg: $ageBeg,
          ageEnd: $ageEnd,
          doIncludeChildren: $doIncludeChildren,
        ) {
            studyId,
            nctId,
        }
      }
    }
  `;

  queryGetStudiesByNctIds = gql`
    query getStudiesByNctId($nctIds: [String]!) {
      studies {
        byNctId(nctIds: $nctIds) {
          studyId,
          nctId,
          briefTitle,
          briefSummary,
          detailedDescription,
          startDate,
          completionDate,
          studyType,
          phase,
          studyOutcomes {
            outcomeType
            protocolOutcome {
              measure,
              timeFrame,
              description,
            }
          },
          studyReferences {
            referenceType,
            reference {
              citation,
              pmid,
            },
          },
          enrollment {
            value,
          },
          overallStatus,
          studyDesignInfo {
            primaryPurpose,
            allocation,
            interventionModel,
          },
          armGroups {
            armGroupType,
            label,
            description,,
            interventions {
              interventionType,
              name,
              description,
            },
          },
          studyMeshTerms {
            meshTermType,
            meshTerm {
              term
            }
          }
          eligibility {
            gender,
            criteria,
            minimumAge,
            maximumAge,
          },
          locations {
            status,
            contactPrimary {
              phone,
              phoneExt,
              email,
              person {
                nameFirst,
                nameMiddle,
                nameLast,
                degrees,
              },
            },
            contactBackup {
              phone,
              phoneExt,
              email,
              person {
                nameFirst,
                nameMiddle,
                nameLast,
                degrees,
              },
            },
            facility {
              facilityCanonical {
                name,
                address,
                phoneNumber,
                url,
              }
            }
          },
          investigators {
            role,
            affiliation,
            person {
              nameFirst,
              nameMiddle,
              nameLast,
              degrees,
            },
          }
        }
      }
    }
  `;

  queryFilterStudies = gql`
    query filterStudies(
      $studyIds: [Int]!,
      $countries: [String],
      $states: [String],
      $cities: [String],
      $currentLocationLongitude: Float,
      $currentLocationLatitude: Float,
      $distanceMaxKm: Int,
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
          currentLocationLongitude: $currentLocationLongitude,
          currentLocationLatitude: $currentLocationLatitude,
          distanceMaxKm: $distanceMaxKm,
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
          nctId,
          studyId,
          briefTitle,
          facilitiesCanonical {
            name,
            locality,
            administrativeAreaLevel1,
            country,
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
      $currentLocationLongitude: Float,
      $currentLocationLatitude: Float,
      $distanceMaxKm: Int,
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
          currentLocationLongitude: $currentLocationLongitude,
          currentLocationLatitude: $currentLocationLatitude,
          distanceMaxKm: $distanceMaxKm,
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
   * Retrieve clinical-trials studies through their NCT IDs.
   * @param {string[]} nctIds The NCT IDs of the studies to be retrieved.
   */
  getStudiesByNctIds(nctIds: string[]): Observable<StudyInterface[]> {
    // Update the 'loading' observable to indicate that loading is in progress.
    this.loadingGetStudiesByNctId.next(true);

    return this.apollo
      .query<ResponseGetStudiesByNctIds, VariablesGetStudiesByNctIds>({
        query: this.queryGetStudiesByNctIds,
        variables: {
          nctIds: nctIds
        }
      }).map((response) => {
        // Update the 'loading' observable to indicate that loading is complete.
        this.loadingGetStudiesByNctId.next(false);
        return response.data.studies.byNctId;
      });
  }

  /**
   * Search for clinical-trial studies based on an array of MeSH descriptors
   * studies are associated with.
   * @param {DescriptorInterface[]} descriptors Array of MeSH descriptors
   * for which the search is performed
   * @param {string} gender The patient gender studies will be limited to for
   * this search.
   * @param {number} yearBeg The beginning of the year-range studies will be
   * limited to for this search.
   * @param {number} ageBeg The beginning of the eligibility age-range studies
   * will be limited to for this search.
   * @param {number} ageEnd The end of the eligibility age-range studies will
   * be limited to for this search.
   * @param {number} yearEnd The end of the year-range studies will be limited
   * to for this search.
   */
  searchStudies(
    descriptors: DescriptorInterface[],
    gender?: string,
    yearBeg?: number,
    yearEnd?: number,
    ageBeg?: number,
    ageEnd?: number,
  ): Observable<StudyInterface[]> {
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
          gender: gender || null,
          yearBeg: yearBeg || null,
          yearEnd: yearEnd || null,
          ageBeg: yearBeg || null,
          ageEnd: yearEnd || null,
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
   * @param {number} currentLocationLongitude The longitude of the current
   * position from which only studies on facilities within a `distanceMaxKm`
   * will be allowed.
   * @param {number} currentLocationLatitude The latitude of the current
   * position from which only studies on facilities within a `distanceMaxKm`
   * will be allowed.
   * @param {number} distanceMaxKm The maximum distance in kilometers from the
   * current location coordinates within which study facilities will be allowed.
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
    currentLocationLongitude?: number,
    currentLocationLatitude?: number,
    distanceMaxKm?: number,
    overallStatuses?: string[],
    interventionTypes?: string[],
    phases?: string[],
    studyTypes?: string[],
    yearBeg?: number,
    yearEnd?: number,
    ageBeg?: number,
    ageEnd?: number,
    orderBy?: string,
    order?: OrderType,
    limit?: number,
    offset?: number,
  ): Observable<StudyInterface[]> {
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
          currentLocationLongitude: currentLocationLongitude,
          currentLocationLatitude: currentLocationLatitude,
          distanceMaxKm: distanceMaxKm,
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
   * @param {number} currentLocationLongitude The longitude of the current
   * position from which only studies on facilities within a `distanceMaxKm`
   * will be allowed.
   * @param {number} currentLocationLatitude The latitude of the current
   * position from which only studies on facilities within a `distanceMaxKm`
   * will be allowed.
   * @param {number} distanceMaxKm The maximum distance in kilometers from the
   * current location coordinates within which study facilities will be allowed.
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
    currentLocationLongitude?: number,
    currentLocationLatitude?: number,
    distanceMaxKm?: number,
    overallStatuses?: string[],
    interventionTypes?: string[],
    phases?: string[],
    studyTypes?: string[],
    yearBeg?: number,
    yearEnd?: number,
    ageBeg?: number,
    ageEnd?: number,
  ): Observable<number> {
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
          currentLocationLongitude: currentLocationLongitude,
          currentLocationLatitude: currentLocationLatitude,
          distanceMaxKm: distanceMaxKm,
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
