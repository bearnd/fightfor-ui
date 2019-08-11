import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

import { DescriptorInterface } from '../interfaces/descriptor.interface';


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

  // GraphQL query used in the `getMeshDescriptorsBySynonym` method.
  queryGetMeshDescriptorsBySynonym = gql`
    query getMeshDescriptorsBySynonym($synonym: String!, $limit: Int!){
      descriptors {
        bySynonym(synonym: $synonym, limit: $limit) {
          descriptorId,
          name,
          ui
        }
      }
    }
  `;

  constructor(private apollo: Apollo) {
  }

  /**
   * Searches for MeSH descriptors by through synonym fuzzy-matching and returns
   * a list of descriptors in order of descending relevance.
   * @param synonym The synonym query to be used in the fuzzy-search.
   * @param limit The maximum number of descriptors to be returned.
   * @returns The matching descriptors in order of descending relevance.
   */
  getMeshDescriptorsBySynonym(synonym: string, limit: number): Observable<DescriptorInterface[]> {
    return this.apollo.query<ResponseGetMeshDescriptorsBySynonym,
      VariablesGetMeshDescriptorsBySynonym>({
      query: this.queryGetMeshDescriptorsBySynonym,
      variables: {
        synonym: synonym,
        limit: limit,
      }
    }).map((response) => {
      return response.data.descriptors.bySynonym;
    });
  }

}
