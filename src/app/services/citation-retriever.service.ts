import { Injectable } from '@angular/core';

import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { CitationInterface } from '../interfaces/citation.interface';
import { DescriptorInterface } from '../interfaces/descriptor.interface';


interface VariablesSearchCitations {
  meshDescriptorIds: number[]
  yearBeg?: number
  yearEnd?: number
  doIncludeChildren?: boolean
}

interface ResponseSearchCitations {
  citations: {
    search: CitationInterface[]
  }
}


@Injectable()
export class CitationRetrieverService {

  private loadingSearchCitations = new BehaviorSubject<boolean>(false);

  public isLoadingSearchCitations = this.loadingSearchCitations.asObservable();

  querySearchCitations = gql`
    query searchCitations(
      $meshDescriptorIds: [Int]!,
      $yearBeg: Int,
      $yearEnd: Int,
      $doIncludeChildren: Boolean,
    ) {
      citations {
        search(
          meshDescriptorIds: $meshDescriptorIds,
          yearBeg: $yearBeg,
          yearEnd: $yearEnd,
          doIncludeChildren: $doIncludeChildren,
        ) {
          citationId,
          article {
            publicationYear,
          },
        }
      }
    }
  `;

  constructor(private apollo: Apollo) {}

  /**
   * Search for PubMed citations based on an array of MeSH descriptors
   * citations are associated with.
   * @param {DescriptorInterface[]} descriptors Array of MeSH descriptors
   * for which the search is performed.
   * @param {number} yearBeg The beginning of the year-range citations will be
   * limited to for this search.
   * @param {number} yearEnd The end of the year-range citations will be
   * limited to for this search.
   */
  searchCitations(
    descriptors: DescriptorInterface[],
    yearBeg?: number,
    yearEnd?: number,
  ) {
    // Update the 'loading' observable to indicate that loading is in progress.
    this.loadingSearchCitations.next(true);

    // Retrieve the IDs out of the provided MeSH descriptors.
    const descriptorIds: number[] = descriptors.map(
      function (d) {
        return d.descriptorId;
      }
    );

    return this.apollo
      .query<ResponseSearchCitations, VariablesSearchCitations>({
        query: this.querySearchCitations,
        variables: {
          meshDescriptorIds: descriptorIds,
          yearBeg: yearBeg || null,
          yearEnd: yearEnd || null,
          doIncludeChildren: true,
        }
      }).map((response) => {
        // Update the 'loading' observable to indicate that loading is complete.
        this.loadingSearchCitations.next(false);
        return response.data.citations.search;
      });
  }
}
