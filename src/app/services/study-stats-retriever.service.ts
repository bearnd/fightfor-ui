import { Injectable } from '@angular/core';

import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs/Observable';
import gql from 'graphql-tag';

import {
  FacilityCanonicalInterface,
  MeshTermType,
  OrderType,
  StudyInterface
} from '../interfaces/study.interface';
import {
  StudiesCountByCountryInterface,
  StudiesCountByFacilityInterface,
  StudiesCountByOverallStatusInterface,
  StudiesCountByFacilityDescriptorInterface,
  StudiesCountByDescriptorInterface,
  LatestDescriptorInterface,
} from '../interfaces/user-config.interface';
import { AgeRange, DateRange } from '../shared/common.interface';
import { DescriptorInterface } from '../interfaces/descriptor.interface';


interface VariablesGetCountStudiesByCountry {
  studyIds: number[];
  limit: number;
}

interface ResponseGetCountStudiesByCountry {
  studiesStats: {
    countStudiesByCountry: StudiesCountByCountryInterface[];
  };
}

interface VariablesGetCountStudiesByOverallStatus {
  studyIds: number[];
  limit: number;
}

interface ResponseGetCountStudiesByOverallStatus {
  studiesStats: {
    countStudiesByOverallStatus: StudiesCountByOverallStatusInterface[];
  };
}

interface VariablesGetCountStudiesByFacility {
  studyIds: number[];
  meshDescriptorIds?: number[];
  countries?: string[];
  states?: string[];
  cities?: string[];
  currentLocationLongitude?: number;
  currentLocationLatitude?: number;
  distanceMaxKm?: number;
  overallStatuses?: string[];
  orderBy?: string;
  order?: OrderType;
  limit?: number;
  offset?: number;
}

interface ResponseGetCountStudiesByFacility {
  studiesStats: {
    countStudiesByFacility: StudiesCountByFacilityInterface[];
  };
}

interface VariablesCountFacilities {
  studyIds: number[];
  meshDescriptorIds?: number[];
  countries?: string[];
  states?: string[];
  cities?: string[];
  currentLocationLongitude?: number;
  currentLocationLatitude?: number;
  distanceMaxKm?: number;
  overallStatuses?: string[];
}

interface ResponseCountFacilities {
  studiesStats: {
    countFacilities: number;
  };
}

interface VariablesGetCountStudiesByFacilityDescriptor {
  studyIds: number[];
  facilityCanonicalIds?: number[];
  meshTermType?: string;
  limit?: number;
}

interface VariablesGetCountStudiesByDescriptor {
  studyIds: number[];
  meshTermType?: string;
  limit?: number;
}

interface VariablesGetLatestDescriptors {
  studyIds: number[];
  meshTermType?: string;
  limit?: number;
}

interface VariablesGetUniqueDescriptors {
  studyIds: number[];
  meshTermType?: string;
}

interface ResponseGetCountStudiesByFacilityDescriptor {
  studiesStats: {
    countStudiesByFacilityDescriptor: StudiesCountByFacilityDescriptorInterface[];
  };
}

interface ResponseGetCountStudiesByDescriptor {
  studiesStats: {
    countStudiesByDescriptor: StudiesCountByDescriptorInterface[];
  };
}

interface ResponseGetLatestDescriptors {
  studiesStats: {
    getLatestDescriptors: LatestDescriptorInterface[];
  };
}

interface ResponseGetUniqueDescriptors {
  studiesStats: {
    getUniqueDescriptors: DescriptorInterface[];
  };
}

interface VariablesGetUniqueCities {
  studyIds: number[];
  countries?: String[];
}

interface ResponseGetUniqueCities {
  studiesStats: {
    getUniqueCities: string[];
  };
}

interface VariablesGetUniqueStates {
  studyIds: number[];
}

interface ResponseGetUniqueStates {
  studiesStats: {
    getUniqueStates: string[];
  };
}

interface VariablesGetUniqueCountries {
  studyIds: number[];
}

interface ResponseGetUniqueCountries {
  studiesStats: {
    getUniqueCountries: string[];
  };
}

interface VariablesGetStartDateRange {
  studyIds?: number[];
}

interface ResponseGetStartDateRange {
  studiesStats: {
    getDateRange: DateRange;
  };
}

interface VariablesGetEligibilityAgeRange {
  studyIds: number[];
}

interface ResponseGetEligibilityAgeRange {
  studiesStats: {
    getAgeRange: AgeRange;
  };
}

interface VariablesGetUniqueCanonicalFacilities {
  studyIds: number[];
}

interface ResponseGetUniqueCanonicalFacilities {
  studiesStats: {
    getUniqueCanonicalFacilities: FacilityCanonicalInterface[];
  };
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
      $meshDescriptorIds: [Int],
      $countries: [String],
      $states: [String],
      $cities: [String],
      $currentLocationLongitude: Float,
      $currentLocationLatitude: Float,
      $distanceMaxKm: Int,
      $overallStatuses: [OverallStatusType],
      $orderBy: String,
      $order: TypeEnumOrder,
      $offset: Int,
      $limit: Int
    ) {
      studiesStats {
        countStudiesByFacility(
          studyIds: $studyIds,
          meshDescriptorIds: $meshDescriptorIds,
          countries: $countries,
          states: $states,
          cities: $cities,
          currentLocationLongitude: $currentLocationLongitude,
          currentLocationLatitude: $currentLocationLatitude,
          distanceMaxKm: $distanceMaxKm,
          overallStatuses: $overallStatuses,
          orderBy: $orderBy,
          order: $order,
          offset: $offset,
          limit: $limit
        ) {
          facilityCanonical {
            facilityCanonicalId,
            googlePlaceId,
            name,
            locality,
            administrativeAreaLevel1,
            country,
          },
          countStudies
        }
      }
    }
  `;

  queryCountFacilities = gql`
    query countFacilities(
      $studyIds: [Int]!,
      $meshDescriptorIds: [Int],
      $countries: [String],
      $states: [String],
      $cities: [String],
      $currentLocationLongitude: Float,
      $currentLocationLatitude: Float,
      $distanceMaxKm: Int,
      $overallStatuses: [OverallStatusType],
    ) {
      studiesStats {
        countFacilities(
          studyIds: $studyIds,
          meshDescriptorIds: $meshDescriptorIds,
          countries: $countries,
          states: $states,
          cities: $cities,
          currentLocationLongitude: $currentLocationLongitude,
          currentLocationLatitude: $currentLocationLatitude,
          distanceMaxKm: $distanceMaxKm,
          overallStatuses: $overallStatuses,
        )
      }
    }
  `;

  queryGetUniqueCities = gql`
    query getUniqueCities(
      $studyIds: [Int]!,
      $countries: [String],
    ) {
      studiesStats {
        getUniqueCities(
          studyIds: $studyIds,
          countries: $countries,
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
      $studyIds: [Int],
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
      $studyIds: [Int],
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

  queryGetCountStudiesByFacilityDescriptor = gql`
    query getCountStudiesByFacility(
      $studyIds: [Int]!,
      $facilityCanonicalIds: [Int],
      $meshTermType: MeshTermType,
      $limit: Int
    ) {
      studiesStats {
        countStudiesByFacilityDescriptor(
          studyIds: $studyIds,
          facilityCanonicalIds: $facilityCanonicalIds,
          meshTermType: $meshTermType,
          limit: $limit
        ) {
          facilityCanonical {
            facilityCanonicalId,
          },
          meshTerm {
            ui,
            name,
          },
          countStudies
        }
      }
    }
  `;

  queryGetCountStudiesByDescriptor = gql`
    query getCountStudiesByDescriptor(
      $studyIds: [Int]!,
      $meshTermType: MeshTermType,
      $limit: Int
    ) {
      studiesStats {
        countStudiesByDescriptor(
          studyIds: $studyIds,
          meshTermType: $meshTermType,
          limit: $limit
        ) {
          meshTerm {
            ui,
            name,
          },
          countStudies
        }
      }
    }
  `;

  queryGetLatestDescriptors = gql`
    query getLatestDescriptors(
      $studyIds: [Int]!,
      $meshTermType: MeshTermType,
      $limit: Int
    ) {
      studiesStats {
        getLatestDescriptors(
          studyIds: $studyIds,
          meshTermType: $meshTermType,
          limit: $limit
        ) {
          meshTerm {
            ui,
            name,
          },
          date
        }
      }
    }
  `;

  queryGetUniqueDescriptors = gql`
    query getUniqueDescriptors(
      $studyIds: [Int]!,
      $meshTermType: MeshTermType
    ) {
      studiesStats {
        getUniqueDescriptors(
          studyIds: $studyIds,
          meshTermType: $meshTermType,
        ) {
            descriptorId,
            ui,
            name,
        }
      }
    }
  `;

  queryGetUniqueCanonicalFacilities = gql`
    query getUniqueCanonicalFacilities(
      $studyIds: [Int]!,
    ) {
      studiesStats {
        getUniqueCanonicalFacilities(
          studyIds: $studyIds,
        ) {
          facilityCanonicalId,
          name,
          locality,
          administrativeAreaLevel1,
          country,
        }
      }
    }
  `;

  constructor(private apollo: Apollo) {
  }

  /**
   * Retrieve the count of clinical-trial studies by country for given studies.
   * @param studies The studies which will be grouped and counted by country.
   * @param limit The number of results to return (ordered by a descending
   * number of studies).
   */
  getCountStudiesByCountry(
    studies: StudyInterface[],
    limit: number = null,
  ): Observable<StudiesCountByCountryInterface[]> {

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
   * @param studies The studies which will be grouped and
   * counted by overall status.
   * @param limit The number of results to return (ordered by a
   * descending number of studies).
   */
  getCountStudiesByOverallStatus(
    studies: StudyInterface[],
    limit: number = null,
  ): Observable<StudiesCountByOverallStatusInterface[]> {

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
   * @param studies The studies which will be grouped and counted by facility.
   * @param descriptors Array of MeSH descriptors
   * to filter on.
   * @param countries Array of country names to filter on.
   * @param states Array of state/region names to filter on.
   * @param cities Array of city names to filter on.
   * @param currentLocationLongitude The longitude of the current
   * position from which only studies on facilities within a `distanceMaxKm`
   * will be allowed.
   * @param currentLocationLatitude The latitude of the current
   * position from which only studies on facilities within a `distanceMaxKm`
   * will be allowed.
   * @param distanceMaxKm The maximum distance in kilometers from the
   * current location coordinates within which study facilities will be allowed.
   * @param overallStatuses Array of overall-statuses to
   * filter on.
   * @param orderBy Field to order the results by.
   * @param order The ordering direction.
   * @param limit The number of studies to limit the results to (used
   * in pagination).
   * @param offset The study offset (used in pagination).
   */
  getCountStudiesByFacility(
    studies: StudyInterface[],
    descriptors: DescriptorInterface[],
    countries?: string[],
    states?: string[],
    cities?: string[],
    currentLocationLongitude?: number,
    currentLocationLatitude?: number,
    distanceMaxKm?: number,
    overallStatuses?: string[],
    orderBy?: string,
    order?: OrderType,
    limit?: number,
    offset?: number,
  ): Observable<StudiesCountByFacilityInterface[]> {

    // Retrieve the IDs out of the provided studies.
    const studyIds: number[] = studies.map(
      function (d) {
        return d.studyId;
      }
    );

    // Retrieve the IDs out of the provided MeSH descriptors.
    let descriptorIds: number[] = null;
    if (descriptors) {
      descriptorIds = descriptors.map(
        function (d) {
          return d.descriptorId;
        }
      );
    }

    return this.apollo
      .query<ResponseGetCountStudiesByFacility,
        VariablesGetCountStudiesByFacility>
      ({
        query: this.queryGetCountStudiesByFacility,
        variables: {
          studyIds: studyIds,
          meshDescriptorIds: descriptorIds,
          countries: countries,
          states: states,
          cities: cities,
          currentLocationLongitude: currentLocationLongitude,
          currentLocationLatitude: currentLocationLatitude,
          distanceMaxKm: distanceMaxKm,
          overallStatuses: overallStatuses,
          orderBy: orderBy,
          order: order,
          limit: limit,
          offset: offset,
        }
      }).map((response) => {
        return response.data.studiesStats.countStudiesByFacility;
      }).catch(
        error => {
          console.error(error);
          return Observable.throwError(error);
        }
      );
  }

  /**
   * Count the facilities for given facilities.
   * @param studies The studies which will be grouped and counted by facility.
   * @param descriptors Array of MeSH descriptors
   * to filter on.
   * @param countries Array of country names to filter on.
   * @param states Array of state/region names to filter on.
   * @param cities Array of city names to filter on.
   * @param currentLocationLongitude The longitude of the current
   * position from which only studies on facilities within a `distanceMaxKm`
   * will be allowed.
   * @param currentLocationLatitude The latitude of the current
   * position from which only studies on facilities within a `distanceMaxKm`
   * will be allowed.
   * @param distanceMaxKm The maximum distance in kilometers from the
   * current location coordinates within which study facilities will be allowed.
   * @param overallStatuses Array of overall-statuses to
   * filter on.
   */
  countFacilities(
    studies: StudyInterface[],
    descriptors: DescriptorInterface[],
    countries?: string[],
    states?: string[],
    cities?: string[],
    currentLocationLongitude?: number,
    currentLocationLatitude?: number,
    distanceMaxKm?: number,
    overallStatuses?: string[],
  ): Observable<number> {

    // Retrieve the IDs out of the provided studies.
    const studyIds: number[] = studies.map(
      function (d) {
        return d.studyId;
      }
    );

    // Retrieve the IDs out of the provided MeSH descriptors.
    let descriptorIds: number[] = null;
    if (descriptors) {
      descriptorIds = descriptors.map(
        function (d) {
          return d.descriptorId;
        }
      );
    }

    return this.apollo
      .query<ResponseCountFacilities, VariablesCountFacilities>
      ({
        query: this.queryCountFacilities,
        variables: {
          studyIds: studyIds,
          meshDescriptorIds: descriptorIds,
          countries: countries,
          states: states,
          cities: cities,
          overallStatuses: overallStatuses,
        }
      }).map((response) => {
        return response.data.studiesStats.countFacilities;
      }).catch(
        error => {
          console.error(error);
          return Observable.throwError(error);
        }
      );
  }

  /**
   * Retrieve the count of clinical-trial studies by facility and MeSH
   * descriptor for given studies.
   * @param studies The studies which will be grouped and counted by facility.
   * @param facilityCanonicalIds The IDs of the canonical facilities to limit
   * the aggregation to.
   * @param meshTermType The type of MeSH descriptor to limit the aggregation to.
   * @param limit The number of results to return (ordered by a descending
   * number of studies).
   */
  getCountStudiesByFacilityDescriptor(
    studies: StudyInterface[],
    facilityCanonicalIds: number[],
    meshTermType?: MeshTermType,
    limit: number = null,
  ): Observable<StudiesCountByFacilityDescriptorInterface[]> {

    // Retrieve the IDs out of the provided studies.
    const studyIds: number[] = studies.map(
      function (d) {
        return d.studyId;
      }
    );

    const meshTermTypeKey = Object.keys(MeshTermType)
              .find(key => MeshTermType[key] === meshTermType);

    return this.apollo
      .query<ResponseGetCountStudiesByFacilityDescriptor,
        VariablesGetCountStudiesByFacilityDescriptor>
      ({
        query: this.queryGetCountStudiesByFacilityDescriptor,
        variables: {
          studyIds: studyIds,
          facilityCanonicalIds: facilityCanonicalIds,
          meshTermType: meshTermTypeKey,
          limit: limit,
        }
      }).map((response) => {
        return response.data.studiesStats.countStudiesByFacilityDescriptor;
      });
  }

  /**
   * Retrieve the count of clinical-trial studies by MeSH descriptor for given
   * studies.
   * @param studies The studies which will be grouped and counted by facility.
   * @param meshTermType The type of MeSH descriptor to limit the aggregation
   * to.
   * @param limit The number of results to return (ordered by a descending
   * number of studies).
   */
  getCountStudiesByDescriptor(
    studies: StudyInterface[],
    meshTermType?: MeshTermType,
    limit: number = null,
  ): Observable<StudiesCountByDescriptorInterface[]> {

    // Retrieve the IDs out of the provided studies.
    const studyIds: number[] = studies.map(
      function (d) {
        return d.studyId;
      }
    );

    const meshTermTypeKey = Object.keys(MeshTermType)
              .find(key => MeshTermType[key] === meshTermType);

    return this.apollo
      .query<ResponseGetCountStudiesByDescriptor,
        VariablesGetCountStudiesByDescriptor>
      ({
        query: this.queryGetCountStudiesByDescriptor,
        variables: {
          studyIds: studyIds,
          meshTermType: meshTermTypeKey,
          limit: limit,
        }
      }).map((response) => {
        return response.data.studiesStats.countStudiesByDescriptor;
      });
  }

   /**
   * Retrieve the latest MeSH descriptors for given studies.
   * @param studies The studies through which the retrieval will be performed
   * @param meshTermType The type of MeSH descriptor to limit the retrieval
   * to.
   * @param limit The number of results to return (ordered by a descending
   * order of descriptor appearance).
   */
  getLatestDescriptors(
    studies: StudyInterface[],
    meshTermType?: MeshTermType,
    limit: number = null,
  ): Observable<LatestDescriptorInterface[]> {

    // Retrieve the IDs out of the provided studies.
    const studyIds: number[] = studies.map(
      function (d) {
        return d.studyId;
      }
    );

    const meshTermTypeKey = Object.keys(MeshTermType)
      .find(key => MeshTermType[key] === meshTermType);

    return this.apollo
      .query<ResponseGetLatestDescriptors,
        VariablesGetLatestDescriptors>
      ({
        query: this.queryGetLatestDescriptors,
        variables: {
          studyIds: studyIds,
          meshTermType: meshTermTypeKey,
          limit: limit,
        }
      }).map((response) => {
        return response.data.studiesStats.getLatestDescriptors;
      });
  }

  /**
   * Retrieve the unique MeSH descriptors for given studies.
   * @param studies The studies through which the retrieval will be performed.
   * @param meshTermType The type of MeSH descriptor to limit the retrieval to.
   */
  getUniqueDescriptors(
    studies: StudyInterface[],
    meshTermType?: MeshTermType,
  ): Observable<DescriptorInterface[]> {

    // Retrieve the IDs out of the provided studies.
    const studyIds: number[] = studies.map(
      function (d) {
        return d.studyId;
      }
    );

    const meshTermTypeKey = Object.keys(MeshTermType)
      .find(key => MeshTermType[key] === meshTermType);

    return this.apollo
      .query<ResponseGetUniqueDescriptors,
        VariablesGetUniqueDescriptors>
      ({
        query: this.queryGetUniqueDescriptors,
        variables: {
          studyIds: studyIds,
          meshTermType: meshTermTypeKey,
        }
      }).map((response) => {
        return response.data.studiesStats.getUniqueDescriptors;
      });
  }

  /**
   * Retrieve the unique cities for given studies.
   * @param studies The studies for which the unique cities will be retrieved.
   * @param countries The countries within which the unique cities will be
   * retrieved.
   */
  getUniqueCities(
    studies: StudyInterface[],
    countries?: String[],
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
        variables: {
          studyIds: studyIds,
          countries: countries,
        },
      }).map((response) => {
        return response.data.studiesStats.getUniqueCities;
      });
  }

  /**
   * Retrieve the unique states for given studies.
   * @param studies The studies for which the unique states will be retrieved.
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
   * @param studies The studies for which the unique countries will be
   * retrieved.
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
   * @param studies The studies for which the start-date date-range will be
   * retrieved.
   */
  getStartDateRange(
    studies?: StudyInterface[],
  ): Observable<DateRange> {

    // Retrieve the IDs out of the provided studies.
    let studyIds: number[] = [];
    if (studies) {
      studyIds = studies.map(
        function (d) {
          return d.studyId;
        }
      );
    }


    return this.apollo
      .query<ResponseGetStartDateRange,
        VariablesGetStartDateRange>
      ({
        query: this.queryGetStartDateRange,
        variables: {studyIds: studyIds || null},
      }).map((response) => {
        return {
          dateBeg: new Date(response.data.studiesStats.getDateRange.dateBeg),
          dateEnd: new Date(response.data.studiesStats.getDateRange.dateEnd),
        };
      });
  }

  /**
   * Retrieve the eligibility age-range for given studies.
   * @param studies The studies for which the eligibility age-range will be
   * retrieved.
   */
  getEligibilityAgeRange(
    studies?: StudyInterface[],
  ): Observable<AgeRange> {

    // Retrieve the IDs out of the provided studies.
    let studyIds: number[] = [];
    if (studies) {
      studyIds = studies.map(
        function (d) {
          return d.studyId;
        }
      );
    }

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

  /**
   * Retrieve the unique canonical facilities for given studies.
   * @param studies The studies for which the unique canonical facilities will
   * be retrieved.
   */
  getUniqueCanonicalFacilities(
    studies: StudyInterface[],
  ): Observable<FacilityCanonicalInterface[]> {

    // Retrieve the IDs out of the provided studies.
    const studyIds: number[] = studies.map(
      function (d) {
        return d.studyId;
      }
    );

    return this.apollo
      .query<ResponseGetUniqueCanonicalFacilities,
        VariablesGetUniqueCanonicalFacilities>
      ({
        query: this.queryGetUniqueCanonicalFacilities,
        variables: {studyIds: studyIds},
      }).map((response) => {
        return response.data.studiesStats.getUniqueCanonicalFacilities;
      });
  }
}
