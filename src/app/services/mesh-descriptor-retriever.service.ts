import { Injectable } from '@angular/core';

import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

import { MeshDescriptorInterface } from '../interfaces/mesh-descriptor.interface';


interface ResponseGetMeshDescriptorsByTreeNumberPrefix {
  descriptors: {
    byTreeNumberPrefix: MeshDescriptorInterface[];
  }
}

interface VariablesGetMeshDescriptorsByTreeNumberPrefix {
  treeNumberPrefix: string
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

  constructor(private apollo: Apollo) {
  }

  getMeshDescriptorsByTreeNumberPrefix(treeNumberPrefix: string) {
    return this.apollo.query<
      ResponseGetMeshDescriptorsByTreeNumberPrefix,
      VariablesGetMeshDescriptorsByTreeNumberPrefix
    >({
      query: this.queryGetMeshDescriptorsByTreeNumberPrefix,
      variables: {
        treeNumberPrefix: treeNumberPrefix
      }
    }).map((response) => {
      return response.data.descriptors.byTreeNumberPrefix;
    });
  }
}
