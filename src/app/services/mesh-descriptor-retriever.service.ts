import { Injectable } from '@angular/core';

import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

import { MeshDescriptorInterface } from '../interfaces/mesh-descriptor.interface';
import { Observable } from 'rxjs/Observable';


interface ResponseGetMeshDescriptorsByTreeNumberPrefix {
  descriptors: {
    byTreeNumberPrefix: MeshDescriptorInterface[]
  }
}

interface VariablesGetMeshDescriptorsByTreeNumberPrefix {
  treeNumberPrefix: string
}

// Response interface for the `getMeshDescriptorsBySynonym` method.
interface ResponseGetMeshDescriptorsBySynonym {
  descriptors: {
    bySynonym: MeshDescriptorInterface[]
  }
}

// Variables interface for the `getMeshDescriptorsBySynonym` method.
interface VariablesGetMeshDescriptorsBySynonym {
  synonym: string
  limit: number
}


@Injectable()
export class MeshDescriptorRetrieverService {

  queryGetMeshDescriptorsByTreeNumberPrefix = gql`
    query getMeshDescriptorsByTreeNumberPrefix($treeNumberPrefix: String!){
      descriptors {
        byTreeNumberPrefix(treeNumberPrefix: $treeNumberPrefix) {
          descriptorId,
          ui,
          name
        }
      }
    }
  `;

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

  getMeshDescriptorsByTreeNumberPrefix(treeNumberPrefix: string) {
    return this.apollo.query<ResponseGetMeshDescriptorsByTreeNumberPrefix,
      VariablesGetMeshDescriptorsByTreeNumberPrefix>({
      query: this.queryGetMeshDescriptorsByTreeNumberPrefix,
      variables: {
        treeNumberPrefix: treeNumberPrefix
      }
    }).map((response) => {
      return response.data.descriptors.byTreeNumberPrefix;
    });
  }

  /**
   * Searches for MeSH descriptors by through synonym fuzzy-matching and returns a list of descriptors in order of descending relevance.
   * @param {string} synonym The synonym query to be used in the fuzzy-search.
   * @param {number} limit The maximum number of descriptors to be returned.
   * @returns {Observable<MeshDescriptorInterface[]>} The matching descriptors in order of descending relevance.
   */
  getMeshDescriptorsBySynonym(synonym: string, limit: number): Observable<MeshDescriptorInterface[]> {
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
