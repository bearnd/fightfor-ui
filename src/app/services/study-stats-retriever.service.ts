import { Injectable } from '@angular/core';

import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs/Observable';
import gql from 'graphql-tag';

import { StudyInterface } from '../interfaces/study.interface';
import {
  CountByCountryInterface, CountByFacilityInterface,
  CountByOverallStatusInterface
} from '../interfaces/search.interface';
import { AgeRange, DateRange } from '../shared/common.interface';


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

interface VariablesGetUniqueCities {
  studyIds: number[]
}

interface ResponseGetUniqueCities {
  studiesStats: {
    getUniqueCities: string[]
  }
}

interface VariablesGetUniqueStates {
  studyIds: number[]
}

interface ResponseGetUniqueStates {
  studiesStats: {
    getUniqueStates: string[]
  }
}

interface VariablesGetUniqueCountries {
  studyIds: number[]
}

interface ResponseGetUniqueCountries {
  studiesStats: {
    getUniqueCountries: string[]
  }
}

interface VariablesGetStartDateRange {
  studyIds: number[]
}

interface ResponseGetStartDateRange {
  studiesStats: {
    getDateRange: DateRange
  }
}

interface VariablesGetEligibilityAgeRange {
  studyIds: number[]
}

interface ResponseGetEligibilityAgeRange {
  studiesStats: {
    getAgeRange: AgeRange
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

  queryGetUniqueCities = gql`
    query getUniqueCities(
      $studyIds: [Int]!,
    ) {
      studiesStats {
        getUniqueCities(
          studyIds: $studyIds,
        )
      }
    }
  `;

  queryGetUniqueStates = gql`
    query getUniqueStates(
      $studyIds: [Int]!,
    ) {
      studiesStats {
        getUniqueStates(
          studyIds: $studyIds,
        )
      }
    }
  `;

  queryGetUniqueCountries = gql`
    query getUniqueCountries(
      $studyIds: [Int]!,
    ) {
      studiesStats {
        getUniqueCountries(
          studyIds: $studyIds,
        )
      }
    }
  `;

  queryGetStartDateRange = gql`
    query getDateRange(
      $studyIds: [Int]!,
    ) {
      studiesStats {
        getDateRange(
          studyIds: $studyIds,
        ) {
          dateBeg,
          dateEnd,
        }
      }
    }
  `;

  queryGetEligibilityAgeRange = gql`
    query getAgeRange(
      $studyIds: [Int]!,
    ) {
      studiesStats {
        getAgeRange(
          studyIds: $studyIds,
        ) {
          ageBeg,
          ageEnd,
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

  /**
   * Retrieve the unique cities for given studies.
   * @param {StudyInterface[]} studies The studies for which the unique cities
   * will be retrieved.
   * @returns {Observable<string[]>} The unique cities.
   */
  getUniqueCities(
    studies: StudyInterface[],
  ): Observable<string[]> {

    // Retrieve the IDs out of the provided studies.
    const studyIds: number[] = studies.map(
      function (d) {
        return d.studyId;
      }
    );

    return this.apollo
      .query<ResponseGetUniqueCities,
        VariablesGetUniqueCities>
      ({
        query: this.queryGetUniqueCities,
        variables: {studyIds: studyIds},
      }).map((response) => {
        return response.data.studiesStats.getUniqueCities;
      });
  }

  /**
   * Retrieve the unique states for given studies.
   * @param {StudyInterface[]} studies The studies for which the unique states
   * will be retrieved.
   * @returns {Observable<string[]>} The unique states.
   */
  getUniqueStates(
    studies: StudyInterface[],
  ): Observable<string[]> {

    // Retrieve the IDs out of the provided studies.
    const studyIds: number[] = studies.map(
      function (d) {
        return d.studyId;
      }
    );

    return this.apollo
      .query<ResponseGetUniqueStates,
        VariablesGetUniqueStates>
      ({
        query: this.queryGetUniqueStates,
        variables: {studyIds: studyIds},
      }).map((response) => {
        return response.data.studiesStats.getUniqueStates;
      });
  }

  /**
   * Retrieve the unique countries for given studies.
   * @param {StudyInterface[]} studies The studies for which the unique
   * countries will be retrieved.
   * @returns {Observable<string[]>} The unique countries.
   */
  getUniqueCountries(
    studies: StudyInterface[],
  ): Observable<string[]> {

    // Retrieve the IDs out of the provided studies.
    const studyIds: number[] = studies.map(
      function (d) {
        return d.studyId;
      }
    );

    return this.apollo
      .query<ResponseGetUniqueCountries,
        VariablesGetUniqueCountries>
      ({
        query: this.queryGetUniqueCountries,
        variables: {studyIds: studyIds},
      }).map((response) => {
        return response.data.studiesStats.getUniqueCountries;
      });
  }

  /**
   * Retrieve the start-date date-range for given studies.
   * @param {StudyInterface[]} studies The studies for which the start-date
   * date-range will be retrieved.
   * @returns {Observable<DateRange>} The start-date date-range.
   */
  getStartDateRange(
    studies: StudyInterface[],
  ): Observable<DateRange> {

    // Retrieve the IDs out of the provided studies.
    const studyIds: number[] = studies.map(
      function (d) {
        return d.studyId;
      }
    );

    return this.apollo
      .query<ResponseGetStartDateRange,
        VariablesGetStartDateRange>
      ({
        query: this.queryGetStartDateRange,
        variables: {studyIds: studyIds},
      }).map((response) => {
        return {
          dateBeg: new Date(response.data.studiesStats.getDateRange.dateBeg),
          dateEnd: new Date(response.data.studiesStats.getDateRange.dateEnd),
        };
      });
  }

  /**
   * Retrieve the eligibility age-range for given studies.
   * @param {StudyInterface[]} studies The studies for which the eligibility
   * age-range will be retrieved.
   * @returns {Observable<AgeRange>} The eligibility age-range.
   */
  getEligibilityAgeRange(
    studies: StudyInterface[],
  ): Observable<AgeRange> {

    // Retrieve the IDs out of the provided studies.
    const studyIds: number[] = studies.map(
      function (d) {
        return d.studyId;
      }
    );

    return this.apollo
      .query<ResponseGetEligibilityAgeRange,
        VariablesGetEligibilityAgeRange>
      ({
        query: this.queryGetEligibilityAgeRange,
        variables: {studyIds: studyIds},
      }).map((response) => {
        return response.data.studiesStats.getAgeRange;
      });
  }

}
