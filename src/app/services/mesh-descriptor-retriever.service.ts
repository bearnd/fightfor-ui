import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

import { DescriptorInterface } from '../interfaces/descriptor.interface';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


// Response interface for the `getMeshDescriptorsBySynonym` method.
interface ResponseGetMeshDescriptorsBySynonym {
  descriptors: {
    bySynonym: DescriptorInterface[];
  };
}

// Variables interface for the `getMeshDescriptorsBySynonym` method.
interface VariablesGetMeshDescriptorsBySynonym {
  synonym: string;
  limit: number;
}


@Injectable()
export class MeshDescriptorRetrieverService {

  private loadingGetMeshDescriptorsBySynonym: BehaviorSubject<boolean>
    = new BehaviorSubject<boolean>(false);
  public isLoadingGetMeshDescriptorsBySynonym: Observable<boolean>
    = this.loadingGetMeshDescriptorsBySynonym.asObservable();
  // GraphQL query used in the `getMeshDescriptorsBySynonym` method.
  queryGetMeshDescriptorsBySynonym = gql`
    query getMeshDescriptorsBySynonym($synonym: String!, $limit: Int!){
      descriptors {
        bySynonym(synonym: $synonym, limit: $limit) {
          descriptorId,
          ui,
          name,
        }
      }
    }
  `;

  constructor(private apollo: Apollo) {
  }

  /**
   * Searches for MeSH descriptors through synonym fuzzy-matching and returns a
   * list of descriptors in order of descending relevance.
   * @param synonym The synonym query to be used in the fuzzy-search.
   * @param limit The maximum number of descriptors to be returned.
   * @returns The matching descriptors in order of descending relevance.
   */
  getMeshDescriptorsBySynonym(
    synonym: string,
    limit: number,
  ): Observable<DescriptorInterface[]> {
    // Update the 'loading' observable to indicate that loading is in progress.
    this.loadingGetMeshDescriptorsBySynonym.next(true);

    return this.apollo.query<ResponseGetMeshDescriptorsBySynonym,
      VariablesGetMeshDescriptorsBySynonym>({
      query: this.queryGetMeshDescriptorsBySynonym,
      variables: {
        synonym: synonym,
        limit: limit,
      }
    }).map((response) => {
      // Update the 'loading' observable to indicate that loading is complete.
      this.loadingGetMeshDescriptorsBySynonym.next(false);

      return response.data.descriptors.bySynonym;
    });
  }

}
