import { Injectable } from '@angular/core';

import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs/Observable';
import gql from 'graphql-tag';

import {
  CitationsCountByAffiliationInterface,
  CitationsCountByCountryInterface,
  CitationsCountByQualifierInterface,
} from '../interfaces/user-config.interface';
import { CitationInterface } from '../interfaces/citation.interface';


interface VariablesGetCountCitationsByCountry {
  citationIds: number[]
  limit?: number
}


interface ResponseGetCountCitationsByCountry {
  citationsStats: {
    countCitationsByCountry: CitationsCountByCountryInterface[]
  }
}


interface VariablesGetCountCitationsByAffiliation {
  citationIds: number[]
  limit?: number
}


interface ResponseGetCountCitationsByAffiliation {
  citationsStats: {
    countCitationsByAffiliation: CitationsCountByAffiliationInterface[]
  }
}


interface VariablesGetCountCitationsByQualifier {
  citationIds: number[]
  limit?: number
}


interface ResponseGetCountCitationsByQualifier {
  citationsStats: {
    countCitationsByQualifier: CitationsCountByQualifierInterface[]
  }
}


@Injectable()
export class CitationStatsRetrieverService {

  queryGetCountCitationsByCountry = gql`
    query getCountCitationsByCountry(
      $citationIds: [Int]!, 
      $limit: Int
    ) {
      citationsStats {
        countCitationsByCountry(
          citationIds: $citationIds,
          limit: $limit
        ) {
          country,
          countCitations
        }
      }
    }
    `;

  queryGetCountCitationsByAffiliation = gql`
    query getCountCitationsByAffiliation(
      $citationIds: [Int]!, 
      $limit: Int
    ) {
      citationsStats {
        countCitationsByAffiliation(
          citationIds: $citationIds,
          limit: $limit
        ) {
          affiliationCanonical {
            affiliationCanonicalId,
            name,
            locality,
            administrativeAreaLevel1,
            postalCode,
            country,
          },
          countCitations
        }
      }
    }
    `;

  queryGetCountCitationsByQualifier = gql`
    query getCountCitationsByQualifier(
      $citationIds: [Int]!, 
      $limit: Int
    ) {
      citationsStats {
        countCitationsByQualifier(
          citationIds: $citationIds,
          limit: $limit
        ) {
          qualifier {
            qualifier
          }
          countCitations
        }
      }
    }
    `;

  constructor(private apollo: Apollo) {}

  /**
   * Retrieve the count of citations by country for given citations.
   * @param {CitationInterface[]} citations The citations which will be grouped
   * and counted by country.
   * @param {number} limit The number of results to return (ordered by a
   * descending number of citations).
   * @returns {Observable<CitationsCountByCountryInterface[]>}
   */
  getCountCitationsByCountry(
    citations: CitationInterface[],
    limit: number = null,
  ): Observable<CitationsCountByCountryInterface[]> {

    // Retrieve the IDs out of the provided citations.
    const citationIds: number[] = citations.map(
      function (d) {
        return d.citationId;
      }
    );

    return this.apollo
      .query<ResponseGetCountCitationsByCountry,
        VariablesGetCountCitationsByCountry>
      ({
        query: this.queryGetCountCitationsByCountry,
        variables: {
          citationIds: citationIds,
          limit: limit,
        }
      }).map((response) => {
        return response.data.citationsStats.countCitationsByCountry;
      });
  }

  /**
   * Retrieve the count of citations by affiliation for given citations.
   * @param {CitationInterface[]} citations The citations which will be grouped
   * and counted by affiliation.
   * @param {number} limit The number of results to return (ordered by a
   * descending number of citations).
   * @returns {Observable<CitationsCountByAffiliationInterface[]>}
   */
  getCountCitationsByAffiliation(
    citations: CitationInterface[],
    limit: number = null,
  ): Observable<CitationsCountByAffiliationInterface[]> {

    // Retrieve the IDs out of the provided citations.
    const citationIds: number[] = citations.map(
      function (d) {
        return d.citationId;
      }
    );

    return this.apollo
      .query<ResponseGetCountCitationsByAffiliation,
        VariablesGetCountCitationsByAffiliation>
      ({
        query: this.queryGetCountCitationsByAffiliation,
        variables: {
          citationIds: citationIds,
          limit: limit,
        }
      }).map((response) => {
        return response.data.citationsStats.countCitationsByAffiliation;
      });
  }

  /**
   * Retrieve the count of citations by qualifier for given citations.
   * @param {CitationInterface[]} citations The citations which will be grouped
   * and counted by qualifier.
   * @param {number} limit The number of results to return (ordered by a
   * descending number of citations).
   * @returns {Observable<CitationsCountByQualifierInterface[]>}
   */
  getCountCitationsByQualifier(
    citations: CitationInterface[],
    limit: number = null,
  ): Observable<CitationsCountByQualifierInterface[]> {

    // Retrieve the IDs out of the provided citations.
    const citationIds: number[] = citations.map(
      function (d) {
        return d.citationId;
      }
    );

    return this.apollo
      .query<ResponseGetCountCitationsByQualifier,
        VariablesGetCountCitationsByQualifier>
      ({
        query: this.queryGetCountCitationsByQualifier,
        variables: {
          citationIds: citationIds,
          limit: limit,
        }
      }).map((response) => {
        return response.data.citationsStats.countCitationsByQualifier;
      });
  }
}
