import { Injectable } from '@angular/core';

import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs/Observable';
import gql from 'graphql-tag';

import { StudyInterface } from '../interfaces/study.interface';
import {
  CountByCountryInterface, CountByFacilityInterface,
  CountByOverallStatusInterface
} from '../interfaces/search.interface';


interface VariablesGetCountStudiesByCountry {
  studyIds: number[]
}

interface ResponseGetCountStudiesByCountry {
  studiesStats: {
    countStudiesByCountry: CountByCountryInterface[]
  }
}

interface VariablesGetCountStudiesByOverallStatus {
  studyIds: number[]
}

interface ResponseGetCountStudiesByOverallStatus {
  studiesStats: {
    countStudiesByOverallStatus: CountByOverallStatusInterface[]
  }
}

interface VariablesGetCountStudiesByFacility {
  studyIds: number[]
}

interface ResponseGetCountStudiesByFacility {
  studiesStats: {
    countStudiesByFacility: CountByFacilityInterface[]
  }
}

@Injectable()
export class StudyStatsRetrieverService {

  queryGetCountStudiesByCountry = gql`
    query getCountStudiesByCountry(
      $studyIds: [Int]!, 
      $limit: Int
    ) {
      studiesStats {
        countStudiesByCountry(
          studyIds: $studyIds,
          limit: $limit
        ) {
          country,
          countStudies
        }
      }
    }
  `;

  queryGetCountStudiesByOverallStatus = gql`
    query getCountStudiesByOverallStatus(
      $studyIds: [Int]!, 
      $limit: Int
    ) {
      studiesStats {
        countStudiesByOverallStatus(
          studyIds: $studyIds,
          limit: $limit
        ) {
          overallStatus,
          countStudies
        }
      }
    }
  `;

  queryGetCountStudiesByFacility = gql`
    query getCountStudiesByFacility(
      $studyIds: [Int]!, 
      $limit: Int
    ) {
      studiesStats {
        countStudiesByFacility(
          studyIds: $studyIds, 
          limit: $limit
        ) {
          facility {
            facilityId,
            name,
            city,
            state,
            zipCode,
            country
          }
          countStudies
        }
      }
    }
  `;

  constructor(private apollo: Apollo) {
  }

  /**
   * Retrieve the count of clinical-trial studies by country for given studies.
   * @param {StudyInterface[]} studies The studies which will be grouped and
   * counted by country.
   * @param {number} limit The number of results to return (ordered by a
   * descending number of studies).
   * @returns {Observable<CountByCountryInterface[]>}
   */
  getCountStudiesByCountry(
    studies: StudyInterface[],
    limit: number = null,
  ): Observable<CountByCountryInterface[]> {

    // Retrieve the IDs out of the provided studies.
    const studyIds: number[] = studies.map(
      function (d) {
        return d.studyId;
      }
    );

    return this.apollo
      .query<ResponseGetCountStudiesByCountry,
        VariablesGetCountStudiesByCountry>
      ({
        query: this.queryGetCountStudiesByCountry,
        variables: {
          studyIds: studyIds,
          limit: limit,
        }
      }).map((response) => {
        return response.data.studiesStats.countStudiesByCountry;
      });
  }

  /**
   * Retrieve the count of clinical-trial studies by overall status for given
   * studies.
   * @param {StudyInterface[]} studies The studies which will be grouped and
   * counted by overall status.
   * @param {number} limit The number of results to return (ordered by a
   * descending number of studies).
   * @returns {Observable<CountByOverallStatusInterface[]>}
   */
  getCountStudiesByOverallStatus(
    studies: StudyInterface[],
    limit: number = null,
  ): Observable<CountByOverallStatusInterface[]> {

    // Retrieve the IDs out of the provided studies.
    const studyIds: number[] = studies.map(
      function (d) {
        return d.studyId;
      }
    );

    return this.apollo
      .query<ResponseGetCountStudiesByOverallStatus,
        VariablesGetCountStudiesByOverallStatus>
      ({
        query: this.queryGetCountStudiesByOverallStatus,
        variables: {
          studyIds: studyIds,
          limit: limit,
        }
      }).map((response) => {
        return response.data.studiesStats.countStudiesByOverallStatus;
      });
  }

  /**
   * Retrieve the count of clinical-trial studies by facility for given studies.
   * @param {StudyInterface[]} studies The studies which will be grouped and
   * counted by facility.
   * @param {number} limit The number of results to return (ordered by a
   * descending number of studies).
   * @returns {Observable<CountByFacilityInterface[]>}
   */
  getCountStudiesByFacility(
    studies: StudyInterface[],
    limit: number = null,
  ): Observable<CountByFacilityInterface[]> {

    // Retrieve the IDs out of the provided studies.
    const studyIds: number[] = studies.map(
      function (d) {
        return d.studyId;
      }
    );

    return this.apollo
      .query<ResponseGetCountStudiesByFacility,
        VariablesGetCountStudiesByFacility>
      ({
        query: this.queryGetCountStudiesByFacility,
        variables: {
          studyIds: studyIds,
          limit: limit,
        }
      }).map((response) => {
        return response.data.studiesStats.countStudiesByFacility;
      });
  }

}
